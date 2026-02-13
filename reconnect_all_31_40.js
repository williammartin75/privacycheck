#!/usr/bin/env node
/**
 * Reconnect ALL 600 VPS 31-40 accounts on Ditlead (fresh after all fixes)
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

const DOMAIN_TO_IP = {
    'mailprivacychecker.space': '23.95.222.204',
    'mailprivacychecker.website': '23.95.222.204',
    'contactprivacychecker.info': '23.226.132.16',
    'contactprivacychecker.cloud': '104.168.102.152',
    'contactprivacychecker.site': '104.168.102.202',
    'contactprivacychecker.website': '104.168.102.202',
    'reportprivacychecker.info': '107.174.254.182',
    'reportprivacychecker.cloud': '107.174.254.182',
    'reportprivacychecker.site': '172.245.226.174',
    'reportprivacychecker.website': '172.245.226.174',
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
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
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

function loadCredentials() {
    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const map = new Map();
    for (const line of content.split('\n')) {
        const [email, password, ip] = line.trim().split(',');
        if (email && password && ip) map.set(email, { email, password, ip });
    }
    return map;
}

async function main() {
    console.log('=== Re-upload ALL 600 VPS 31-40 accounts ===\n');

    const creds = loadCredentials();
    console.log(`Credentials loaded: ${creds.size}\n`);

    // Fetch all current mailboxes
    console.log('Fetching mailboxes from Ditlead...');
    const res = await apiCall('GET', 'mailbox');
    let items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    console.log(`Total mailboxes: ${items.length}`);

    // Find ALL VPS 31-40 accounts
    const allDomains = Object.keys(DOMAIN_TO_IP);
    const targets = items.filter(m => {
        const email = m.mailboxAddress || m.email || '';
        return allDomains.some(d => email.endsWith('@' + d));
    });
    console.log(`VPS 31-40 accounts found: ${targets.length}\n`);

    let ok = 0, fail = 0, skip = 0;

    for (let i = 0; i < targets.length; i++) {
        const acct = targets[i];
        const email = acct.mailboxAddress || acct.email || '';
        const id = acct.mailboxId || acct._id || acct.id;
        const cred = creds.get(email);

        if (!cred) { skip++; continue; }

        const domain = email.split('@')[1];
        const ip = DOMAIN_TO_IP[domain];
        if (!ip) { skip++; continue; }

        process.stdout.write(`  [${i + 1}/${targets.length}] ${email}...`);

        try {
            await apiCall('DELETE', `mailbox/${id}`);
            await sleep(300);

            const post = await apiCall('POST', 'mailbox', {
                firstName: email.split('@')[0],
                lastName: domain.replace(/\./g, '-'),
                smtp: { host: ip, port: '587', username: email, password: cred.password, emailAddress: email, secure: false },
                imap: { host: ip, port: '143', username: email, password: cred.password },
            });

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

        await sleep(300);
        if ((i + 1) % 50 === 0) console.log(`  ─── Progress: ${ok}✅ ${fail}❌ ${skip}⏭ ───`);
    }

    console.log(`\n=== DONE ===`);
    console.log(`  ✅ ${ok} | ❌ ${fail} | ⏭ ${skip}`);
}

main().catch(console.error);
