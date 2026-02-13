#!/usr/bin/env node
/**
 * FIX THE REAL ISSUE: mail_location uses ~/Maildir but home dir not set
 * Solution: change to maildir:/home/%n/Maildir (same as working VPS-21)
 * Apply to ALL VPS 31-40, restart Dovecot, and verify IMAP works
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

const servers = [
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', email: 'contact1@mailprivacychecker.space' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', email: 'contact1@contactprivacychecker.info' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', email: 'contact1@contactprivacychecker.cloud' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', email: 'contact1@contactprivacychecker.site' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N', email: 'contact1@reportprivacychecker.info' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm', email: 'contact1@reportprivacychecker.site' },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y', email: 'contact1@checkprivacychecker.info' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', email: 'contact1@checkprivacychecker.site' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', email: 'contact1@checkprivacychecker.space' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', email: 'contact1@checkprivacychecker.website' },
];

// Load password for test users
const creds = new Map();
for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
    const [email, password] = line.trim().split(',');
    if (email && password) creds.set(email, password);
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 30000);
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
    console.log('═══ FIXING mail_location on ALL VPS 31-40 ═══\n');

    for (const s of servers) {
        const testPass = creds.get(s.email) || 'M1a9n3GPhwYAxSZ+';

        const cmd = [
            // Fix mail_location to match working VPS-21
            `sed -i 's|^mail_location = maildir:~/Maildir|mail_location = maildir:/home/%n/Maildir|' /etc/dovecot/conf.d/10-mail.conf`,
            // Also set it via doveconf override in case the file doesn't have it
            `grep -q 'mail_location' /etc/dovecot/conf.d/10-mail.conf || echo 'mail_location = maildir:/home/%n/Maildir' >> /etc/dovecot/conf.d/10-mail.conf`,
            // Verify the setting
            `echo "CONF: $(grep mail_location /etc/dovecot/conf.d/10-mail.conf | head -1)"`,
            // Restart dovecot
            'systemctl restart dovecot',
            // Test IMAP login + SELECT INBOX
            `python3 -c "
import imaplib
try:
    m = imaplib.IMAP4('localhost', 143)
    m.login('${s.email}', '${testPass}')
    status, data = m.select('INBOX')
    print('IMAP_OK status=' + status)
    m.logout()
except Exception as e:
    print('IMAP_FAIL: ' + str(e))
"`,
        ].join(' && ');

        process.stdout.write(`VPS-${s.id}... `);
        const result = await sshExec(s.ip, s.pass, cmd);

        const lines = result.split('\n');
        const conf = lines.find(l => l.includes('CONF:')) || '';
        const imap = lines.find(l => l.includes('IMAP_')) || '';
        console.log(`${conf} | ${imap}`);
    }

    console.log('\n═══ DONE ═══');
})();
