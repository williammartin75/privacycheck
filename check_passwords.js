const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// Compare passwords between CSV and VPS-03 for failing domains
const vps = { id: 'vps-03', ip: '206.217.139.115', pw: '20QEs9OSh8Bw3egI1q' };

function sshExec(command) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('timeout')); }, 30000);
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                let out = '';
                stream.on('data', c => out += c.toString());
                stream.stderr.on('data', c => out += c.toString());
                stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out.trim()); });
            });
        });
        conn.on('error', e => { clearTimeout(timer); reject(e); });
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pw,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group14-sha256'] }
        });
    });
}

async function main() {
    console.log('=== Password Comparison: CSV vs VPS-03 ===\n');

    // Load CSV
    const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
        'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
        'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');
    const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n');

    // Build CSV password map for VPS-03 domains
    const csvPasswords = {};
    for (let i = 1; i < csvLines.length; i++) {
        const parts = csvLines[i].split(',');
        if (parts.length >= 7) {
            const email = parts[2]?.trim();
            const smtpPassword = parts[6]?.trim();
            if (email && (email.includes('mailprivacycheckerpro.site') || email.includes('mailprivacycheckerpro.icu'))) {
                csvPasswords[email] = smtpPassword;
            }
        }
    }
    console.log(`CSV passwords for VPS-03 domains: ${Object.keys(csvPasswords).length} entries`);

    // Get VPS passwd-file
    const vpsUsers = await sshExec('cat /etc/dovecot/users');
    const vpsPasswords = {};
    for (const line of vpsUsers.split('\n')) {
        if (!line.includes('@')) continue;
        // Format: user@domain:{PLAIN}password:5000:5000::home
        const match = line.match(/^([^:]+):\{PLAIN\}([^:]+):/);
        if (match) {
            vpsPasswords[match[1]] = match[2];
        }
    }
    console.log(`VPS passwords: ${Object.keys(vpsPasswords).length} entries\n`);

    // Compare
    let mismatches = 0;
    let matches = 0;
    for (const [email, csvPw] of Object.entries(csvPasswords)) {
        const vpsPw = vpsPasswords[email];
        if (!vpsPw) {
            console.log(`❌ MISSING ON VPS: ${email}`);
            mismatches++;
        } else if (csvPw !== vpsPw) {
            console.log(`❌ MISMATCH: ${email}`);
            console.log(`   CSV: "${csvPw}"`);
            console.log(`   VPS: "${vpsPw}"`);
            mismatches++;
        } else {
            matches++;
        }
    }

    console.log(`\n✅ Matches: ${matches}`);
    console.log(`❌ Mismatches: ${mismatches}`);

    // Also check: which ones are the specific failing ones from Ditlead???
    const failingAccounts = [
        'support1@mailprivacycheckerpro.icu', 'support4@mailprivacycheckerpro.icu',
        'contact1@mailprivacycheckerpro.icu', 'contact1@mailprivacycheckerpro.site',
        'gdpr3@mailprivacycheckerpro.site', 'gdpr4@mailprivacycheckerpro.site'
    ];

    console.log('\n--- Specific failing account checks ---');
    for (const email of failingAccounts) {
        const csvPw = csvPasswords[email];
        const vpsPw = vpsPasswords[email];
        const match = csvPw === vpsPw ? '✅' : '❌';
        console.log(`${match} ${email}: CSV="${csvPw}" VPS="${vpsPw}"`);
    }
}

main().catch(console.error);
