#!/usr/bin/env node
const { Client } = require('ssh2');

const VPS40 = { ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };
const VPS21 = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

const CHECKS = [
    { name: 'DOVECOT VERSION', cmd: 'dovecot --version 2>&1' },
    { name: 'DOVECOT PROTOCOLS', cmd: 'doveconf protocols 2>/dev/null | head -3' },
    { name: 'IMAP CONFIG', cmd: 'doveconf -f service=imap 2>/dev/null | grep -i "protocol\\|ssl\\|auth\\|login\\|disable_plaintext" | head -15' },
    { name: 'SSL CONFIG', cmd: 'doveconf ssl ssl_cert ssl_key ssl_min_protocol 2>/dev/null | head -10' },
    { name: '10-ssl.conf', cmd: 'cat /etc/dovecot/conf.d/10-ssl.conf 2>/dev/null | grep -v "^#" | grep -v "^$"' },
    { name: '10-mail.conf (mail_location)', cmd: 'doveconf mail_location 2>/dev/null' },
    {
        name: 'IMAP LOGIN TEST from localhost', cmd: `python3 -c "
import imaplib
try:
    m = imaplib.IMAP4('localhost', 143)
    print('IMAP CONNECT OK, capabilities:', m.capabilities)
    m.login('contact1@checkprivacychecker.website' if '155' in '155.94' else 'contact1@privacyaudit.online', 'M1a9n3GPhwYAxSZ+')
    print('IMAP LOGIN OK')
    m.select('INBOX')
    print('IMAP SELECT INBOX OK')
    m.logout()
except Exception as e:
    print('IMAP FAIL: ' + str(e))
" 2>&1`},
    { name: 'RECENT DOVECOT IMAP LOG', cmd: 'journalctl -u dovecot --no-pager -n 10 2>/dev/null | grep -i imap' },
];

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 25000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR'); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    for (const vps of [{ label: 'VPS-40 (BROKEN)', ...VPS40, email: 'contact1@checkprivacychecker.website' }, { label: 'VPS-21 (WORKING)', ...VPS21, email: 'contact1@privacyaudit.online' }]) {
        console.log(`\n━━━━━━━━ ${vps.label} ━━━━━━━━`);
        for (const check of CHECKS) {
            let cmd = check.cmd;
            if (check.name === 'IMAP LOGIN TEST from localhost') {
                cmd = `python3 -c "
import imaplib
try:
    m = imaplib.IMAP4('localhost', 143)
    print('IMAP CONNECT OK, capabilities:', m.capabilities)
    m.login('${vps.email}', 'M1a9n3GPhwYAxSZ+')
    print('IMAP LOGIN OK')
    m.select('INBOX')
    print('IMAP SELECT INBOX OK')
    m.logout()
except Exception as e:
    print('IMAP FAIL: ' + str(e))
" 2>&1`;
            }
            console.log(`\n  ${check.name}:`);
            const r = await sshExec(vps.ip, vps.pass, cmd);
            console.log('  ' + r.split('\n').join('\n  '));
        }
    }
    console.log('\n=== DONE ===');
})();
