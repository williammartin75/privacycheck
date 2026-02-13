#!/usr/bin/env node
/**
 * Diagnose DKIM + PTR on all VPS 21-40
 * Checks: opendkim status, config, keys, DNS records, PTR
 */
const { Client } = require('ssh2');
const dns = require('dns');

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

function sshExec(host, pass, cmd, timeout = 20000) {
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

function reverseLookup(ip) {
    return new Promise(resolve => {
        dns.reverse(ip, (err, hostnames) => {
            resolve(err ? `NONE (${err.code})` : hostnames.join(', '));
        });
    });
}

function dkimLookup(domain) {
    return new Promise(resolve => {
        dns.resolveTxt(`default._domainkey.${domain}`, (err, records) => {
            if (err) return resolve(`NONE (${err.code})`);
            resolve(records.map(r => r.join('')).join(' ').substring(0, 80));
        });
    });
}

(async () => {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║      DKIM + PTR DIAGNOSTIC — ALL VPS        ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    for (const vps of VPS_FLEET) {
        console.log(`\n═══ VPS-${vps.id} (${vps.ip}) — ${vps.domains.join(', ')} ═══\n`);

        // 1. PTR check
        const ptr = await reverseLookup(vps.ip);
        console.log(`  PTR: ${ptr}`);

        // 2. OpenDKIM status
        const dkimStatus = await sshExec(vps.ip, vps.pass,
            'systemctl is-active opendkim 2>&1 || echo INACTIVE'
        );
        console.log(`  OpenDKIM service: ${dkimStatus}`);

        // 3. OpenDKIM config
        const dkimConf = await sshExec(vps.ip, vps.pass,
            'cat /etc/opendkim.conf 2>/dev/null | grep -E "^(Domain|KeyFile|Selector|Socket|Mode|Canonicalization)" | head -10 || echo "NO CONFIG"'
        );
        console.log(`  OpenDKIM config:\n    ${dkimConf.replace(/\n/g, '\n    ')}`);

        // 4. DKIM key files
        const keyFiles = await sshExec(vps.ip, vps.pass,
            'find /etc/opendkim /etc/dkimkeys /var/db/dkim -name "*.private" -o -name "*.txt" 2>/dev/null | head -10 || echo "NO KEYS"'
        );
        console.log(`  DKIM key files: ${keyFiles}`);

        // 5. KeyTable
        const keyTable = await sshExec(vps.ip, vps.pass,
            'cat /etc/opendkim/KeyTable 2>/dev/null || cat /etc/opendkim/key.table 2>/dev/null || echo "NO KEYTABLE"'
        );
        console.log(`  KeyTable: ${keyTable.substring(0, 200)}`);

        // 6. SigningTable
        const signTable = await sshExec(vps.ip, vps.pass,
            'cat /etc/opendkim/SigningTable 2>/dev/null || cat /etc/opendkim/signing.table 2>/dev/null || echo "NO SIGNINGTABLE"'
        );
        console.log(`  SigningTable: ${signTable.substring(0, 200)}`);

        // 7. Postfix milter config
        const milter = await sshExec(vps.ip, vps.pass,
            'postconf milter_protocol milter_default_action smtpd_milters non_smtpd_milters 2>&1'
        );
        console.log(`  Postfix milters:\n    ${milter.replace(/\n/g, '\n    ')}`);

        // 8. DKIM DNS records
        for (const domain of vps.domains) {
            const dkimDns = await dkimLookup(domain);
            console.log(`  DNS default._domainkey.${domain}: ${dkimDns}`);
        }

        // 9. Test DKIM signing
        const testSign = await sshExec(vps.ip, vps.pass,
            `echo "Subject: test" | /usr/sbin/sendmail -f contact1@${vps.domains[0]} root@localhost 2>&1; sleep 2; tail -5 /var/log/mail.log 2>/dev/null | grep -i dkim || echo "NO DKIM LOG"`,
            15000
        );
        console.log(`  DKIM test sign: ${testSign.substring(0, 200)}`);
    }
})();
