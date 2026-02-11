#!/usr/bin/env node
// Fix OpenDKIM on VPS-17 to VPS-20
// Problem: DKIM key files missing or misconfigured
// Solution: Regenerate DKIM keys and fix OpenDKIM config
const { Client } = require('ssh2');

const PROBLEM_VPS = [
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domain: 'theprivacycheckerpro.cloud' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domain: 'theprivacycheckerpro.site' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domain: 'theprivacycheckerpro.online' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domain: 'theprivacycheckerpro.website' },
];

function sshExec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${cmd.substring(0, 80)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => { clearTimeout(timer); resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code }); });
        });
    });
}

function sshConnect(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pass,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function fixVPS(vps) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Fixing ${vps.id} — ${vps.ip} — ${vps.domain}`);
    console.log(`${'='.repeat(60)}`);

    let conn;
    try {
        conn = await sshConnect(vps);
        console.log('  ✅ SSH connected');

        // 1. Check current DKIM state
        const dkimCheck = await sshExec(conn, `ls -la /etc/opendkim/keys/${vps.domain}/ 2>/dev/null || echo "NO KEYS DIR"`);
        console.log(`  Current DKIM keys: ${dkimCheck.stdout}`);

        const sigTable = await sshExec(conn, 'cat /etc/opendkim/signing.table 2>/dev/null || echo "NO signing.table"');
        console.log(`  Signing table: ${sigTable.stdout}`);

        const keyTable = await sshExec(conn, 'cat /etc/opendkim/key.table 2>/dev/null || echo "NO key.table"');
        console.log(`  Key table: ${keyTable.stdout}`);

        // 2. Fix DKIM - regenerate key and fix config
        const fixScript = `#!/bin/bash
set -e
DOMAIN="${vps.domain}"

# Create directory structure
mkdir -p /etc/opendkim/keys/$DOMAIN

# Generate new DKIM key
opendkim-genkey -b 2048 -d $DOMAIN -D /etc/opendkim/keys/$DOMAIN -s mail -v 2>&1

# Set permissions
chown -R opendkim:opendkim /etc/opendkim/keys/
chmod 600 /etc/opendkim/keys/$DOMAIN/mail.private

# Configure signing table
echo "*@$DOMAIN mail._domainkey.$DOMAIN" > /etc/opendkim/signing.table

# Configure key table
echo "mail._domainkey.$DOMAIN $DOMAIN:mail:/etc/opendkim/keys/$DOMAIN/mail.private" > /etc/opendkim/key.table

# Configure trusted hosts
cat > /etc/opendkim/trusted.hosts << EOF
127.0.0.1
localhost
$DOMAIN
*.$DOMAIN
EOF

# Configure opendkim.conf
cat > /etc/opendkim.conf << 'ODKIM'
AutoRestart             Yes
AutoRestartRate         10/1h
Syslog                  yes
SyslogSuccess           Yes
LogWhy                  Yes
Canonicalization        relaxed/simple
ExternalIgnoreList      refile:/etc/opendkim/trusted.hosts
InternalHosts           refile:/etc/opendkim/trusted.hosts
KeyTable                refile:/etc/opendkim/key.table
SigningTable            refile:/etc/opendkim/signing.table
Mode                    sv
PidFile                 /run/opendkim/opendkim.pid
SignatureAlgorithm      rsa-sha256
UserID                  opendkim:opendkim
Socket                  inet:8891@localhost
ODKIM

# Ensure socket directory exists
mkdir -p /run/opendkim
chown opendkim:opendkim /run/opendkim

# Restart OpenDKIM
systemctl restart opendkim

# Verify it's running
systemctl is-active opendkim

# Show the DKIM DNS record
echo "=== DKIM DNS RECORD ==="
cat /etc/opendkim/keys/$DOMAIN/mail.txt
echo "=== END ==="
`;

        await sshExec(conn, `cat > /tmp/fix_dkim.sh << 'FIXEOF'
${fixScript}
FIXEOF
chmod +x /tmp/fix_dkim.sh`);

        const result = await sshExec(conn, 'bash /tmp/fix_dkim.sh', 30000);
        console.log(`\n  Fix output:\n    ${result.stdout.split('\n').join('\n    ')}`);
        if (result.stderr) console.log(`  Stderr:\n    ${result.stderr.split('\n').join('\n    ')}`);

        // 3. Also restart Postfix to pick up changes
        await sshExec(conn, 'systemctl restart postfix');
        console.log('\n  ✅ Postfix restarted');

        // 4. Verify — send a test email via SMTP
        const creds = await sshExec(conn, 'head -1 /root/mailboxes.txt');
        const [email, password] = creds.stdout.split(',');

        const authTest = await sshExec(conn, `doveadm auth test "${email}" "${password}" 2>&1`);
        console.log(`  Auth test: ${authTest.stdout.includes('succeeded') ? '✅ OK' : '❌ ' + authTest.stdout}`);

        // 5. Try SMTP send
        const smtpAuth = await sshExec(conn, `echo -ne "\\0${email}\\0${password}" | openssl base64`);
        const authString = smtpAuth.stdout.trim();
        const smtpTest = await sshExec(conn, `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${authString}"; sleep 1; echo "MAIL FROM:<${email}>"; sleep 1; echo "QUIT") | timeout 10 openssl s_client -starttls smtp -connect 127.0.0.1:587 -quiet 2>/dev/null | grep -E "235|250|535"`, 20000);
        console.log(`  SMTP send test: ${smtpTest.stdout.split('\n').join(' | ')}`);

        // 6. Check mail logs for any remaining errors
        await new Promise(r => setTimeout(r, 2000));
        const postLogs = await sshExec(conn, 'tail -5 /var/log/mail.log | grep -iE "error|milter-reject" || echo "No errors"');
        console.log(`  Post-fix logs: ${postLogs.stdout.split('\n')[0]}`);

        conn.end();
        return { ok: true };
    } catch (err) {
        console.log(`  ❌ FAILED: ${err.message}`);
        if (conn) conn.end();
        return { ok: false, error: err.message };
    }
}

async function main() {
    console.log('============================================================');
    console.log('  FIX OpenDKIM — VPS 17-20 (theprivacycheckerpro.*)');
    console.log('============================================================');

    for (const vps of PROBLEM_VPS) {
        await fixVPS(vps);
    }

    console.log('\n\nDone! Now update DKIM DNS records in IONOS if the keys changed.');
}

main().catch(console.error);
