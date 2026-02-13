#!/usr/bin/env node
const { Client } = require('ssh2');

const servers = [
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

const CMD = [
    'echo "=== BEFORE ==="',
    'systemctl is-active dovecot',
    'ls -la /var/spool/postfix/private/auth 2>/dev/null; echo ""',
    'echo "=== RESTARTING ==="',
    'systemctl restart dovecot; echo "dovecot restart: $?"',
    'systemctl restart postfix; echo "postfix restart: $?"',
    'sleep 2',
    'echo "=== AFTER ==="',
    'systemctl is-active dovecot',
    'systemctl is-active postfix',
    'ls -la /var/spool/postfix/private/auth 2>/dev/null; echo ""',
    'head -1 /etc/dovecot/users 2>/dev/null',
].join(' && ');

function run(host, pass) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 30000);
        c.on('ready', () => {
            c.exec(CMD, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
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
    for (const s of servers) {
        console.log('\n########## VPS-' + s.id + ' (' + s.ip + ') ##########');
        const out = await run(s.ip, s.pass);
        console.log(out);
    }
    console.log('\n===== ALL DONE =====');
})();
