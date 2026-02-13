#!/usr/bin/env node
const { Client } = require('ssh2');

// VPS 38-40 are showing 451 errors, also check VPS-21 (working) for comparison
const servers = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', label: 'OLD-WORKING' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', label: 'checkprivacychecker.site' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', label: 'checkprivacychecker.space' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', label: 'checkprivacychecker.website' },
];

const CHECKS = [
    { name: 'postconf conflict check', cmd: 'postconf mydestination virtual_mailbox_domains virtual_mailbox_maps virtual_transport 2>&1' },
    { name: 'recent 451 errors', cmd: 'journalctl -u postfix --no-pager -n 30 2>/dev/null | grep -i "451\\|reject\\|unavailable\\|error" | tail -10 || echo "no journal"' },
    { name: 'mail.log 451', cmd: 'tail -50 /var/log/mail.log 2>/dev/null | grep -i "451\\|reject\\|unavailable\\|error" | tail -10 || echo "no mail.log"' },
    { name: 'syslog 451', cmd: 'tail -50 /var/log/syslog 2>/dev/null | grep -i "postfix.*451\\|postfix.*reject\\|postfix.*error" | tail -10 || echo "no syslog"' },
    { name: 'postfix check', cmd: 'postfix check 2>&1 || echo "CHECK_FAILED"' },
    { name: 'postscreen', cmd: 'grep -r "postscreen" /etc/postfix/master.cf 2>/dev/null || echo "no postscreen"' },
    { name: 'smtpd restrictions', cmd: 'postconf smtpd_recipient_restrictions smtpd_relay_restrictions smtpd_sender_restrictions 2>&1' },
];

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 20000);
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
    for (const s of servers) {
        console.log(`\n╔══ VPS-${s.id} (${s.label}) ══╗`);
        for (const check of CHECKS) {
            console.log(`  ── ${check.name} ──`);
            const out = await sshExec(s.ip, s.pass, check.cmd);
            console.log('  ' + out.split('\n').join('\n  '));
        }
    }
    console.log('\n=== DONE ===');
})();
