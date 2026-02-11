#!/usr/bin/env node
// Check CURRENT mail log status on ALL 10 VPS
const { Client } = require('ssh2');

const ALL_VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domains: ['theprivacycheckerpro.cloud'] },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domains: ['theprivacycheckerpro.site'] },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domains: ['theprivacycheckerpro.online'] },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domains: ['theprivacycheckerpro.website'] },
];

function sshExec(conn, cmd, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', () => { });
            stream.on('close', () => { clearTimeout(timer); resolve(stdout.trim()); });
        });
    });
}

function sshConnect(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pass,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function main() {
    for (const vps of ALL_VPS) {
        try {
            const conn = await sshConnect(vps);

            // Check recent (last 1 hour) milter-rejects
            const recentRejects = await sshExec(conn, 'grep "milter-reject" /var/log/mail.log | tail -3');
            const rejectCount = await sshExec(conn, 'grep -c "milter-reject" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check last email activity
            const lastSent = await sshExec(conn, 'grep "status=sent" /var/log/mail.log | tail -1');
            const sentCount = await sshExec(conn, 'grep -c "status=sent" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check OpenDKIM status
            const dkimStatus = await sshExec(conn, 'systemctl is-active opendkim');
            const postfixStatus = await sshExec(conn, 'systemctl is-active postfix');

            // Check signing table
            const sigTable = await sshExec(conn, 'cat /etc/opendkim/signing.table 2>/dev/null || echo "MISSING"');
            const keyTable = await sshExec(conn, 'cat /etc/opendkim/key.table 2>/dev/null || echo "MISSING"');

            // Check key file permissions
            const keyPerms = await sshExec(conn, 'ls -la /etc/opendkim/keys/*/mail.private 2>/dev/null || echo "NO KEYS"');

            // Recent errors 
            const dkimErrors = await sshExec(conn, 'grep -i "opendkim.*error\\|dkim.*fail" /var/log/mail.log | tail -2');

            // Check DKIM signature count
            const dkimSigned = await sshExec(conn, 'grep -c "DKIM-Signature" /var/log/mail.log 2>/dev/null || echo "0"');

            console.log(`\n${vps.id} (${vps.domains.join(', ')}):`);
            console.log(`  Services: opendkim=${dkimStatus} postfix=${postfixStatus}`);
            console.log(`  Rejects: ${rejectCount} | Sent: ${sentCount} | DKIM signed: ${dkimSigned}`);
            console.log(`  signing.table: ${sigTable.substring(0, 120)}`);
            console.log(`  key.table: ${keyTable.substring(0, 120)}`);
            if (dkimErrors) console.log(`  DKIM errors: ${dkimErrors.substring(0, 200)}`);
            if (recentRejects) console.log(`  Last reject: ${recentRejects.split('\n').pop().substring(0, 150)}`);
            if (lastSent) console.log(`  Last sent: ${lastSent.substring(0, 150)}`);

            conn.end();
        } catch (e) {
            console.log(`\n${vps.id}: ❌ ${e.message}`);
        }
    }
}

main().catch(console.error);
