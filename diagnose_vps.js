#!/usr/bin/env node
// Diagnose theprivacycheckerpro.* VPS (17-20)
const { Client } = require('ssh2');

const PROBLEM_VPS = [
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domain: 'theprivacycheckerpro.cloud' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domain: 'theprivacycheckerpro.site' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domain: 'theprivacycheckerpro.online' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domain: 'theprivacycheckerpro.website' },
];

function sshExec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${cmd.substring(0, 60)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => { clearTimeout(timer); resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code }); });
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

async function diagnose(vps) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  ${vps.id} — ${vps.ip} — ${vps.domain}`);
    console.log(`${'='.repeat(60)}`);

    let conn;
    try {
        conn = await sshConnect(vps);
        console.log('  ✅ SSH connected');

        // 1. Check services
        const postfix = await sshExec(conn, 'systemctl is-active postfix');
        const dovecot = await sshExec(conn, 'systemctl is-active dovecot');
        console.log(`  Postfix: ${postfix.stdout} | Dovecot: ${dovecot.stdout}`);

        // 2. Check Postfix is listening on 587
        const ports = await sshExec(conn, 'ss -tlnp | grep -E "587|993|25"');
        console.log(`  Ports:\n    ${ports.stdout.split('\n').join('\n    ')}`);

        // 3. Check hostname
        const hostname = await sshExec(conn, 'hostname');
        console.log(`  Hostname: ${hostname.stdout}`);

        // 4. Check Postfix myhostname
        const myhostname = await sshExec(conn, 'postconf myhostname');
        console.log(`  ${myhostname.stdout}`);

        // 5. Check dovecot users file
        const usersCount = await sshExec(conn, 'wc -l /etc/dovecot/users');
        const firstUser = await sshExec(conn, 'head -1 /etc/dovecot/users');
        console.log(`  Dovecot users: ${usersCount.stdout}`);
        console.log(`  First user: ${firstUser.stdout.substring(0, 60)}`);

        // 6. Check dovecot auth config
        const authConf = await sshExec(conn, 'cat /etc/dovecot/conf.d/10-auth.conf');
        console.log(`  Auth config:\n    ${authConf.stdout.split('\n').join('\n    ')}`);

        // 7. Test dovecot auth directly
        const email = `contact1@${vps.domain}`;
        const passLine = await sshExec(conn, `grep "^${email}:" /etc/dovecot/users`);
        if (passLine.stdout) {
            // Extract password from {PLAIN}password or just password
            const parts = passLine.stdout.split(':');
            let password = parts[1] || '';
            password = password.replace('{PLAIN}', '');
            console.log(`  Testing auth: ${email} / ${password.substring(0, 4)}...`);

            const authTest = await sshExec(conn, `doveadm auth test "${email}" "${password}" 2>&1`);
            console.log(`  doveadm auth: ${authTest.stdout}`);
        } else {
            console.log(`  ⚠️ User ${email} NOT found in /etc/dovecot/users`);
        }

        // 8. Check mailboxes.txt
        const mbCount = await sshExec(conn, 'wc -l /root/mailboxes.txt');
        const firstMb = await sshExec(conn, 'head -1 /root/mailboxes.txt');
        console.log(`  mailboxes.txt: ${mbCount.stdout}`);
        console.log(`  First mailbox: ${firstMb.stdout}`);

        // 9. Test SMTP directly
        const smtpTest = await sshExec(conn, `(echo "EHLO test"; sleep 1; echo "QUIT") | timeout 5 openssl s_client -starttls smtp -connect 127.0.0.1:587 -quiet 2>/dev/null | head -5`, 15000);
        console.log(`  SMTP test:\n    ${smtpTest.stdout.split('\n').join('\n    ')}`);

        // 10. Check Postfix logs for errors
        const logs = await sshExec(conn, 'tail -20 /var/log/mail.log 2>/dev/null | grep -iE "error|fatal|reject|warning" | tail -5');
        if (logs.stdout) {
            console.log(`  Mail log errors:\n    ${logs.stdout.split('\n').join('\n    ')}`);
        } else {
            console.log('  Mail logs: no recent errors');
        }

        // 11. Check DNS resolution
        const dns = await sshExec(conn, `dig +short A ${vps.domain} 2>/dev/null || echo "dig not available"`);
        const mx = await sshExec(conn, `dig +short MX ${vps.domain} 2>/dev/null || echo "dig not available"`);
        console.log(`  DNS A: ${dns.stdout}`);
        console.log(`  DNS MX: ${mx.stdout}`);

        // 12. Check Postfix virtual domains config
        const virtualDomains = await sshExec(conn, 'postconf virtual_mailbox_domains 2>/dev/null');
        console.log(`  ${virtualDomains.stdout}`);

        // 13. Check TLS/SSL cert
        const certCheck = await sshExec(conn, 'postconf smtpd_tls_cert_file smtpd_tls_key_file 2>/dev/null');
        console.log(`  ${certCheck.stdout.split('\n').join('\n  ')}`);

        conn.end();
    } catch (err) {
        console.log(`  ❌ FAILED: ${err.message}`);
        if (conn) conn.end();
    }
}

async function main() {
    console.log('============================================================');
    console.log('  DIAGNOSE: theprivacycheckerpro.* VPS (17-20)');
    console.log('============================================================');

    for (const vps of PROBLEM_VPS) {
        await diagnose(vps);
    }
}

main().catch(console.error);
