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
const PROGRESS_DIR = path.join(__dirname, 'import_progress');

const CONCURRENCY = 150;        // safe parallel limit (300 tested OK but 150 avoids rate-limits)
const LIST_MAX = 4900;          // rotate list before 5000 limit (safety margin)
const LOG_INTERVAL = 500;
const SAVE_INTERVAL = 1000;
const RETRY_WAIT = 3000;        // wait on 429
const MAX_RETRIES = 3;

const agent = new https.Agent({ keepAlive: true, maxSockets: CONCURRENCY + 50, maxFreeSockets: 50 });

// ============================================
// API
// ============================================
function postContact(attributes, listPublicId) {
    return new Promise((resolve) => {
        const body = JSON.stringify({ attributes, listId: listPublicId });
        const req = https.request({
            hostname: API_BASE, port: 443, path: '/v1/contact', method: 'POST',
            agent,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 30000
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(d); } catch (e) { parsed = null; }
                resolve({ status: res.statusCode, body: parsed, raw: d });
            });
        });
        req.on('error', () => resolve({ status: 0, body: null, raw: 'error' }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: null, raw: 'timeout' }); });
        req.write(body);
        req.end();
    });
}

async function postContactWithRetry(attributes, listPublicId) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const result = await postContact(attributes, listPublicId);

        if (result.status === 201 || result.status === 200) {
            // Check if added to list or hit limit
            const warning = result.body?.warning || '';
            if (warning.includes('List limit reached')) {
                return { status: 'list_full', result };
            }
            return { status: 'ok', result };
        }

        if (result.status === 429) {
            await sleep(RETRY_WAIT * (attempt + 1));
            continue;
        }

        if (result.status === 0) {
            await sleep(2000);
            continue;
        }

        // Other error (400, 500, etc.)
        return { status: 'error', result };
    }
    return { status: 'error', result: null };
}

