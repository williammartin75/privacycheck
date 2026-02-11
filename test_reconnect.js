#!/usr/bin/env node
// Test DELETE + re-POST on a single Ditlead mailbox
const https = require('https');
const fs = require('fs');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function apiCall(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.ditlead.com',
            port: 443,
            path: `/v1/${path}`,
            method: method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    // 1. Get all mailboxes to find a suspended one
    console.log('Fetching mailboxes...');
    const listResult = await apiCall('GET', 'mailbox');
    const allData = JSON.parse(listResult.data);
    const mailboxes = allData.data || allData;

    // Show unique emailAccountError values
    const errors = new Set();
    const errorCounts = {};
    let connectedCount = 0;
    let disconnectedCount = 0;

    for (const m of mailboxes) {
        if (m.isConnected) connectedCount++;
        else disconnectedCount++;

        const err = m.emailAccountError || 'none';
        errors.add(err);
        errorCounts[err] = (errorCounts[err] || 0) + 1;
    }

    console.log(`\nConnected: ${connectedCount}, Disconnected: ${disconnectedCount}`);
    console.log('\nError breakdown:');
    for (const [err, count] of Object.entries(errorCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${err}: ${count}`);
    }

    // Take a suspended mailbox on theprivacycheckerpro.website (we know this is fixed)
    const testMailbox = mailboxes.find(m =>
        m.mailboxAddress && m.mailboxAddress.includes('theprivacycheckerpro.website') && !m.isConnected
    );

    if (!testMailbox) {
        console.log('\nNo suspended mailbox found for testing');
        return;
    }

    console.log(`\nTest target: ${testMailbox.mailboxAddress} (${testMailbox.mailboxId})`);
    console.log(`  Connected: ${testMailbox.isConnected}`);
    console.log(`  Error: ${testMailbox.emailAccountError}`);

    // Find the corresponding credentials
    const batchFiles = ['ditlead_batch_1.csv', 'ditlead_batch_2.csv', 'ditlead_batch_3.csv', 'ditlead_batch_4.csv'];
    let credentials = null;

    for (const file of batchFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.trim().split('\n');
            for (const line of lines) {
                const parts = line.split(',');
                if (parts[2] === testMailbox.mailboxAddress) {
                    credentials = {
                        first_name: parts[0],
                        last_name: parts[1],
                        email: parts[2],
                        smtp_host: parts[3],
                        smtp_port: parseInt(parts[4]),
                        smtp_username: parts[5],
                        smtp_password: parts[6],
                        smtp_encryption: parts[7],
                        imap_host: parts[8],
                        imap_port: parseInt(parts[9]),
                        imap_username: parts[10],
                        imap_password: parts[11],
                        imap_encryption: parts[12],
                    };
                    break;
                }
            }
        } catch (e) { }
        if (credentials) break;
    }

    if (!credentials) {
        console.log('  Credentials not found in batch files');
        return;
    }

    console.log(`  Found credentials: ${credentials.email} / ${credentials.smtp_password.substring(0, 4)}...`);

    // Step 1: DELETE the mailbox
    console.log('\n--- Step 1: DELETE mailbox ---');
    const delResult = await apiCall('DELETE', `mailbox/${testMailbox.mailboxId}`);
    console.log(`  Status: ${delResult.status}`);
    console.log(`  Body: ${delResult.data.substring(0, 200)}`);

    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));

    // Step 2: Re-POST the mailbox
    console.log('\n--- Step 2: POST mailbox ---');
    const postBody = {
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        email_address: credentials.email,
        email_provider: 'SMTP',
        smtp_host: credentials.smtp_host,
        smtp_port: credentials.smtp_port,
        smtp_username: credentials.smtp_username,
        smtp_password: credentials.smtp_password,
        smtp_encryption: credentials.smtp_encryption,
        imap_host: credentials.imap_host,
        imap_port: credentials.imap_port,
        imap_username: credentials.imap_username,
        imap_password: credentials.imap_password,
        imap_encryption: credentials.imap_encryption,
        warmup_enabled: true,
        daily_limit: 2,
        increase_per_day: 2,
        reply_rate: 30,
    };

    const postResult = await apiCall('POST', 'mailbox', postBody);
    console.log(`  Status: ${postResult.status}`);
    console.log(`  Body: ${postResult.data.substring(0, 300)}`);

    // Step 3: Verify
    await new Promise(r => setTimeout(r, 2000));
    console.log('\n--- Step 3: Verify ---');
    const verifyResult = await apiCall('GET', 'mailbox?limit=5');
    const verifyData = JSON.parse(verifyResult.data);
    const reAdded = (verifyData.data || verifyData).find(m => m.mailboxAddress === testMailbox.mailboxAddress);
    if (reAdded) {
        console.log(`  ✅ Found: ${reAdded.mailboxAddress} connected:${reAdded.isConnected} error:${reAdded.emailAccountError || 'none'}`);
    } else {
        console.log('  ❌ Not found in top 5 results, checking full list...');
    }
}

main().catch(console.error);
