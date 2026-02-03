/**
 * Script to prepare domain files for GCP batch processing
 * 1. Combines all domain files
 * 2. Cleans and validates domains
 * 3. Filters out spam traps and invalid domains
 * 4. Splits into chunks of 20,000
 * 5. Ready for upload to GCS
 */

const fs = require('fs');
const path = require('path');

const URLS_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS';
const OUTPUT_DIR = path.join(URLS_DIR, 'chunks');
const CHUNK_SIZE = 20000;

// Domains/patterns to EXCLUDE
const BLACKLIST_PATTERNS = [
    /no-?spam/i,
    /spam-?trap/i,
    /honey-?pot/i,
    /abuse\./i,
    /postmaster\./i,
    /noreply/i,
    /do-?not-?reply/i,
    /unsubscribe/i,
    /bounce/i,
    /mailer-daemon/i,
    /localhost/i,
    /example\.(com|org|net)/i,
    /test\.(com|org|net)/i,
    /invalid\./i,
    /\.local$/i,
    /\.internal$/i,
    /\.test$/i,
    /\.invalid$/i,
    /\.localhost$/i,
    /^mail\./i,        // Generic mail servers
    /^smtp\./i,
    /^mx\d*\./i,
    /^ns\d*\./i,       // Nameservers
    /^ftp\./i,
    /^cdn\./i,
    /^api\./i,
    /^dev\./i,
    /^staging\./i,
    /^admin\./i,
];

// Known non-business TLDs to exclude
const EXCLUDED_TLDS = [
    '.gov', '.mil', '.edu',  // Government/military/education
    '.int',                  // International orgs
];

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
} else {
    // Clean existing chunks
    const existingChunks = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith('chunk_'));
    for (const chunk of existingChunks) {
        fs.unlinkSync(path.join(OUTPUT_DIR, chunk));
    }
    console.log(`Cleaned ${existingChunks.length} existing chunks\n`);
}

console.log('=== DOMAIN FILE PREPARATION (with filtering) ===\n');

// Step 1: Read all .txt files (excluding markdown and analysis files)
const files = fs.readdirSync(URLS_DIR).filter(f =>
    f.endsWith('.txt') &&
    f.includes('_URLs') // Only URL files
);

console.log(`Found ${files.length} domain files to process\n`);

// Step 2: Combine all domains with filtering
const allDomains = new Set();
let totalLines = 0;
let filteredOut = 0;

function isValidDomain(domain) {
    // Check basic format
    if (!domain.match(/^[a-z0-9][a-z0-9-_.]*\.[a-z]{2,}$/) ||
        domain.length <= 3 ||
        domain.length >= 256 ||
        domain.includes(' ')) {
        return false;
    }

    // Check blacklist patterns
    for (const pattern of BLACKLIST_PATTERNS) {
        if (pattern.test(domain)) {
            return false;
        }
    }

    // Check excluded TLDs
    for (const tld of EXCLUDED_TLDS) {
        if (domain.endsWith(tld)) {
            return false;
        }
    }

    return true;
}

for (const file of files) {
    const filePath = path.join(URLS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    totalLines += lines.length;

    let fileFiltered = 0;
    for (const line of lines) {
        const domain = line.trim().toLowerCase();
        if (isValidDomain(domain)) {
            allDomains.add(domain);
        } else {
            fileFiltered++;
        }
    }

    filteredOut += fileFiltered;
    console.log(`  ✓ ${file}: ${lines.length.toLocaleString()} lines (filtered: ${fileFiltered.toLocaleString()})`);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total lines read: ${totalLines.toLocaleString()}`);
console.log(`Filtered out (blacklist + invalid): ${filteredOut.toLocaleString()}`);
console.log(`Unique valid domains: ${allDomains.size.toLocaleString()}`);

// Step 3: Convert to array and sort
const domains = Array.from(allDomains).sort();

// Step 4: Split into chunks
const chunks = [];
for (let i = 0; i < domains.length; i += CHUNK_SIZE) {
    chunks.push(domains.slice(i, i + CHUNK_SIZE));
}

console.log(`\nCreating ${chunks.length} chunks of ${CHUNK_SIZE.toLocaleString()} domains each...\n`);

// Step 5: Write chunks
for (let i = 0; i < chunks.length; i++) {
    const filename = `chunk_${String(i).padStart(4, '0')}.txt`;
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, chunks[i].join('\n'), 'utf-8');

    if (i < 5 || i >= chunks.length - 2) {
        console.log(`  ✓ ${filename}: ${chunks[i].length.toLocaleString()} domains`);
    } else if (i === 5) {
        console.log(`  ... (${chunks.length - 7} more chunks) ...`);
    }
}

console.log(`\n=== DONE ===`);
console.log(`Output directory: ${OUTPUT_DIR}`);
console.log(`Total chunks: ${chunks.length}`);
console.log(`Total domains: ${domains.length.toLocaleString()}`);
console.log(`Ready for upload to GCS!`);
console.log(`\nNext step: gsutil -m cp "${OUTPUT_DIR}\\*.txt" gs://privacychecker-domains-input/`);
