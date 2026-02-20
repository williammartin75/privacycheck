#!/usr/bin/env node
/**
 * status_v4.js — Monitor CC Pipeline v4 (4 workers, per-worker output files)
 */
const { Client } = require('ssh2');

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

const BATCH = 10;

function ssh(h, p, cmd, timeout = 20000) {
    return new Promise(r => {
        const c = new Client();
        const t = setTimeout(() => { try { c.end() } catch (e) { } r({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.exec(cmd, { pty: false }, (e, s) => {
                if (e) { clearTimeout(t); c.end(); return r({ ok: false, out: 'ERR' }) }
                let o = '';
                s.on('data', d => o += d.toString());
                s.stderr.on('data', d => o += d.toString());
                s.on('close', () => { clearTimeout(t); c.end(); r({ ok: true, out: o.trim() }) });
            });
        });
        c.on('error', e => { clearTimeout(t); r({ ok: false, out: 'SSH:' + e.message }) });
        c.connect({
            host: h, port: 22, username: 'root', password: p, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    const startTime = Date.now();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  CC PIPELINE v4 — STATUS CHECK                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    let totalEmails = 0, totalDone = 0, totalFiles = 0;
    let runningVps = 0;
    const vpsData = [];

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            ssh(vps.ip, vps.pass,
                'TOTAL=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
                'DONE=$(wc -l < /root/cc_progress.log 2>/dev/null || echo 0); ' +
                'EMAILS=0; for f in /root/cc_results_w*.ndjson; do [ -f "$f" ] && EMAILS=$((EMAILS + $(wc -l < "$f"))); done; ' +
                'WORKERS=$(pgrep -c -f extract_v4.py 2>/dev/null || echo 0); ' +
                'DISK=$(df -h / | tail -1 | awk \'{print $5}\'); ' +
                'echo "$TOTAL|$DONE|$EMAILS|$WORKERS|$DISK"',
                25000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            if (r.ok && r.out.includes('|')) {
                const [total, done, emails, workers, disk] = r.out.split('|');
                const t = parseInt(total) || 0, d = parseInt(done) || 0, e = parseInt(emails) || 0, w = parseInt(workers) || 0;
                const pct = t > 0 ? Math.round(d / t * 100) : 0;
                const icon = w > 0 ? '🔄' : (pct >= 100 ? '✅' : '⏸️');
                console.log(`  ${icon} VPS-${String(vps.id).padStart(2)}: ${String(d).padStart(4)}/${t} files (${String(pct).padStart(3)}%) | ${e.toLocaleString().padStart(10)} emails | ${w}W | Disk: ${disk}`);
                totalEmails += e; totalDone += d; totalFiles += t;
                if (w > 0) runningVps++;
                vpsData.push({ id: vps.id, total: t, done: d, emails: e, workers: w });
            } else {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out.substring(0, 60)}`);
            }
        });
    }

    const pct = totalFiles > 0 ? Math.round(totalDone / totalFiles * 100) : 0;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // ETA calculation
    let eta = '?';
    if (totalDone > 0 && pct < 100) {
        // Launched at ~03:50 UTC Feb 20 = ~1708397400000
        const launchTime = new Date('2026-02-20T03:50:00Z').getTime();
        const elapsedSinceLaunch = (Date.now() - launchTime) / 1000 / 3600; // hours
        const rate = totalDone / elapsedSinceLaunch; // files per hour
        const remaining = totalFiles - totalDone;
        const hoursLeft = remaining / rate;
        const etaDate = new Date(Date.now() + hoursLeft * 3600 * 1000);
        eta = etaDate.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
    }

    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`  TOTAL: ${totalDone.toLocaleString()} / ${totalFiles.toLocaleString()} files (${pct}%)`);
    console.log(`  EMAILS: ${totalEmails.toLocaleString()}`);
    console.log(`  RUNNING: ${runningVps}/40 VPS`);
    console.log(`  ETA: ${eta}`);
    console.log(`  Scan took: ${elapsed}s`);
    console.log(`═══════════════════════════════════════════════════════════`);

    process.exit(0);
})();
