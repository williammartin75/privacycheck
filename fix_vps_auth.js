const fs = require('fs');
const { Client } = require('ssh2');

/**
 * Fix VPS mail auth — switch from system users to Dovecot virtual passwd-file.
 * Uses SFTP to upload files (avoiding shell escaping issues with passwords).
 */

const CSV_PATH = 'all_mailboxes_21_30.csv';

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

function sshExec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Exec timeout`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve({ stdout, stderr }); });
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

function parseCSV() {
    return fs.readFileSync(CSV_PATH, 'utf-8').split('\n').filter(l => l.trim()).map(l => {
        const [email, password, ip] = l.split(',').map(s => s.trim());
        return { email, password, ip };
    });
}

async function fixVPS(vps, accounts) {
    console.log(`\n[VPS-${vps.id}] ${vps.ip} — ${accounts.length} accounts`);

    let conn;
    try {
        conn = await sshConnect(vps.ip, vps.pass);
    } catch (e) {
        console.log(`  ❌ SSH failed: ${e.message}`);
        return false;
    }

    try {
        // 1. Build Dovecot passwd-file content
        // Format: user@domain:{PLAIN}password:::::/home/username/Maildir
        const passwdLines = accounts.map(a => {
            const user = a.email.split('@')[0];
            return `${a.email}:{PLAIN}${a.password}:::::/home/${user}/Maildir`;
        });
        const passwdContent = passwdLines.join('\n') + '\n';

        // Upload via SFTP (avoids shell escaping issues)
        await sftpWrite(conn, '/etc/dovecot/users', passwdContent);
        await sshExec(conn, 'chmod 600 /etc/dovecot/users');
        console.log(`  ✅ Uploaded /etc/dovecot/users (${accounts.length} entries)`);

        // 2. Switch Dovecot auth to passwd-file
        const authConf = [
            'disable_plaintext_auth = no',
            'auth_mechanisms = plain login',
            '',
            'passdb {',
            '  driver = passwd-file',
            '  args = /etc/dovecot/users',
            '}',
            'userdb {',
            '  driver = passwd-file',
            '  args = /etc/dovecot/users',
            '}',
            ''
        ].join('\n');
        await sftpWrite(conn, '/etc/dovecot/conf.d/10-auth.conf', authConf);
        console.log(`  ✅ Updated Dovecot auth → passwd-file`);

        // 3. Update mail_location to use %n (username part, no domain)
        const mailConf = [
            'mail_location = maildir:/home/%n/Maildir',
            'namespace inbox {',
            '  inbox = yes',
            '}',
            ''
        ].join('\n');
        await sftpWrite(conn, '/etc/dovecot/conf.d/10-mail.conf', mailConf);
        console.log(`  ✅ Updated mail_location → /home/%n/Maildir`);

        // 4. Update system user passwords via SFTP (write a chpasswd batch file)
        // Group by unique username (avoid duplicates)
        const userPassMap = {};
        for (const a of accounts) {
            const user = a.email.split('@')[0];
            userPassMap[user] = a.password; // Last password wins (for system user)
        }
        const chpasswdContent = Object.entries(userPassMap).map(([u, p]) => `${u}:${p}`).join('\n') + '\n';
        await sftpWrite(conn, '/tmp/chpasswd_batch.txt', chpasswdContent);
        await sshExec(conn, 'chpasswd < /tmp/chpasswd_batch.txt && rm /tmp/chpasswd_batch.txt');
        console.log(`  ✅ Updated ${Object.keys(userPassMap).length} system user passwords`);

        // 5. Ensure all system users exist
        const uniqueUsers = [...new Set(accounts.map(a => a.email.split('@')[0]))];
        for (const u of uniqueUsers) {
            await sshExec(conn, `id -u ${u} &>/dev/null || useradd -m -s /bin/false ${u}`);
        }

        // 6. Restart services
        const restart = await sshExec(conn, 'systemctl restart dovecot && systemctl restart postfix && echo RESTART_OK', 15000);
        if (restart.stdout.includes('RESTART_OK')) {
            console.log(`  ✅ Services restarted`);
        } else {
            console.log(`  ⚠️ Restart: ${restart.stdout.trim()} | ${restart.stderr.trim()}`);
        }

        // 7. Quick IMAP test with first account (using full email as login)
        await new Promise(r => setTimeout(r, 2000)); // Wait for Dovecot to start
        const t = accounts[0];
        const testCmd = `echo -e "a1 LOGIN ${t.email} ${t.password}\\na2 LOGOUT" | nc -w3 localhost 143 2>&1 | head -5`;
        const testResult = await sshExec(conn, testCmd, 10000);
        const imapOK = testResult.stdout.includes('OK Logged in') || testResult.stdout.includes('a1 OK');
        if (imapOK) {
            console.log(`  ✅ IMAP test OK: ${t.email}`);
        } else {
            console.log(`  ⚠️ IMAP test for ${t.email}:`);
            console.log(`     ${testResult.stdout.trim()}`);
            if (testResult.stderr.trim()) console.log(`     err: ${testResult.stderr.trim()}`);
        }

        // 8. Also test SMTP auth with a second account
        const t2 = accounts.length > 40 ? accounts[40] : accounts[accounts.length - 1];
        // Test with doveadm (more reliable than nc for testing)
        const doveTest = await sshExec(conn,
            `doveadm auth test ${t2.email} '${t2.password.replace(/'/g, "'\\''")}' 2>&1 || echo DOVETEST_FAIL`,
            10000
        );
        if (doveTest.stdout.includes('passdb') || doveTest.stdout.includes('ok')) {
            console.log(`  ✅ doveadm auth OK: ${t2.email}`);
        } else {
            console.log(`  ⚠️ doveadm auth: ${doveTest.stdout.trim()}`);
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
    console.log('=== Fix VPS Mail Auth — Virtual Users ===\n');

    const allAccounts = parseCSV();
    const byIP = {};
    for (const a of allAccounts) {
        if (!byIP[a.ip]) byIP[a.ip] = [];
        byIP[a.ip].push(a);
    }

    console.log(`Total accounts: ${allAccounts.length}`);
    console.log(`VPS count: ${Object.keys(byIP).length}`);

    let ok = 0, fail = 0;
    for (const vps of VPS_LIST) {
        const accounts = byIP[vps.ip];
        if (!accounts) { console.log(`[VPS-${vps.id}] No accounts, skip`); continue; }
        const success = await fixVPS(vps, accounts);
        if (success) ok++; else fail++;
    }

    console.log(`\n=== DONE: ${ok} OK, ${fail} failed ===`);
    console.log(`\nNext: Run reconnect_ditlead.js to reconnect all suspended accounts`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
