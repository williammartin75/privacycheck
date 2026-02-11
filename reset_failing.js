const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

// Failing accounts — all @mailprivacycheckerpro.icu with Account Issue Detected
const FAILING_PREFIXES = ['support', 'sales', 'team', 'report', 'audit', 'info', 'contact'];
const FAILING_DOMAIN = 'mailprivacycheckerpro.icu';
const FAILING_EMAILS = [];
for (const prefix of FAILING_PREFIXES) {
    for (let i = 1; i <= 4; i++) {
        FAILING_EMAILS.push(`${prefix}${i}@${FAILING_DOMAIN}`);
    }
}

console.log(`Will reset ${FAILING_EMAILS.length} accounts on @${FAILING_DOMAIN}\n`);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function apiRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const opts = {
            hostname: 'api.ditlead.com', path: apiPath, method,
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }
        };
        if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch { resolve({ status: res.statusCode, body: d }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// Load CSV for passwords
const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
    'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
    'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');
const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n');

function findCSVLine(email) {
    return csvLines.find(l => l.includes(email));
}

async function main() {
    // Step 1: Get all mailboxes to find IDs of failing ones
    console.log('Step 1: Fetching mailbox IDs...');
    const resp = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const allAccounts = resp.body.data || [];

    const failingAccounts = allAccounts.filter(a => FAILING_EMAILS.includes(a.mailboxAddress));
    console.log(`Found ${failingAccounts.length} accounts to reset\n`);

    // Step 2: Delete failing accounts
    console.log('Step 2: Deleting failing accounts...');
    let deleted = 0;
    for (const acct of failingAccounts) {
        try {
            const res = await apiRequest('DELETE', `/v1/mailbox/${acct.mailboxId}`);
            if (res.status === 200) {
                deleted++;
                process.stdout.write(`\r  Deleted ${deleted}/${failingAccounts.length}`);
            } else {
                console.log(`\n  ❌ ${acct.mailboxAddress}: ${res.status} ${JSON.stringify(res.body).substring(0, 100)}`);
            }
        } catch (err) {
            console.log(`\n  ❌ ${acct.mailboxAddress}: ${err.message}`);
        }
        await sleep(1000);
    }
    console.log(`\n  ✅ Deleted ${deleted} accounts\n`);

    // Step 3: Wait a bit
    console.log('Step 3: Waiting 5s before reimport...');
    await sleep(5000);

    // Step 4: Reimport
    console.log('Step 4: Reimporting...');
    let imported = 0;
    for (const email of FAILING_EMAILS) {
        const line = findCSVLine(email);
        if (!line) { console.log(`  ❌ ${email}: not in CSV`); continue; }

        const p = line.split(',');
        const prefix = email.split('@')[0].replace(/\d+$/, '');
        const firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

        const payload = {
            firstName,
            lastName: 'PrivacyChecker',
            smtp: {
                host: p[3],
                port: '587',
                username: p[5],
                password: p[6],
                emailAddress: p[2],
                secure: false
            },
            imap: {
                host: p[8],
                port: '993',
                username: p[10],
                password: p[11]
            }
        };

        try {
            const res = await apiRequest('POST', '/v1/mailbox', payload);
            if (res.status === 200 || res.status === 201) {
                imported++;
                process.stdout.write(`\r  ✅ Imported ${imported}/${FAILING_EMAILS.length}`);
            } else {
                console.log(`\n  ❌ ${email}: ${res.status} ${JSON.stringify(res.body).substring(0, 150)}`);
            }
        } catch (err) {
            console.log(`\n  ❌ ${email}: ${err.message}`);
        }
        await sleep(2000);
    }

    console.log(`\n\n=== DONE ===`);
    console.log(`Deleted: ${deleted}`);
    console.log(`Reimported: ${imported}`);
}

main().catch(console.error);
