#!/usr/bin/env node
/**
 * Compare mail config between a WORKING old VPS and NEW VPS
 * to find differences that could cause Ditlead issues
 */
const { Client } = require('ssh2');

// One known-good old VPS (VPS-21, working fine on Ditlead)
const OLD_VPS = { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
// One known-bad new VPS (VPS-40, just reconnected)
const NEW_VPS = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };

const CHECKS = [
    { name: 'Postfix main.cf', cmd: 'cat /etc/postfix/main.cf 2>/dev/null | grep -v "^#" | grep -v "^$" | sort' },
    { name: 'Postfix master.cf submission', cmd: 'grep -A 20 "^submission" /etc/postfix/master.cf 2>/dev/null' },
    { name: 'Dovecot version', cmd: 'dovecot --version 2>/dev/null' },
    { name: 'Dovecot auth config', cmd: 'cat /etc/dovecot/conf.d/10-auth.conf 2>/dev/null | grep -v "^#" | grep -v "^$"' },
    { name: 'Dovecot master config', cmd: 'cat /etc/dovecot/conf.d/10-master.conf 2>/dev/null | grep -v "^#" | grep -v "^$"' },
    { name: 'Dovecot passdb', cmd: 'cat /etc/dovecot/conf.d/auth-passwdfile.conf.ext 2>/dev/null || cat /etc/dovecot/conf.d/auth-system.conf.ext 2>/dev/null || echo "no auth-passwdfile"' },
    { name: 'Dovecot users file (first 3)', cmd: 'head -3 /etc/dovecot/users 2>/dev/null || echo "NO USERS FILE"' },
    { name: 'Dovecot users count', cmd: 'wc -l /etc/dovecot/users 2>/dev/null || echo "0"' },
    { name: 'OpenDKIM config', cmd: 'cat /etc/opendkim.conf 2>/dev/null | grep -v "^#" | grep -v "^$" | sort' },
    { name: 'OpenDKIM KeyTable', cmd: 'cat /etc/opendkim/KeyTable 2>/dev/null || echo "NO KeyTable"' },
    { name: 'OpenDKIM SigningTable', cmd: 'cat /etc/opendkim/SigningTable 2>/dev/null || echo "NO SigningTable"' },
    { name: 'DKIM keys exist', cmd: 'ls -la /etc/opendkim/keys/ 2>/dev/null' },
    { name: 'TLS cert', cmd: 'ls -la /etc/ssl/certs/mailcert.pem 2>/dev/null || ls -la /etc/letsencrypt/live/*/fullchain.pem 2>/dev/null || echo "NO CERT"' },
    { name: 'Services status', cmd: 'systemctl is-active postfix dovecot opendkim 2>/dev/null' },
    { name: 'SASL auth test (port 587)', cmd: 'echo QUIT | timeout 3 openssl s_client -starttls smtp -connect localhost:587 -quiet 2>&1 | head -5' },
    { name: 'Hostname', cmd: 'hostname && cat /etc/mailname 2>/dev/null || echo "no mailname"' },
];

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 20000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR:' + err.message); }
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
    console.log('=== COMPARING OLD VPS-' + OLD_VPS.id + ' vs NEW VPS-' + NEW_VPS.id + ' ===\n');

    for (const check of CHECKS) {
        console.log('────────────────────────────────────────');
        console.log('CHECK: ' + check.name);
        console.log('────────────────────────────────────────');

        const oldOut = await sshExec(OLD_VPS.ip, OLD_VPS.pass, check.cmd);
        const newOut = await sshExec(NEW_VPS.ip, NEW_VPS.pass, check.cmd);

        if (oldOut === newOut) {
            console.log('  ✅ IDENTICAL');
            console.log('  ' + oldOut.split('\n').slice(0, 3).join('\n  '));
        } else {
            console.log('  ⚠️ DIFFERENT!');
            console.log('  [OLD VPS-' + OLD_VPS.id + ']:');
            console.log('  ' + oldOut.split('\n').slice(0, 8).join('\n  '));
            console.log('  [NEW VPS-' + NEW_VPS.id + ']:');
            console.log('  ' + newOut.split('\n').slice(0, 8).join('\n  '));
        }
        console.log('');
    }

    console.log('=== COMPARISON DONE ===');
})();
