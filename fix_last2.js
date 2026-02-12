const { Client } = require('ssh2');

// VPS-22 has the 2 broken accounts: sales1@privacyaudit.cloud, sales2@privacyaudit.cloud
const VPS = { ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' };

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

    console.log('Connected to VPS-22\n');

    // Check passwd-file entries for sales users
    console.log('--- passwd-file entries for sales ---');
    console.log(await exec(conn, "grep 'sales' /etc/dovecot/users"));

    // Check system user
    console.log('\n--- System user sales1 ---');
    console.log(await exec(conn, 'id sales1 2>&1'));
    console.log(await exec(conn, 'id sales2 2>&1'));

    // Check Maildir
    console.log('\n--- Maildir for sales1/sales2 ---');
    console.log(await exec(conn, 'ls -la /home/sales1/Maildir/ 2>&1'));
    console.log(await exec(conn, 'ls -la /home/sales2/Maildir/ 2>&1'));

    // Test doveadm auth
    const usersData = await exec(conn, "grep 'sales.*privacyaudit.cloud' /etc/dovecot/users");
    const lines = usersData.trim().split('\n').filter(l => l.trim());

    for (const line of lines) {
        const parts = line.split(':');
        const email = parts[0];
        const pass = parts[1].replace('{PLAIN}', '').split(':')[0];

        console.log(`\n--- doveadm auth test: ${email} ---`);
        console.log(await exec(conn, `doveadm auth test '${email}' '${pass}' 2>&1`));

        console.log(`--- IMAP login test: ${email} ---`);
        const cmd = `echo -e "a1 LOGIN ${email} ${pass}\\na2 SELECT INBOX\\na3 LOGOUT" | nc -w5 localhost 143 2>&1 | head -10`;
        console.log(await exec(conn, cmd));
    }

    // Check if sales user was somehow conflicting (sales is a common name)
    console.log('\n--- Check /etc/passwd for sales ---');
    console.log(await exec(conn, "grep 'sales' /etc/passwd"));

    // Check Dovecot logs for sales errors
    console.log('\n--- Recent Dovecot errors for sales ---');
    console.log(await exec(conn, "journalctl -u dovecot --since '30 min ago' --no-pager 2>&1 | grep -i sales | tail -5"));

    conn.end();
}

main().catch(console.error);
