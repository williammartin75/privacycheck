#!/usr/bin/env node
/**
 * Phase 1-3: Fix ALL dovecot auth issues on VPS 31-40
 * - Rewrites /etc/dovecot/users from CSV (source of truth)
 * - Creates missing system users
 * - Tests every single user via doveadm auth test
 * - Reports results
 */
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

const servers = [
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'] },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', domains: ['contactprivacychecker.info'] },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', domains: ['contactprivacychecker.cloud'] },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', domains: ['contactprivacychecker.site', 'contactprivacychecker.website'] },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N', domains: ['reportprivacychecker.info', 'reportprivacychecker.cloud'] },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm', domains: ['reportprivacychecker.site', 'reportprivacychecker.website'] },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y', domains: ['checkprivacychecker.info', 'checkprivacychecker.cloud'] },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', domains: ['checkprivacychecker.site'] },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', domains: ['checkprivacychecker.space'] },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', domains: ['checkprivacychecker.website'] },
];

// Load CSV credentials
const allCreds = [];
for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
    const parts = line.trim().split(',');
    if (parts.length >= 3) allCreds.push({ email: parts[0], password: parts[1], ip: parts[2] });
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
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  FIX ALL DOVECOT AUTH - VPS 31-40         ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    let totalOk = 0, totalFail = 0;

    for (const s of servers) {
        console.log(`\n═══ VPS-${s.id} (${s.domains.join(', ')}) ═══`);

        // Get credentials for this VPS
        const vpsCreds = allCreds.filter(c => c.ip === s.ip);
        console.log(`  ${vpsCreds.length} users from CSV`);

        // Build the dovecot users file content
        const usersLines = vpsCreds.map(c => {
            const localPart = c.email.split('@')[0];
            return `${c.email}:{PLAIN}${c.password}:1000:1000:::/home/${localPart}/Maildir`;
        });
        const usersContent = usersLines.join('\n') + '\n';

        // Build bash script that:
        // 1. Creates system users
        // 2. Writes dovecot users file
        // 3. Fixes permissions
        // 4. Restarts services
        // 5. Tests auth for EVERY user
        const userCreationCmds = vpsCreds.map(c => {
            const localPart = c.email.split('@')[0];
            return `id ${localPart} >/dev/null 2>&1 || useradd -m -s /usr/sbin/nologin ${localPart} && mkdir -p /home/${localPart}/Maildir/{new,cur,tmp} && chown -R ${localPart}:${localPart} /home/${localPart}/Maildir`;
        });

        // Escape the users content for base64 transport
        const b64Content = Buffer.from(usersContent).toString('base64');

        const bashScript = [
            '#!/bin/bash',
            'set -e',
            '',
            '# Create system users',
            ...userCreationCmds,
            '',
            '# Write dovecot users file from base64',
            `echo "${b64Content}" | base64 -d > /etc/dovecot/users`,
            '',
            '# Fix permissions',
            'chown root:dovecot /etc/dovecot/users',
            'chmod 640 /etc/dovecot/users',
            '',
            '# Ensure auth config uses passwd-file',
            'cat > /etc/dovecot/conf.d/10-auth.conf << \'AUTHEOF\'',
            'disable_plaintext_auth = no',
            'auth_mechanisms = plain login',
            'passdb {',
            '  driver = passwd-file',
            '  args = /etc/dovecot/users',
            '}',
            'userdb {',
            '  driver = passwd-file',
            '  args = /etc/dovecot/users',
            '}',
            'AUTHEOF',
            '',
            '# Restart services',
            'systemctl restart dovecot',
            'systemctl restart postfix',
            '',
            '# Test auth for EVERY user',
            'echo "AUTH_TESTS_START"',
        ];

        // Add auth test for each user
        for (const c of vpsCreds) {
            // Escape password for bash (handle + and other special chars)
            const escapedPass = c.password.replace(/'/g, "'\\''");
            bashScript.push(`result=$(doveadm auth test '${c.email}' '${escapedPass}' 2>&1 | head -1) && echo "TEST:${c.email}:$result" || echo "TEST:${c.email}:ERROR"`);
        }
        bashScript.push('echo "AUTH_TESTS_END"');

        // Upload and run bash script via base64
        const scriptB64 = Buffer.from(bashScript.join('\n')).toString('base64');
        const cmd = `echo "${scriptB64}" | base64 -d > /tmp/fix_auth.sh && chmod +x /tmp/fix_auth.sh && bash /tmp/fix_auth.sh 2>&1`;

        console.log('  Running fix + auth tests...');
        const result = await sshExec(s.ip, s.pass, cmd);

        // Parse auth test results
        const lines = result.split('\n');
        let ok = 0, fail = 0;
        const failures = [];

        for (const line of lines) {
            if (line.startsWith('TEST:')) {
                const parts = line.split(':');
                const email = parts[1];
                const rest = parts.slice(2).join(':');
                if (rest.includes('succeeded')) {
                    ok++;
                } else {
                    fail++;
                    failures.push(`    ❌ ${email}: ${rest}`);
                }
            }
        }

        console.log(`  ✅ ${ok} passed | ❌ ${fail} failed`);
        if (failures.length > 0) {
            for (const f of failures) console.log(f);
        }

        totalOk += ok;
        totalFail += fail;
    }

    console.log(`\n╔═══════════════════════════════════════╗`);
    console.log(`║  TOTAL: ✅ ${totalOk} passed | ❌ ${totalFail} failed  ║`);
    console.log(`╚═══════════════════════════════════════╝`);
})();
