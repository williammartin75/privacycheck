const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/willi/AppData/Local/Temp/ditlead.json', 'utf8'));
const items = Array.isArray(data) ? data : (data.data || []);

console.log('=== DITLEAD MAILBOX STATUS ===');
console.log('Total mailboxes:', items.length);

if (items.length === 0) {
    console.log('No mailboxes. Response keys:', Object.keys(data));
    process.exit();
}

// Count statuses
let errors = 0, warming = 0;
const domains = {};

for (const m of items) {
    const email = m.mailboxAddress || m.email || '?';
    const domain = email.split('@')[1] || '?';
    if (m.hasError) errors++;
    if (m.warmupEnabled || m.isWarmupEnabled) warming++;

    if (!domains[domain]) domains[domain] = { t: 0, e: 0, w: 0 };
    domains[domain].t++;
    if (m.hasError) domains[domain].e++;
    if (m.warmupEnabled || m.isWarmupEnabled) domains[domain].w++;
}

console.log('With errors:', errors);
console.log('Warmup enabled:', warming);
console.log('OK (no error):', items.length - errors);

// Warmup fields
const wFields = Object.keys(items[0]).filter(k =>
    /warm|score|health|reput|creat|daily|limit|ramp|sent|receiv|date/i.test(k)
);
console.log('\nWarmup fields:', wFields.join(', '));

// Show sample warmup data from first non-error mailbox
const sample = items.find(m => !m.hasError) || items[0];
console.log('\nSample mailbox:', sample.mailboxAddress || sample.email);
for (const f of wFields) {
    console.log('  ' + f + ':', JSON.stringify(sample[f]));
}

// Created dates to estimate warmup age
const createdField = Object.keys(items[0]).find(k => /creat/i.test(k));
if (createdField) {
    const dates = items.filter(m => !m.hasError).map(m => new Date(m[createdField]));
    const oldest = new Date(Math.min(...dates));
    const newest = new Date(Math.max(...dates));
    const now = new Date();
    const oldestDays = Math.floor((now - oldest) / 86400000);
    const newestDays = Math.floor((now - newest) / 86400000);
    console.log('\nOldest mailbox:', oldestDays, 'days ago (' + oldest.toISOString().split('T')[0] + ')');
    console.log('Newest mailbox:', newestDays, 'days ago (' + newest.toISOString().split('T')[0] + ')');
}

console.log('\n=== BY DOMAIN ===');
Object.entries(domains)
    .sort((a, b) => b[1].t - a[1].t)
    .forEach(([d, s]) => {
        const status = s.e > 0 ? 'ERR' : (s.w > 0 ? 'WARM' : 'OK');
        console.log(`${d}: ${s.t} mailbox, ${s.e} err, ${s.w} warm [${status}]`);
    });
