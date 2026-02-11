#!/usr/bin/env node
// ============================================================
// Generate ditlead_batch_3.csv and ditlead_batch_4.csv
// from ditlead_new_mailboxes.csv (600 entries)
// Format matches batch 1 & 2 exactly
// ============================================================

const fs = require('fs');
const path = require('path');

const SOURCE_CSV = path.join(__dirname, 'ditlead_new_mailboxes.csv');
const OUTPUT_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Strategy';

const HEADER = 'first_name,last_name,email,smtp_host,smtp_port,smtp_username,smtp_password,smtp_encryption,imap_host,imap_port,imap_username,imap_password,imap_encryption';

// Prefix to first_name mapping
const PREFIX_MAP = {
    'contact': 'Contact',
    'info': 'Info',
    'audit': 'Audit',
    'report': 'Report',
    'team': 'Team',
    'sales': 'Sales',
    'support': 'Support',
    'hello': 'Hello',
    'privacy': 'Privacy',
    'gdpr': 'Gdpr',
};

// Read source CSV
const raw = fs.readFileSync(SOURCE_CSV, 'utf8').trim().split('\n');
const dataLines = raw.filter(l => l.includes('@') && !l.startsWith('email'));

console.log(`Source: ${dataLines.length} mailbox entries\n`);

// Validate and transform
const rows = [];
let issues = 0;

for (const line of dataLines) {
    const parts = line.trim().split(',');
    if (parts.length < 3) {
        console.log(`⚠️ Bad format: ${line.substring(0, 60)}`);
        issues++;
        continue;
    }

    const [email, password, ip] = parts;

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
        console.log(`⚠️ Bad email: ${email}`);
        issues++;
        continue;
    }

    // Validate password is real (not $PASS or empty)
    if (!password || password.includes('$PASS') || password.length < 5) {
        console.log(`⚠️ Bad password for ${email}: "${password}"`);
        issues++;
        continue;
    }

    // Validate IP
    if (!ip || !ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        console.log(`⚠️ Bad IP for ${email}: "${ip}"`);
        issues++;
        continue;
    }

    // Extract prefix (e.g., "contact1" → "contact")
    const localPart = email.split('@')[0];
    const prefix = localPart.replace(/\d+$/, '');
    const firstName = PREFIX_MAP[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1);

    // Format: first_name,last_name,email,smtp_host,smtp_port,smtp_username,smtp_password,smtp_encryption,imap_host,imap_port,imap_username,imap_password,imap_encryption
    rows.push(`${firstName},PrivacyChecker,${email},${ip},587,${email},${password},STARTTLS,${ip},993,${email},${password},SSL`);
}

console.log(`✅ ${rows.length} valid entries, ${issues} issues\n`);

if (rows.length !== 600) {
    console.log(`⚠️ Expected 600, got ${rows.length}`);
}

// Split into two batches of 300
const batch3 = rows.slice(0, 300);
const batch4 = rows.slice(300, 600);

console.log(`Batch 3: ${batch3.length} entries`);
console.log(`Batch 4: ${batch4.length} entries`);

// Write batch 3
const batch3Content = HEADER + '\n' + batch3.join('\n') + '\n';
const batch3Path = path.join(OUTPUT_DIR, 'ditlead_batch_3.csv');
fs.writeFileSync(batch3Path, batch3Content);
console.log(`\n✅ Written: ${batch3Path}`);

// Write batch 4
const batch4Content = HEADER + '\n' + batch4.join('\n') + '\n';
const batch4Path = path.join(OUTPUT_DIR, 'ditlead_batch_4.csv');
fs.writeFileSync(batch4Path, batch4Content);
console.log(`✅ Written: ${batch4Path}`);

// Quick sanity check: show first 3 rows of each
console.log('\n--- Batch 3 preview ---');
console.log(HEADER);
batch3.slice(0, 3).forEach(r => console.log(r));

console.log('\n--- Batch 4 preview ---');
console.log(HEADER);
batch4.slice(0, 3).forEach(r => console.log(r));

// Verify no duplicates with batch 1 & 2
const b1Path = path.join(OUTPUT_DIR, 'ditlead_batch_1.csv');
const b2Path = path.join(OUTPUT_DIR, 'ditlead_batch_2.csv');
const existingEmails = new Set();

for (const bPath of [b1Path, b2Path]) {
    if (fs.existsSync(bPath)) {
        const lines = fs.readFileSync(bPath, 'utf8').trim().split('\n').slice(1);
        for (const l of lines) {
            const email = l.split(',')[2];
            if (email) existingEmails.add(email);
        }
    }
}

// Check for duplicates
let dupes = 0;
for (const r of rows) {
    const email = r.split(',')[2];
    if (existingEmails.has(email)) {
        console.log(`⚠️ Duplicate with batch 1/2: ${email}`);
        dupes++;
    }
}

console.log(`\n✅ Duplicate check: ${dupes} duplicates found with batch 1/2`);
console.log(`\nTotal mailboxes across all batches: ${existingEmails.size + rows.length}`);
