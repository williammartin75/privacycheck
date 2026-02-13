#!/usr/bin/env node
/**
 * Check if passwords in /etc/dovecot/users match the CSV on each VPS
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

// Load CSV
const creds = new Map();
for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
    const [email, password, ip] = line.trim().split(',');
    if (email && password) creds.set(email, password);
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 20000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR'); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    for (const s of servers) {
        console.log(`\n═══ VPS-${s.id} (${s.domains.join(', ')}) ═══`);

        // Get dovecot users file
        const usersFile = await sshExec(s.ip, s.pass, 'cat /etc/dovecot/users');
        if (!usersFile || usersFile === 'TIMEOUT') {
            console.log('  CANNOT READ USERS FILE');
            continue;
        }

        const dovecotUsers = new Map();
        for (const line of usersFile.split('\n')) {
            const match = line.match(/^([^:]+):\{PLAIN\}([^:]+)/);
            if (match) dovecotUsers.set(match[1], match[2]);
        }

        let match = 0, mismatch = 0, missing = 0;
        const mismatches = [];

        for (const domain of s.domains) {
            // Check each expected user
            const prefixes = ['contact', 'info', 'audit', 'report', 'team', 'sales', 'support', 'hello', 'privacy', 'gdpr'];
            for (const pre of prefixes) {
                for (let i = 1; i <= 4; i++) {
                    const email = `${pre}${i}@${domain}`;
                    const csvPass = creds.get(email);
                    const dovecotPass = dovecotUsers.get(email);

                    if (!csvPass) { missing++; continue; }
                    if (!dovecotPass) {
                        mismatches.push(`  ❌ ${email}: NOT IN DOVECOT`);
                        mismatch++;
                    } else if (csvPass !== dovecotPass) {
                        mismatches.push(`  ❌ ${email}: CSV="${csvPass}" DOVECOT="${dovecotPass}"`);
                        mismatch++;
                    } else {
                        match++;
                    }
                }
            }
        }

        console.log(`  ✅ Match: ${match} | ❌ Mismatch: ${mismatch} | ⏭ Missing: ${missing}`);
        if (mismatches.length > 0) {
            console.log('  FIRST 5 MISMATCHES:');
            for (const m of mismatches.slice(0, 5)) console.log(m);
        }

        // Also test one auth
        const testEmail = `contact1@${s.domains[0]}`;
        const testPass = creds.get(testEmail);
        if (testEmail && testPass) {
            const authResult = await sshExec(s.ip, s.pass, `doveadm auth test '${testEmail}' '${testPass}' 2>&1 | head -3`);
            console.log(`  AUTH TEST ${testEmail}: ${authResult.split('\n')[0]}`);
        }
    }

    console.log('\n=== DONE ===');
})();
