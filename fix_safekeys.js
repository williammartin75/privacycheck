#!/usr/bin/env node
/**
 * Add RequireSafeKeys false to opendkim.conf on ALL VPS
 * Then restart and verify DKIM signing via swaks
 */
const { Client } = require('ssh2');

const VPS_FLEET = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacyaudit.info'] },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'] },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', domains: ['contactprivacychecker.info'] },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', domains: ['contactprivacychecker.cloud'] },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', domains: ['contactprivacychecker.site', 'contactprivacychecker.website'] },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N', domains: ['reportprivacychecker.info', 'reportprivacychecker.cloud'] },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm', domains: ['reportprivacychecker.site', 'reportprivacychecker.website'] },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y', domains: ['checkprivacychecker.info', 'checkprivacychecker.cloud'] },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', domains: ['checkprivacychecker.site'] },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', domains: ['checkprivacychecker.space'] },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', domains: ['checkprivacychecker.website'] },
];

function ssh(host, pass, cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('[TIMEOUT]') }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, s) => {
                if (err) { clearTimeout(t); c.end(); return resolve('[ERR]') }
                let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d);
                s.on('close', () => { clearTimeout(t); c.end(); resolve(o.trim()) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   ADD RequireSafeKeys=false — ALL VPS    ║');
    console.log('╚══════════════════════════════════════════╝\n');

    for (const vps of VPS_FLEET) {
        process.stdout.write(`VPS-${vps.id}: `);

        // Add RequireSafeKeys false
        let r = await ssh(vps.ip, vps.pass, `
            grep -q "RequireSafeKeys" /etc/opendkim.conf 2>/dev/null && echo "ALREADY" || echo "RequireSafeKeys false" >> /etc/opendkim.conf
            # Also check the conf has correct settings
            grep -c "RequireSafeKeys" /etc/opendkim.conf
        `);
        process.stdout.write(r.includes('ALREADY') ? 'already set, ' : 'added, ');

        // Restart
        r = await ssh(vps.ip, vps.pass, 'systemctl restart opendkim && systemctl restart postfix && echo "OK"');
        process.stdout.write(r.includes('OK') ? 'restarted, ' : `FAIL(${r.substring(0, 30)}), `);

        // Test signing by sending to localhost and checking headers
        r = await ssh(vps.ip, vps.pass, `
            echo "Subject: DKIM verify test\nFrom: contact1@${vps.domains[0]}\nTo: root@localhost\n\nDKIM test body" | /usr/sbin/sendmail -t -f contact1@${vps.domains[0]} 2>&1
            sleep 3
            # Check mail log for DKIM
            tail -20 /var/log/mail.log 2>/dev/null | grep -iE "(dkim|opendkim)" | tail -3
        `, 15000);

        const lines = r.split('\n').filter(l => l.toLowerCase().includes('dkim') || l.toLowerCase().includes('opendkim'));
        if (lines.some(l => l.includes('DKIM-Signature') || l.toLowerCase().includes('dkim-signature field added'))) {
            console.log('✅ DKIM signing works!');
        } else if (lines.some(l => l.includes('error'))) {
            const err = lines.find(l => l.includes('error'));
            console.log('❌ ' + err.substring(err.indexOf('opendkim'), err.indexOf('opendkim') + 70));
        } else if (lines.length > 0) {
            console.log('⚠️ ' + lines[0].substring(lines[0].indexOf('opendkim') > -1 ? lines[0].indexOf('opendkim') : 0).substring(0, 70));
        } else {
            console.log('⚠️ no DKIM log (may still work)');
        }
    }

    console.log('\n✅ Done! Now run HappyDeliver test to verify.');
})();
