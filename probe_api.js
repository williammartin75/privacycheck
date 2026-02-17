const https = require('https');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const NDJSON_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails';

function postContact(attributes, listPublicId) {
    return new Promise((resolve) => {
        const body = JSON.stringify({ attributes, listId: listPublicId });
        const req = https.request({
            hostname: 'api.ditlead.com', port: 443, path: '/v1/contact', method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 15000
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
        req.write(body);
        req.end();
    });
}

async function main() {
    // 1. Count lines in Bulgarian.ndjson
    console.log('=== Counting Bulgarian lines ===');
    const bgPath = path.join(NDJSON_DIR, 'Bulgarian.ndjson');
    const rl = readline.createInterface({ input: fs.createReadStream(bgPath, 'utf-8') });
    let count = 0;
    let first5 = [];
    for await (const line of rl) {
        count++;
        if (first5.length < 5 && line.trim()) {
            try { first5.push(JSON.parse(line.trim())); } catch (e) { }
        }
    }
    console.log(`Bulgarian.ndjson: ${count} lines\n`);

    // 2. Read progress file
    const progress = JSON.parse(fs.readFileSync(path.join(__dirname, 'import_progress', 'Bulgarian.json'), 'utf-8'));
    console.log('Progress file:', JSON.stringify(progress, null, 2), '\n');

    // 3. Test a single contact with full response
    console.log('=== Test single contact ===');
    if (first5.length > 0) {
        const r = first5[0];
        console.log('Sample record:', JSON.stringify(r).substring(0, 200));
        const result = await postContact({
            email: r.email,
            domain: r.domain,
            subject: r.subject,
            body: r.body,
            score: String(r.score || '')
        }, progress.listPublicId);
        console.log(`Status: ${result.status}`);
        console.log(`Body: ${result.body}`);
    }

    // 4. Test with a brand new email
    console.log('\n=== Test with new unique email ===');
    const uniqueEmail = `debug_test_${Date.now()}@uniquetest.com`;
    const result2 = await postContact({
        email: uniqueEmail,
        domain: 'uniquetest.com',
        subject: 'Test subject',
        body: 'Test body',
        score: '50'
    }, progress.listPublicId);
    console.log(`Status: ${result2.status}`);
    console.log(`Body: ${result2.body}`);

    // 5. Test sending 5 in parallel - see actual responses
    console.log('\n=== 5 parallel with full responses ===');
    const results = await Promise.all([1, 2, 3, 4, 5].map(i =>
        postContact({
            email: `parallel_debug_${i}_${Date.now()}@test.com`,
            domain: 'test.com',
            subject: 'Test',
            body: 'Test',
            score: '50'
        }, progress.listPublicId)
    ));
    for (const r of results) {
        console.log(`  ${r.status}: ${r.body.substring(0, 150)}`);
    }
}

main().catch(console.error);
