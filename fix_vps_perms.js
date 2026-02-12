const { Client } = require('ssh2');

/**
 * Fix permissions on /etc/dovecot/users — needs to be readable by dovecot user.
 * The file was created with chmod 600 (root only), but Dovecot auth worker 
 * runs as dovecot user and needs read access.
 */

const VPS_LIST = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS' },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o' },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q' },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK' },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v' },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK' },
];

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const conn = new Client();
        const timer = setTimeout(() => { try { conn.end(); } catch { } resolve('TIMEOUT'); }, 15000);
        conn.on('ready', () => {
            conn.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return resolve('ERR: ' + err.message); }
                let out = '';
                stream.on('data', d => out += d.toString());
                stream.stderr.on('data', d => out += d.toString());
                stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out); });
            });
        });
        conn.on('error', e => { clearTimeout(timer); resolve('SSH ERR: ' + e.message); });
        conn.connect({ host, port: 22, username: 'root', password: pass, readyTimeout: 10000 });
    });
}

async function main() {
    console.log('=== Fix /etc/dovecot/users permissions ===\n');

    for (const vps of VPS_LIST) {
        const cmd = [
            // Fix permissions: readable by dovecot group
            'chown root:dovecot /etc/dovecot/users',
            'chmod 640 /etc/dovecot/users',
            // Restart dovecot to clear cached auth failures
            'systemctl restart dovecot',
            // Wait a moment
            'sleep 2',
            // Test IMAP login with first account
            "EMAIL=$(head -1 /etc/dovecot/users | cut -d: -f1)",
            "PASS=$(head -1 /etc/dovecot/users | cut -d: -f2 | sed 's/{PLAIN}//')",
            'echo "Testing: $EMAIL"',
            'doveadm auth test "$EMAIL" "$PASS" 2>&1',
            // Verify permissions
            'ls -la /etc/dovecot/users',
            'echo DONE'
        ].join(' && ');

        const out = await sshExec(vps.ip, vps.pass, cmd);
        const ok = out.includes('DONE');
        const authOk = out.includes('passdb');
        console.log(`[VPS-${vps.id}] ${ok ? '✅' : '❌'} ${authOk ? 'auth OK' : 'auth FAIL'}`);
        if (!ok) console.log(`  ${out.trim().substring(0, 200)}`);
    }

    console.log('\nDone! Now test IMAP from outside:');
    console.log('The accounts should now authenticate properly on Ditlead.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
