#!/usr/bin/env node
/**
 * Debug: Find correct DELETE format. Use pagination to handle large response.
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
            timeout: 120000,
        };
        if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
                catch (e) { resolve({ status: res.statusCode, data: d, parseError: e.message }); }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

(async () => {
    try {
        console.log('Fetching mailboxes...');
        const res = await api('GET', 'mailbox');
        const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        console.log(`Got ${items.length} mailboxes`);

        // Find target
        const target = items.find(m => (m.mailboxAddress || '') === 'gdpr4@checkprivacychecker.website');
        if (!target) {
            console.log('gdpr4 not found. Trying contact1...');
            const alt = items.find(m => (m.mailboxAddress || '') === 'contact1@checkprivacychecker.website');
            if (alt) {
                console.log('FULL OBJECT:');
                console.log(JSON.stringify(alt, null, 2));
            } else {
                console.log('No checkprivacychecker.website accounts found');
                console.log('Sample keys:', Object.keys(items[0] || {}));
            }
            return;
        }

        console.log('FULL OBJECT:');
        console.log(JSON.stringify(target, null, 2));

        // The mailboxId is the right ID - let's try DELETE with it
        const mid = target.mailboxId;
        console.log(`\nDELETE with mailboxId: ${mid}`);
        const del1 = await api('DELETE', `mailbox/${mid}`);
        console.log(`  Status: ${del1.status} Response: ${JSON.stringify(del1.data).substring(0, 200)}`);

        // Also try the API endpoint without v1
        console.log(`\nDELETE without /v1/ prefix...`);
        const del2 = await api('DELETE', `mailbox/${mid}`);
        console.log(`  Status: ${del2.status}`);

        // Check duplicates
        const dupes = items.filter(m => (m.mailboxAddress || '') === 'gdpr4@checkprivacychecker.website');
        console.log(`\nDuplicates: ${dupes.length}`);
        for (const d of dupes) {
            console.log(`  mailboxId=${d.mailboxId} version=${d.version}`);
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    }
})();
