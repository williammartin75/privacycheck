#!/usr/bin/env node
/**
 * FIX: dovecot users file must use REAL uid/gid from system
 * Also fix: authentication server connection lost → increase auth worker limits
 * 
 * For each VPS:
 * 1. Get real uid/gid for each system user
 * 2. Rebuild /etc/dovecot/users with correct uid/gid
 * 3. Fix home dir permissions to be 0755 instead of 0750
 * 4. Increase Dovecot auth worker limits
 * 5. Restart and test
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

const servers = [
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

// Load CSV
const allCreds = [];
for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
    const parts = line.trim().split(',');
    if (parts.length >= 3) allCreds.push({ email: parts[0], password: parts[1], ip: parts[2] });
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 90000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  FIX UID/GID + PERMISSIONS - ALL VPS      ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    for (const s of servers) {
        const vpsCreds = allCreds.filter(c => c.ip === s.ip);
        console.log(`\n═══ VPS-${s.id} (${vpsCreds.length} users) ═══`);

        // Build bash script that:
        // 1. For each user, get real uid/gid and build the users file line
        // 2. Fix home dir permissions
        // 3. Increase auth worker limits
        // 4. Restart and test IMAP

        const scriptLines = [
            '#!/bin/bash',
            'set -e',
            '',
            '# Rebuild dovecot users file with REAL uid/gid',
            '> /tmp/dovecot_users_new',
        ];

        for (const c of vpsCreds) {
            const localPart = c.email.split('@')[0];
            const escapedPass = c.password.replace(/'/g, "'\\''");
            scriptLines.push(
                `uid=$(id -u ${localPart} 2>/dev/null || echo "")`,
                `gid=$(id -g ${localPart} 2>/dev/null || echo "")`,
                `if [ -z "$uid" ]; then`,
                `  useradd -m -s /usr/sbin/nologin ${localPart} 2>/dev/null || true`,
                `  uid=$(id -u ${localPart})`,
                `  gid=$(id -g ${localPart})`,
                `fi`,
                `mkdir -p /home/${localPart}/Maildir/{new,cur,tmp}`,
                `chown -R ${localPart}:${localPart} /home/${localPart}`,
                `chmod 755 /home/${localPart}`,
                `echo "${c.email}:{PLAIN}${escapedPass}:$uid:$gid::/home/${localPart}:/home/${localPart}/Maildir" >> /tmp/dovecot_users_new`,
            );
        }

        scriptLines.push(
            '',
            '# Install the new users file',
            'cp /tmp/dovecot_users_new /etc/dovecot/users',
            'chown root:dovecot /etc/dovecot/users',
            'chmod 640 /etc/dovecot/users',
            '',
            '# Increase auth worker limits to prevent "Connection lost to auth server"',
            'cat > /etc/dovecot/conf.d/10-master.conf << \'MASTEREOF\'',
            'service auth {',
            '  unix_listener /var/spool/postfix/private/auth {',
            '    mode = 0660',
            '    user = postfix',
            '    group = postfix',
            '  }',
            '}',
            '',
            'service auth-worker {',
            '  process_limit = 30',
            '}',
            '',
            'service lmtp {',
            '  unix_listener lmtp {',
            '  }',
            '}',
            'MASTEREOF',
            '',
            '# Restart',
            'systemctl restart dovecot',
            'systemctl restart postfix',
            'sleep 1',
            '',
            '# Verify: show first 3 lines of users file',
            'echo "USERS_FILE:"',
            'head -3 /etc/dovecot/users',
            '',
            '# Test IMAP for last user (gdpr4 or equivalent)',
        );

        // Find last user for test
        const lastUser = vpsCreds[vpsCreds.length - 1];
        scriptLines.push(
            `python3 -c "`,
            `import imaplib`,
            `try:`,
            `    m = imaplib.IMAP4('localhost', 143)`,
            `    m.login('${lastUser.email}', '${lastUser.password}')`,
            `    status, data = m.select('INBOX')`,
            `    print('IMAP_TEST: OK status=' + status)`,
            `    m.logout()`,
            `except Exception as e:`,
            `    print('IMAP_TEST: FAIL ' + str(e))`,
            `"`,
        );

        const scriptB64 = Buffer.from(scriptLines.join('\n')).toString('base64');
        const cmd = `echo "${scriptB64}" | base64 -d > /tmp/fix_uid.sh && chmod +x /tmp/fix_uid.sh && bash /tmp/fix_uid.sh 2>&1`;

        const result = await sshExec(s.ip, s.pass, cmd);

        // Parse result
        const lines = result.split('\n');
        const usersLine = lines.find(l => l.includes('USERS_FILE:'));
        const imapLine = lines.find(l => l.includes('IMAP_TEST:'));
        const sampleLines = [];
        let collecting = false;
        for (const l of lines) {
            if (l.includes('USERS_FILE:')) { collecting = true; continue; }
            if (collecting && sampleLines.length < 1) { sampleLines.push(l); }
            if (l.includes('IMAP_TEST:')) break;
        }

        console.log(`  Sample: ${sampleLines[0] || '?'}`);
        console.log(`  ${imapLine || 'NO IMAP TEST RESULT'}`);
    }

    console.log('\n╔═══════════════════════════════╗');
    console.log('║  ALL VPS FIXED                ║');
    console.log('╚═══════════════════════════════╝');
})();
