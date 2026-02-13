#!/usr/bin/env node
/**
 * Add virtual_mailbox_domains to Postfix on VPS 31-40
 * Also add mydestination with all domains (matching old VPS pattern)
 */
const { Client } = require('ssh2');

const servers = [
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

(async () => {
    console.log('=== Adding virtual_mailbox_domains to VPS 31-40 ===\n');

    for (const s of servers) {
        const domainList = s.domains.join(', ');
        const cmd = [
            // Update mydestination to include ALL domains
            `postconf -e "mydestination = localhost, ${domainList}"`,
            // Add virtual_mailbox_domains
            `postconf -e "virtual_mailbox_domains = ${domainList}"`,
            // Restart postfix
            'systemctl restart postfix',
            // Verify
            `echo "mydest=$(postconf mydestination)"`,
            `echo "virtual=$(postconf virtual_mailbox_domains)"`,
            'echo "postfix=$(systemctl is-active postfix)"',
        ].join(' && ');

        console.log('--- VPS-' + s.id + ' (' + domainList + ') ---');
        const result = await sshExec(s.ip, s.pass, cmd);
        console.log('  ' + result.split('\n').join('\n  '));
        console.log('');
    }

    console.log('=== DONE ===');
})();
