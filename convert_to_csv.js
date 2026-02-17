const fs = require('fs');
const readline = require('readline');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const INPUT_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails';
const OUTPUT_DIR = path.join(INPUT_DIR, 'CSV_for_Ditlead');

// CSV columns to export
const COLUMNS = ['email', 'domain', 'subject', 'body', 'score', 'issues_count', 'passed_count', 'estimated_fine_min', 'estimated_fine_max'];

// ============================================
// CSV ESCAPE
// ============================================
function csvEscape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // If contains comma, quote, newline — wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

// ============================================
// CONVERT ONE FILE
// ============================================
async function convertFile(inputPath, outputPath) {
    const name = path.basename(inputPath, '.ndjson');

    return new Promise((resolve, reject) => {
        const input = fs.createReadStream(inputPath, { encoding: 'utf-8' });
        const output = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
        const rl = readline.createInterface({ input, crlfDelay: Infinity });

        // Write CSV header
        output.write(COLUMNS.join(',') + '\n');

        let count = 0;
        let errors = 0;

        rl.on('line', (line) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            try {
                const record = JSON.parse(trimmed);
                const row = COLUMNS.map(col => csvEscape(record[col]));
                output.write(row.join(',') + '\n');
                count++;
            } catch (e) {
                errors++;
            }
        });

        rl.on('close', () => {
            output.end();
            resolve({ name, count, errors });
        });

        rl.on('error', reject);
        input.on('error', reject);
    });
}

// ============================================
// MAIN
// ============================================
async function main() {
    // Get all NDJSON files
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.ndjson')).sort();

    console.log(`=== NDJSON → CSV Converter for Ditlead ===`);
    console.log(`Found ${files.length} NDJSON files`);
    console.log(`Output: ${OUTPUT_DIR}\n`);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let totalLeads = 0;
    const results = [];

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        const outputName = file.replace('.ndjson', '.csv');
        const outputPath = path.join(OUTPUT_DIR, outputName);

        const sizeMB = (fs.statSync(inputPath).size / 1048576).toFixed(1);
        process.stdout.write(`  Converting ${file} (${sizeMB} MB)...`);

        const start = Date.now();
        const result = await convertFile(inputPath, outputPath);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        totalLeads += result.count;
        results.push(result);

        console.log(` ${result.count.toLocaleString()} leads (${elapsed}s)${result.errors ? ` [${result.errors} errors]` : ''}`);
    }

    // Summary
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total files: ${files.length}`);
    console.log(`Total leads: ${totalLeads.toLocaleString()}`);
    console.log(`Output directory: ${OUTPUT_DIR}`);

    console.log(`\n=== FILES BY SIZE ===`);
    results.sort((a, b) => b.count - a.count);
    for (const r of results) {
        console.log(`  ${String(r.count.toLocaleString()).padStart(10)}  ${r.name}`);
    }
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
