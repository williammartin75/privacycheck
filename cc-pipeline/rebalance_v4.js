#!/usr/bin/env node
/**
 * rebalance_v4.js — Redistribute remaining WET files from slow VPS to idle VPS
 * 
 * How it works:
 *   1. Check all 40 VPS: get progress (done/total) and running workers
 *   2. Identify "donor" VPS (slow, <30% done) and "receiver" VPS (finished, 0 workers)
 *   3. For each donor: download its progress log + file list → compute remaining files
 *   4. Stop donor workers, split remaining files across receivers
 *   5. Upload new file lists + extract_v4.py to receivers, launch workers
 *   6. Restart donor with its own remaining files (lighter load)
 * 
 * Safety:
 *   - Only touches VPS that are 100% done (receivers) or explicitly slow (donors)
 *   - Collects results from donors before stopping them
 *   - Does NOT touch VPS between 30-99% — they continue normally
 * 
 * Usage: node rebalance_v4.js
 *   --dry-run    Show what would happen without making changes
 *   --threshold  Donor threshold (default: 20 = VPS below 20% are donors)
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
    { id: 3, ip: '206.217.139.115', pass: '20QEs9OSh8Bw3egI1q' },
    { id: 4, ip: '206.217.139.116', pass: 'JvSg1HPu956fAt0dY0' },
    { id: 5, ip: '23.95.242.32', pass: 'v6Jk79EUE15reqJ3zB' },
    { id: 6, ip: '192.3.86.156', pass: 'H77WKufh2r9lVX3iP6' },
    { id: 7, ip: '107.175.83.186', pass: '1KiaL7RpwAng23B08L' },
    { id: 8, ip: '23.226.135.153', pass: 'dIKsL94sx6o8u7SAA1' },
    { id: 9, ip: '64.188.29.151', pass: '1EQpF0fSapC610hjK3' },
    { id: 10, ip: '23.94.240.173', pass: 'L5fgrQ6I84E3uvR2Nn' },
    { id: 11, ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 12, ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe' },
    { id: 13, ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5' },
    { id: 14, ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 15, ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 16, ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783' },
    { id: 17, ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C' },
    { id: 18, ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 19, ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw' },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS' },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o' },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q' },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK' },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v' },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK' },
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

const BATCH = 8;
const NUM_WORKERS = 4;
const EXTRACT_PY = path.join(__dirname, 'extract_v4.py');
const DRY_RUN = process.argv.includes('--dry-run');
const DONOR_THRESHOLD = parseInt(process.argv.find((a, i, arr) => arr[i - 1] === '--threshold') || '20');

function sshExec(host, pass, cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const timer = setTimeout(() => { try { c.end() } catch (e) { } resolve({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.exec(cmd, { pty: false }, (err, stream) => {
                if (err) { clearTimeout(timer); c.end(); return resolve({ ok: false, out: 'EXEC_ERR' }) }
                let out = '';
                stream.on('data', d => out += d.toString());
                stream.stderr.on('data', d => out += d.toString());
                stream.on('close', () => { clearTimeout(timer); c.end(); resolve({ ok: true, out: out.trim() }) });
            });
        });
        c.on('error', e => { clearTimeout(timer); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
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
                ws.on('close', () => { clearTimeout(t); c.end(); resolve({ ok: true, out: 'OK' }) });
                ws.on('error', (e) => { clearTimeout(t); c.end(); resolve({ ok: false, out: e.message }) });
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

function sshDownloadContent(host, pass, remotePath, timeout = 60000) {
    return sshExec(host, pass, `cat ${remotePath} 2>/dev/null`, timeout);
}

(async () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log(`║  CC Pipeline v4 — Rebalancer${DRY_RUN ? ' (DRY RUN)' : ''}                       ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // ══════════════════════════════════════════════════════════
    // Step 1: Get status of all VPS
    // ══════════════════════════════════════════════════════════
    console.log('=== Step 1: Scanning all VPS ===\n');
    const vpsStatus = [];

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                'TOTAL=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
                'DONE=$(wc -l < /root/cc_progress.log 2>/dev/null || echo 0); ' +
                'WORKERS=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
                'EMAILS=0; for f in /root/cc_results_w*.ndjson; do [ -f "$f" ] && EMAILS=$((EMAILS + $(wc -l < "$f"))); done; ' +
                'echo "$TOTAL|$DONE|$EMAILS|$WORKERS"',
                20000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            if (r.ok && r.out.includes('|')) {
                const [total, done, emails, workers] = r.out.split('|').map(Number);
                const pct = total > 0 ? Math.round(done / total * 100) : 0;
                vpsStatus.push({ ...vps, total, done, emails, workers, pct, remaining: total - done });
                const icon = workers > 0 ? (pct >= 100 ? '✅' : '🔄') : (pct >= 100 ? '✅' : '⏸️');
                console.log(`  ${icon} VPS-${String(vps.id).padStart(2)}: ${done}/${total} (${pct}%) | ${emails.toLocaleString()} emails | ${workers} workers`);
            } else {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out}`);
                vpsStatus.push({ ...vps, total: 0, done: 0, emails: 0, workers: 0, pct: 0, remaining: 0, error: true });
            }
        });
    }

    // ══════════════════════════════════════════════════════════
    // Step 2: Identify receivers (finished) and donors (slow)
    // ══════════════════════════════════════════════════════════
    const receivers = vpsStatus.filter(v => !v.error && v.pct >= 100);
    const donors = vpsStatus.filter(v => !v.error && v.pct < DONOR_THRESHOLD && v.remaining > 500);

    // Sort donors by pct ascending (slowest first)
    donors.sort((a, b) => a.pct - b.pct);

    console.log(`\n=== Step 2: Rebalance Plan ===\n`);
    console.log(`  Receivers (finished, 0 workers): ${receivers.length} VPS`);
    receivers.forEach(v => console.log(`    📥 VPS-${String(v.id).padStart(2)}: ${v.pct}% done`));
    console.log(`  Donors (below ${DONOR_THRESHOLD}%, >500 remaining): ${donors.length} VPS`);
    donors.forEach(v => console.log(`    📤 VPS-${String(v.id).padStart(2)}: ${v.pct}% done, ${v.remaining} remaining`));

    if (receivers.length === 0) {
        console.log('\n  ⚠️  No free receivers yet. Run this script again when some VPS finish.');
        console.log('     Tip: Check VPS-40 (96%) and VPS-39 (85%) — they should finish soon.');
        process.exit(0);
    }

    if (donors.length === 0) {
        console.log('\n  ⚠️  No slow donors found. All VPS are above the threshold.');
        console.log(`     Tip: Use --threshold 30 to include more VPS as donors.`);
        process.exit(0);
    }

    // Calculate total remaining files from donors to redistribute
    const totalRemaining = donors.reduce((sum, d) => sum + d.remaining, 0);
    const filesPerReceiver = Math.ceil(totalRemaining / receivers.length);
    console.log(`\n  Total files to redistribute: ${totalRemaining.toLocaleString()}`);
    console.log(`  Files per receiver: ~${filesPerReceiver}`);

    if (DRY_RUN) {
        console.log('\n  🏁 DRY RUN — no changes made. Remove --dry-run to execute.');
        process.exit(0);
    }

    // ══════════════════════════════════════════════════════════
    // Step 3: For each donor, get remaining files
    // ══════════════════════════════════════════════════════════
    console.log('\n=== Step 3: Getting remaining files from donors ===\n');
    let allRemainingFiles = [];

    for (const donor of donors) {
        console.log(`  📤 VPS-${String(donor.id).padStart(2)}: Getting file list and progress...`);

        // Get file list
        const fileListResult = await sshDownloadContent(donor.ip, donor.pass, '/root/my_wet_files.txt', 30000);
        if (!fileListResult.ok) {
            console.log(`    ❌ Could not get file list: ${fileListResult.out}`);
            continue;
        }
        const allFiles = fileListResult.out.split('\n').filter(l => l.trim());

        // Get progress
        const progressResult = await sshDownloadContent(donor.ip, donor.pass, '/root/cc_progress.log', 60000);
        const doneFiles = new Set();
        if (progressResult.ok && progressResult.out) {
            progressResult.out.split('\n').forEach(l => { if (l.trim()) doneFiles.add(l.trim()); });
        }

        // Compute remaining
        const remaining = allFiles.filter(f => !doneFiles.has(f));
        console.log(`    Files: ${allFiles.length} total, ${doneFiles.size} done, ${remaining.length} remaining`);

        // Stop workers on donor
        console.log(`    Stopping workers on VPS-${donor.id}...`);
        await sshExec(donor.ip, donor.pass, 'pkill -f extract_v4.py 2>/dev/null; sleep 2', 15000);

        allRemainingFiles.push(...remaining);
        console.log(`    ✅ Collected ${remaining.length} remaining files from VPS-${donor.id}`);
    }

    if (allRemainingFiles.length === 0) {
        console.log('\n  ⚠️  No remaining files found. Nothing to redistribute.');
        process.exit(0);
    }

    console.log(`\n  Total remaining files collected: ${allRemainingFiles.length.toLocaleString()}`);

    // ══════════════════════════════════════════════════════════
    // Step 4: Distribute remaining files to receivers
    // ══════════════════════════════════════════════════════════
    console.log('\n=== Step 4: Distributing files to receivers ===\n');

    // Split files evenly across receivers
    const chunkSize = Math.ceil(allRemainingFiles.length / receivers.length);
    const tmpDir = path.join(os.tmpdir(), 'cc_rebalance');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    let deployedCount = 0;

    for (let i = 0; i < receivers.length; i++) {
        const receiver = receivers[i];
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, allRemainingFiles.length);
        const chunk = allRemainingFiles.slice(start, end);

        if (chunk.length === 0) {
            console.log(`  ⏭️  VPS-${String(receiver.id).padStart(2)}: No files to assign`);
            continue;
        }

        console.log(`  📥 VPS-${String(receiver.id).padStart(2)}: Deploying ${chunk.length} files...`);

        // Write chunk to temp file
        const tmpFile = path.join(tmpDir, `rebalance_${receiver.id}.txt`);
        fs.writeFileSync(tmpFile, chunk.join('\n') + '\n');

        // Clean receiver for fresh start
        await sshExec(receiver.ip, receiver.pass,
            'pkill -f extract_v4.py 2>/dev/null; ' +
            'rm -f /root/cc_progress.log /root/cc_extract*.log /tmp/w*.wet.gz 2>/dev/null',
            15000
        );

        // Upload new file list
        const r1 = await scpUpload(receiver.ip, receiver.pass, tmpFile, '/root/my_wet_files.txt', 30000);
        if (!r1.ok) {
            console.log(`    ❌ Failed to upload file list: ${r1.out}`);
            continue;
        }

        // Upload extract_v4.py
        const r2 = await scpUpload(receiver.ip, receiver.pass, EXTRACT_PY, '/root/extract_v4.py', 30000);
        if (!r2.ok) {
            console.log(`    ❌ Failed to upload script: ${r2.out}`);
            continue;
        }

        // Launch workers
        const launchResult = await sshExec(receiver.ip, receiver.pass,
            `for w in 0 1 2 3; do ` +
            `  nohup python3 /root/extract_v4.py $w ${NUM_WORKERS} > /root/cc_extract_\${w}.log 2>&1 & ` +
            `done; ` +
            `sleep 3; ` +
            `pgrep -c -f extract_v4.py 2>/dev/null || echo 0`,
            20000
        );

        const workerCount = parseInt(launchResult.out) || 0;
        console.log(`    ${workerCount >= NUM_WORKERS ? '🚀' : '⚠️'} ${workerCount} workers launched for ${chunk.length} files`);
        if (workerCount > 0) deployedCount++;

        // Cleanup temp file
        fs.unlinkSync(tmpFile);
    }

    // ══════════════════════════════════════════════════════════
    // Step 5: Verify
    // ══════════════════════════════════════════════════════════
    console.log('\n=== Step 5: Verification (10s later) ===\n');
    await new Promise(r => setTimeout(r, 10000));

    let runningCount = 0;
    for (const receiver of receivers) {
        const r = await sshExec(receiver.ip, receiver.pass,
            'W=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
            'T=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
            'echo "$W|$T"',
            15000
        );
        if (r.ok && r.out.includes('|')) {
            const [w, t] = r.out.split('|').map(Number);
            if (w > 0) runningCount++;
            console.log(`  VPS-${String(receiver.id).padStart(2)}: ${w >= NUM_WORKERS ? '✅' : '⚠️'} ${w} workers, ${t} files assigned`);
        } else {
            console.log(`  ❌ VPS-${String(receiver.id).padStart(2)}: ${r.out}`);
        }
    }

    // ══════════════════════════════════════════════════════════
    // Summary
    // ══════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  REBALANCE SUMMARY');
    console.log(`  Donors (stopped):    ${donors.length} VPS (${donors.map(d => 'VPS-' + d.id).join(', ')})`);
    console.log(`  Receivers (started): ${runningCount}/${receivers.length} VPS`);
    console.log(`  Files redistributed: ${allRemainingFiles.length.toLocaleString()}`);
    console.log(`  Files per receiver:  ~${chunkSize}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n  Monitor: node cc-pipeline/status_v4.js');

    // Cleanup
    try { fs.rmdirSync(tmpDir); } catch (e) { }

    process.exit(0);
})();
