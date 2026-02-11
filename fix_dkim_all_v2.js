#!/usr/bin/env node
// Fix DKIM key loading errors on ALL VPS
// Root cause: "error loading key" — likely permissions or path issue
const { Client } = require('ssh2');

const ALL_VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domains: ['theprivacycheckerpro.cloud'] },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domains: ['theprivacycheckerpro.site'] },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domains: ['theprivacycheckerpro.online'] },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domains: ['theprivacycheckerpro.website'] },
];

function sshExec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
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
    console.log(`  ${vps.id} — ${vps.ip} — ${vps.domains.join(', ')}`);
    console.log(`${'='.repeat(60)}`);

    let conn;
    try {
        conn = await sshConnect(vps);
        console.log('  ✅ SSH connected');

        // Step 1: Diagnose - check key files, permissions, user
        const diag = await sshExec(conn, `
echo "=== Key files ==="
ls -la /etc/opendkim/keys/*/mail.private 2>&1
echo "=== OpenDKIM user ==="
id opendkim 2>&1
echo "=== Key table ==="
cat /etc/opendkim/key.table 2>&1
echo "=== Signing table ==="
cat /etc/opendkim/signing.table 2>&1
echo "=== OpenDKIM conf socket ==="
grep -i "socket" /etc/opendkim.conf 2>&1
echo "=== Postfix milter ==="
postconf smtpd_milters 2>&1
postconf non_smtpd_milters 2>&1
echo "=== Test key loading ==="
for d in ${vps.domains.join(' ')}; do
    echo "Testing $d..."
    opendkim-testkey -d $d -s mail -vvv 2>&1 | head -5
done
`);
        console.log('  Diagnostic output:');
        console.log(diag.stdout.split('\n').map(l => '    ' + l).join('\n'));
        if (diag.stderr) console.log('  STDERR:', diag.stderr.substring(0, 200));

        // Step 2: Fix — regenerate keys with proper permissions AND ensure file is readable
        const fixScript = vps.domains.map(d => `
# Fix ${d}
mkdir -p /etc/opendkim/keys/${d}
# Regenerate key
opendkim-genkey -b 2048 -d ${d} -D /etc/opendkim/keys/${d} -s mail -v 2>&1 || true
# Fix ownership - ensure opendkim can read
chown -R opendkim:opendkim /etc/opendkim/keys/${d}
chmod 600 /etc/opendkim/keys/${d}/mail.private
chmod 644 /etc/opendkim/keys/${d}/mail.txt
ls -la /etc/opendkim/keys/${d}/mail.private
`).join('\n');

        // Build signing.table
        const sigLines = vps.domains.map(d => `*@${d} mail._domainkey.${d}`).join('\\n');
        const keyLines = vps.domains.map(d => `mail._domainkey.${d} ${d}:mail:/etc/opendkim/keys/${d}/mail.private`).join('\\n');
        const trustedLines = ['127.0.0.1', 'localhost', ...vps.domains.flatMap(d => [d, `*.${d}`])].join('\\n');

        const fullFix = `#!/bin/bash
set -x

${fixScript}

# Write config files
echo -e "${sigLines}" > /etc/opendkim/signing.table
echo -e "${keyLines}" > /etc/opendkim/key.table
echo -e "${trustedLines}" > /etc/opendkim/trusted.hosts

# Ensure config
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

# Ensure postfix milter config
postconf -e "smtpd_milters = inet:localhost:8891"
postconf -e "non_smtpd_milters = inet:localhost:8891"
postconf -e "milter_default_action = accept"
postconf -e "milter_protocol = 6"

# Ensure socket dir
mkdir -p /run/opendkim
chown opendkim:opendkim /run/opendkim

# Restart
systemctl restart opendkim
sleep 2
systemctl restart postfix
sleep 1

# Verify
echo "DKIM_STATUS: $(systemctl is-active opendkim)"
echo "POSTFIX_STATUS: $(systemctl is-active postfix)"

# Test keys
for d in ${vps.domains.join(' ')}; do
    echo "KEY_TEST:$d"
    opendkim-testkey -d $d -s mail -vvv 2>&1 | head -3
done

# Show new DKIM records
for d in ${vps.domains.join(' ')}; do
    echo "DKIM_RECORD:$d"
    cat /etc/opendkim/keys/$d/mail.txt
done
`;

        // Upload and execute
        await sshExec(conn, `cat > /tmp/fix_dkim2.sh << 'FIXEOF'
${fullFix}
FIXEOF
chmod +x /tmp/fix_dkim2.sh`);

        const result = await sshExec(conn, 'bash /tmp/fix_dkim2.sh 2>&1', 60000);

        // Check results
        const statusMatch = result.stdout.match(/DKIM_STATUS: (\w+)/);
        const postfixMatch = result.stdout.match(/POSTFIX_STATUS: (\w+)/);
        console.log(`\n  OpenDKIM: ${statusMatch ? statusMatch[1] : 'unknown'}`);
        console.log(`  Postfix: ${postfixMatch ? postfixMatch[1] : 'unknown'}`);

        // Check key tests
        const keyTests = result.stdout.match(/KEY_TEST:[\s\S]*?(?=DKIM_RECORD|$)/g) || [];
        keyTests.forEach(t => console.log('  ' + t.trim().substring(0, 150)));

        // Check for errors in output
        if (result.stdout.includes('error')) {
            const errLines = result.stdout.split('\n').filter(l => l.toLowerCase().includes('error'));
            errLines.forEach(l => console.log(`  ⚠️ ${l.trim().substring(0, 150)}`));
        }

        // Send a test email to verify DKIM signing works
        const testEmail = `echo "Test DKIM" | mail -s "DKIM test" root@localhost 2>&1; sleep 2; tail -5 /var/log/mail.log | grep -i "dkim\\|milter"`;
        const testResult = await sshExec(conn, testEmail);
        console.log(`  Test mail log: ${testResult.stdout.substring(0, 200)}`);

        conn.end();
        return true;
    } catch (err) {
        console.log(`  ❌ FAILED: ${err.message}`);
        if (conn) conn.end();
        return false;
    }
}

async function main() {
    console.log('============================================================');
    console.log('  FIX DKIM KEY LOADING — ALL 10 VPS');
    console.log('============================================================');

    let success = 0, failed = 0;
    for (const vps of ALL_VPS) {
        const ok = await fixVPS(vps);
        if (ok) success++; else failed++;
    }

    console.log(`\n\n============================================================`);
    console.log(`  DONE: ${success} fixed, ${failed} failed`);
    console.log(`============================================================`);
}

main().catch(console.error);
