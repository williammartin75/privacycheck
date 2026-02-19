const fs = require('fs');
const readline = require('readline');
const https = require('https');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const NDJSON_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails';

const NUM_SPLITS = 10;
const SOURCE_LIST_SIZE = 4900; // first Danish list size
const CONCURRENCY = 50;
const agent = new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY + 20, maxFreeSockets: 20 });

// ============================================
// API HELPERS
// ============================================
function apiRequest(method, apiPath, body) {
    return new Promise((resolve) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: API_BASE, port: 443, path: apiPath, method,
            agent,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000
        };
        if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);

        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch (e) { resolve({ status: res.statusCode, body: null, raw: d }); }
            });
        });
        req.on('error', (e) => resolve({ status: 0, body: null, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: null, error: 'timeout' }); });
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createList(name) {
    const res = await apiRequest('POST', '/v1/list', { listName: name });
    if (res.body?.success && res.body?.data?.publicId) {
        return res.body.data.publicId;
    }
    throw new Error(`Failed to create list "${name}": ${JSON.stringify(res).substring(0, 300)}`);
}

async function addContact(attributes, listId) {
    for (let attempt = 0; attempt < 3; attempt++) {
        const res = await apiRequest('POST', '/v1/contact', { attributes, listId });
        if (res.status === 201 || res.status === 200) return 'ok';
        if (res.status === 429) { await sleep(3000 * (attempt + 1)); continue; }
        if (res.status === 0) { await sleep(2000); continue; }
        return 'error';
    }
    return 'error';
}

// ============================================
// MAIN
// ============================================
async function main() {
    // Step 1: Read first 4900 valid records from Danish.ndjson
    console.log('=== Danish List Splitter (10 sub-lists) ===\n');
    console.log('Step 1: Reading first 4900 contacts from Danish.ndjson...');

    const ndjsonPath = path.join(NDJSON_DIR, 'Danish.ndjson');
    const rl = readline.createInterface({
        input: fs.createReadStream(ndjsonPath, 'utf-8'),
        crlfDelay: Infinity
    });

    const records = [];
    for await (const line of rl) {
        if (records.length >= SOURCE_LIST_SIZE) break;
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            records.push(JSON.parse(trimmed));
        } catch (e) { /* skip bad lines */ }
    }
    console.log(`  Read ${records.length} contacts\n`);

    // Step 2: Create 10 lists
    console.log('Step 2: Creating 10 sub-lists...');
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const lists = [];
    for (const letter of letters) {
        const name = `Danish Privacy Leads ${letter}`;
        try {
            const publicId = await createList(name);
            lists.push({ name, publicId, letter });
            console.log(`  ✓ Created: "${name}" (${publicId})`);
        } catch (e) {
            console.log(`  ✗ Failed: "${name}" — ${e.message}`);
            process.exit(1);
        }
    }
    console.log(`  All ${lists.length} lists created\n`);

    // Step 3: Split contacts into 10 groups and import
    const chunkSize = Math.ceil(records.length / NUM_SPLITS);
    console.log(`Step 3: Importing ${records.length} contacts (${chunkSize}/list, ${CONCURRENCY} concurrent)...\n`);

    for (let i = 0; i < NUM_SPLITS; i++) {
        const list = lists[i];
        const chunk = records.slice(i * chunkSize, (i + 1) * chunkSize);
        const startTime = Date.now();
        let success = 0, failed = 0;

        // Process in batches
        for (let j = 0; j < chunk.length; j += CONCURRENCY) {
            const batch = chunk.slice(j, j + CONCURRENCY);
            const results = await Promise.all(
                batch.map(record => addContact({
                    email: record.email,
                    domain: record.domain,
                    subject: record.subject,
                    body: record.body,
                    score: String(record.score || '')
                }, list.publicId))
            );
            for (const r of results) {
                if (r === 'ok') success++; else failed++;
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  [${list.letter}] "${list.name}" — ${success} ok, ${failed} err (${elapsed}s)`);
    }

    agent.destroy();
    console.log('\n=== DONE ===');
    console.log('Lists created:');
    for (const l of lists) {
        console.log(`  ${l.letter}: ${l.name} (${l.publicId})`);
    }
    console.log('\nNext: Create 10 campaigns in Ditlead UI, assign 1 list + 100 mailboxes to each.');
}

main().catch(console.error);
