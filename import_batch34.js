#!/usr/bin/env node
// ============================================================
// Import batch 3 then batch 4 into Ditlead via API
// Based on existing ditlead_import.js
// ============================================================

const fs = require('fs');
const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const DELAY = 1500; // 1.5s between requests

const BATCH_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Strategy';

function readCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const header = lines[0].split(',');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        header.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
        rows.push(row);
    }
    return rows;
}

function buildPayload(row) {
    const smtpSecure = row.smtp_encryption === 'SSL' || row.smtp_port === '465';
    return {
        firstName: row.first_name,
        lastName: row.last_name,
        smtp: {
            host: row.smtp_host,
            port: row.smtp_port,
            username: row.smtp_username,
            password: row.smtp_password,
            emailAddress: row.email,
            secure: smtpSecure
        },
        imap: {
            host: row.imap_host,
            port: row.imap_port,
            username: row.imap_username,
            password: row.imap_password
        }
    };
}

function postMailbox(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const options = {
            hostname: API_BASE,
            path: '/v1/mailbox',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 30000
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(body) }); }
                catch { resolve({ status: res.statusCode, body }); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.write(data);
        req.end();
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function importBatch(batchName, filePath) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Importing ${batchName}`);
    console.log(`${'='.repeat(60)}`);

    const rows = readCSV(filePath);
    console.log(`  ${rows.length} accounts to import\n`);

    let success = 0, skipped = 0, failures = 0;
    const failedAccounts = [];

    for (let i = 0; i < rows.length; i++) {
        const payload = buildPayload(rows[i]);
        const email = payload.smtp.emailAddress;

        try {
            const result = await postMailbox(payload);

            if (result.status === 200 || result.status === 201) {
                if (result.body && result.body.data === 'Email already exist') {
                    skipped++;
                    if (i % 50 === 0) console.log(`  ⏭️ [${i + 1}/${rows.length}] ${email} (exists)`);
                } else {
                    success++;
                    if (i % 10 === 0 || i < 5) console.log(`  ✅ [${i + 1}/${rows.length}] ${email}`);
                }
            } else if (result.status === 403 || result.status === 401) {
                console.log(`\n  ❌ AUTH ERROR (${result.status}) — API key invalid`);
                console.log(`  Response: ${JSON.stringify(result.body)}`);
                return { success, skipped, failures, error: 'auth' };
            } else {
                failures++;
                failedAccounts.push({ email, status: result.status, error: result.body });
                console.log(`  ❌ [${i + 1}/${rows.length}] ${email} — ${result.status}`);
            }
        } catch (e) {
            failures++;
            failedAccounts.push({ email, error: e.message });
            console.log(`  ❌ [${i + 1}/${rows.length}] ${email} — ${e.message}`);
        }

        await sleep(DELAY);
    }

    console.log(`\n  --- ${batchName} Summary ---`);
    console.log(`  ✅ Imported: ${success}`);
    console.log(`  ⏭️ Already exist: ${skipped}`);
    console.log(`  ❌ Failed: ${failures}`);

    return { success, skipped, failures, failedAccounts };
}

async function main() {
    console.log('============================================================');
    console.log('  Ditlead Batch Import — Batch 3 + Batch 4');
    console.log(`  API: https://${API_BASE}/v1/mailbox`);
    console.log('============================================================');

    // Test API first with batch 3's first account
    const testRows = readCSV(`${BATCH_DIR}\\ditlead_batch_3.csv`);
    const testPayload = buildPayload(testRows[0]);
    console.log(`\nTesting API with: ${testPayload.smtp.emailAddress}`);

    try {
        const test = await postMailbox(testPayload);
        console.log(`Status: ${test.status} — ${JSON.stringify(test.body).substring(0, 100)}`);

        if (test.status === 403 || test.status === 401) {
            console.log('\n❌ API key invalid. Update API_KEY in script.');
            return;
        }
        console.log('✅ API working!\n');
    } catch (e) {
        console.log(`\n❌ API connection failed: ${e.message}`);
        return;
    }

    // Batch 3
    const r3 = await importBatch('Batch 3', `${BATCH_DIR}\\ditlead_batch_3.csv`);
    if (r3.error === 'auth') return;

    // Batch 4
    const r4 = await importBatch('Batch 4', `${BATCH_DIR}\\ditlead_batch_4.csv`);

    // Grand total
    console.log(`\n${'='.repeat(60)}`);
    console.log('  GRAND TOTAL');
    console.log(`${'='.repeat(60)}`);
    console.log(`  ✅ Imported: ${r3.success + r4.success}`);
    console.log(`  ⏭️ Existed: ${r3.skipped + r4.skipped}`);
    console.log(`  ❌ Failed: ${r3.failures + r4.failures}`);

    // Save failures
    const allFailed = [...(r3.failedAccounts || []), ...(r4.failedAccounts || [])];
    if (allFailed.length > 0) {
        fs.writeFileSync('ditlead_failed_batch34.json', JSON.stringify(allFailed, null, 2));
        console.log('\n  Failed accounts saved to ditlead_failed_batch34.json');
    }
}

main().catch(console.error);
