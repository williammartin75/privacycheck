#!/usr/bin/env node
/**
 * Deep investigation: what REALLY happens when Ditlead tries to send 
 * Check everything on VPS-40 (checkprivacychecker.website)
 */
const { Client } = require('ssh2');

const VPS = { ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };

const CHECKS = [
    // 1. Recent mail log entries (ALL entries, not just errors)
    { name: 'RECENT MAIL LOG (last 50)', cmd: 'tail -50 /var/log/mail.log 2>/dev/null || journalctl -u postfix --no-pager -n 50 2>/dev/null || tail -50 /var/log/syslog 2>/dev/null | grep -i "postfix\\|dovecot\\|opendkim"' },

    // 2. Postfix queue - are there stuck mails?
    { name: 'POSTFIX QUEUE', cmd: 'mailq 2>/dev/null | head -30' },

    // 3. Full postfix main.cf (all non-default settings)
    { name: 'POSTFIX MAIN.CF (non-default)', cmd: 'postconf -n 2>/dev/null | head -40' },

    // 4. Hostname and myhostname match
    { name: 'HOSTNAME vs MYHOSTNAME', cmd: 'echo "hostname=$(hostname)" && postconf myhostname mydomain myorigin' },

    // 5. OpenDKIM - is it running and signing?
    { name: 'OPENDKIM STATUS', cmd: 'systemctl is-active opendkim && cat /etc/opendkim/KeyTable 2>/dev/null && cat /etc/opendkim/SigningTable 2>/dev/null' },

    // 6. OpenDKIM socket check  
    { name: 'OPENDKIM SOCKET', cmd: 'postconf smtpd_milters non_smtpd_milters milter_default_action 2>/dev/null' },

    // 7. Dovecot auth test
    { name: 'DOVECOT AUTH TEST', cmd: 'doveadm auth test gdpr4@checkprivacychecker.website M1a9n3GPhwYAxSZ+ 2>&1 | head -5' },

    // 8. Real SMTP send test via port 587 (what Ditlead does)
    {
        name: 'SMTP AUTH + SEND TEST (port 587)', cmd: `python3 -c "
import smtplib
from email.mime.text import MIMEText
try:
    s = smtplib.SMTP('localhost', 587, timeout=10)
    s.ehlo()
    s.starttls()
    s.login('gdpr4@checkprivacychecker.website', 'M1a9n3GPhwYAxSZ+')
    msg = MIMEText('Test from deep investigation')
    msg['From'] = 'gdpr4@checkprivacychecker.website'
    msg['To'] = 'gdpr4@checkprivacychecker.website'
    msg['Subject'] = 'Deep test'
    s.send_message(msg)
    s.quit()
    print('SEND_OK')
except Exception as e:
    print('SEND_ERR: ' + str(e))
" 2>&1`},

    // 9. Check mail log AFTER send test
    { name: 'MAIL LOG AFTER SEND', cmd: 'sleep 2 && tail -20 /var/log/mail.log 2>/dev/null || journalctl -u postfix --no-pager -n 20 2>/dev/null' },

    // 10. IP reputation - check if listed on major blacklists
    {
        name: 'IP BLACKLIST CHECK', cmd: `python3 -c "
import socket
ip = '155.94.155.113'
rev = '.'.join(ip.split('.')[::-1])
bls = ['zen.spamhaus.org','bl.spamcop.net','b.barracudacentral.org','dnsbl.sorbs.net']
for bl in bls:
    try:
        r = socket.getaddrinfo(rev+'.'+bl, None)
        print(f'  LISTED on {bl}: {r[0][4][0]}')
    except:
        print(f'  clean on {bl}')
" 2>&1`},

    // 11. Check if port 25 outbound is blocked (can we reach external SMTP?)
    {
        name: 'OUTBOUND PORT 25 TEST', cmd: `python3 -c "
import socket
try:
    s = socket.create_connection(('gmail-smtp-in.l.google.com', 25), timeout=5)
    print('PORT 25 OUTBOUND: OPEN')
    s.close()
except Exception as e:
    print('PORT 25 OUTBOUND: BLOCKED - ' + str(e))
" 2>&1`},

    // 12. Check master.cf for submission service
    { name: 'MASTER.CF SUBMISSION', cmd: 'grep -A 10 "^submission" /etc/postfix/master.cf 2>/dev/null' },
];

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 30000);
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
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  DEEP INVESTIGATION: VPS-40               ║');
    console.log('║  checkprivacychecker.website (155.94.155.113) ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    for (const check of CHECKS) {
        console.log(`\n═══ ${check.name} ═══`);
        const out = await sshExec(VPS.ip, VPS.pass, check.cmd);
        console.log(out);
    }

    console.log('\n╔═══════════════════════════╗');
    console.log('║  INVESTIGATION COMPLETE   ║');
    console.log('╚═══════════════════════════╝');
})();
