#!/usr/bin/env node
/**
 * Try every possible PUT field combination to clear errors and force reconnect
 * Test on ONE account first
 */
const https = require('https');
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function api(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'api.ditlead.com', port: 443,
            path: `/v1/${path}`, method,
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 30000,
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
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    // Find target account
    const res = await api('GET', 'mailbox');
    const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    const target = items.find(m => (m.mailboxAddress || '') === 'gdpr4@checkprivacychecker.website');
    if (!target) return console.log('Not found');

    const id = target.mailboxId;
    console.log(`Target: ${target.mailboxAddress} (${id})`);
    console.log(`Current: active=${target.isActive} error=${JSON.stringify(target.emailAccountError?.errMsg)}\n`);

    // Test 1: PUT warmupEnabled
    console.log('TEST 1: PUT warmupEnabled: false then true');
    let r = await api('PUT', `mailbox/${id}`, { warmupEnabled: false });
    console.log(`  OFF: ${r.status} ${JSON.stringify(r.data)}`);
    await sleep(2000);
    r = await api('PUT', `mailbox/${id}`, { warmupEnabled: true });
    console.log(`  ON: ${r.status} ${JSON.stringify(r.data)}`);

    // Test 2: PUT with isConnected and isActive
    console.log('\nTEST 2: PUT isActive/isConnected');
    r = await api('PUT', `mailbox/${id}`, { isActive: true, isConnected: true });
    console.log(`  ${r.status} ${JSON.stringify(r.data)}`);

    // Test 3: PUT with emailAccountError reset
    console.log('\nTEST 3: PUT emailAccountError reset');
    r = await api('PUT', `mailbox/${id}`, { emailAccountError: { hasError: false, errMsg: [] } });
    console.log(`  ${r.status} ${JSON.stringify(r.data)}`);

    // Test 4: PUT with smtp/imap
    console.log('\nTEST 4: PUT smtp + imap');
    r = await api('PUT', `mailbox/${id}`, {
        smtp: { host: '155.94.155.113', port: '587', username: 'gdpr4@checkprivacychecker.website', password: 'M1a9n3GPhwYAxSZ+', emailAddress: 'gdpr4@checkprivacychecker.website', secure: false },
        imap: { host: '155.94.155.113', port: '143', username: 'gdpr4@checkprivacychecker.website', password: 'M1a9n3GPhwYAxSZ+' },
    });
    console.log(`  ${r.status} ${JSON.stringify(r.data)}`);

    // Test 5: PUT EVERYTHING together
    console.log('\nTEST 5: PUT all fields together');
    r = await api('PUT', `mailbox/${id}`, {
        warmupEnabled: true,
        isActive: true,
        isConnected: true,
        emailAccountError: { hasError: false, errMsg: [] },
        smtp: { host: '155.94.155.113', port: '587', username: 'gdpr4@checkprivacychecker.website', password: 'M1a9n3GPhwYAxSZ+', emailAddress: 'gdpr4@checkprivacychecker.website', secure: false },
        imap: { host: '155.94.155.113', port: '143', username: 'gdpr4@checkprivacychecker.website', password: 'M1a9n3GPhwYAxSZ+' },
    });
    console.log(`  ${r.status} ${JSON.stringify(r.data)}`);

    // Wait 10 seconds and check
    console.log('\n\nWaiting 10s...');
    await sleep(10000);

    const check = await api('GET', 'mailbox');
    const updated = (Array.isArray(check.data) ? check.data : (check.data?.data || []))
        .find(m => (m.mailboxAddress || '') === 'gdpr4@checkprivacychecker.website');

    if (updated) {
        console.log('\nUPDATED STATE:');
        console.log(`  isActive: ${updated.isActive}`);
        console.log(`  isConnected: ${updated.isConnected}`);
        console.log(`  error: ${JSON.stringify(updated.emailAccountError?.errMsg)}`);
        console.log(`  warming.isActive: ${updated.warmingData?.isActive}`);
    }
})();