function createList(name) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ listName: name });
        const req = https.request({
            hostname: API_BASE, port: 443, path: '/v1/list', method: 'POST',
            agent,
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 30000
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); }
                catch (e) { resolve({ success: false, data: d }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================
// PROGRESS (enhanced for multi-list)
// ============================================
function progressFile(lang) { return path.join(PROGRESS_DIR, `${lang}.json`); }

function loadProgress(lang) {
    try {
        if (fs.existsSync(progressFile(lang)))
            return JSON.parse(fs.readFileSync(progressFile(lang), 'utf-8'));
    } catch (e) { }
    return {
        lastLine: 0,
        success: 0,
        failed: 0,
        rateLimited: 0,
        lists: [],           // Array of { publicId, name, count }
        currentListIndex: 0,
        currentListCount: 0
    };
}

function saveProgress(lang, prog) {
    fs.writeFileSync(progressFile(lang), JSON.stringify(prog, null, 2));
}

// ============================================
// IMPORT ONE LANGUAGE (streaming — no OOM)
// ============================================
async function importLanguage(lang) {
    const ndjsonPath = path.join(NDJSON_DIR, `${lang}.ndjson`);
    if (!fs.existsSync(ndjsonPath)) {
        console.log(`  [${lang}] File not found, skipping`);
        return;
    }
    const fileSize = fs.statSync(ndjsonPath).size;
    if (fileSize < 100) {
        console.log(`  [${lang}] Empty file, skipping`);
        return;
    }

    const progress = loadProgress(lang);

    // Ensure we have a current list
    async function ensureList() {
        if (progress.lists.length === 0 || progress.currentListCount >= LIST_MAX) {
            const partNum = progress.lists.length + 1;
            const listName = partNum === 1
                ? `${lang} Privacy Leads`
                : `${lang} Privacy Leads (Part ${partNum})`;
            console.log(`  [${lang}] Creating list: "${listName}"...`);
            const result = await createList(listName);
            if (result.success && result.data?.publicId) {
                progress.lists.push({ publicId: result.data.publicId, name: listName, count: 0 });
                progress.currentListIndex = progress.lists.length - 1;
                progress.currentListCount = 0;
                saveProgress(lang, progress);
                console.log(`  [${lang}] List created: ${result.data.publicId} (Part ${partNum})`);
            } else {
                console.log(`  [${lang}] Failed to create list: ${JSON.stringify(result).substring(0, 200)}`);
                throw new Error('List creation failed');
            }
        }
        return progress.lists[progress.currentListIndex].publicId;
    }

    // Stream records in batches — never load entire file into memory
    console.log(`  [${lang}] Streaming NDJSON (resuming from line ${progress.lastLine})...`);
    const rl = readline.createInterface({
        input: fs.createReadStream(ndjsonPath, 'utf-8'),
        crlfDelay: Infinity
    });

    const startTime = Date.now();
    let processed = 0;
    let totalLines = 0;
    let batch = [];   // small buffer, max CONCURRENCY items

    async function flushBatch() {
        if (batch.length === 0) return;

        // Check list space, create new list if needed
        let spaceInList = LIST_MAX - progress.currentListCount;
        while (spaceInList <= 0) {
            progress.currentListCount = LIST_MAX;
            await ensureList();
            spaceInList = LIST_MAX - progress.currentListCount;
        }

        // Trim batch to fit in current list
        const toSend = batch.slice(0, spaceInList);
        const overflow = batch.slice(spaceInList);

        const listPublicId = await ensureList();
        progress.currentListCount += toSend.length;

        // Process batch in parallel
        const results = await Promise.all(
            toSend.map(({ record }) => {
                const attributes = {
                    email: record.email,
                    domain: record.domain,
                    subject: record.subject,
                    body: record.body,
                    score: String(record.score || '')
                };
                return postContactWithRetry(attributes, listPublicId);
            })
        );

        let listFullCount = 0;
        for (const r of results) {
            if (r.status === 'ok') {
                progress.success++;
            } else if (r.status === 'list_full') {
                listFullCount++;
            } else {
                progress.failed++;
            }
        }

        processed += toSend.length;
        progress.lastLine = toSend[toSend.length - 1].lineNum;

        // Update list count
        if (progress.lists[progress.currentListIndex]) {
            progress.lists[progress.currentListIndex].count = progress.currentListCount;
        }

        if (listFullCount > 0) {
            console.log(`  [${lang}] List full (${progress.currentListCount}), will create new list...`);
            progress.currentListCount = LIST_MAX;
        }

        // Log progress
        if (processed % LOG_INTERVAL < CONCURRENCY) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = processed / elapsed;
            const listInfo = `list ${progress.currentListIndex + 1} (${progress.currentListCount}/${LIST_MAX})`;
            console.log(`  [${lang}] ${processed} done | ${progress.success} ok | ${progress.failed} err | ${rate.toFixed(1)}/s | ${listInfo}`);
        }

        if (processed % SAVE_INTERVAL < CONCURRENCY) {
            saveProgress(lang, progress);
        }

        // Reset batch to overflow (records that didn't fit in current list)
        batch = overflow;
        if (overflow.length > 0) {
            await flushBatch(); // recursively flush overflow into new list
        }
    }

    for await (const line of rl) {
        totalLines++;
        if (totalLines <= progress.lastLine) continue;
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
            batch.push({ lineNum: totalLines, record: JSON.parse(trimmed) });
        } catch (e) {
            progress.failed++;
        }

        if (batch.length >= CONCURRENCY) {
            await flushBatch();
        }
    }

    // Flush remaining
    await flushBatch();

    saveProgress(lang, progress);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
    const totalLists = progress.lists.length;
    console.log(`  [${lang}] COMPLETE: ${progress.success} ok | ${progress.failed} err | ${totalTime}s | ${totalLists} lists`);
}

// ============================================
// MAIN
// ============================================
async function main() {
    if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });

    const args = process.argv.slice(2);
    let languages;

    if (args.length > 0) {
        languages = args;
    } else {
        languages = fs.readdirSync(NDJSON_DIR)
            .filter(f => f.endsWith('.ndjson'))
            .map(f => f.replace('.ndjson', ''))
            .sort();
    }

    console.log(`=== Ditlead PARALLEL Import v2 (${CONCURRENCY} concurrent, ${LIST_MAX}/list) ===`);
    console.log(`Languages: ${languages.length}`);
    console.log(`Progress: ${PROGRESS_DIR}\n`);

    for (const lang of languages) {
        try {
            await importLanguage(lang);
        } catch (e) {
            console.log(`  [${lang}] ERROR: ${e.message}`);
        }
    }

    agent.destroy();
    console.log('\n=== ALL DONE ===');
}

main().catch(console.error);
