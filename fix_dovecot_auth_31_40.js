#!/usr/bin/env node
/**
 * Fix Dovecot auth on VPS 31-40
 * - Write /etc/dovecot/users with passwd-file entries
 * - Fix 10-auth.conf to use passwd-file driver
 * - Restart services
 * Uses a single bash script instead of && chaining to avoid heredoc issues
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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
const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');
const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
const credsByIP = new Map();
for (const line of csvContent.split('\n')) {
    const [email, password, ip] = line.trim().split(',');
    if (!email || !password || !ip) continue;
    if (!credsByIP.has(ip)) credsByIP.set(ip, []);
    credsByIP.get(ip).push({ email, password });
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 60000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR:' + err.message); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 20000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function fix(s) {
    console.log('=== VPS-' + s.id + ' (' + s.ip + ') ===');

    const creds = credsByIP.get(s.ip) || [];
    if (creds.length === 0) {
        console.log('  ⚠️ No creds for this IP');
        return;
    }

    // Build the users file content
    let uid = 1000;
    const usersLines = [];
    const usernames = new Set();
    for (const cred of creds) {
        const localPart = cred.email.split('@')[0];
        usernames.add(localPart);
        usersLines.push(`${cred.email}:{PLAIN}${cred.password}:${uid}:${uid}:::/home/${localPart}/Maildir`);
        uid++;
    }

    // Build a complete bash script
    const script = `#!/bin/bash
set -e

# 1. Create system users
${[...usernames].map(u => `id ${u} >/dev/null 2>&1 || { useradd -m -s /usr/sbin/nologin ${u}; mkdir -p /home/${u}/Maildir/{new,cur,tmp}; chown -R ${u}:${u} /home/${u}; }`).join('\n')}

# 2. Write dovecot users file
cat > /etc/dovecot/users << 'USERSEOF'
${usersLines.join('\n')}
USERSEOF
chmod 600 /etc/dovecot/users
chown root:dovecot /etc/dovecot/users

# 3. Fix auth config
cat > /etc/dovecot/conf.d/10-auth.conf << 'AUTHEOF'
disable_plaintext_auth = no
auth_mechanisms = plain login
passdb {
  driver = passwd-file
  args = /etc/dovecot/users
}
userdb {
  driver = passwd-file
  args = /etc/dovecot/users
}
AUTHEOF

# 4. Restart services
systemctl restart dovecot
systemctl restart postfix

# 5. Verify
echo "USERS=$(wc -l < /etc/dovecot/users)"
echo "DOVECOT=$(systemctl is-active dovecot)"
echo "POSTFIX=$(systemctl is-active postfix)"
echo "AUTH_CONF=$(grep driver /etc/dovecot/conf.d/10-auth.conf)"

# 6. Test auth
doveadm auth test ${creds[0].email} '${creds[0].password}' 2>&1 | head -2
echo "DONE"
`;

    // Upload script via echo+base64
    const b64 = Buffer.from(script).toString('base64');
    const uploadCmd = `echo '${b64}' | base64 -d > /tmp/fix_dovecot.sh && chmod +x /tmp/fix_dovecot.sh && bash /tmp/fix_dovecot.sh`;

    const result = await sshExec(s.ip, s.pass, uploadCmd);
    console.log('  ' + result.split('\n').join('\n  '));
    console.log('');
}

(async () => {
    console.log('=== Fixing Dovecot auth on VPS 31-40 ===\n');
    for (const s of servers) {
        await fix(s);
    }
    console.log('=== ALL DONE ===');
})();
