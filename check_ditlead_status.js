#!/usr/bin/env node
// Quick check current Ditlead error count
const https = require('https');
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function api(path) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.ditlead.com', port: 443,
            path: '/v1/' + path, method: 'GET',
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
            timeout: 60000
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve(JSON.parse(d)));
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.end();
    });
}

async function main() {
    const data = await api('mailbox');

    // Debug response structure
    console.log('Response type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Keys:', Object.keys(data).join(', '));

    const items = Array.isArray(data) ? data : (data.data || []);
    console.log('Items count:', items.length);

    if (items.length > 0) {
        // Show first item structure
        const first = items[0];
        console.log('\nFirst item keys:', Object.keys(first).join(', '));
        console.log('Email:', first.mailboxAddress || first.email);
        console.log('hasError:', first.hasError);
        console.log('errMsg:', JSON.stringify(first.errMsg));
        console.log('emailAccountError:', JSON.stringify(first.emailAccountError));
    }

    // Count errors
    const errs = items.filter(m => {
        const e = m.emailAccountError;
        if (!e) return false;
        const s = typeof e === 'object' ? JSON.stringify(e) : String(e);
        return s.includes('451') || s.includes('unavailable');
    });
    console.log('\nTotal:', items.length);
    console.log('With 451 error:', errs.length);
    console.log('Without error:', items.filter(m => !m.hasError).length);
    console.log('With hasError=true:', items.filter(m => m.hasError).length);

    // List by domain
    if (errs.length > 0) {
        const domains = {};
        errs.forEach(m => {
            const d = (m.mailboxAddress || m.email || '').split('@')[1] || '?';
            domains[d] = (domains[d] || 0) + 1;
        });
        console.log('\nBy domain:');
        Object.entries(domains).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => console.log(`  ${d}: ${c}`));
    }

    // Also show errMsg for the reconnected ones
    const reconnected = items.filter(m => m.errMsg && JSON.stringify(m.errMsg).includes('reconnected'));
    console.log(`\nReconnected: ${reconnected.length}`);
}

main().catch(console.error);
