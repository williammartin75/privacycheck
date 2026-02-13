#!/usr/bin/env node
/**
 * DEEP AUDIT: Compare OLD working VPS-21 vs NEW VPS-40
 * Tests: DNS, DKIM, SPF, DMARC, PTR, Full Postfix config, TLS, real SMTP send
 */
const { Client } = require('ssh2');
const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const reverse = promisify(dns.reverse);

const OLD = { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domain: 'privacyaudit.online' };
const NEW = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', domain: 'checkprivacychecker.website' };

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
            host, port: 22, username: 'root', password: pass, readyTimeout: 20000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function dnsCheck(domain, ip) {
    const r = {};
    try { const a = await resolve4(domain); r.A = a.includes(ip) ? '✅ ' + a[0] : '❌ got ' + a[0]; } catch { r.A = '❌ NXDOMAIN'; }
    try { const mx = await resolveMx(domain); r.MX = mx.map(m => m.exchange).join(', '); } catch { r.MX = '❌ none'; }
    try { const t = await resolveTxt(domain); const f = t.map(x => x.join('')); r.SPF = f.find(x => x.includes('v=spf1')) || '❌ none'; } catch { r.SPF = '❌ none'; }
    try { const t = await resolveTxt('mail._domainkey.' + domain); const f = t.map(x => x.join('')); r.DKIM = f.find(x => x.includes('v=DKIM1')) ? '✅ present' : '❌'; } catch { r.DKIM = '❌ not found'; }
    try { const t = await resolveTxt('_dmarc.' + domain); const f = t.map(x => x.join('')); r.DMARC = f.find(x => x.includes('v=DMARC1')) || '❌ none'; } catch { r.DMARC = '❌ none'; }
    try { const ptr = await reverse(ip); r.PTR = ptr[0]; } catch { r.PTR = '❌ no PTR'; }
    return r;
}

