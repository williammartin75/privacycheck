const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Slow VPS (donors)
const DONORS = [
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
];

// Receiver
const VPS40 = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };
const NUM_WORKERS = 6;
const EXTRACT_PY = path.join(__dirname, 'extract_v4.py');

function sshExec(host, pass, cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { try { c.end() } catch (e) { } resolve({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.exec(cmd, { pty: false }, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: 'EXEC_ERR' }) }
                let out = '';
                stream.on('data', d => out += d.toString());
                stream.stderr.on('data', d => out += d.toString());
                stream.on('close', () => { clearTimeout(t); c.end(); resolve({ ok: true, out: out.trim() }) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function scpUpload(host, pass, localPath, remotePath, timeout = 60000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: 'SFTP_ERR' }) }
                const rs = fs.createReadStream(localPath);
                const ws = sftp.createWriteStream(remotePath);
                ws.on('close', () => { clearTimeout(t); c.end(); resolve({ ok: true }) });
                ws.on('error', e => { clearTimeout(t); c.end(); resolve({ ok: false, out: e.message }) });
                rs.pipe(ws);
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('=== Redistribute: Move remaining files from VPS-2 & VPS-36 → VPS-40 ===\n');

    // Step 1: Get remaining (unprocessed) files from each donor
    let allRemainingFiles = [];

    for (const donor of DONORS) {
        console.log(`1. Getting remaining files from VPS-${donor.id}...`);

        // Get the full file list
        const rAll = await sshExec(donor.ip, donor.pass, 'cat /root/my_wet_files.txt', 60000);
        if (!rAll.ok) { console.log(`  ❌ Failed to get file list: ${rAll.out}`); continue; }

        // Get the progress log to find completed files
        const rProg = await sshExec(donor.ip, donor.pass, 'cat /root/cc_progress.log 2>/dev/null || echo ""', 60000);

        const allFiles = rAll.out.split('\n').filter(l => l.trim());
        const doneFiles = new Set();
        if (rProg.ok && rProg.out) {
            for (const line of rProg.out.split('\n')) {
                // Progress log format: "DONE|filename|emails|duration" or similar
                const parts = line.split('|');
                if (parts.length >= 2 && parts[0] === 'DONE') {
                    doneFiles.add(parts[1].trim());
                }
            }
        }

        const remaining = allFiles.filter(f => !doneFiles.has(f));
        console.log(`   Total: ${allFiles.length}, Done: ${doneFiles.size}, Remaining: ${remaining.length}`);

        allRemainingFiles.push(...remaining);

        // Stop workers on donor
        console.log(`   Stopping VPS-${donor.id} workers...`);
        await sshExec(donor.ip, donor.pass, 'pkill -f extract_v4.py 2>/dev/null; sleep 2');
        console.log(`   ✅ Stopped\n`);
    }

    console.log(`Total remaining files to move to VPS-40: ${allRemainingFiles.length}\n`);

    if (allRemainingFiles.length === 0) {
        console.log('No remaining files to redistribute!');
        process.exit(0);
    }

    // Step 2: Stop VPS-40 workers (if any)
    console.log('2. Stopping VPS-40 workers...');
    await sshExec(VPS40.ip, VPS40.pass, 'pkill -f extract_v4.py 2>/dev/null; sleep 2');
    console.log('   ✅ Stopped\n');

    // Step 3: Clean VPS-40 state for fresh start (keep results!)
    console.log('3. Preparing VPS-40 for new batch...');
    // Backup existing results, reset progress/logs
    await sshExec(VPS40.ip, VPS40.pass,
        'cp /root/cc_progress.log /root/cc_progress_batch2_backup.log 2>/dev/null; ' +
        'rm -f /root/cc_progress.log /root/cc_extract*.log /tmp/w*.wet.gz 2>/dev/null');
    console.log('   ✅ State cleaned (results kept)\n');

    // Step 4: Upload new file list to VPS-40
    console.log('4. Uploading file list to VPS-40...');
    const tmpDir = path.join(os.tmpdir(), 'cc_redistribute_vps40');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpFile = path.join(tmpDir, 'new_files.txt');
    fs.writeFileSync(tmpFile, allRemainingFiles.join('\n') + '\n');

    const r1 = await scpUpload(VPS40.ip, VPS40.pass, tmpFile, '/root/my_wet_files.txt');
    if (!r1.ok) { console.log(`   ❌ Upload failed: ${r1.out}`); process.exit(1); }
    console.log(`   ✅ Uploaded ${allRemainingFiles.length} files\n`);

    // Step 5: Upload extract_v4.py (ensure latest version)
    console.log('5. Uploading extract_v4.py...');
    const r2 = await scpUpload(VPS40.ip, VPS40.pass, EXTRACT_PY, '/root/extract_v4.py');
    if (!r2.ok) { console.log(`   ❌ Upload script failed: ${r2.out}`); process.exit(1); }
    console.log('   ✅ Done\n');

    // Step 6: Launch workers on VPS-40
    console.log(`6. Launching ${NUM_WORKERS} workers on VPS-40...`);
    const workerIds = Array.from({ length: NUM_WORKERS }, (_, i) => i);
    const launchCmd = workerIds.map(w =>
        `nohup python3 /root/extract_v4.py ${w} ${NUM_WORKERS} > /root/cc_extract_${w}.log 2>&1 &`
    ).join(' ');

    const launch = await sshExec(VPS40.ip, VPS40.pass,
        `${launchCmd} sleep 3; pgrep -c -f extract_v4.py 2>/dev/null || echo 0`,
        20000);
    const wc = parseInt(launch.out) || 0;
    console.log(`   ${wc >= NUM_WORKERS ? '🚀' : '⚠️'} ${wc} workers launched\n`);

    // Step 7: Verify after 15s
    console.log('7. Verification (15s later)...\n');
    await new Promise(r => setTimeout(r, 15000));

    const check = await sshExec(VPS40.ip, VPS40.pass,
        'W=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
        'T=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
        'D=$(grep -c "^DONE" /root/cc_progress.log 2>/dev/null || echo 0); ' +
        'echo "$W|$T|$D"');

    if (check.ok && check.out.includes('|')) {
        const [w, t, d] = check.out.split('|').map(Number);
        console.log(`  VPS-40: ${w >= NUM_WORKERS ? '✅' : '⚠️'} ${w} workers, ${t} files assigned, ${d} done so far`);
    }

    // Cleanup
    try { fs.unlinkSync(tmpFile); fs.rmdirSync(tmpDir); } catch (e) { }

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`  REDISTRIBUTION COMPLETE`);
    console.log(`  ${allRemainingFiles.length} files moved from VPS-2+36 → VPS-40`);
    console.log(`  VPS-40 now processing with ${NUM_WORKERS} workers`);
    console.log(`  VPS-2 and VPS-36 stopped`);
    console.log(`═══════════════════════════════════════════════════════`);
})();
