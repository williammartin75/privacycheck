#!/usr/bin/env node
/**
 * patch-link.js — Patch all NDJSON email files to add clickable link
 * 
 * Replaces plain text "privacychecker.pro" with "https://privacychecker.pro/"
 * in the body field. Does NOT regenerate anything — pure find-and-replace.
 * 
 * Streams files line by line to handle large files (up to 5GB).
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REAL_EMAILS_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails';

// Already patched in previous run
const DONE = new Set(['Bulgarian.ndjson', 'Chinese.ndjson']);

async function patchFile(filename) {
    const inputPath = path.join(REAL_EMAILS_DIR, filename);
    if (!fs.existsSync(inputPath)) return 0;

    const tempPath = inputPath + '.tmp';
    // Clean up leftover temp if exists
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    const rl = readline.createInterface({
        input: fs.createReadStream(inputPath),
        crlfDelay: Infinity
    });
    const ws = fs.createWriteStream(tempPath);

    let count = 0;
    let patched = 0;

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const entry = JSON.parse(line);
            if (entry.body) {
                const original = entry.body;

                // Replace bare "privacychecker.pro" with "https://privacychecker.pro/"
                // but NOT when part of email address (contact@privacychecker.pro)
                // and NOT when already has https://
                entry.body = entry.body.replace(
                    /(?<![@/])privacychecker\.pro(?!\/)/g,
                    'https://privacychecker.pro/'
                );

                if (entry.body !== original) patched++;
            }

            ws.write(JSON.stringify(entry) + '\n');
            count++;

            if (count % 100000 === 0) {
                process.stdout.write(`  ${filename}: ${(count / 1000).toFixed(0)}k lines...\r`);
            }
        } catch { }
    }

    await new Promise(r => ws.end(r));

    // Replace original with patched
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);

    return { count, patched };
}

async function main() {
    console.log('=== Patch: privacychecker.pro → https://privacychecker.pro/ ===\n');

    const files = fs.readdirSync(REAL_EMAILS_DIR)
        .filter(f => f.endsWith('.ndjson'));

    console.log(`Found ${files.length} NDJSON files to patch\n`);

    let totalLines = 0, totalPatched = 0;

    for (const file of files) {
        if (DONE.has(file)) { console.log(`  ⏭ ${file} (already done)`); continue; }
        const t0 = Date.now();
        const result = await patchFile(file);
        if (!result) { console.log(`  SKIP: ${file}`); continue; }

        totalLines += result.count;
        totalPatched += result.patched;
        const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`  ✅ ${file.padEnd(30)} ${result.count.toLocaleString().padStart(10)} lines | ${result.patched.toLocaleString().padStart(10)} patched | ${elapsed}s`);
    }

    console.log(`\n=== DONE: ${totalLines.toLocaleString()} lines processed, ${totalPatched.toLocaleString()} patched ===`);
}

main().catch(console.error);
