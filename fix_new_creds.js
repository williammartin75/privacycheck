#!/usr/bin/env node
// ============================================================
// Fix credentials on 10 new VPS
// The original deploy had a bash escaping issue where $PASS
// wasn't expanded. This script regenerates credentials properly.
// ============================================================

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const NEW_VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe' },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5' },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783' },
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
];

const DOMAIN_ASSIGNMENTS = {
    'VPS-11': ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'],
    'VPS-12': ['privacycheckermailpro.website', 'privacycheckermailpro.space'],
    'VPS-13': ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'],
    'VPS-14': ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'],
    'VPS-15': ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'],
    'VPS-16': ['privacy-checker-mail-pro.icu'],
    'VPS-17': ['theprivacycheckerpro.cloud'],
    'VPS-18': ['theprivacycheckerpro.site'],
    'VPS-19': ['theprivacycheckerpro.online'],
    'VPS-20': ['theprivacycheckerpro.website'],
};

const CSV_OUTPUT = path.join(__dirname, 'ditlead_new_mailboxes.csv');
const PREFIXES = ['contact', 'info', 'audit', 'report', 'team', 'sales', 'support', 'hello', 'privacy', 'gdpr'];

function sshExec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${cmd.substring(0, 80)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => {
                clearTimeout(timer);
                resolve({ stdout, stderr, code });
            });
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
            readyTimeout: 30000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

async function fixVPS(vps, domains, index, total) {
    console.log(`\n[${index}/${total}] ${vps.id} (${vps.ip}) — ${domains.length} domains`);

    let conn;
    try {
        conn = await sshConnect(vps);

        // Upload a small bash script that properly handles variable expansion
        const script = `#!/bin/bash
> /etc/dovecot/users
> /root/mailboxes.txt
VPS_IP=$(curl -s ifconfig.me)
PREFIXES="contact info audit report team sales support hello privacy gdpr"
DOMAINS="${domains.join(' ')}"

for d in $DOMAINS; do
    mkdir -p /var/mail/vhosts/$d
    for prefix in $PREFIXES; do
        for i in 1 2 3 4; do
            USER="\${prefix}\${i}"
            PASS=$(openssl rand -base64 12)
            echo "\${USER}@\${d}:{PLAIN}\${PASS}:::::" >> /etc/dovecot/users
            echo "\${USER}@\${d},\${PASS},\${VPS_IP}" >> /root/mailboxes.txt
        done
    done
done

chown -R vmail:vmail /var/mail/vhosts
chmod 644 /etc/dovecot/users
systemctl restart dovecot
echo "DONE"
`;

        // Write script to VPS
        await sshExec(conn, `cat > /tmp/fix_creds.sh << 'FIXEOF'
${script}
FIXEOF
chmod +x /tmp/fix_creds.sh`);

        // Execute it
        const result = await sshExec(conn, 'bash /tmp/fix_creds.sh', 120000);
        if (!result.stdout.includes('DONE')) {
            throw new Error(`Script did not complete: ${result.stderr}`);
        }

        // Verify credentials
        const creds = await sshExec(conn, 'cat /root/mailboxes.txt');
        const lines = creds.stdout.trim().split('\n').filter(l => l.includes('@'));

        // Check first line has actual password (not $PASS)
        const firstLine = lines[0] || '';
        const hasRealPassword = !firstLine.includes('$PASS') && firstLine.split(',').length >= 3;

        if (!hasRealPassword) {
            throw new Error(`Password still not expanded: ${firstLine}`);
        }

        // Test SMTP auth with first credential
        const [email, password] = firstLine.split(',');
        const authTest = await sshExec(conn, `echo -ne "\\0${email}\\0${password}" | openssl base64`);
        const authString = authTest.stdout.trim();
        const smtpTest = await sshExec(conn, `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${authString}"; sleep 1; echo "QUIT") | openssl s_client -starttls smtp -connect 127.0.0.1:587 -quiet 2>/dev/null | grep -E "235|535"`, 15000);

        const smtpOk = smtpTest.stdout.includes('235');
        console.log(`  ✅ ${lines.length} mailboxes, SMTP: ${smtpOk ? '✅ OK' : '⚠️ ' + smtpTest.stdout.trim()}`);

        conn.end();
        return { vps, credentials: creds.stdout.trim(), count: lines.length, smtpOk };
    } catch (err) {
        console.error(`  ❌ FAILED: ${err.message}`);
        if (conn) conn.end();
        return { vps, credentials: '', count: 0, smtpOk: false, error: err.message };
    }
}

async function main() {
    console.log('============================================================');
    console.log('  FIX CREDENTIALS — Regenerate passwords on 10 VPS');
    console.log('============================================================');

    const allCredentials = [];
    let totalMailboxes = 0;

    for (let idx = 0; idx < NEW_VPS.length; idx++) {
        const vps = NEW_VPS[idx];
        const domains = DOMAIN_ASSIGNMENTS[vps.id];
        const result = await fixVPS(vps, domains, idx + 1, NEW_VPS.length);

        if (result.credentials) {
            allCredentials.push(result.credentials);
            totalMailboxes += result.count;
        }
    }

    // Save CSV
    const csvContent = 'email,password,ip\n' + allCredentials.join('\n');
    fs.writeFileSync(CSV_OUTPUT, csvContent);

    console.log(`\n============================================================`);
    console.log(`  DONE — ${totalMailboxes} mailboxes, CSV: ${CSV_OUTPUT}`);
    console.log(`============================================================`);
}

main().catch(console.error);
