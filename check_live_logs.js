#!/usr/bin/env node
// Check LIVE mail logs on VPS 17-20 (where errors persist)
const { Client } = require('ssh2');

const VPS = [
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', d: 'theprivacycheckerpro.cloud' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', d: 'theprivacycheckerpro.site' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', d: 'theprivacycheckerpro.online' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', d: 'theprivacycheckerpro.website' },
];

function exec(c, cmd) {
    return new Promise((r, j) => {
        const t = setTimeout(() => j(new Error('Timeout')), 15000);
        c.exec(cmd, (e, s) => {
            if (e) { clearTimeout(t); return j(e); }
            let o = '';
            s.on('data', d => o += d.toString());
            s.stderr.on('data', () => { });
            s.on('close', () => { clearTimeout(t); r(o.trim()); });
        });
    });
}

function conn(v) {
    return new Promise((r, j) => {
        const c = new Client();
        c.on('ready', () => r(c));
        c.on('error', j);
        c.connect({
            host: v.ip, port: 22, username: 'root', password: v.pass,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function main() {
    for (const v of VPS) {
        try {
            const c = await conn(v);

            const dkim = await exec(c, 'systemctl is-active opendkim');
            const postfix = await exec(c, 'systemctl is-active postfix');

            // Count milter-rejects AFTER the fix (15:37 UTC)
            const rejectsAfterFix = await exec(c, 'grep "milter-reject" /var/log/mail.log | grep -c "T1[5-9]:" || echo 0');
            const lastReject = await exec(c, 'grep "milter-reject" /var/log/mail.log | tail -1 | cut -c1-40');

            // Recent DKIM errors
            const dkimErr = await exec(c, 'grep -i "opendkim.*error" /var/log/mail.log | tail -2');

            // Recent successful sends
            const sentCount = await exec(c, 'grep -c "status=sent" /var/log/mail.log || echo 0');
            const lastSent = await exec(c, 'grep "status=sent" /var/log/mail.log | tail -1 | cut -c1-100');

            // Recent bounces/deferred
            const deferred = await exec(c, 'grep -c "status=deferred" /var/log/mail.log || echo 0');
            const bounced = await exec(c, 'grep -c "status=bounced" /var/log/mail.log || echo 0');

            // Last 5 log lines
            const recent = await exec(c, 'tail -10 /var/log/mail.log');

            console.log(`\n=== ${v.id} (${v.d}) ===`);
            console.log(`  opendkim: ${dkim} | postfix: ${postfix}`);
            console.log(`  milter-rejects after fix: ${rejectsAfterFix}`);
            console.log(`  last reject: ${lastReject}`);
            console.log(`  sent: ${sentCount} | deferred: ${deferred} | bounced: ${bounced}`);
            console.log(`  last sent: ${lastSent}`);
            if (dkimErr) console.log(`  DKIM errors:\n${dkimErr}`);
            console.log(`  --- Recent logs ---`);
            console.log(recent);

            c.end();
        } catch (e) {
            console.log(`\n${v.id}: ERROR ${e.message}`);
        }
    }
}

main().catch(console.error);
