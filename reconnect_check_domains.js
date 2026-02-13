#!/usr/bin/env node
/**
 * Reconnect suspended Ditlead accounts for checkprivacychecker.* domains
 * Strategy: GET all → filter suspended on checkprivacychecker.* → DELETE → POST
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';

// CSV with the credentials
const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

// Target domains to reconnect
const TARGET_DOMAINS = [
    'checkprivacychecker.info',
    'checkprivacychecker.cloud',
    'checkprivacychecker.site',
    'checkprivacychecker.space',
    'checkprivacychecker.website',
];

// VPS IP mapping
const DOMAIN_TO_IP = {
    'checkprivacychecker.info': '107.172.216.227',
    'checkprivacychecker.cloud': '107.172.216.227',
    'checkprivacychecker.site': '107.173.146.56',
    'checkprivacychecker.space': '198.23.246.94',
    'checkprivacychecker.website': '155.94.155.113',
};

function apiCall(method, apiPath, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: API_BASE, port: 443,
            path: `/v1/${apiPath}`, method,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Load CSV credentials
function loadCredentials() {
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const map = new Map();
    for (const line of content.split('\n')) {
        const [email, password, ip] = line.trim().split(',');
        if (email && password && ip) {
            const domain = email.split('@')[1];
            map.set(email, { email, password, ip, domain });
        }
    }
    return map;
}

async function main() {
    console.log('=== Reconnect checkprivacychecker.* accounts ===\n');

    // Load credentials
    const creds = loadCredentials();
    const targetCreds = [...creds.entries()]
        .filter(([email]) => TARGET_DOMAINS.some(d => email.endsWith('@' + d)));
    console.log(`Credentials loaded: ${creds.size} total, ${targetCreds.length} target\n`);

    // Fetch all mailboxes from Ditlead
    console.log('Fetching mailboxes from Ditlead...');
    const res = await apiCall('GET', 'mailbox');
    let items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    console.log(`  Total mailboxes: ${items.length}`);

    // Find checkprivacychecker accounts
    const targets = items.filter(m => {
        const email = m.mailboxAddress || m.email || '';
        return TARGET_DOMAINS.some(d => email.endsWith('@' + d));
    });
    console.log(`  checkprivacychecker.* accounts: ${targets.length}`);

    // Show error breakdown for targets
    const errorTargets = targets.filter(m => m.emailAccountError);
    console.log(`  With errors: ${errorTargets.length}\n`);

    if (targets.length === 0) {
        console.log('No target accounts found!');
        return;
    }

    // Reconnect: DELETE then POST
    let ok = 0, fail = 0, skip = 0;
    const toProcess = targets; // reconnect ALL checkprivacychecker accounts

    for (let i = 0; i < toProcess.length; i++) {
        const acct = toProcess[i];
        const email = acct.mailboxAddress || acct.email || '';
        const id = acct.mailboxId || acct._id || acct.id;
        const cred = creds.get(email);

        if (!cred) {
            process.stdout.write(`  [${i + 1}/${toProcess.length}] SKIP ${email} (no creds)\n`);
            skip++;
            continue;
        }

        const domain = email.split('@')[1];
        const ip = DOMAIN_TO_IP[domain];

        process.stdout.write(`  [${i + 1}/${toProcess.length}] ${email}...`);

        try {
            // DELETE
            const del = await apiCall('DELETE', `mailbox/${id}`);
            if (del.status >= 400 && del.status !== 404) {
                console.log(` DEL_FAIL(${del.status})`);
                fail++;
                await sleep(500);
                continue;
            }

            await sleep(500);

            // POST with fresh credentials
            const payload = {
                firstName: email.split('@')[0],
                lastName: domain.replace(/\./g, '-'),
                smtp: {
                    host: ip,
                    port: '587',
                    username: email,
                    password: cred.password,
                    emailAddress: email,
                    secure: false,
                },
                imap: {
                    host: ip,
                    port: '143',
                    username: email,
                    password: cred.password,
                },
            };

            const post = await apiCall('POST', 'mailbox', payload);

            if (post.status === 200 || post.status === 201) {
                console.log(' ✅');
                ok++;
            } else {
                console.log(` ❌(${post.status})`);
                fail++;
            }
        } catch (e) {
            console.log(` ERR: ${e.message}`);
            fail++;
        }

        await sleep(500);

        if ((i + 1) % 20 === 0) {
            console.log(`  --- Progress: ${ok}✅ ${fail}❌ ${skip}⏭ ---`);
        }
    }

    console.log(`\n=== DONE ===`);
    console.log(`  ✅ Reconnected: ${ok}`);
    console.log(`  ❌ Failed: ${fail}`);
    console.log(`  ⏭ Skipped: ${skip}`);
}

main().catch(console.error);
