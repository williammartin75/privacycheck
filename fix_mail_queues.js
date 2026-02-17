#!/usr/bin/env node
/**
 * Fix mail queue on all VPS with stuck emails
 * 1. Check VPS-29 port 25 status
 * 2. Flush/delete old queued mails on all affected VPS
 */
const { Client } = require('ssh2');

const AFFECTED_VPS = [
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
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

// VPS-29 for diagnosis
const VPS29 = { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

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
    // Phase 1: Diagnose VPS-29 port 25
    console.log('═══ Phase 1: Diagnose VPS-29 port 25 ═══\n');
    const diag = await ssh(VPS29.ip, VPS29.pass, `
echo "=== Postfix status ===";
systemctl status postfix | head -5;
echo "";
echo "=== Port 25 listening ===";
ss -tlnp | grep ':25 ';
echo "";
echo "=== Docker containers ===";
docker ps --format '{{.Names}} {{.Ports}} {{.Status}}' 2>/dev/null || echo 'no docker';
echo "";
echo "=== iptables port 25 ===";
iptables -L INPUT -n --line-numbers 2>/dev/null | grep -E '25|REJECT|DROP' | head -5;
echo "";
echo "=== Postfix inet_interfaces ===";
postconf inet_interfaces 2>/dev/null;
echo "";
echo "=== Transport maps ===";
cat /etc/postfix/transport 2>/dev/null | head -5;
    `);
    console.log(diag);

    // Phase 2: Delete stuck mails from affected VPS queues
    console.log('\n\n═══ Phase 2: Flush mail queues on 24 affected VPS ═══\n');

    const BATCH = 5;
    for (let i = 0; i < AFFECTED_VPS.length; i += BATCH) {
        const batch = AFFECTED_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(v => ssh(v.ip, v.pass, `
BEFORE=$(mailq 2>/dev/null | grep -c '^[A-F0-9]' || echo 0);
postsuper -d ALL 2>/dev/null;
AFTER=$(mailq 2>/dev/null | grep -c '^[A-F0-9]' || echo 0);
echo "before=$BEFORE after=$AFTER";
        `)));

        for (let j = 0; j < batch.length; j++) {
            const v = batch[j];
            console.log(`  VPS-${String(v.id).padStart(2)}: ${results[j]}`);
        }
    }

    // Phase 3: Remove HappyDeliver transport map entries (no longer needed)
    console.log('\n\n═══ Phase 3: Clean transport maps ═══\n');
    for (let i = 0; i < AFFECTED_VPS.length; i += BATCH) {
        const batch = AFFECTED_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(v => ssh(v.ip, v.pass, `
if grep -q 'emailtester.local' /etc/postfix/transport 2>/dev/null; then
    sed -i '/emailtester.local/d' /etc/postfix/transport;
    postmap /etc/postfix/transport 2>/dev/null;
    postfix reload 2>/dev/null >/dev/null;
    echo "cleaned transport + reloaded";
else
    echo "transport clean already";
fi
        `)));

        for (let j = 0; j < batch.length; j++) {
            const v = batch[j];
            console.log(`  VPS-${String(v.id).padStart(2)}: ${results[j]}`);
        }
    }

    console.log('\n✅ Done. All queues flushed and transport maps cleaned.');
})();
