#!/usr/bin/env node
const { Client } = require('ssh2');

const servers = [
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
    'chmod 640 /etc/dovecot/users',
    'chown root:dovecot /etc/dovecot/users',
    'for u in $(cut -d: -f1 /etc/dovecot/users | cut -d@ -f1 | sort -u); do mkdir -p /home/$u/Maildir/{new,cur,tmp}; chown -R $u:$u /home/$u/Maildir 2>/dev/null; done',
    'systemctl restart dovecot',
    'systemctl restart postfix',
    'sleep 1',
    'echo "perms=$(ls -la /etc/dovecot/users)"',
    'echo "dovecot=$(systemctl is-active dovecot)"',
    'FIRST_USER=$(head -1 /etc/dovecot/users | cut -d: -f1)',
    'FIRST_PASS=$(head -1 /etc/dovecot/users | sed "s/.*{PLAIN}//" | cut -d: -f1)',
    'echo "testing auth for $FIRST_USER"',
    'doveadm auth test "$FIRST_USER" "$FIRST_PASS" 2>&1 | head -2',
].join(' && ');

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 30000);
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
    for (const s of servers) {
        console.log('--- VPS-' + s.id + ' ---');
        const r = await sshExec(s.ip, s.pass, FIX_CMD);
        console.log(r);
        console.log('');
    }
    console.log('=== DONE ===');
})();
