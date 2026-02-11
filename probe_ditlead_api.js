#!/usr/bin/env node
// Explore Ditlead API endpoints to find reconnect/update mailbox
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
                console.log(`${method} /v1/${path} → ${res.statusCode}`);
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log('=== Probing Ditlead API ===\n');

    // 1. List mailboxes
    console.log('--- GET /v1/mailbox ---');
    const list = await apiCall('GET', 'mailbox');
    if (list.data && Array.isArray(list.data)) {
        console.log(`  Found ${list.data.length} mailboxes`);
        if (list.data.length > 0) {
            const first = list.data[0];
            console.log(`  First mailbox keys: ${Object.keys(first).join(', ')}`);
            console.log(`  First mailbox: ${JSON.stringify(first).substring(0, 200)}`);
            // Find a suspended one
            const suspended = list.data.find(m => m.status === 'suspended' || m.is_active === false || m.warming_status === 'suspended');
            if (suspended) {
                console.log(`\n  Suspended mailbox: ${JSON.stringify(suspended).substring(0, 300)}`);
            }
        }
    } else if (list.data && list.data.data && Array.isArray(list.data.data)) {
        console.log(`  Found ${list.data.data.length} mailboxes (paginated)`);
        if (list.data.data.length > 0) {
            const first = list.data.data[0];
            console.log(`  First mailbox keys: ${Object.keys(first).join(', ')}`);
            console.log(`  First mailbox: ${JSON.stringify(first).substring(0, 200)}`);
        }
        if (list.data.meta) console.log(`  Meta: ${JSON.stringify(list.data.meta)}`);
    } else {
        console.log(`  Response: ${JSON.stringify(list.data).substring(0, 500)}`);
    }

    // 2. Try listing with query params
    console.log('\n--- GET /v1/mailbox?limit=5 ---');
    const list2 = await apiCall('GET', 'mailbox?limit=5');
    console.log(`  Response: ${JSON.stringify(list2.data).substring(0, 500)}`);

    // 3. Try /v1/mailboxes (plural)
    console.log('\n--- GET /v1/mailboxes ---');
    const list3 = await apiCall('GET', 'mailboxes');
    console.log(`  Status: ${list3.status}`);
    console.log(`  Response: ${JSON.stringify(list3.data).substring(0, 300)}`);

    // 4. Try /v1/email-accounts
    console.log('\n--- GET /v1/email-accounts ---');
    const list4 = await apiCall('GET', 'email-accounts');
    console.log(`  Status: ${list4.status}`);
    console.log(`  Response: ${JSON.stringify(list4.data).substring(0, 300)}`);

    // 5. Try /v1/accounts
    console.log('\n--- GET /v1/accounts ---');
    const list5 = await apiCall('GET', 'accounts');
    console.log(`  Status: ${list5.status}`);
    console.log(`  Response: ${JSON.stringify(list5.data).substring(0, 300)}`);
}

main().catch(console.error);