(async () => {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  DEEP AUDIT: OLD VPS-21 vs NEW VPS-40              ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ── 1. DNS ──
    console.log('═══ 1. DNS RECORDS ═══');
    const oldDns = await dnsCheck(OLD.domain, OLD.ip);
    const newDns = await dnsCheck(NEW.domain, NEW.ip);
    for (const key of ['A', 'MX', 'SPF', 'DKIM', 'DMARC', 'PTR']) {
        const match = oldDns[key] === newDns[key] ? '=' : '≠';
        console.log(`  ${key.padEnd(6)} OLD: ${oldDns[key]}`);
        console.log(`  ${' '.repeat(6)} NEW: ${newDns[key]}  ${match}`);
    }

    // ── 2. Full Postfix main.cf diff ──
    console.log('\n═══ 2. POSTFIX main.cf (sorted, no comments) ═══');
    const oldMainCf = await sshExec(OLD.ip, OLD.pass, 'postconf -n | sort');
    const newMainCf = await sshExec(NEW.ip, NEW.pass, 'postconf -n | sort');
    const oldLines = new Set(oldMainCf.split('\n'));
    const newLines = new Set(newMainCf.split('\n'));
    const onlyOld = [...oldLines].filter(l => !newLines.has(l) && !l.includes('myhostname') && !l.includes('mydomain') && !l.includes('virtual_alias_maps'));
    const onlyNew = [...newLines].filter(l => !oldLines.has(l) && !l.includes('myhostname') && !l.includes('mydomain') && !l.includes('virtual_alias_maps'));
    if (onlyOld.length === 0 && onlyNew.length === 0) {
        console.log('  ✅ IDENTICAL (ignoring hostname/domain)');
    } else {
        console.log('  ⚠️ DIFFERENCES:');
        onlyOld.forEach(l => console.log('  - OLD ONLY: ' + l));
        onlyNew.forEach(l => console.log('  + NEW ONLY: ' + l));
    }

    // ── 3. Postfix master.cf submission block ──
    console.log('\n═══ 3. POSTFIX master.cf (submission) ═══');
    const oldMaster = await sshExec(OLD.ip, OLD.pass, 'grep -A 20 "^submission" /etc/postfix/master.cf');
    const newMaster = await sshExec(NEW.ip, NEW.pass, 'grep -A 20 "^submission" /etc/postfix/master.cf');
    console.log(oldMaster === newMaster ? '  ✅ IDENTICAL' : '  ⚠️ DIFFERENT\n  OLD:\n  ' + oldMaster.split('\n').slice(0, 5).join('\n  ') + '\n  NEW:\n  ' + newMaster.split('\n').slice(0, 5).join('\n  '));

    // ── 4. Dovecot auth ──
    console.log('\n═══ 4. DOVECOT AUTH ═══');
    const oldAuth = await sshExec(OLD.ip, OLD.pass, 'cat /etc/dovecot/conf.d/10-auth.conf');
    const newAuth = await sshExec(NEW.ip, NEW.pass, 'cat /etc/dovecot/conf.d/10-auth.conf');
    console.log(oldAuth === newAuth ? '  ✅ IDENTICAL' : '  ⚠️ DIFFERENT\n  OLD:\n  ' + oldAuth.split('\n').join('\n  ') + '\n  NEW:\n  ' + newAuth.split('\n').join('\n  '));

    // ── 5. TLS config ──
    console.log('\n═══ 5. TLS CERTIFICATES ═══');
    const oldTls = await sshExec(OLD.ip, OLD.pass, 'postconf smtpd_tls_cert_file smtpd_tls_key_file smtpd_tls_security_level');
    const newTls = await sshExec(NEW.ip, NEW.pass, 'postconf smtpd_tls_cert_file smtpd_tls_key_file smtpd_tls_security_level');
    console.log('  OLD: ' + oldTls.split('\n').join(' | '));
    console.log('  NEW: ' + newTls.split('\n').join(' | '));

    // ── 6. OpenDKIM status ──
    console.log('\n═══ 6. OPENDKIM ═══');
    const oldDkim = await sshExec(OLD.ip, OLD.pass, 'systemctl is-active opendkim && ls /etc/opendkim/keys/*/mail.private | head -3');
    const newDkim = await sshExec(NEW.ip, NEW.pass, 'systemctl is-active opendkim && ls /etc/opendkim/keys/*/mail.private | head -3');
    console.log('  OLD: ' + oldDkim.split('\n').join(' | '));
    console.log('  NEW: ' + newDkim.split('\n').join(' | '));

    // ── 7. REAL SMTP SEND TEST ──
    console.log('\n═══ 7. REAL SMTP SEND TEST ═══');
    // Send a test email from VPS-40 to a throwaway check
    const sendCmd = `echo -e "Subject: VPS40 auth test $(date +%s)\\nFrom: contact1@checkprivacychecker.website\\nTo: contact1@checkprivacychecker.website\\n\\nTest" | sendmail -f contact1@checkprivacychecker.website contact1@checkprivacychecker.website 2>&1 && echo SENT_OK && sleep 2 && tail -10 /var/log/mail.log | grep -E "status=|error|reject|bounce" | tail -5`;
    const sendResult = await sshExec(NEW.ip, NEW.pass, sendCmd);
    console.log('  ' + sendResult.split('\n').join('\n  '));

    // Also test SMTP AUTH specifically (what Ditlead uses)
    console.log('\n═══ 8. SMTP AUTH TEST (port 587, what Ditlead uses) ═══');
    // Get first user credentials
    const firstUser = await sshExec(NEW.ip, NEW.pass, 'head -1 /etc/dovecot/users | cut -d: -f1');
    const firstPass = await sshExec(NEW.ip, NEW.pass, "head -1 /etc/dovecot/users | sed 's/.*{PLAIN}//' | cut -d: -f1");
    console.log('  User: ' + firstUser);

    const authB64 = Buffer.from('\0' + firstUser + '\0' + firstPass).toString('base64');
    const smtpTest = await sshExec(NEW.ip, NEW.pass,
        `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${authB64}"; sleep 1; echo "QUIT") | openssl s_client -starttls smtp -connect localhost:587 -quiet 2>/dev/null | grep -E "235|535|451|503|AUTH"`);
    console.log('  SMTP AUTH result: ' + smtpTest);

    // Same test on OLD VPS for comparison
    const oldFirstUser = await sshExec(OLD.ip, OLD.pass, 'head -1 /etc/dovecot/users | cut -d: -f1');
    const oldFirstPass = await sshExec(OLD.ip, OLD.pass, "head -1 /etc/dovecot/users | sed 's/.*{PLAIN}//' | cut -d: -f1");
    const oldAuthB64 = Buffer.from('\0' + oldFirstUser + '\0' + oldFirstPass).toString('base64');
    const oldSmtpTest = await sshExec(OLD.ip, OLD.pass,
        `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${oldAuthB64}"; sleep 1; echo "QUIT") | openssl s_client -starttls smtp -connect localhost:587 -quiet 2>/dev/null | grep -E "235|535|451|503|AUTH"`);
    console.log('  OLD VPS AUTH result: ' + oldSmtpTest);

    // ── 9. Dovecot users file check ──
    console.log('\n═══ 9. DOVECOT USERS FILE ═══');
    const oldUsers = await sshExec(OLD.ip, OLD.pass, 'wc -l /etc/dovecot/users && ls -la /etc/dovecot/users && head -1 /etc/dovecot/users');
    const newUsers = await sshExec(NEW.ip, NEW.pass, 'wc -l /etc/dovecot/users && ls -la /etc/dovecot/users && head -1 /etc/dovecot/users');
    console.log('  OLD: ' + oldUsers.split('\n').join('\n  '));
    console.log('  NEW: ' + newUsers.split('\n').join('\n  '));

    // ── 10. Dovecot auth socket ──
    console.log('\n═══ 10. AUTH SOCKET + SERVICES ═══');
    const oldSock = await sshExec(OLD.ip, OLD.pass, 'ls -la /var/spool/postfix/private/auth && systemctl is-active dovecot postfix opendkim');
    const newSock = await sshExec(NEW.ip, NEW.pass, 'ls -la /var/spool/postfix/private/auth && systemctl is-active dovecot postfix opendkim');
    console.log('  OLD: ' + oldSock.split('\n').join(' | '));
    console.log('  NEW: ' + newSock.split('\n').join(' | '));

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║  AUDIT COMPLETE                                     ║');
    console.log('╚══════════════════════════════════════════════════════╝');
})();
