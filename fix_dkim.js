#!/usr/bin/env node
/**
 * FIX DKIM on ALL VPS:
 * 1. VPS 21+31: Install opendkim, generate keys, configure
 * 2. VPS 32-40: Fix key permissions (key data not secure)
 * 3. ALL: Extract DKIM public keys for DNS publishing
 */
const { Client } = require('ssh2');
const fs = require('fs');

const VPS_FLEET = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacyaudit.info'], needInstall: true },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'], needInstall: true },
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

function ssh(host, pass, cmd, timeout = 60000) {
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
    console.log('║       FIX DKIM ON ALL VPS                ║');
    console.log('╚══════════════════════════════════════════╝\n');

    const dnsRecords = [];

    for (const vps of VPS_FLEET) {
        console.log(`\n═══ VPS-${vps.id} (${vps.ip}) ═══\n`);

        if (vps.needInstall) {
            // Install opendkim
            console.log('  Installing opendkim...');
            let r = await ssh(vps.ip, vps.pass,
                'apt-get update -qq && apt-get install -y -qq opendkim opendkim-tools 2>&1 | tail -3',
                120000
            );
            console.log('  ' + r.substring(0, 100));

            // Generate keys for each domain
            for (const domain of vps.domains) {
                console.log(`  Generating key for ${domain}...`);
                r = await ssh(vps.ip, vps.pass, `
                    mkdir -p /etc/opendkim/keys/${domain}
                    opendkim-genkey -D /etc/opendkim/keys/${domain}/ -d ${domain} -s mail -r
                    chown -R opendkim:opendkim /etc/opendkim/keys/${domain}
                    chmod 700 /etc/opendkim/keys/${domain}
                    chmod 600 /etc/opendkim/keys/${domain}/mail.private
                    echo "KEY GENERATED"
                `);
                console.log('  ' + r);
            }

            // Create config
            console.log('  Creating config...');
            const keyTableLines = vps.domains.map(d => `mail._domainkey.${d} ${d}:mail:/etc/opendkim/keys/${d}/mail.private`).join('\\n');
            const signTableLines = vps.domains.map(d => `*@${d} mail._domainkey.${d}`).join('\\n');
            const trustedHosts = '127.0.0.1\\nlocalhost';

            r = await ssh(vps.ip, vps.pass, `
                cat > /etc/opendkim.conf << 'CONF'
AutoRestart             Yes
AutoRestartRate         10/1h
Syslog                  yes
SyslogSuccess           Yes
LogWhy                  Yes
Canonicalization        relaxed/simple
ExternalIgnoreList      refile:/etc/opendkim/TrustedHosts
InternalHosts           refile:/etc/opendkim/TrustedHosts
KeyTable                refile:/etc/opendkim/KeyTable
SigningTable            refile:/etc/opendkim/SigningTable
Mode                    sv
PidFile                 /var/run/opendkim/opendkim.pid
SignatureAlgorithm      rsa-sha256
UserID                  opendkim:opendkim
Socket                  inet:8891@localhost
CONF

                echo -e "${keyTableLines}" > /etc/opendkim/KeyTable
                echo -e "${signTableLines}" > /etc/opendkim/SigningTable
                echo -e "${trustedHosts}" > /etc/opendkim/TrustedHosts

                mkdir -p /var/run/opendkim
                chown opendkim:opendkim /var/run/opendkim

                echo "CONFIG DONE"
            `);
            console.log('  ' + r);

            // Configure Postfix milters
            console.log('  Configuring Postfix milters...');
            r = await ssh(vps.ip, vps.pass, `
                postconf -e "milter_protocol = 6"
                postconf -e "milter_default_action = accept"
                postconf -e "smtpd_milters = inet:localhost:8891"
                postconf -e "non_smtpd_milters = inet:localhost:8891"
                echo "POSTFIX MILTERS SET"
            `);
            console.log('  ' + r);

            // Start/restart opendkim + postfix
            console.log('  Starting services...');
            r = await ssh(vps.ip, vps.pass,
                'systemctl enable opendkim && systemctl restart opendkim && systemctl restart postfix && echo "SERVICES STARTED" && systemctl is-active opendkim'
            );
            console.log('  ' + r);

        } else {
            // Fix permissions on existing keys
            console.log('  Fixing key permissions...');
            for (const domain of vps.domains) {
                const r = await ssh(vps.ip, vps.pass, `
                    chown -R opendkim:opendkim /etc/opendkim/keys/${domain} 2>/dev/null
                    chmod 700 /etc/opendkim/keys/${domain} 2>/dev/null
                    chmod 600 /etc/opendkim/keys/${domain}/mail.private 2>/dev/null
                    echo "PERMS FIXED for ${domain}"
                `);
                console.log('  ' + r);
            }

            // Also fix /etc/opendkim directory
            await ssh(vps.ip, vps.pass, 'chown -R opendkim:opendkim /etc/opendkim && chmod 755 /etc/opendkim');

            // Restart opendkim
            console.log('  Restarting opendkim...');
            const r = await ssh(vps.ip, vps.pass,
                'systemctl restart opendkim && systemctl restart postfix && echo "RESTARTED" && systemctl is-active opendkim'
            );
            console.log('  ' + r);
        }

        // Extract DKIM public keys for DNS
        for (const domain of vps.domains) {
            const keyTxt = await ssh(vps.ip, vps.pass,
                `cat /etc/opendkim/keys/${domain}/mail.txt 2>/dev/null`
            );
            if (keyTxt && !keyTxt.includes('[TIMEOUT]')) {
                // Parse the TXT record value
                const match = keyTxt.match(/\(\s*"([\s\S]+?)"\s*\)/);
                let value;
                if (match) {
                    value = match[1].replace(/"\s*"/g, '').replace(/\s+/g, '');
                } else {
                    // Multi-line format
                    const parts = keyTxt.match(/"([^"]+)"/g);
                    value = parts ? parts.map(p => p.replace(/"/g, '')).join('') : keyTxt;
                }
                console.log(`  DNS: mail._domainkey.${domain} TXT "${value.substring(0, 60)}..."`);
                dnsRecords.push({ domain, selector: 'mail', type: 'TXT', record: `mail._domainkey.${domain}`, value });
            }
        }

        // Verify DKIM is now signing
        console.log('  Testing DKIM signing...');
        const testResult = await ssh(vps.ip, vps.pass, `
            echo "Subject: DKIM test\nFrom: contact1@${vps.domains[0]}\nTo: test@test.com\n\nTest" | /usr/sbin/sendmail -f contact1@${vps.domains[0]} root@localhost 2>&1
            sleep 3
            tail -5 /var/log/mail.log 2>/dev/null | grep -i dkim || echo "NO_DKIM_LOG"
        `, 15000);
        console.log('  ' + testResult.split('\n').filter(l => l.includes('dkim') || l.includes('DKIM')).join('\n  ') || '  ' + testResult.substring(0, 100));
    }

    // Save DNS records
    console.log('\n\n╔══════════════════════════════════════════╗');
    console.log('║   DNS RECORDS TO PUBLISH (IONOS)         ║');
    console.log('╚══════════════════════════════════════════╝\n');

    for (const rec of dnsRecords) {
        console.log(`${rec.domain}:`);
        console.log(`  Name: mail._domainkey`);
        console.log(`  Type: TXT`);
        console.log(`  Value: ${rec.value}`);
        console.log('');
    }

    fs.writeFileSync('dkim_dns_records.json', JSON.stringify(dnsRecords, null, 2));
    console.log('✅ Saved → dkim_dns_records.json');
})();
