#!/usr/bin/env node
/**
 * DEFINITIVE INVESTIGATION - Why does Ditlead still fail?
 * 
 * Theory: doveadm auth test works but the Postfix→Dovecot auth socket
 * may not be functioning. Or there's a firewall. Or rsyslog isn't logging.
 * 
 * Tests:
 * 1. Check rsyslog status and config
 * 2. Check iptables/firewall rules on port 587
 * 3. Do a real SMTP AUTH test on port 587 from INSIDE the VPS (localhost)
 * 4. Check Dovecot auth socket existence and permissions
 * 5. Check Postfix SASL config pointing to correct Dovecot socket
 * 6. Check mail log DURING the test
 * 7. Try to telnet to port 587 from another VPS (external test)
 * 8. Compare with OLD working VPS-21
 */
const { Client } = require('ssh2');

const VPS40 = { ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };
const VPS21 = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
// Use VPS-31 as external tester
const VPS31 = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function sshExec(host, pass, cmd, timeout = 30000) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, timeout);
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
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║  DEFINITIVE INVESTIGATION - VPS-40 vs VPS-21  ║');
    console.log('╚═══════════════════════════════════════════════╝\n');

    // ============ VPS-40 (BROKEN) ============
    console.log('━━━━━━━━━━━━ VPS-40 (BROKEN) ━━━━━━━━━━━━');

    console.log('\n1. RSYSLOG STATUS + CONFIG');
    let r = await sshExec(VPS40.ip, VPS40.pass, 'systemctl is-active rsyslog 2>/dev/null || echo "NOT_RUNNING" && grep -i mail /etc/rsyslog.d/*.conf /etc/rsyslog.conf 2>/dev/null | head -5');
    console.log('  ' + r);

    console.log('\n2. IPTABLES/FIREWALL on port 587');
    r = await sshExec(VPS40.ip, VPS40.pass, 'iptables -L -n 2>/dev/null | grep -i "587\\|submission" | head -5 || echo "no iptables rules"');
    console.log('  ' + r);

    console.log('\n3. UFW STATUS');
    r = await sshExec(VPS40.ip, VPS40.pass, 'ufw status 2>/dev/null || echo "ufw not installed"');
    console.log('  ' + r);

    console.log('\n4. PORT 587 LISTENING?');
    r = await sshExec(VPS40.ip, VPS40.pass, 'ss -tlnp | grep ":587\\|:25\\|:143"');
    console.log('  ' + r);

    console.log('\n5. DOVECOT AUTH SOCKET');
    r = await sshExec(VPS40.ip, VPS40.pass, 'ls -la /var/spool/postfix/private/auth 2>/dev/null && ls -la /var/run/dovecot/auth-* 2>/dev/null || echo "no dovecot auth socket found"');
    console.log('  ' + r);

    console.log('\n6. POSTFIX SASL CONFIG');
    r = await sshExec(VPS40.ip, VPS40.pass, 'postconf smtpd_sasl_type smtpd_sasl_path smtpd_sasl_auth_enable 2>/dev/null');
    console.log('  ' + r);

    console.log('\n7. DOVECOT AUTH SERVICE CONFIG');
    r = await sshExec(VPS40.ip, VPS40.pass, 'grep -A 20 "service auth" /etc/dovecot/conf.d/10-master.conf 2>/dev/null');
    console.log('  ' + r);

    console.log('\n8. REAL SMTP AUTH TEST (localhost:587)');
    r = await sshExec(VPS40.ip, VPS40.pass, `python3 -c "
import smtplib, base64
try:
    s = smtplib.SMTP('localhost', 587, timeout=10)
    s.set_debuglevel(1)
    s.ehlo('test.local')
    s.starttls()
    s.ehlo('test.local')
    s.login('contact1@checkprivacychecker.website', 'M1a9n3GPhwYAxSZ+')
    print('AUTH_OK')
    s.quit()
except Exception as e:
    print('AUTH_FAIL: ' + str(e))
" 2>&1`, 20000);
    console.log('  ' + r.split('\n').slice(-5).join('\n  '));

    console.log('\n9. MAIL LOG CONTENT (all of it)');
    r = await sshExec(VPS40.ip, VPS40.pass, 'wc -l /var/log/mail.log 2>/dev/null && tail -5 /var/log/mail.log 2>/dev/null');
    console.log('  ' + r);

    console.log('\n10. JOURNALCTL POSTFIX (last 15 lines)');
    r = await sshExec(VPS40.ip, VPS40.pass, 'journalctl -u postfix -u dovecot --no-pager -n 15 2>/dev/null');
    console.log('  ' + r);

    // ============ VPS-21 (WORKING) ============
    console.log('\n\n━━━━━━━━━━━━ VPS-21 (WORKING) ━━━━━━━━━━━━');

    console.log('\n1. RSYSLOG STATUS');
    r = await sshExec(VPS21.ip, VPS21.pass, 'systemctl is-active rsyslog 2>/dev/null || echo "NOT_RUNNING"');
    console.log('  ' + r);

    console.log('\n4. PORT 587 LISTENING?');
    r = await sshExec(VPS21.ip, VPS21.pass, 'ss -tlnp | grep ":587\\|:25\\|:143"');
    console.log('  ' + r);

    console.log('\n5. DOVECOT AUTH SOCKET');
    r = await sshExec(VPS21.ip, VPS21.pass, 'ls -la /var/spool/postfix/private/auth 2>/dev/null');
    console.log('  ' + r);

    console.log('\n7. DOVECOT AUTH SERVICE CONFIG');
    r = await sshExec(VPS21.ip, VPS21.pass, 'grep -A 20 "service auth" /etc/dovecot/conf.d/10-master.conf 2>/dev/null');
    console.log('  ' + r);

    console.log('\n8. REAL SMTP AUTH TEST (localhost:587)');
    r = await sshExec(VPS21.ip, VPS21.pass, `python3 -c "
import smtplib
try:
    s = smtplib.SMTP('localhost', 587, timeout=10)
    s.ehlo('test.local')
    s.starttls()
    s.ehlo('test.local')
    s.login('contact1@privacyaudit.online', 'M1a9n3GPhwYAxSZ+')
    print('AUTH_OK')
    s.quit()
except Exception as e:
    print('AUTH_FAIL: ' + str(e))
" 2>&1`, 20000);
    console.log('  ' + r.split('\n').slice(-3).join('\n  '));

    // ============ EXTERNAL TEST ============
    console.log('\n\n━━━━━━━━━━━━ EXTERNAL TEST (VPS-31 → VPS-40) ━━━━━━━━━━━━');

    console.log('\n11. CAN VPS-31 REACH VPS-40 on port 587?');
    r = await sshExec(VPS31.ip, VPS31.pass, `python3 -c "
import socket
try:
    s = socket.create_connection(('155.94.155.113', 587), timeout=5)
    data = s.recv(1024)
    print('CONNECTED: ' + data.decode().strip())
    s.close()
except Exception as e:
    print('BLOCKED: ' + str(e))
" 2>&1`);
    console.log('  ' + r);

    console.log('\n12. FULL SMTP AUTH FROM VPS-31 → VPS-40');
    r = await sshExec(VPS31.ip, VPS31.pass, `python3 -c "
import smtplib
try:
    s = smtplib.SMTP('155.94.155.113', 587, timeout=10)
    s.ehlo('external-test')
    s.starttls()
    s.ehlo('external-test')
    s.login('contact1@checkprivacychecker.website', 'M1a9n3GPhwYAxSZ+')
    print('EXTERNAL_AUTH_OK')
    s.quit()
except Exception as e:
    print('EXTERNAL_AUTH_FAIL: ' + str(e))
" 2>&1`, 20000);
    console.log('  ' + r);

    console.log('\n╔═══════════════════════════════════════╗');
    console.log('║  INVESTIGATION COMPLETE               ║');
    console.log('╚═══════════════════════════════════════╝');
})();
