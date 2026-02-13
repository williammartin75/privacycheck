#!/usr/bin/env node
/**
 * Test: DELETE account, wait 10s, then POST fresh to clear cached 451
 * Test with just 5 accounts first
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const CSV_PATH = path.join(__dirname, 'all_mailboxes_31_40.csv');

const DOMAIN_TO_IP = {
    'checkprivacychecker.website': '155.94.155.113',
};

function api(method, apiPath, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: API_BASE, port: 443,
            path: `/v1/${apiPath}`, method,
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 60000,
        };
        if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
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

(async () => {
    // Load creds
    const creds = new Map();
    for (const line of fs.readFileSync(CSV_PATH, 'utf-8').split('\n')) {
        const [email, password, ip] = line.trim().split(',');
        if (email && password) creds.set(email, { password, ip });
    }

    // Fetch mailboxes
    console.log('Fetching...');
    const res = await api('GET', 'mailbox');
    const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);

    // Test with 5 checkprivacychecker.website accounts
    const testEmails = [
        'contact1@checkprivacychecker.website',
        'contact2@checkprivacychecker.website',
        'contact3@checkprivacychecker.website',
        'contact4@checkprivacychecker.website',
        'info1@checkprivacychecker.website',
    ];

    for (const testEmail of testEmails) {
        const m = items.find(x => (x.mailboxAddress || x.email) === testEmail);
        if (!m) { console.log(`  ${testEmail}: NOT FOUND`); continue; }

        const id = m._id || m.mailboxId || m.id;
        const cred = creds.get(testEmail);
        const domain = testEmail.split('@')[1];
        const ip = DOMAIN_TO_IP[domain] || cred?.ip;

        console.log(`\n--- ${testEmail} ---`);
        console.log('  Current error:', m.emailAccountError || 'none');
        console.log('  isActive:', m.isActive, 'isConnected:', m.isConnected);

        // Step 1: DELETE
        console.log('  DELETE...');
        const del = await api('DELETE', `mailbox/${id}`);
        console.log('  DELETE status:', del.status);

        // Step 2: Wait 10 seconds
        console.log('  Waiting 10s...');
        await sleep(10000);

        // Step 3: POST with fresh data and warmup enabled
        console.log('  POST (recreate)...');
        const postBody = {
            firstName: testEmail.split('@')[0],
            lastName: domain.replace(/\./g, '-'),
            smtp: { host: ip, port: '587', username: testEmail, password: cred.password, emailAddress: testEmail, secure: false },
            imap: { host: ip, port: '143', username: testEmail, password: cred.password },
            warmupEnabled: true,
            dailyWarmupLimit: 2,
            dailyCampaignLimit: 200,
        };
        const post = await api('POST', 'mailbox', postBody);
        console.log('  POST status:', post.status);
        if (post.data) {
            const d = post.data;
            console.log('  New ID:', d.mailboxId || d._id);
            console.log('  isActive:', d.isActive);
            console.log('  isConnected:', d.isConnected);
            console.log('  error:', d.emailAccountError || 'none');
        }
    }

    // Wait and check
    console.log('\n\nWaiting 30s before checking...');
    await sleep(30000);

    console.log('Re-fetching...');
    const check = await api('GET', 'mailbox');
    const newItems = Array.isArray(check.data) ? check.data : (check.data?.data || []);

    for (const testEmail of testEmails) {
        const m = newItems.find(x => (x.mailboxAddress || x.email) === testEmail);
        if (!m) { console.log(`  ${testEmail}: NOT FOUND`); continue; }
        console.log(`  ${testEmail}: active=${m.isActive} connected=${m.isConnected} error="${m.emailAccountError || 'none'}"`);
    }

    console.log('\n=== DONE ===');
})();
