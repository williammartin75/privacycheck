#!/usr/bin/env node
/**
 * Enable warming on ALL VPS 31-40 accounts via Ditlead API
 * Uses PUT /v1/mailbox/{id} { warmupEnabled: true }
 */
const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';

const TARGET_DOMAINS = [
    'mailprivacychecker.space', 'mailprivacychecker.website',
    'contactprivacychecker.info', 'contactprivacychecker.cloud',
    'contactprivacychecker.site', 'contactprivacychecker.website',
    'reportprivacychecker.info', 'reportprivacychecker.cloud',
    'reportprivacychecker.site', 'reportprivacychecker.website',
    'checkprivacychecker.info', 'checkprivacychecker.cloud',
    'checkprivacychecker.site', 'checkprivacychecker.space',
    'checkprivacychecker.website',
];

function api(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: API_BASE, port: 443,
            path: `/v1/${path}`, method,
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
    console.log('=== Enable warming on VPS 31-40 accounts ===\n');

    // Fetch all mailboxes
    console.log('Fetching mailboxes...');
    const res = await api('GET', 'mailbox');
    let items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    console.log(`Total: ${items.length}`);

    // Filter VPS 31-40 accounts
    const targets = items.filter(m => {
        const email = m.mailboxAddress || m.email || '';
        return TARGET_DOMAINS.some(d => email.endsWith('@' + d));
    });
    console.log(`VPS 31-40 accounts: ${targets.length}`);

    // Check warmup status
    const notWarming = targets.filter(m => {
        const w = m.warmingData || m.warmup || {};
        return !w.warmupEnabled;
    });
    const hasIssue = targets.filter(m => {
        const err = m.error || m.errorMessage || '';
        return err.length > 0;
    });
    console.log(`Not warming: ${notWarming.length}`);
    console.log(`With errors: ${hasIssue.length}\n`);

    let ok = 0, fail = 0;

    for (let i = 0; i < targets.length; i++) {
        const m = targets[i];
        const email = m.mailboxAddress || m.email || '';
        const id = m._id || m.mailboxId || m.id;

        process.stdout.write(`  [${i + 1}/${targets.length}] ${email}...`);

        try {
            // First toggle OFF then ON to force a fresh connection cycle
            await api('PUT', `mailbox/${id}`, { warmupEnabled: false });
            await sleep(200);
            const r = await api('PUT', `mailbox/${id}`, { warmupEnabled: true });

            if (r.status === 200 || r.status === 201) {
                console.log(' ✅');
                ok++;
            } else {
                console.log(` ❌(${r.status})`);
                fail++;
            }
        } catch (e) {
            console.log(` ERR: ${e.message}`);
            fail++;
        }

        await sleep(200);
        if ((i + 1) % 50 === 0) console.log(`  ─── ${ok}✅ ${fail}❌ ───`);
    }

    console.log(`\n=== DONE: ${ok}✅ ${fail}❌ ===`);
})();
