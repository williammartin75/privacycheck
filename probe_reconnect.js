#!/usr/bin/env node
// Probe reconnect endpoints on Ditlead API
const https = require('https');

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
            res.on('end', () => {
                resolve({ status: res.statusCode, data });
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    // 1. Get first suspended mailbox
    console.log('Fetching mailboxes...');
    const listResult = await apiCall('GET', 'mailbox');
    const allData = JSON.parse(listResult.data);
    const mailboxes = allData.data || allData;

    // Find suspended ones
    const suspended = mailboxes.filter(m => !m.isConnected || m.emailAccountError);
    console.log(`Total: ${mailboxes.length}, Suspended/Error: ${suspended.length}`);

    if (suspended.length === 0) {
        console.log('No suspended mailboxes found!');
        return;
    }

    // Take first suspended
    const test = suspended[0];
    console.log(`\nTest mailbox: ${test.mailboxAddress} (ID: ${test.mailboxId})`);
    console.log(`  Full object: ${JSON.stringify(test).substring(0, 500)}`);

    // 2. Try GET single mailbox
    console.log('\n--- GET /v1/mailbox/:id ---');
    const single = await apiCall('GET', `mailbox/${test.mailboxId}`);
    console.log(`  Status: ${single.status}`);
    console.log(`  Body: ${single.data.substring(0, 500)}`);

    // 3. Try PUT to re-send same data (reconnect)
    console.log('\n--- PUT /v1/mailbox/:id ---');
    const putResult = await apiCall('PUT', `mailbox/${test.mailboxId}`, {
        email: test.mailboxAddress,
    });
    console.log(`  Status: ${putResult.status}`);
    console.log(`  Body: ${putResult.data.substring(0, 300)}`);

    // 4. Try PATCH
    console.log('\n--- PATCH /v1/mailbox/:id ---');
    const patchResult = await apiCall('PATCH', `mailbox/${test.mailboxId}`, {
        isActive: true,
    });
    console.log(`  Status: ${patchResult.status}`);
    console.log(`  Body: ${patchResult.data.substring(0, 300)}`);

    // 5. Try POST reconnect
    console.log('\n--- POST /v1/mailbox/:id/reconnect ---');
    const reconnect = await apiCall('POST', `mailbox/${test.mailboxId}/reconnect`);
    console.log(`  Status: ${reconnect.status}`);
    console.log(`  Body: ${reconnect.data.substring(0, 300)}`);

    // 6. Try POST /v1/mailbox/:id/connect
    console.log('\n--- POST /v1/mailbox/:id/connect ---');
    const connect = await apiCall('POST', `mailbox/${test.mailboxId}/connect`);
    console.log(`  Status: ${connect.status}`);
    console.log(`  Body: ${connect.data.substring(0, 300)}`);

    // 7. Try DELETE then re-POST (nuclear option info)
    console.log('\n--- DELETE /v1/mailbox/:id (INFO ONLY, NOT EXECUTING) ---');
    console.log('  Skipping delete - just checking if it exists');
}

main().catch(console.error);
