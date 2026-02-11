const { Client } = require('ssh2');

const vps = { ip: '107.174.93.156', pw: '4uZeYG82Wgf5tf0Y7B' };

const commands = [
    'head -2 /etc/dovecot/users',
    'head -2 /root/mailboxes.txt',
    'grep -c "" /etc/dovecot/users',
    'file /etc/dovecot/users',
];

async function run() {
    for (const cmd of commands) {
        try {
            const result = await new Promise((resolve, reject) => {
                const conn = new Client();
                const timer = setTimeout(() => { conn.end(); reject(new Error('timeout')); }, 20000);
                conn.on('ready', () => {
                    conn.exec(cmd, (err, stream) => {
                        if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                        let out = '';
                        stream.on('data', c => out += c.toString());
                        stream.stderr.on('data', c => out += c.toString());
                        stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out); });
                    });
                });
                conn.on('error', e => { clearTimeout(timer); reject(e); });
                conn.connect({
                    host: vps.ip, port: 22, username: 'root', password: vps.pw,
                    readyTimeout: 15000,
                    algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group14-sha256'] }
                });
            });
            console.log(`CMD: ${cmd}`);
            console.log(`OUT: ${result.trim()}`);
            console.log('---');
        } catch (e) {
            console.log(`CMD: ${cmd} => ERROR: ${e.message}`);
        }
    }
}

run();
