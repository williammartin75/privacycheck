#!/usr/bin/env node
// Quick check: are VPS 17-20 still producing milter-reject errors NOW?
const { Client } = require('ssh2');

const VPS = [
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domain: 'theprivacycheckerpro.cloud' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domain: 'theprivacycheckerpro.site' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domain: 'theprivacycheckerpro.online' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domain: 'theprivacycheckerpro.website' },
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
    for (const vps of VPS) {
        try {
            const conn = await sshConnect(vps);

            // Check recent milter-reject errors
            const rejects = await sshExec(conn, 'grep "milter-reject" /var/log/mail.log | tail -5');
            const rejectCount = await sshExec(conn, 'grep -c "milter-reject" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check recent DKIM signing successes
            const dkimOk = await sshExec(conn, 'grep "DKIM-Signature" /var/log/mail.log | tail -3');
            const dkimOkCount = await sshExec(conn, 'grep -c "DKIM-Signature" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check recent sent mail
            const sent = await sshExec(conn, 'grep "status=sent" /var/log/mail.log | tail -3');
            const sentCount = await sshExec(conn, 'grep -c "status=sent" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check recent deferred/bounced
            const deferred = await sshExec(conn, 'grep -c "status=deferred" /var/log/mail.log 2>/dev/null || echo "0"');
            const bounced = await sshExec(conn, 'grep -c "status=bounced" /var/log/mail.log 2>/dev/null || echo "0"');

            // Check OpenDKIM errors
            const dkimErrors = await sshExec(conn, 'grep "opendkim.*error" /var/log/mail.log | tail -3');

            // Check if signing table is correct
            const sigTable = await sshExec(conn, 'cat /etc/opendkim/signing.table');
            const keyTable = await sshExec(conn, 'cat /etc/opendkim/key.table');

            console.log(`\n${vps.id} (${vps.domain}):`);
            console.log(`  milter-rejects: ${rejectCount}`);
            console.log(`  DKIM signatures: ${dkimOkCount}`);
            console.log(`  sent: ${sentCount} | deferred: ${deferred} | bounced: ${bounced}`);
            console.log(`  signing.table: ${sigTable}`);
            console.log(`  key.table: ${keyTable}`);
            if (dkimErrors) console.log(`  DKIM errors: ${dkimErrors}`);
            if (rejects) console.log(`  Last rejects:\n${rejects.split('\n').slice(-2).map(l => '    ' + l.substring(0, 150)).join('\n')}`);
            if (sent) console.log(`  Last sent:\n${sent.split('\n').slice(-2).map(l => '    ' + l.substring(0, 150)).join('\n')}`);

            conn.end();
        } catch (e) {
            console.log(`\n${vps.id}: ❌ ${e.message}`);
        }
    }
}

main().catch(console.error);
