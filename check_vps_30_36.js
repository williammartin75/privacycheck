#!/usr/bin/env node
const { Client } = require('ssh2');

const servers = [
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
];

const CMD = [
    'echo "dovecot=$(systemctl is-active dovecot)"',
    'echo "postfix=$(systemctl is-active postfix)"',
    'echo "socket=$(ls /var/spool/postfix/private/auth 2>/dev/null && echo OK || echo MISSING)"',
    'echo "maillog=$(tail -5 /var/log/mail.log 2>/dev/null | grep -c SASL || echo 0) SASL errors in last 5 lines"',
    'tail -3 /var/log/mail.log 2>/dev/null | grep -i "sasl\\|error\\|fail" || echo "no recent errors"',
].join(' && ');

function run(host, pass) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 20000);
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
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    for (const s of servers) {
        console.log('--- VPS-' + s.id + ' (' + s.ip + ') ---');
        const out = await run(s.ip, s.pass);
        console.log(out);
        console.log('');
    }
    console.log('=== DONE ===');
})();
