#!/usr/bin/env node
/**
 * Fix 451 errors: remove virtual_mailbox_domains conflict on ALL VPS (21-40)
 * Domains should only be in mydestination since we use local system accounts
 */
const { Client } = require('ssh2');

const servers = [
    // Old VPS (21-30) — fix them too for consistency
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '107.175.118.114', pass: 'Yt8w4dVUy9hXnz9hBD' },
    { id: 23, ip: '107.175.118.83', pass: 'ByG7i8qH8PtaVYJzRN' },
    { id: 24, ip: '107.175.118.163', pass: 'fL4sE4w2dAR8LHSBWX' },
    { id: 25, ip: '192.227.234.125', pass: 'u6lZ7bG4dS5f2rL6nI' },
    { id: 26, ip: '192.227.234.196', pass: 'JpZn90Mz2hHIrKPw6m' },
    { id: 27, ip: '23.95.222.217', pass: '9Ck27jlBh1EGdDeFm3' },
    { id: 28, ip: '23.95.222.140', pass: 'MvD1dCo7OFE1Z3J8qR' },
    { id: 29, ip: '23.95.222.131', pass: 'uS92wB0fNy8x10y3sO' },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
    // New VPS (31-40) — the ones with current 451 errors
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

const FIX_CMD = [
    // Remove virtual_mailbox_domains completely
    'postconf -X virtual_mailbox_domains',
    // Also remove virtual_mailbox_maps and virtual_transport if empty
    'postconf -X virtual_mailbox_maps 2>/dev/null',
    // Restart postfix
    'systemctl restart postfix',
    // Verify
    'echo "mydest=$(postconf mydestination)"',
    'echo "virtual=$(postconf virtual_mailbox_domains 2>/dev/null || echo REMOVED)"',
    'echo "postfix=$(systemctl is-active postfix)"',
].join(' && ');

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
    console.log('=== Removing virtual_mailbox_domains conflict on VPS 21-40 ===\n');
    for (const s of servers) {
        process.stdout.write('VPS-' + s.id + '... ');
        const r = await sshExec(s.ip, s.pass, FIX_CMD);
        // Extract key info
        const lines = r.split('\n');
        const virtual = lines.find(l => l.includes('virtual=')) || '';
        const postfix = lines.find(l => l.includes('postfix=')) || '';
        console.log(virtual + ' | ' + postfix);
    }
    console.log('\n=== DONE ===');
})();
