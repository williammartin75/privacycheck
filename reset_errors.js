const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

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

// Load CSV (for reimport)
const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
    'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
    'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');
const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n');

function findCSVData(email) {
    const line = csvLines.find(l => l.includes(email));
    if (!line) return null;
    return line.split(',');
}

async function main() {
    console.log('=== Reset 203 error-flagged accounts ===\n');

    // Step 1: Fetch all accounts
    console.log('Step 1: Fetching accounts...');
    const resp = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const all = resp.body.data || [];

    // Filter: hasError === true
    const errorAccounts = all.filter(a => a.emailAccountError && a.emailAccountError.hasError === true);
    console.log(`  Found ${errorAccounts.length} accounts with hasError=true\n`);

    if (errorAccounts.length === 0) {
        console.log('No accounts to reset!');
        return;
    }

    // Step 2: Delete error accounts
    console.log(`Step 2: Deleting ${errorAccounts.length} accounts...`);
    let deleted = 0, deleteErrors = 0;

    for (let i = 0; i < errorAccounts.length; i++) {
        const acct = errorAccounts[i];
        try {
            const res = await apiRequest('DELETE', '/v1/mailbox/' + acct.mailboxId);
            if (res.status === 200) {
                deleted++;
            } else {
                deleteErrors++;
                console.log(`  ❌ Delete failed: ${acct.mailboxAddress} - ${res.status}`);
            }
        } catch (err) {
            deleteErrors++;
            console.log(`  ❌ ${acct.mailboxAddress}: ${err.message}`);
        }

        if ((i + 1) % 20 === 0 || i === errorAccounts.length - 1) {
            process.stdout.write(`\r  Progress: ${i + 1}/${errorAccounts.length} (deleted: ${deleted}, errors: ${deleteErrors})`);
        }
        await sleep(500); // Rate limit: 2/sec
    }
    console.log(`\n  ✅ Deleted: ${deleted}, Failed: ${deleteErrors}\n`);

    // Step 3: Wait before reimport
    console.log('Step 3: Waiting 10s before reimport...');
    await sleep(10000);

    // Step 4: Reimport
    console.log(`Step 4: Reimporting ${errorAccounts.length} accounts...`);
    let imported = 0, importErrors = 0, notInCSV = 0;
    const failedImports = [];

    for (let i = 0; i < errorAccounts.length; i++) {
        const email = errorAccounts[i].mailboxAddress;
        const p = findCSVData(email);

        if (!p) {
            notInCSV++;
            console.log(`  ⚠️ ${email}: not found in CSV`);
            continue;
        }

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
            } else {
                importErrors++;
                failedImports.push({ email, status: res.status, body: JSON.stringify(res.body).substring(0, 100) });
                if (importErrors <= 5) {
                    console.log(`\n  ❌ Import failed: ${email} - ${res.status} ${JSON.stringify(res.body).substring(0, 100)}`);
                }
            }
        } catch (err) {
            importErrors++;
            failedImports.push({ email, error: err.message });
        }

        if ((i + 1) % 20 === 0 || i === errorAccounts.length - 1) {
            process.stdout.write(`\r  Progress: ${i + 1}/${errorAccounts.length} (imported: ${imported}, errors: ${importErrors})`);
        }
        await sleep(1500); // Rate limit
    }

    console.log('\n');
    console.log('=== SUMMARY ===');
    console.log(`  Accounts with errors: ${errorAccounts.length}`);
    console.log(`  Successfully deleted: ${deleted}`);
    console.log(`  Successfully reimported: ${imported}`);
    console.log(`  Not in CSV: ${notInCSV}`);
    console.log(`  Import failures: ${importErrors}`);

    if (failedImports.length > 0) {
        console.log('\n  Failed imports:');
        failedImports.forEach(f => console.log(`    ${f.email}: ${f.status || f.error}`));
    }

    // Step 5: Verify
    console.log('\nStep 5: Verifying...');
    await sleep(3000);
    const verify = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const verifyAll = verify.body.data || [];
    const stillError = verifyAll.filter(a => a.emailAccountError && a.emailAccountError.hasError === true);
    console.log(`  Total accounts: ${verifyAll.length}`);
    console.log(`  Still with errors: ${stillError.length}`);
    console.log('\n✅ Done!');
}

main().catch(console.error);
