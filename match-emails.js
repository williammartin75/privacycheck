const fs = require('fs');
const readline = require('readline');

// Chemins des fichiers
const ALIVE_DOMAINS_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\DOMAINS_ALIVE.txt';
const UNANALYZED_07_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\domains_worker07.txt';
const UNANALYZED_10_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\domains_worker10.txt';
const GENERIC_EMAILS_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\GENERIC_EMAILS.txt';

const OUTPUT_VERIFIED = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\EMAILS_VERIFIED.txt';
const OUTPUT_UNVERIFIED = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\EMAILS_UNVERIFIED.txt';
const OUTPUT_ALL = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\EMAILS_ALL_COMBINED.txt';

async function loadDomains(filePath) {
    console.log(`Loading domains from ${filePath}...`);
    const domains = new Set();

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.replace(/\r/g, '').split('\n');

    for (const line of lines) {
        const domain = line.trim().toLowerCase();
        if (domain) domains.add(domain);
    }

    console.log(`  Loaded ${domains.size} domains`);
    return domains;
}

async function processEmails(emailFile, aliveDomains, unanalyzedDomains, verifiedStream, unverifiedStream) {
    console.log(`\nProcessing ${emailFile}...`);

    const content = fs.readFileSync(emailFile, 'utf-8');
    const lines = content.replace(/\r/g, '').split('\n');

    let verified = 0;
    let unverified = 0;
    let dead = 0;
    let total = 0;

    for (const line of lines) {
        const email = line.trim().toLowerCase();
        if (!email || !email.includes('@')) continue;

        total++;
        const domain = email.split('@')[1];

        if (aliveDomains.has(domain)) {
            verifiedStream.write(email + '\n');
            verified++;
        } else if (unanalyzedDomains.has(domain)) {
            unverifiedStream.write(email + '\n');
            unverified++;
        } else {
            dead++;
        }

        if (total % 500000 === 0) {
            console.log(`  Progress: ${total} emails (${verified} verified, ${unverified} unverified, ${dead} dead)`);
        }
    }

    console.log(`  Done: ${total} emails (${verified} verified, ${unverified} unverified, ${dead} dead)`);
    return { verified, unverified, dead, total };
}

async function main() {
    console.log('=== Email Matching Tool ===\n');

    // Load domains
    const aliveDomains = await loadDomains(ALIVE_DOMAINS_FILE);

    let unanalyzedDomains = new Set();
    if (fs.existsSync(UNANALYZED_07_FILE)) {
        const d07 = await loadDomains(UNANALYZED_07_FILE);
        d07.forEach(d => unanalyzedDomains.add(d));
    }
    if (fs.existsSync(UNANALYZED_10_FILE)) {
        const d10 = await loadDomains(UNANALYZED_10_FILE);
        d10.forEach(d => unanalyzedDomains.add(d));
    }

    console.log(`\nTotal: ${aliveDomains.size} alive + ${unanalyzedDomains.size} unanalyzed domains`);

    // Open output streams
    const verifiedStream = fs.createWriteStream(OUTPUT_VERIFIED);
    const unverifiedStream = fs.createWriteStream(OUTPUT_UNVERIFIED);

    // Process generic emails
    const stats = await processEmails(
        GENERIC_EMAILS_FILE,
        aliveDomains,
        unanalyzedDomains,
        verifiedStream,
        unverifiedStream
    );

    verifiedStream.end();
    unverifiedStream.end();

    // Wait for streams to finish
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Combine files
    console.log('\nCombining verified + unverified...');
    const verified = fs.readFileSync(OUTPUT_VERIFIED, 'utf-8');
    const unverified = fs.readFileSync(OUTPUT_UNVERIFIED, 'utf-8');
    fs.writeFileSync(OUTPUT_ALL, verified + unverified);

    // Final stats
    const allLines = (verified + unverified).split('\n').filter(l => l.trim()).length;

    console.log('\n=== RESULTS ===');
    console.log(`Verified emails (alive domains): ${stats.verified}`);
    console.log(`Unverified emails (workers 07/10): ${stats.unverified}`);
    console.log(`Dead emails (domain dead): ${stats.dead}`);
    console.log(`Total combined: ${allLines}`);
    console.log(`\nOutput files:`);
    console.log(`  ${OUTPUT_VERIFIED}`);
    console.log(`  ${OUTPUT_UNVERIFIED}`);
    console.log(`  ${OUTPUT_ALL}`);
}

main().catch(console.error);
