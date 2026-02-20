const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');

// VPS-40 (has the 17475 files) + 8 idle donors
const IDLE_VPS = [
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
    { id: 14, ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 18, ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
];
const VPS40 = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };

const NUM_WORKERS = 4;
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
    console.log('=== Redistribute: Split VPS-40 files across 9 VPS ===\n');

    // Step 1: Get current file list from VPS-40
    console.log('1. Getting file list from VPS-40...');
    const r = await sshExec(VPS40.ip, VPS40.pass, 'cat /root/my_wet_files.txt', 60000);
    if (!r.ok) { console.log('  ❌ Failed:', r.out); process.exit(1); }

    const allFiles = r.out.split('\n').filter(l => l.trim());
    console.log(`   ${allFiles.length} files to distribute\n`);

    // Step 2: Stop VPS-40 workers
    console.log('2. Stopping VPS-40 workers...');
    await sshExec(VPS40.ip, VPS40.pass, 'pkill -f extract_v4.py 2>/dev/null; sleep 2');
    console.log('   ✅ Stopped\n');

    // Step 3: Split files across 9 VPS (VPS-40 + 8 donors)
    const allTargets = [VPS40, ...IDLE_VPS]; // 9 VPS total
    const chunkSize = Math.ceil(allFiles.length / allTargets.length);
    const tmpDir = path.join(os.tmpdir(), 'cc_redistribute');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    console.log(`3. Distributing ${allFiles.length} files across ${allTargets.length} VPS (~${chunkSize} each)\n`);

    for (let i = 0; i < allTargets.length; i++) {
        const vps = allTargets[i];
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, allFiles.length);
        const chunk = allFiles.slice(start, end);

        if (chunk.length === 0) continue;

        console.log(`  VPS-${String(vps.id).padStart(2)}: ${chunk.length} files`);

        // Write chunk to temp file
        const tmpFile = path.join(tmpDir, `chunk_${vps.id}.txt`);
        fs.writeFileSync(tmpFile, chunk.join('\n') + '\n');

        // Clean state for fresh start
        await sshExec(vps.ip, vps.pass,
            'pkill -f extract_v4.py 2>/dev/null; sleep 1; ' +
            'rm -f /root/cc_progress.log /root/cc_extract*.log /root/cc_results_w*.ndjson /tmp/w*.wet.gz 2>/dev/null',
            15000
        );

        // Upload file list
        const r1 = await scpUpload(vps.ip, vps.pass, tmpFile, '/root/my_wet_files.txt');
        if (!r1.ok) { console.log(`    ❌ Upload file list failed: ${r1.out}`); continue; }

        // Upload extract_v4.py
        const r2 = await scpUpload(vps.ip, vps.pass, EXTRACT_PY, '/root/extract_v4.py');
        if (!r2.ok) { console.log(`    ❌ Upload script failed: ${r2.out}`); continue; }

        // Launch workers
        const launch = await sshExec(vps.ip, vps.pass,
            `for w in 0 1 2 3; do nohup python3 /root/extract_v4.py $w ${NUM_WORKERS} > /root/cc_extract_\${w}.log 2>&1 & done; sleep 3; pgrep -c -f extract_v4.py 2>/dev/null || echo 0`,
            20000
        );
        const wc = parseInt(launch.out) || 0;
        console.log(`    ${wc >= NUM_WORKERS ? '🚀' : '⚠️'} ${wc} workers launched`);

        fs.unlinkSync(tmpFile);
    }

    // Step 4: Verify
    console.log('\n4. Verification (10s later)...\n');
    await new Promise(r => setTimeout(r, 10000));

    let running = 0;
    for (const vps of allTargets) {
        const r = await sshExec(vps.ip, vps.pass,
            'W=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); T=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); echo "$W|$T"');
        if (r.ok && r.out.includes('|')) {
            const [w, t] = r.out.split('|').map(Number);
            if (w > 0) running++;
            console.log(`  VPS-${String(vps.id).padStart(2)}: ${w >= NUM_WORKERS ? '✅' : '⚠️'} ${w} workers, ${t} files`);
        } else {
            console.log(`  VPS-${String(vps.id).padStart(2)}: ❌ ${r.out}`);
        }
    }

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`  REDISTRIBUTION COMPLETE`);
    console.log(`  ${running}/${allTargets.length} VPS running`);
    console.log(`  ${allFiles.length} files split across ${allTargets.length} VPS (~${chunkSize} each)`);
    console.log(`═══════════════════════════════════════════════════════`);

    try { fs.rmdirSync(tmpDir); } catch (e) { }
})();
