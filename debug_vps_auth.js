const { Client } = require('ssh2');

// Test REAL IMAP login on VPS-21 using multiple methods
const VPS = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

function exec(conn, cmd) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve('TIMEOUT'), 15000);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return resolve('ERR: ' + err.message); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve(out); });
        });
    });
}

async function main() {
    const conn = new Client();
    await new Promise((resolve, reject) => {
        conn.on('ready', resolve);
        conn.on('error', reject);
        conn.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 15000 });
    });

    console.log('Connected to VPS-21\n');

    // Get first account from passwd file
    const userData = await exec(conn, 'head -1 /etc/dovecot/users');
    const email = userData.trim().split(':')[0];
    const pass = userData.trim().split(':')[1].replace('{PLAIN}', '').split(':')[0];
    console.log(`Test account: ${email} / ${pass}\n`);

    // Test 1: doveadm auth test (this works - we know)
    console.log('--- Test 1: doveadm auth test ---');
    console.log(await exec(conn, `doveadm auth test '${email}' '${pass}' 2>&1`));

    // Test 2: Real IMAP login via openssl (port 993 IMAPS)
    console.log('\n--- Test 2: IMAP login via openssl (port 993 SSL) ---');
    const sslCmd = `echo -e "a1 LOGIN ${email} ${pass}\\r\\na2 LOGOUT\\r\\n" | timeout 5 openssl s_client -connect localhost:993 -quiet 2>&1 | head -10`;
    console.log(await exec(conn, sslCmd));

    // Test 3: Real IMAP login via nc (port 143)
    console.log('\n--- Test 3: IMAP login via nc (port 143) ---');
    const ncCmd = `echo -e "a1 LOGIN ${email} ${pass}\\na2 LOGOUT" | nc -w3 localhost 143 2>&1 | head -10`;
    console.log(await exec(conn, ncCmd));

    // Test 4: Check if Dovecot is listening on 993
    console.log('\n--- Test 4: Dovecot listening ports ---');
    console.log(await exec(conn, 'ss -tlnp | grep -E "dovecot|143|993"'));

    // Test 5: Check dovecot SSL config
    console.log('\n--- Test 5: Dovecot SSL config ---');
    console.log(await exec(conn, 'doveconf ssl 2>&1 | head -5'));

    // Test 6: Check /etc/dovecot/users permissions
    console.log('\n--- Test 6: /etc/dovecot/users perms ---');
    console.log(await exec(conn, 'ls -la /etc/dovecot/users'));

    // Test 7: Check Dovecot error log since the fix
    console.log('\n--- Test 7: Dovecot errors (last 10) ---');
    console.log(await exec(conn, 'journalctl -u dovecot --since "2 hours ago" --no-pager 2>&1 | grep -i error | tail -10'));

    // Test 8: Check all auth configs being loaded
    console.log('\n--- Test 8: Full auth config chain ---');
    console.log(await exec(conn, 'doveconf -n 2>&1 | grep -A3 -E "passdb|userdb|auth_mechanisms|disable_plain"'));

    conn.end();
}

main().catch(console.error);
