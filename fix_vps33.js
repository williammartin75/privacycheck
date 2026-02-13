#!/usr/bin/env node
/**
 * Debug and fix VPS-33 IMAP auth issue
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS33 = { ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' };
const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

// Load creds for VPS-33
const creds = [];
for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
    const [email, password, ip] = line.trim().split(',');
    if (email && ip === VPS33.ip) creds.push({ email, password });
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 60000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('═══ DEBUGGING VPS-33 ═══');
    console.log(`${creds.length} users for VPS-33`);

    // Check current state
    let r = await sshExec(VPS33.ip, VPS33.pass, 'cat /etc/dovecot/users | head -5 && echo "---" && wc -l /etc/dovecot/users && echo "---" && cat /etc/dovecot/conf.d/10-auth.conf');
    console.log('\nCurrent state:\n' + r);

    // Check if the user exists
    r = await sshExec(VPS33.ip, VPS33.pass, `doveadm auth test '${creds[0].email}' '${creds[0].password}' 2>&1`);
    console.log('\nAuth test: ' + r);

    // Check system user existence
    r = await sshExec(VPS33.ip, VPS33.pass, `id contact1 2>&1 && ls -la /home/contact1/Maildir/ 2>&1`);
    console.log('\nSystem user: ' + r);

    // Re-check if the fix_all_auth.js actually wrote the file correctly
    r = await sshExec(VPS33.ip, VPS33.pass, 'ls -la /etc/dovecot/users && stat /etc/dovecot/users');
    console.log('\nFile info: ' + r);

    // The issue might be that the users file didn't get written properly
    // Let's rewrite it explicitly
    console.log('\n\nRewriting users file...');
    const usersLines = creds.map(c => {
        const localPart = c.email.split('@')[0];
        return `${c.email}:{PLAIN}${c.password}:1000:1000:::/home/${localPart}/Maildir`;
    });
    const usersContent = usersLines.join('\n') + '\n';
    const b64 = Buffer.from(usersContent).toString('base64');

    r = await sshExec(VPS33.ip, VPS33.pass, [
        `echo "${b64}" | base64 -d > /etc/dovecot/users`,
        'chown root:dovecot /etc/dovecot/users',
        'chmod 640 /etc/dovecot/users',
        'systemctl restart dovecot',
        'sleep 1',
        `doveadm auth test '${creds[0].email}' '${creds[0].password}' 2>&1`,
    ].join(' && '));
    console.log('After rewrite: ' + r);

    // Final IMAP test
    r = await sshExec(VPS33.ip, VPS33.pass, `python3 -c "
import imaplib
try:
    m = imaplib.IMAP4('localhost', 143)
    m.login('${creds[0].email}', '${creds[0].password}')
    status, data = m.select('INBOX')
    print('IMAP_OK status=' + status)
    m.logout()
except Exception as e:
    print('IMAP_FAIL: ' + str(e))
"`);
    console.log('IMAP test: ' + r);

    console.log('\n═══ DONE ═══');
})();
