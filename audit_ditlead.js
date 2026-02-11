const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function apiGet(endpoint) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'api.ditlead.com',
            path: endpoint,
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }
        };
        const req = https.request(opts, resp => {
            let data = '';
            resp.on('data', c => data += c);
            resp.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(data); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log('=== Ditlead Account Audit v2 ===\n');

    // Fetch all accounts
    const resp = await apiGet('/v1/mailbox?limit=1000');
    const accounts = resp.data || [];
    console.log(`Total accounts in Ditlead: ${accounts.length}`);

    // Show sample fields
    if (accounts.length > 0) {
        const a = accounts[0];
        console.log('\nSample account:');
        console.log(`  mailboxAddress: ${a.mailboxAddress}`);
        console.log(`  isActive: ${a.isActive}`);
        console.log(`  isConnected: ${a.isConnected}`);
        console.log(`  emailAccountError: ${a.emailAccountError}`);
        console.log(`  warmingData: ${JSON.stringify(a.warmingData)}`);
    }

    // Build Ditlead email set
    const ditleadEmails = new Set(accounts.map(a => a.mailboxAddress));

    // Load CSV
    const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
        'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
        'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');
    const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
    const csvEmails = [];
    for (let i = 1; i < csvLines.length; i++) {
        const parts = csvLines[i].split(',');
        if (parts.length >= 3) csvEmails.push(parts[2].trim());
    }
    console.log(`\nEmails in CSV: ${csvEmails.length}`);

    // Find missing
    const missing = csvEmails.filter(e => !ditleadEmails.has(e));
    console.log(`\nMISSING (in CSV but not in Ditlead): ${missing.length}`);

    // Group missing by domain
    const missingByDomain = {};
    missing.forEach(e => {
        const domain = e.split('@')[1];
        if (!missingByDomain[domain]) missingByDomain[domain] = [];
        missingByDomain[domain].push(e.split('@')[0]);
    });
    Object.entries(missingByDomain).forEach(([domain, users]) => {
        console.log(`  @${domain}: ${users.length} missing (${users.join(', ')})`);
    });

    // Status breakdown
    const active = accounts.filter(a => a.isActive === true);
    const inactive = accounts.filter(a => a.isActive === false);
    const connected = accounts.filter(a => a.isConnected === true);
    const disconnected = accounts.filter(a => a.isConnected === false);
    const withErrors = accounts.filter(a => a.emailAccountError);

    console.log(`\n--- Status Breakdown ---`);
    console.log(`  Active: ${active.length}`);
    console.log(`  Inactive: ${inactive.length}`);
    console.log(`  Connected: ${connected.length}`);
    console.log(`  Disconnected: ${disconnected.length}`);
    console.log(`  With errors: ${withErrors.length}`);

    // Show errors
    if (withErrors.length > 0) {
        const errorByDomain = {};
        withErrors.forEach(a => {
            const domain = a.mailboxAddress.split('@')[1];
            errorByDomain[domain] = (errorByDomain[domain] || 0) + 1;
        });
        console.log('\n  Errors by domain:');
        Object.entries(errorByDomain).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => {
            console.log(`    @${d}: ${c} errors`);
        });

        // Show first 10 error details
        console.log('\n  First 10 error accounts:');
        withErrors.slice(0, 10).forEach(a => {
            console.log(`    ${a.mailboxAddress}: ${a.emailAccountError}`);
        });
    }

    // Find extras (in Ditlead but not in CSV - leftover duplicates)
    const csvEmailSet = new Set(csvEmails);
    const extras = accounts.filter(a => !csvEmailSet.has(a.mailboxAddress));
    console.log(`\nExtra accounts (in Ditlead but not in CSV): ${extras.length}`);
    if (extras.length > 0) {
        extras.forEach(a => console.log(`  EXTRA: ${a.mailboxAddress}`));
    }
}

main().catch(console.error);
