#!/usr/bin/env node
const https = require('https');
const API = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
function api(p) {
    return new Promise((r, j) => {
        const q = https.request({
            hostname: 'api.ditlead.com', port: 443, path: '/v1/' + p, method: 'GET',
            headers: { 'Authorization': 'Bearer ' + API, 'Content-Type': 'application/json' }, timeout: 60000
        }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => r(JSON.parse(d))); });
        q.on('error', j); q.end();
    });
}
async function main() {
    const data = await api('mailbox');
    const items = data.data || [];
    console.log('Total:', items.length);

    // Find the 8 NOT warming
    const notActive = items.filter(m => !m.isActive);
    const notConnected = items.filter(m => !m.isConnected);
    const hasErrorTrue = items.filter(m => m.emailAccountError && m.emailAccountError.hasError === true);

    console.log('\nNot active:', notActive.length);
    notActive.forEach(m => console.log('  ', m.mailboxAddress));

    console.log('\nNot connected:', notConnected.length);
    notConnected.forEach(m => console.log('  ', m.mailboxAddress));

    console.log('\nhasError=true:', hasErrorTrue.length);
    hasErrorTrue.forEach(m => console.log('  ', m.mailboxAddress, '|', JSON.stringify(m.emailAccountError.errMsg)));

    // Also check warmingData structure
    if (items.length > 0) {
        const sample = items[0];
        console.log('\nSample warmingData:', JSON.stringify(sample.warmingData));
        console.log('Sample campaignData:', JSON.stringify(sample.campaignData));
    }
}
main().catch(console.error);
