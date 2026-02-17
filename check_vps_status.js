#!/usr/bin/env node
/**
 * Full 40-VPS Status Check
 * Checks: uptime, extract_v3.py status, postfix, mail queue, CPU
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

function ssh(host, pass, cmd, timeout = 20000) {
    return new Promise((resolve) => {
        const c = new Client();
        const timer = setTimeout(() => { c.end(); resolve('[TIMEOUT]'); }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(timer); c.end(); resolve('[ERROR]'); return; }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(timer); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(timer); resolve('[CONN_ERR] ' + e.message); });
        c.connect({ host, port: 22, username: 'root', password: pass, readyTimeout: 15000 });
    });
}

(async () => {
    console.log('╔══════════════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║  FULL 40-VPS STATUS CHECK                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════════════════╝\n');

    console.log('VPS   IP                  Uptime            extract_v3   Workers  Postfix   Queue     CPU%');
    console.log('───   ──                  ──────            ──────────   ───────  ───────   ─────     ────');

    const results = [];
    let total_ok = 0, total_err = 0, total_extract = 0, total_queue = 0;

    // Process 5 at a time for speed
    const BATCH = 5;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const outputs = await Promise.all(batch.map(v => ssh(v.ip, v.pass, `
echo "UP=$(uptime -p 2>/dev/null | sed 's/up //')";
echo "EXTRACT=$(pgrep -c -f extract_v3.py 2>/dev/null || echo 0)";
echo "POSTFIX=$(systemctl is-active postfix 2>/dev/null || echo unknown)";
QCOUNT=$(mailq 2>/dev/null | grep -c '^[A-F0-9]' || echo 0);
echo "QUEUE=$QCOUNT";
echo "CPU=$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' 2>/dev/null || echo '?')";
        `)));

        for (let j = 0; j < batch.length; j++) {
            const v = batch[j];
            const raw = outputs[j];

            if (raw.startsWith('[')) {
                console.log(`${String(v.id).padStart(3)}   ${v.ip.padEnd(20)} ${raw}`);
                total_err++;
                continue;
            }

            const get = (key) => { const m = raw.match(new RegExp(`${key}=(.*)`)); return m ? m[1].trim() : '?'; };
            const uptime = get('UP').substring(0, 18);
            const extractCount = parseInt(get('EXTRACT')) || 0;
            const postfix = get('POSTFIX');
            const queueCount = parseInt(get('QUEUE')) || 0;
            const cpu = get('CPU');

            total_ok++;
            if (extractCount > 0) total_extract++;
            total_queue += queueCount;

            const extractIcon = extractCount > 0 ? '✅ running' : '❌ stopped';
            const postfixIcon = postfix === 'active' ? '✅' : '❌';
            const queueStr = queueCount === 0 ? '✅ empty' : `⚠️ ${queueCount}`;

            console.log(`${String(v.id).padStart(3)}   ${v.ip.padEnd(20)} ${uptime.padEnd(18)} ${extractIcon.padEnd(12)} ${String(extractCount).padEnd(8)} ${postfixIcon}${postfix.padEnd(8)} ${queueStr.padEnd(10)} ${cpu}%`);

            results.push({ id: v.id, ip: v.ip, uptime, extractCount, postfix, queueCount, cpu });
        }
    }

    console.log('\n════════════════════════════════════════════════════════════════════════════════════════════');
    console.log(`SUMMARY:`);
    console.log(`  VPS Online: ${total_ok}/40  |  Errors: ${total_err}`);
    console.log(`  extract_v3.py running: ${total_extract}/40`);
    console.log(`  Total queued mails: ${total_queue}`);
    console.log(`  VPS with queue issues: ${results.filter(r => r.queueCount > 0).map(r => `VPS-${r.id}(${r.queueCount})`).join(', ') || 'none'}`);
    console.log(`  VPS with extract stopped: ${results.filter(r => r.extractCount === 0).map(r => `VPS-${r.id}`).join(', ') || 'none'}`);
})();
