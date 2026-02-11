const { Client } = require('ssh2');

// Diagnose VPS-03 specifically
const vps = { id: 'vps-03', ip: '206.217.139.115', pw: '20QEs9OSh8Bw3egI1q' };

function sshExec(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('timeout')); }, timeout);
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                let out = '';
                stream.on('data', c => out += c.toString());
                stream.stderr.on('data', c => out += c.toString());
                stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out.trim()); });
            });
        });
        conn.on('error', e => { clearTimeout(timer); reject(e); });
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pw,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group14-sha256'] }
        });
    });
}

async function main() {
    console.log(`=== Diagnosing VPS-03 (${vps.ip}) ===\n`);

    const commands = [
        // Check passwd file
        'echo "=== /etc/dovecot/users permissions ===" && ls -la /etc/dovecot/users',
        'echo "=== Line count ===" && wc -l /etc/dovecot/users',
        'echo "=== First 3 lines ===" && head -3 /etc/dovecot/users',
        'echo "=== Last 3 lines ===" && tail -3 /etc/dovecot/users',
        // Check for special chars or corruption
        'echo "=== Check for odd chars ===" && cat -A /etc/dovecot/users | head -3',
        // Check mailboxes.txt
        'echo "=== mailboxes.txt first 3 ===" && head -3 /root/mailboxes.txt',
        'echo "=== mailboxes.txt line count ===" && wc -l /root/mailboxes.txt',
        // Test auth for failing accounts
        'echo "=== Auth test: support1@mailprivacycheckerpro.icu ===" && PASS=$(grep "support1@mailprivacycheckerpro.icu" /root/mailboxes.txt | cut -d, -f2) && echo "Password: $PASS" && doveadm auth test support1@mailprivacycheckerpro.icu "$PASS" 2>&1',
        'echo "=== Auth test: contact1@mailprivacycheckerpro.site ===" && PASS=$(grep "contact1@mailprivacycheckerpro.site" /root/mailboxes.txt | cut -d, -f2) && echo "Password: $PASS" && doveadm auth test contact1@mailprivacycheckerpro.site "$PASS" 2>&1',
        // Check dovecot logs
        'echo "=== Recent dovecot errors ===" && journalctl -u dovecot --no-pager -n 10 --since "5 min ago" 2>&1 | grep -i error || echo "no recent errors"',
        // Check dovecot config
        'echo "=== Dovecot auth config ===" && cat /etc/dovecot/conf.d/10-auth.conf',
    ];

    for (const cmd of commands) {
        try {
            const result = await sshExec(cmd);
            console.log(result);
            console.log('---');
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
            console.log('---');
        }
    }
}

main().catch(console.error);
