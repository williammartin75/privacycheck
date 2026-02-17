#!/usr/bin/env node
/**
 * launch.js — Fix CRLF and launch extract.sh on all 40 VPS
 * 
 * Step 1: sed -i to fix CRLF line endings
 * Step 2: nohup bash extract.sh in background
 * Step 3: Verify with pgrep
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
            host, port: 22, username: 'root', password: pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('=== Step 1: Fix CRLF on all VPS (10 at a time) ===\n');

    const BATCH = 10;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass, "sed -i 's/\\r$//' /root/extract.sh && echo FIXED", 15000)
        ));
        results.forEach((r, j) => {
            const vps = batch[j];
            console.log(`  VPS-${String(vps.id).padStart(2)}: ${r.ok && r.out.includes('FIXED') ? '✅' : '❌ ' + r.out}`);
        });
    }

    console.log('\n=== Step 2: Launch extraction (10 at a time) ===\n');

    let launched = 0;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass,
                'pkill -f "bash /root/extract" 2>/dev/null; ' +
                'nohup bash /root/extract.sh > /root/cc_extract.log 2>&1 & disown; ' +
                'sleep 3; ' +
                'pgrep -fa extract.sh | grep -v pgrep | head -1',
                20000
            )
        ));
        results.forEach((r, j) => {
            const vps = batch[j];
            const ok = r.ok && r.out.length > 0 && !r.out.includes('ERR');
            console.log(`  VPS-${String(vps.id).padStart(2)}: ${ok ? '🚀' : '❌'} ${r.out.substring(0, 60)}`);
            if (ok) launched++;
        });
    }

    console.log(`\n=== Result: ${launched}/40 VPS launched ===`);

    // Step 3: Quick verify after 5s
    console.log('\n=== Step 3: Verify (5s later) ===\n');
    await new Promise(r => setTimeout(r, 5000));

    let running = 0;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            sshExec(vps.ip, vps.pass, 'pgrep -c -f extract.sh 2>/dev/null || echo 0', 10000)
        ));
        results.forEach((r, j) => {
            const vps = batch[j];
            const count = parseInt(r.out) || 0;
            if (count > 0) running++;
            console.log(`  VPS-${String(vps.id).padStart(2)}: ${count > 0 ? '🔄 running' : '⏸️ not running'} (${count} procs)`);
        });
    }

    console.log(`\n✅ ${running}/40 VPS actively running`);
    console.log('Monitor: node distribute.js --status');
})();
