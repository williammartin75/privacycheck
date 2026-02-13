#!/usr/bin/env node
/**
 * Fix /etc/opendkim ownership on ALL VPS:
 * - /etc/opendkim -> root:root 755
 * - /etc/opendkim/keys/<domain> -> opendkim:opendkim 700
 * - /etc/opendkim/keys/<domain>/mail.private -> opendkim:opendkim 600
 * Then restart and verify DKIM signing works
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
    console.log('║   FIX OPENDKIM PERMISSIONS — ALL VPS     ║');
    console.log('╚══════════════════════════════════════════╝\n');

    for (const vps of VPS_FLEET) {
        console.log(`VPS-${vps.id} (${vps.ip}):`);

        // Fix ownership hierarchy:
        // /etc/opendkim -> root:root 755 (directories accessed by root process)
        // /etc/opendkim/keys -> root:root 755
        // /etc/opendkim/keys/<domain> -> opendkim:opendkim 700
        // /etc/opendkim/keys/<domain>/mail.private -> opendkim:opendkim 600
        // /etc/opendkim/keys/<domain>/mail.txt -> opendkim:opendkim 644
        // Config files -> root:root 644
        let r = await ssh(vps.ip, vps.pass, `
            # Fix /etc/opendkim directory ownership
            chown root:root /etc/opendkim
            chmod 755 /etc/opendkim
            
            # Fix config files
            chown root:root /etc/opendkim/KeyTable /etc/opendkim/SigningTable /etc/opendkim/TrustedHosts 2>/dev/null
            chmod 644 /etc/opendkim/KeyTable /etc/opendkim/SigningTable /etc/opendkim/TrustedHosts 2>/dev/null
            
            # Fix keys directory  
            chown root:root /etc/opendkim/keys
            chmod 755 /etc/opendkim/keys
            
            # Fix each domain key directory
            for d in /etc/opendkim/keys/*/; do
                chown opendkim:opendkim "$d"
                chmod 700 "$d"
                chown opendkim:opendkim "$d"mail.private 2>/dev/null
                chmod 600 "$d"mail.private 2>/dev/null
                chown opendkim:opendkim "$d"mail.txt 2>/dev/null
                chmod 644 "$d"mail.txt 2>/dev/null
            done
            
            # Verify
            ls -la /etc/opendkim/ | head -5
            echo "---"
            ls -la /etc/opendkim/keys/ | head -5
        `);
        console.log('  ' + r.replace(/\n/g, '\n  '));

        // Restart opendkim
        r = await ssh(vps.ip, vps.pass, 'systemctl restart opendkim && echo "OK" && systemctl is-active opendkim');
        console.log('  Restart: ' + r);

        // Test signing
        r = await ssh(vps.ip, vps.pass, `
            echo "Subject: DKIM test\nFrom: contact1@${vps.domains[0]}\nTo: test@test.com\n\nTest body" | /usr/sbin/sendmail -f contact1@${vps.domains[0]} root@localhost 2>&1
            sleep 3
            tail -10 /var/log/mail.log 2>/dev/null | grep -iE "(dkim|opendkim)" | tail -3 || echo "NO_DKIM_LOG"
        `, 15000);
        const dkimLines = r.split('\n').filter(l => l.toLowerCase().includes('dkim') || l.toLowerCase().includes('opendkim'));
        if (dkimLines.length > 0) {
            dkimLines.forEach(l => {
                if (l.includes('error') || l.includes('not secure')) {
                    console.log('  ❌ ' + l.substring(l.indexOf('opendkim'), l.indexOf('opendkim') + 80));
                } else if (l.includes('DKIM-Signature') || l.includes('key loaded')) {
                    console.log('  ✅ ' + l.substring(l.indexOf('opendkim'), l.indexOf('opendkim') + 80));
                } else {
                    console.log('  ℹ️  ' + l.substring(l.indexOf('opendkim') > -1 ? l.indexOf('opendkim') : 0, l.indexOf('opendkim') + 80));
                }
            });
        } else {
            console.log('  ⚠️ No DKIM log output');
        }
        console.log('');
    }
})();
