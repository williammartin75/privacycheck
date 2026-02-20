#!/usr/bin/env node
/**
 * daily_collect.js — Download CC extraction results from all 40 VPS
 * 
 * Downloads worker-specific output files (cc_results_w{0-3}.ndjson) 
 * without stopping the extraction. Safe to run while extraction is running.
 * 
 * Usage: node daily_collect.js
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

const BATCH = 5;
const COLLECT_BASE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\CC - January 2026';

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

function scpDownload(host, pass, remotePath, localPath, timeout = 300000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: 'SFTP_ERR' }) }
                sftp.fastGet(remotePath, localPath, { concurrency: 4, chunkSize: 32768 }, (err) => {
                    clearTimeout(t);
                    c.end();
                    if (err) return resolve({ ok: false, out: err.message });
                    resolve({ ok: true, out: 'OK' });
                });
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
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dayDir = path.join(COLLECT_BASE, `collect_${date}`);
    if (!fs.existsSync(dayDir)) {
        fs.mkdirSync(dayDir, { recursive: true });
    }

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log(`║  Daily Collection — ${date}                          ║`);
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    let totalEmails = 0;
    let totalFiles = 0;
    let totalDone = 0;
    let vpsRunning = 0;
    let filesDownloaded = 0;

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);

        // First get status
        const statusResults = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                'TOTAL=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
                'DONE=$(wc -l < /root/cc_progress.log 2>/dev/null || echo 0); ' +
                'WORKERS=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
                // Count emails across all worker output files
                'EMAILS=0; for f in /root/cc_results_w*.ndjson; do [ -f "$f" ] && EMAILS=$((EMAILS + $(wc -l < "$f"))); done; ' +
                'echo "$TOTAL|$DONE|$EMAILS|$WORKERS"',
                20000
            )
        ));

        // Then download results
        for (let j = 0; j < batch.length; j++) {
            const vps = batch[j];
            const r = statusResults[j];

            if (!r.ok || !r.out.includes('|')) {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out}`);
                continue;
            }

            const [total, done, emails, workers] = r.out.split('|').map(Number);
            const pct = total > 0 ? Math.round(done / total * 100) : 0;
            totalFiles += total;
            totalDone += done;
            totalEmails += emails;
            if (workers > 0) vpsRunning++;

            const icon = workers > 0 ? '🔄' : (pct >= 100 ? '✅' : '⏸️');
            console.log(`  ${icon} VPS-${String(vps.id).padStart(2)}: ${done}/${total} (${pct}%) | ${emails.toLocaleString()} emails | ${workers} workers`);

            // Download each worker's output file
            for (let w = 0; w < 4; w++) {
                const remoteFile = `/root/cc_results_w${w}.ndjson`;
                const localFile = path.join(dayDir, `vps_${vps.id}_w${w}.ndjson`);
                const dl = await scpDownload(vps.ip, vps.pass, remoteFile, localFile, 300000);
                if (dl.ok) {
                    filesDownloaded++;
                }
                // Not all workers may have produced output yet, silently skip
            }
        }
    }

    const globalPct = totalFiles > 0 ? Math.round(totalDone / totalFiles * 100) : 0;
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`  Progress: ${totalDone.toLocaleString()}/${totalFiles.toLocaleString()} files (${globalPct}%)`);
    console.log(`  Emails:   ${totalEmails.toLocaleString()}`);
    console.log(`  VPS running: ${vpsRunning}/40`);
    console.log(`  Files downloaded: ${filesDownloaded}`);
    console.log(`  Saved to: ${dayDir}`);
    console.log('═══════════════════════════════════════════════════════');

    process.exit(0);
})();
