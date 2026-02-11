#!/usr/bin/env node
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
    const items = data.data || [];
    console.log(`Total: ${items.length}\n`);

    // Classify accounts
    const notWarming = [];
    const warming = [];
    const withError = [];
    const inactive = [];

    for (const m of items) {
        const email = m.mailboxAddress || '';
        const active = m.isActive;
        const connected = m.isConnected;
        const warmup = m.warmingData;
        const err = m.emailAccountError;
        const errStr = err ? JSON.stringify(err) : '';
        const has451 = errStr.includes('451') || errStr.includes('unavailable');

        if (!active) inactive.push(email);
        if (has451) withError.push(email);

        // Check if warmup is enabled and running
        const warmupEnabled = warmup && warmup.warmupEnabled;
        const warmupSent = warmup && (warmup.sentToday || 0);

        if (!warmupEnabled) {
            notWarming.push({ email, active, connected, warmupEnabled, warmupSent, error: errStr.substring(0, 80) });
        } else {
            warming.push(email);
        }
    }

    console.log(`Warming: ${warming.length}`);
    console.log(`Not warming (warmup disabled): ${notWarming.length}`);
    console.log(`With 451 error: ${withError.length}`);
    console.log(`Inactive: ${inactive.length}`);

    if (notWarming.length > 0) {
        console.log(`\n=== Not warming (${notWarming.length}) ===`);
        notWarming.forEach(m => {
            console.log(`  ${m.email} | active=${m.active} connected=${m.connected} warmup=${m.warmupEnabled} sent=${m.warmupSent} | ${m.error}`);
        });
    }

    // Also list accounts with warmup=true but 0 sent today
    const warmingButZero = items.filter(m => {
        const w = m.warmingData;
        return w && w.warmupEnabled && (w.sentToday || 0) === 0;
    });
    if (warmingButZero.length > 0) {
        console.log(`\n=== Warmup ON but 0 sent today (${warmingButZero.length}) ===`);
        warmingButZero.slice(0, 20).forEach(m => {
            const email = m.mailboxAddress || '';
            const err = m.emailAccountError ? JSON.stringify(m.emailAccountError).substring(0, 60) : 'none';
            console.log(`  ${email} | err: ${err}`);
        });
        if (warmingButZero.length > 20) console.log(`  ... and ${warmingButZero.length - 20} more`);
    }

    // Show domain breakdown of not-warming
    if (notWarming.length > 0) {
        const domains = {};
        notWarming.forEach(m => {
            const d = m.email.split('@')[1] || '?';
            domains[d] = (domains[d] || 0) + 1;
        });
        console.log('\nNot-warming by domain:');
        Object.entries(domains).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => console.log(`  ${d}: ${c}`));
    }
}

main().catch(console.error);
