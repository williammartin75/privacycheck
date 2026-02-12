const { Client } = require('ssh2');
const http = require('http');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };
const VPS21 = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
const HAPPYDELIVER_API = `http://${VPS29.ip}:8080`;

function exec(conn, cmd, timeout = 20000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve('[TIMEOUT]'), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
        });
    });
}

function sshConnect(ip, pass) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({ host: ip, port: 22, username: 'root', password: pass, readyTimeout: 10000 });
    });
}

function apiRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const u = new URL(`${HAPPYDELIVER_API}${path}`);
        const opts = {
            hostname: u.hostname, port: u.port, path: u.pathname, method,
            headers: { 'Content-Type': 'application/json' }, timeout: 10000,
        };
        const req = http.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    // Step 1: Check happyDeliver logs
    console.log('=== happyDeliver logs (VPS-29) ===');
    const conn29 = await sshConnect(VPS29.ip, VPS29.pass);
    console.log(await exec(conn29, 'docker logs happydeliver 2>&1 | tail -20'));

    console.log('\n=== Postfix mail log inside container ===');
    console.log(await exec(conn29, 'docker exec happydeliver cat /var/log/mail.log 2>/dev/null | tail -20'));

    // Step 2: Create a fresh test
    console.log('\n=== Creating test ===');
    const test = await apiRequest('POST', '/api/test');
    console.log(JSON.stringify(test, null, 2));
    const testEmail = test.email;
    const testId = test.id;

    // Step 3: Send email from VPS-21 using swaks or raw SMTP properly
    console.log('\n=== Sending test email from VPS-21 ===');
    const conn21 = await sshConnect(VPS21.ip, VPS21.pass);

    // Method 1: Use sendmail with relay host
    const fromEmail = 'contact1@privacyaudit.online';

    // Use swaks if available, otherwise use raw SMTP with proper line endings
    const sendCmd = `printf "EHLO mail.privacyaudit.online\\r\\n\
MAIL FROM:<${fromEmail}>\\r\\n\
RCPT TO:<${testEmail}>\\r\\n\
DATA\\r\\n\
Subject: Test deliverability\\r\\n\
From: ${fromEmail}\\r\\n\
To: ${testEmail}\\r\\n\
MIME-Version: 1.0\\r\\n\
Content-Type: text/plain\\r\\n\
\\r\\n\
Test email from ${fromEmail}\\r\\n\
.\\r\\n\
QUIT\\r\\n" | nc -w10 ${VPS29.ip} 25 2>&1`;

    console.log('Send command result:');
    const sendResult = await exec(conn21, sendCmd, 15000);
    console.log(sendResult);

    // Also try using the mail command via Postfix relay
    console.log('\n=== Method 2: Using Postfix sendmail ===');
    const sendCmd2 = `echo "Subject: Deliverability Test
From: ${fromEmail}
To: ${testEmail}
MIME-Version: 1.0
Content-Type: text/plain

Test from ${fromEmail}" | /usr/sbin/sendmail -f ${fromEmail} ${testEmail} 2>&1 && echo "QUEUED" || echo "FAILED"`;
    console.log(await exec(conn21, sendCmd2));

    // Wait for delivery
    console.log('\n=== Waiting 10s for delivery ===');
    await new Promise(r => setTimeout(r, 10000));

    // Check mail log on VPS-29
    console.log('\n=== VPS-29 mail log after send ===');
    console.log(await exec(conn29, 'docker exec happydeliver cat /var/log/mail.log 2>/dev/null | tail -20'));

    // Check report
    console.log('\n=== Report ===');
    const report = await apiRequest('GET', `/api/report/${testId}`);
    console.log(JSON.stringify(report, null, 2));

    // Also check Postfix queue on VPS-21
    console.log('\n=== VPS-21 Postfix queue ===');
    console.log(await exec(conn21, 'mailq | head -20'));

    console.log('\n=== VPS-21 mail log ===');
    console.log(await exec(conn21, 'tail -20 /var/log/mail.log 2>/dev/null || journalctl -u postfix --no-pager -n 20'));

    conn21.end();
    conn29.end();
}

main().catch(console.error);
