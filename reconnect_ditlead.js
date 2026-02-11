#!/usr/bin/env node
// Reconnect Ditlead accounts with 451 errors
// Uses exact same API format as the original ditlead_import.js
const https = require('https');
const fs = require('fs');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const CSV_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Strategy';
const CSV_FILES = [
    'ditlead_all_mailboxes.csv',
    'ditlead_batch_3.csv',
    'ditlead_batch_4.csv',
];

function apiCall(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: API_BASE,
            port: 443,
            path: `/v1/${path}`,
            method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const req = https.request(options, (res) => {
            let d = '';
            res.on('data', chunk => d += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
                catch { resolve({ status: res.statusCode, data: d }); }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    // Step 1: Read all CSVs for password/config data
    console.log('Loading CSVs...');
    const path = require('path');
    const csvMap = new Map();
    for (const csvFile of CSV_FILES) {
        try {
            const csvPath = path.join(CSV_DIR, csvFile);
            const rows = readCSV(csvPath);
            rows.forEach(row => { if (row.email) csvMap.set(row.email, row); });
            console.log(`  ${csvFile}: ${rows.length} accounts`);
        } catch (e) {
            console.log(`  ${csvFile}: SKIPPED (${e.message})`);
        }
    }
    console.log(`Total passwords loaded: ${csvMap.size}\n`);


    // Step 2: Fetch all mailboxes from API (single call — API returns all on page 1)
    console.log('--- Fetching mailboxes from Ditlead ---');
    let allMailboxes = [];
    try {
        const res = await apiCall('GET', 'mailbox');
        let items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        // Deduplicate by email
        const seen = new Set();
        for (const m of items) {
            const email = m.mailboxAddress || m.email || '';
            if (email && !seen.has(email)) {
                seen.add(email);
                allMailboxes.push(m);
            }
        }
        console.log(`  Fetched ${items.length} items, ${allMailboxes.length} unique`);
    } catch (e) {
        console.log(`  Error: ${e.message}`);
        return;
    }
    console.log(`Total mailboxes in Ditlead: ${allMailboxes.length}`);

    // Step 3: Show structure
    if (allMailboxes.length > 0) {
        console.log(`\nMailbox keys: ${Object.keys(allMailboxes[0]).join(', ')}`);
    }

    // Step 4: Find error accounts
    const errorAccounts = allMailboxes.filter(m => {
        const errField = m.emailAccountError || '';
        const errStr = typeof errField === 'object' ? JSON.stringify(errField) : errField.toString();
        return errStr.includes('451') || errStr.includes('unavailable');
    });

    // Also check for other error patterns
    const allErrors = allMailboxes.filter(m => m.emailAccountError);

    console.log(`\nAccounts with 451 errors: ${errorAccounts.length}`);
    console.log(`Accounts with any error: ${allErrors.length}`);

    // Show error breakdown
    const breakdown = {};
    allMailboxes.forEach(m => {
        const e = m.emailAccountError;
        const key = e ? (typeof e === 'object' ? JSON.stringify(e) : e.toString()) : 'none';
        breakdown[key] = (breakdown[key] || 0) + 1;
    });
    console.log('\nError breakdown:');
    Object.entries(breakdown).sort((a, b) => b[1] - a[1]).forEach(([e, c]) => {
        console.log(`  [${c}] ${e.substring(0, 150)}`);
    });

    const toReconnect = errorAccounts.length > 0 ? errorAccounts : allErrors;

    if (toReconnect.length === 0) {
        console.log('\n✅ No error accounts found!');
        return;
    }

    console.log(`\n--- Reconnecting ${toReconnect.length} accounts ---`);
    console.log('Strategy: DELETE old → wait → POST new (same config as original import)\n');

    let success = 0, failed = 0, skipped = 0;

    for (let i = 0; i < toReconnect.length; i++) {
        const acct = toReconnect[i];
        const email = acct.mailboxAddress || acct.email || '';
        const id = acct.mailboxId || acct._id || acct.id;

        // Find CSV row for this email
        const csvRow = csvMap.get(email);
        if (!csvRow) {
            console.log(`  [${i + 1}/${toReconnect.length}] SKIP ${email} - not in CSV`);
            skipped++;
            continue;
        }

        process.stdout.write(`  [${i + 1}/${toReconnect.length}] ${email}... `);

        try {
            // DELETE
            const del = await apiCall('DELETE', `mailbox/${id}`);
            if (del.status >= 400 && del.status !== 404) {
                console.log(`DEL failed (${del.status}: ${JSON.stringify(del.data).substring(0, 80)})`);
                failed++;
                await sleep(1000);
                continue;
            }

            await sleep(2000);

            // Re-POST with exact same payload format as original import
            const payload = buildPayload(csvRow);
            const post = await apiCall('POST', 'mailbox', payload);

            if (post.status === 200 || post.status === 201) {
                console.log('✅');
                success++;
            } else {
                console.log(`POST failed (${post.status}: ${JSON.stringify(post.data).substring(0, 80)})`);
                failed++;
            }
        } catch (e) {
            console.log(`ERROR: ${e.message}`);
            failed++;
        }

        await sleep(1500);
    }

    console.log(`\n--- Results ---`);
    console.log(`  ✅ Reconnected: ${success}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⏭️ Skipped: ${skipped}`);
}

main().catch(console.error);
