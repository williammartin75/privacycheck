const fs = require('fs');
const readline = require('readline');
const https = require('https');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';
const LIST_PUBLIC_ID = '724de7af-961d-450f-a757-f4f5af485864'; // Turkish KVKK Leads

const NDJSON_PATH = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Turkish.ndjson';
const PROGRESS_FILE = path.join(__dirname, 'turkish_import_progress.json');
const ERRORS_FILE = path.join(__dirname, 'turkish_import_errors.json');

const DELAY_MS = 500;           // ms between requests
const TEST_MODE_LIMIT = 5;     // contacts to import in --test mode
const LOG_INTERVAL = 100;      // log progress every N contacts

// ============================================
// API HELPER
// ============================================
function postContact(attributes) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            attributes,
            listId: LIST_PUBLIC_ID
        });

        const req = https.request({
            hostname: API_BASE,
            port: 443,
            path: '/v1/contact',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 30000
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.write(body);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ============================================
// PROGRESS TRACKING
// ============================================
function loadProgress() {
    try {
        if (fs.existsSync(PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
        }
    } catch (e) { /* ignore */ }
    return { lastLine: 0, success: 0, skipped: 0, failed: 0, startedAt: new Date().toISOString() };
}

function saveProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function loadErrors() {
    try {
        if (fs.existsSync(ERRORS_FILE)) {
            return JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));
        }
    } catch (e) { /* ignore */ }
    return [];
}

function saveErrors(errors) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2));
}

// ============================================
// MAIN IMPORT
// ============================================
async function main() {
    const isTest = process.argv.includes('--test');
    const isReset = process.argv.includes('--reset');

    if (isReset) {
        if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
        if (fs.existsSync(ERRORS_FILE)) fs.unlinkSync(ERRORS_FILE);
        console.log('Progress reset.');
        return;
    }

    const progress = loadProgress();
    const errors = loadErrors();

    console.log('=== Ditlead Turkish KVKK Import ===');
    console.log(`Mode: ${isTest ? 'TEST (first ' + TEST_MODE_LIMIT + ' only)' : 'FULL IMPORT'}`);
    console.log(`List: Turkish KVKK Leads (${LIST_PUBLIC_ID})`);
    console.log(`Source: ${NDJSON_PATH}`);
    console.log(`Delay: ${DELAY_MS}ms between requests`);

    if (progress.lastLine > 0) {
        console.log(`\nResuming from line ${progress.lastLine + 1}`);
        console.log(`Previous: ${progress.success} success, ${progress.skipped} skipped, ${progress.failed} failed`);
    }

    console.log('');

    // Stream-read the NDJSON file
    const fileStream = fs.createReadStream(NDJSON_PATH, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let lineNum = 0;
    let processed = 0;
    const startTime = Date.now();

    for await (const line of rl) {
        lineNum++;

        // Skip already-processed lines (resume support)
        if (lineNum <= progress.lastLine) continue;

        // Skip empty lines
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Test mode limit
        if (isTest && processed >= TEST_MODE_LIMIT) {
            console.log(`\nTest mode: stopped after ${TEST_MODE_LIMIT} contacts.`);
            break;
        }

        // Parse the NDJSON record
        let record;
        try {
            record = JSON.parse(trimmed);
        } catch (e) {
            console.log(`Line ${lineNum}: JSON parse error, skipping`);
            progress.failed++;
            errors.push({ line: lineNum, error: 'JSON parse error', raw: trimmed.substring(0, 100) });
            continue;
        }

        // Build contact attributes
        const attributes = {
            email: record.email,
            domain: record.domain,
            subject: record.subject,
            body: record.body,
            score: String(record.score || ''),
            issues_count: String(record.issues_count || ''),
            passed_count: String(record.passed_count || ''),
            estimated_fine_min: String(record.estimated_fine_min || ''),
            estimated_fine_max: String(record.estimated_fine_max || '')
        };

        // POST to Ditlead
        try {
            const result = await postContact(attributes);

            if (result.status === 201 || result.status === 200) {
                progress.success++;
                if (processed < 3 || isTest) {
                    console.log(`  [${lineNum}] ${record.email} -> created (${result.body?.data?.publicId || 'ok'})`);
                }
            } else if (result.body?.data === 'Contact already exists' || result.body?.data?.includes?.('already')) {
                progress.skipped++;
                if (processed < 3 || isTest) {
                    console.log(`  [${lineNum}] ${record.email} -> already exists`);
                }
            } else {
                progress.failed++;
                errors.push({ line: lineNum, email: record.email, status: result.status, response: result.body });
                if (processed < 10 || isTest) {
                    console.log(`  [${lineNum}] ${record.email} -> ERROR ${result.status}: ${JSON.stringify(result.body).substring(0, 100)}`);
                }
            }
        } catch (e) {
            progress.failed++;
            errors.push({ line: lineNum, email: record.email, error: e.message });
            console.log(`  [${lineNum}] ${record.email} -> NETWORK ERROR: ${e.message}`);

            // On network error, wait longer and retry once
            await sleep(5000);
            try {
                const retry = await postContact(attributes);
                if (retry.status === 201 || retry.status === 200) {
                    progress.failed--;
                    progress.success++;
                    errors.pop();
                    console.log(`  [${lineNum}] ${record.email} -> RETRY SUCCESS`);
                }
            } catch (e2) {
                // Already logged as failed
            }
        }

        processed++;
        progress.lastLine = lineNum;

        // Periodic logging
        if (processed % LOG_INTERVAL === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = processed / elapsed;
            console.log(`  Progress: ${processed} processed | ${progress.success} ok | ${progress.skipped} skip | ${progress.failed} err | ${rate.toFixed(1)}/s | Line ${lineNum}`);
            saveProgress(progress);
            saveErrors(errors);
        }

        // Rate limiting
        await sleep(DELAY_MS);
    }

    // Final save
    saveProgress(progress);
    saveErrors(errors);

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('\n=== IMPORT COMPLETE ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Success: ${progress.success}`);
    console.log(`Skipped (duplicates): ${progress.skipped}`);
    console.log(`Failed: ${progress.failed}`);
    console.log(`Time: ${elapsed} minutes`);
    console.log(`Progress saved to: ${PROGRESS_FILE}`);

    if (errors.length > 0) {
        console.log(`Errors saved to: ${ERRORS_FILE}`);
    }
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
