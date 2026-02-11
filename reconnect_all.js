const https = require('https');
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

async function main() {
    console.log('=== Reconnect all error accounts ===\n');

    // Step 1: Fetch all accounts
    console.log('Step 1: Fetching accounts...');
    const resp = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const all = resp.body.data || [];

    // Filter: hasError === true
    const errorAccounts = all.filter(a => a.emailAccountError && a.emailAccountError.hasError === true);
    console.log(`  Total: ${all.length}, with errors: ${errorAccounts.length}\n`);

    // Step 2: Reconnect each one
    console.log('Step 2: Reconnecting...');
    let success = 0, smtpOk = 0, imapOk = 0, failed = 0;
    const failures = [];

    for (let i = 0; i < errorAccounts.length; i++) {
        const acct = errorAccounts[i];

        try {
            const res = await apiRequest('POST', '/v1/mailbox/reconnect', { mailboxId: acct.mailboxId });

            if (res.status === 200 && res.body.success) {
                success++;
                if (res.body.smtpCheck) smtpOk++;
                if (res.body.imapCheck) imapOk++;
            } else {
                failed++;
                failures.push({ email: acct.mailboxAddress, status: res.status, body: res.body });
                if (failed <= 5) {
                    console.log(`  ❌ ${acct.mailboxAddress}: ${JSON.stringify(res.body).substring(0, 150)}`);
                }
            }
        } catch (err) {
            failed++;
            failures.push({ email: acct.mailboxAddress, error: err.message });
        }

        if ((i + 1) % 10 === 0 || i === errorAccounts.length - 1) {
            process.stdout.write(`\r  Progress: ${i + 1}/${errorAccounts.length} | ✅ ${success} | ❌ ${failed} | SMTP: ${smtpOk} | IMAP: ${imapOk}`);
        }

        await sleep(1500); // Rate limit - don't hammer the API
    }

    console.log('\n');
    console.log('=== SUMMARY ===');
    console.log(`  Accounts reconnected: ${success}/${errorAccounts.length}`);
    console.log(`  SMTP checks passed: ${smtpOk}`);
    console.log(`  IMAP checks passed: ${imapOk}`);
    console.log(`  Failures: ${failed}`);

    if (failures.length > 0 && failures.length <= 20) {
        console.log('\n  Failed accounts:');
        failures.forEach(f => console.log(`    ${f.email}: ${f.status || f.error} ${JSON.stringify(f.body || '').substring(0, 100)}`));
    }

    // Step 3: Verify
    console.log('\nStep 3: Verifying...');
    await sleep(5000);
    const verify = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const verifyAll = verify.body.data || [];
    const stillError = verifyAll.filter(a => a.emailAccountError && a.emailAccountError.hasError === true);
    const active = verifyAll.filter(a => a.isActive === true);
    console.log(`  Total: ${verifyAll.length}`);
    console.log(`  Active: ${active.length}`);
    console.log(`  Still with errors: ${stillError.length}`);

    if (stillError.length > 0 && stillError.length <= 10) {
        console.log('\n  Still broken:');
        stillError.forEach(a => console.log(`    ${a.mailboxAddress}: ${JSON.stringify(a.emailAccountError.errMsg)}`));
    }

    console.log('\n✅ Done!');
}

main().catch(console.error);
