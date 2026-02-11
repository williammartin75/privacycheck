const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
    'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
    'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');

const lines = fs.readFileSync(csvPath, 'utf-8').split('\n');
const missing = ['privacy3@mailprivacycheckerpro.icu', 'gdpr2@mailprivacycheckerpro.icu'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function apiPost(body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const opts = {
            hostname: 'api.ditlead.com', path: '/v1/mailbox', method: 'POST',
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        };
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    for (const email of missing) {
        const line = lines.find(l => l.includes(email));
        if (!line) { console.log('Not found:', email); continue; }

        const p = line.split(',');
        const prefix = email.split('@')[0].replace(/\d+$/, '');
        const firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

        console.log(`Importing: ${p[2]} (${firstName})`);

        // Use the exact same format as deploy_fix.js
        const payload = {
            firstName,
            lastName: 'PrivacyChecker',
            smtp: {
                host: p[3],       // smtp_host (IP)
                port: '587',
                username: p[5],   // smtp_username (email)
                password: p[6],   // smtp_password
                emailAddress: p[2], // email
                secure: false     // port 587 = STARTTLS
            },
            imap: {
                host: p[8],       // imap_host (IP)
                port: '993',
                username: p[10],  // imap_username (email)
                password: p[11]   // imap_password
            }
        };

        console.log('  Payload:', JSON.stringify(payload, null, 2));

        const result = await apiPost(payload);
        console.log(`  Status: ${result.status} — ${result.body.substring(0, 300)}`);
        await sleep(2000);
    }
    console.log('Done!');
}

main();
