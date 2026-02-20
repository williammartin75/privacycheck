#!/usr/bin/env node
/**
 * launch_v4.js — Full CC Pipeline Reset
 * 
 * Steps:
 * 1. Rename current results on VPS (preserve for later collection)
 * 2. Stop all running extractions  
 * 3. Clean old working files (keep renamed results)
 * 4. Upload correct 2500-file chunks + extract_v4.py
 * 5. Launch 4 workers per VPS
 * 6. Verify all running
 * 
 * Old results are renamed to /root/cc_results_old.ndjson for later
 * collection via daily_collect.js
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
const CHUNKS_DIR = path.join(__dirname, 'chunks');
const EXTRACT_PY = path.join(__dirname, 'extract_v4.py');
const NUM_WORKERS = 4;

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
                stream.on('close', code => {
                    clearTimeout(timer);
                    c.end();
                    resolve({ ok: true, out: out.trim(), code });
                });
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

(async () => {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║  CC Pipeline v4 — Full Reset & Launch (100K files)       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // ══════════════════════════════════════════════════════════
    // Step 1: Stop + preserve old results + clean
    // ══════════════════════════════════════════════════════════
    console.log('=== Step 1: Stop extraction + preserve old results + clean ===\n');
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                // Kill all extract processes
                'pkill -f extract 2>/dev/null; sleep 1; ' +
                // Rename old results to preserve them (for later collection)
                'mv /root/cc_results.ndjson /root/cc_results_old.ndjson 2>/dev/null; ' +
                // Clean everything else
                'rm -f /root/cc_results_w*.ndjson /root/cc_progress.log /root/cc_extract*.log ' +
                '/root/extract.py /root/extract.sh /root/extract_v3.py /root/extract_v4.py ' +
                '/root/my_wet_files.txt /root/results.ndjson /root/progress.txt /tmp/w*.wet.gz 2>/dev/null; ' +
                // Report what was preserved
                'OLD=$(wc -l < /root/cc_results_old.ndjson 2>/dev/null || echo 0); ' +
                'echo "CLEANED|OLD=$OLD"',
                20000
            )
        ));
        results.forEach((r, j) => {
            const vps = batch[j];
            if (r.ok && r.out.includes('|')) {
                const oldCount = r.out.split('OLD=')[1] || '0';
                const icon = parseInt(oldCount) > 0 ? '💾' : '✅';
                console.log(`  ${icon} VPS-${String(vps.id).padStart(2)}: cleaned (${parseInt(oldCount).toLocaleString()} old emails preserved)`);
            } else {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out}`);
            }
        });
    }

    // ══════════════════════════════════════════════════════════
    // Step 2: Upload chunks + extract_v4.py
    // ══════════════════════════════════════════════════════════
    console.log('\n=== Step 2: Deploy chunk files + extract_v4.py ===\n');
    let deployed = 0;

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(async vps => {
            const chunkFile = path.join(CHUNKS_DIR, `chunk_${vps.id}.txt`);
            if (!fs.existsSync(chunkFile)) {
                return { vps, ok: false, out: `chunk_${vps.id}.txt not found` };
            }

            // Upload chunk
            const r1 = await scpUpload(vps.ip, vps.pass, chunkFile, '/root/my_wet_files.txt', 30000);
            if (!r1.ok) return { vps, ok: false, out: 'chunk: ' + r1.out };

            // Upload extract_v4.py
            const r2 = await scpUpload(vps.ip, vps.pass, EXTRACT_PY, '/root/extract_v4.py', 30000);
            if (!r2.ok) return { vps, ok: false, out: 'script: ' + r2.out };

            // Verify
            const verify = await sshExec(vps.ip, vps.pass,
                'WC=$(wc -l < /root/my_wet_files.txt); PY=$(python3 --version 2>&1); echo "$WC files | $PY"',
                10000
            );

            return { vps, ok: true, out: verify.out };
        }));

        results.forEach(r => {
            console.log(`  VPS-${String(r.vps.id).padStart(2)}: ${r.ok ? '✅' : '❌'} ${r.out}`);
            if (r.ok) deployed++;
        });
    }
    console.log(`\n  Deployed: ${deployed}/40\n`);

    // ══════════════════════════════════════════════════════════
    // Step 3: Launch 4 workers per VPS
    // ══════════════════════════════════════════════════════════
    console.log('=== Step 3: Launch 4 workers per VPS ===\n');
    let launched = 0;

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                `for w in 0 1 2 3; do ` +
                `  nohup python3 /root/extract_v4.py $w ${NUM_WORKERS} > /root/cc_extract_\${w}.log 2>&1 & ` +
                `done; ` +
                `sleep 3; ` +
                `pgrep -c -f extract_v4.py 2>/dev/null || echo 0`,
                20000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            const count = parseInt(r.out) || 0;
            console.log(`  VPS-${String(vps.id).padStart(2)}: ${count >= NUM_WORKERS ? '🚀' : '⚠️'} ${count} workers`);
            if (count >= NUM_WORKERS) launched++;
        });
    }
    console.log(`\n  Launched: ${launched}/40 VPS\n`);

    // ══════════════════════════════════════════════════════════
    // Step 4: Final verification (10s later)
    // ══════════════════════════════════════════════════════════
    console.log('=== Step 4: Verify (10s later) ===\n');
    await new Promise(r => setTimeout(r, 10000));

    let running = 0;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                'W=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
                'T=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
                'echo "$W|$T"',
                15000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            if (r.ok && r.out.includes('|')) {
                const [w, t] = r.out.split('|');
                const workers = parseInt(w) || 0;
                if (workers > 0) running++;
                console.log(`  VPS-${String(vps.id).padStart(2)}: ${workers >= NUM_WORKERS ? '✅' : '⚠️'} ${workers} workers, ${t} files`);
            } else {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out}`);
            }
        });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log(`  VPS deployed:  ${deployed}/40`);
    console.log(`  VPS running:   ${running}/40 (${NUM_WORKERS} workers each)`);
    console.log('  Files/VPS:     2,500');
    console.log('  Total files:   100,000');
    console.log('  ETA:           ~4 days (Feb 24)');
    console.log('  Old results:   preserved as cc_results_old.ndjson');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n  Monitor: node distribute.js --status');
    console.log('  Daily collect: node daily_collect.js');

    process.exit(0);
})();
