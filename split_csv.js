const fs = require('fs');
const path = require('path');

const CSV_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\CSV_for_Ditlead';
const CHUNK_SIZE = 5000;

// Stream-based CSV splitter with quote-aware parsing
function splitFile(filePath) {
    return new Promise((resolve, reject) => {
        const name = path.basename(filePath, '.csv');
        const outDir = path.join(CSV_DIR, name);

        if (fs.existsSync(outDir)) {
            fs.readdirSync(outDir).forEach(f => fs.unlinkSync(path.join(outDir, f)));
        } else {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const stream = fs.createReadStream(filePath, { encoding: 'utf-8', highWaterMark: 64 * 1024 });

        let header = null;
        let records = [];
        let currentRecord = '';
        let inQuotes = false;
        let chunk = 1;
        let total = 0;

        function flushChunk() {
            if (records.length === 0) return;
            const out = path.join(outDir, `${name}_${String(chunk).padStart(3, '0')}.csv`);
            fs.writeFileSync(out, header + '\n' + records.join('\n') + '\n');
            chunk++;
            records = [];
        }

        stream.on('data', (data) => {
            for (let i = 0; i < data.length; i++) {
                const ch = data[i];

                if (ch === '"') {
                    if (inQuotes && i + 1 < data.length && data[i + 1] === '"') {
                        currentRecord += '""';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                        currentRecord += ch;
                    }
                } else if (ch === '\n' && !inQuotes) {
                    const trimmed = currentRecord.replace(/\r$/, '');
                    if (trimmed) {
                        if (!header) {
                            header = trimmed;
                        } else {
                            records.push(trimmed);
                            total++;
                            if (records.length === CHUNK_SIZE) flushChunk();
                        }
                    }
                    currentRecord = '';
                } else {
                    currentRecord += ch;
                }
            }
        });

        stream.on('end', () => {
            const trimmed = currentRecord.replace(/\r$/, '');
            if (trimmed && header) {
                records.push(trimmed);
                total++;
            }
            flushChunk();
            resolve({ name, total, chunks: chunk - 1 });
        });

        stream.on('error', reject);
    });
}

async function main() {
    const files = fs.readdirSync(CSV_DIR).filter(f => f.endsWith('.csv')).sort();

    // Skip already-split files (check if subdir exists with correct count)
    const args = process.argv.slice(2);
    const skipDone = !args.includes('--force');

    console.log(`=== Splitting ${files.length} CSVs -> ${CHUNK_SIZE}-contact chunks ===\n`);

    let totalChunks = 0;
    let totalLeads = 0;

    for (const file of files) {
        const filePath = path.join(CSV_DIR, file);
        const sizeMB = (fs.statSync(filePath).size / 1048576).toFixed(1);
        if (parseFloat(sizeMB) < 0.001) { console.log(`  Skip ${file} (empty)`); continue; }

        const name = file.replace('.csv', '');
        const outDir = path.join(CSV_DIR, name);

        if (skipDone && fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0) {
            const existing = fs.readdirSync(outDir).length;
            console.log(`  Skip ${file} (already split -> ${existing} files)`);
            totalChunks += existing;
            continue;
        }

        process.stdout.write(`  ${file} (${sizeMB} MB)...`);
        const t0 = Date.now();
        const result = await splitFile(filePath);
        const sec = ((Date.now() - t0) / 1000).toFixed(1);
        totalChunks += result.chunks;
        totalLeads += result.total;
        console.log(` ${result.total.toLocaleString()} leads -> ${result.chunks} files (${sec}s)`);
    }

    console.log(`\n=== DONE ===`);
    console.log(`Total chunks: ${totalChunks}`);
    console.log(`Output: ${CSV_DIR}/<language>/`);
}

main().catch(console.error);
