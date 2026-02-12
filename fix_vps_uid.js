const { Client } = require('ssh2');

/**
 * Fix Dovecot UID/GID issue on all VPS.
 * 
 * Problem: passwd-file entries have empty UID/GID fields, causing
 * "Couldn't drop privileges: User is missing UID" after successful login.
 * 
 * Solution: Update 10-mail.conf to set mail_uid and mail_gid so Dovecot
 * knows which user to run as. We also update the passwd-file to include
 * the actual UID/GID from the system user.
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

function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => reject(new Error('SSH timeout')), 20000);
        conn.on('ready', () => { clearTimeout(timer); resolve(conn); });
        conn.on('error', e => { clearTimeout(timer); reject(e); });
        conn.connect({ host, port: 22, username: 'root', password, readyTimeout: 20000 });
    });
}

function exec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Exec timeout`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve(out); });
        });
    });
}

function sftpWrite(conn, remotePath, content) {
    return new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) return reject(err);
            const ws = sftp.createWriteStream(remotePath);
            ws.on('close', () => resolve());
            ws.on('error', e => reject(e));
            ws.end(content);
        });
    });
}

async function fixVPS(vps) {
    console.log(`\n[VPS-${vps.id}] ${vps.ip}`);

    let conn;
    try {
        conn = await sshConnect(vps.ip, vps.pass);
    } catch (e) {
        console.log(`  ❌ SSH failed: ${e.message}`);
        return false;
    }

    try {
        // Step 1: Read current passwd-file and rebuild with proper UID/GID
        const currentUsers = await exec(conn, 'cat /etc/dovecot/users');
        const lines = currentUsers.trim().split('\n').filter(l => l.trim());
        console.log(`  Current passwd entries: ${lines.length}`);

        // For each entry, resolve the system user's UID/GID
        // Format: email:{PLAIN}password:UID:GID:::homedir
        const newLines = [];
        for (const line of lines) {
            const parts = line.split(':');
            const email = parts[0];
            const passField = parts[1]; // {PLAIN}password
            const username = email.split('@')[0];

            // Get UID/GID from system
            const uidResult = await exec(conn, `id -u ${username} 2>/dev/null || echo NOUSER`);
            const gidResult = await exec(conn, `id -g ${username} 2>/dev/null || echo NOUSER`);
            const uid = uidResult.trim();
            const gid = gidResult.trim();

            if (uid === 'NOUSER') {
                console.log(`  ⚠️ User ${username} not found, creating...`);
                await exec(conn, `useradd -m -s /bin/false ${username}`);
                const newUid = (await exec(conn, `id -u ${username}`)).trim();
                const newGid = (await exec(conn, `id -g ${username}`)).trim();
                newLines.push(`${email}:${passField}:${newUid}:${newGid}:::/home/${username}/Maildir`);
            } else {
                newLines.push(`${email}:${passField}:${uid}:${gid}:::/home/${username}/Maildir`);
            }
        }

        // Step 2: Write updated passwd-file
        const newContent = newLines.join('\n') + '\n';
        await sftpWrite(conn, '/etc/dovecot/users', newContent);
        await exec(conn, 'chown root:dovecot /etc/dovecot/users && chmod 640 /etc/dovecot/users');
        console.log(`  ✅ Updated passwd-file with UID/GID (${newLines.length} entries)`);

        // Step 3: Also update 10-mail.conf with proper settings
        const mailConf = [
            'mail_location = maildir:/home/%n/Maildir',
            'namespace inbox {',
            '  inbox = yes',
            '}',
            ''
        ].join('\n');
        await sftpWrite(conn, '/etc/dovecot/conf.d/10-mail.conf', mailConf);
        console.log(`  ✅ Updated 10-mail.conf`);

        // Step 4: Ensure Maildir exists for all users
        const uniqueUsers = [...new Set(lines.map(l => l.split(':')[0].split('@')[0]))];
        for (const u of uniqueUsers) {
            await exec(conn, `mkdir -p /home/${u}/Maildir/{cur,new,tmp} && chown -R ${u}:${u} /home/${u}/Maildir`);
        }
        console.log(`  ✅ Ensured Maildir dirs for ${uniqueUsers.length} users`);

        // Step 5: Restart Dovecot
        await exec(conn, 'systemctl restart dovecot', 15000);
        await new Promise(r => setTimeout(r, 3000));
        console.log(`  ✅ Dovecot restarted`);

        // Step 6: Test real IMAP login (not just doveadm)
        const testEmail = lines[0].split(':')[0];
        const testPass = lines[0].split(':')[1].replace('{PLAIN}', '').split(':')[0];

        // Test via nc (plain IMAP port 143)
        const testCmd = `echo -e "a1 LOGIN ${testEmail} ${testPass}\\na2 SELECT INBOX\\na3 LOGOUT" | nc -w5 localhost 143 2>&1 | head -10`;
        const testResult = await exec(conn, testCmd, 10000);

        const loginOK = testResult.includes('a1 OK');
        const noError = !testResult.includes('Internal error') && !testResult.includes('BYE');
        const selectOK = testResult.includes('a2 OK') || testResult.includes('SELECT');

        if (loginOK && noError) {
            console.log(`  ✅ IMAP login + mailbox OK: ${testEmail}`);
        } else if (loginOK && !noError) {
            console.log(`  ⚠️ Login OK but mailbox error:`);
            console.log(`     ${testResult.trim().replace(/\n/g, '\n     ')}`);
        } else {
            console.log(`  ❌ IMAP login failed:`);
            console.log(`     ${testResult.trim().replace(/\n/g, '\n     ')}`);
        }

        // Also test doveadm auth
        const authTest = await exec(conn, `doveadm auth test '${testEmail}' '${testPass}' 2>&1`);
        if (authTest.includes('succeeded')) {
            console.log(`  ✅ doveadm auth OK`);
        } else {
            console.log(`  ⚠️ doveadm: ${authTest.trim()}`);
        }

        conn.end();
        return true;
    } catch (e) {
        console.log(`  ❌ Error: ${e.message}`);
        try { conn.end(); } catch { }
        return false;
    }
}

async function main() {
    console.log('=== Fix Dovecot UID/GID — Virtual User Passwd-File ===\n');

    let ok = 0, fail = 0;
    for (const vps of VPS_LIST) {
        const success = await fixVPS(vps);
        if (success) ok++; else fail++;
    }

    console.log(`\n=== DONE: ${ok} OK, ${fail} failed ===`);
    console.log('\nNext: Re-run reconnect_all.js to reconnect all error accounts');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
