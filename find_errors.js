const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function apiRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const opts = {
            hostname: 'api.ditlead.com', path: apiPath, method,
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' }
        };
        if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
                catch { resolve({ status: res.statusCode, body: d }); }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

// Load CSV
const csvPath = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails',
    'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues',
    'Emails to contact', 'By languages', 'Real emails', 'Strategy', 'ditlead_all_mailboxes.csv');
const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n');

function findCSVData(email) {
    const line = csvLines.find(l => l.includes(email));
    if (!line) return null;
    return line.split(',');
}

async function main() {
    console.log('=== Reset accounts with stale errors ===\n');

    // Step 1: Fetch all accounts
    console.log('Step 1: Fetching all accounts...');
    const resp = await apiRequest('GET', '/v1/mailbox?limit=1000');
    const all = resp.body.data || [];
    console.log(`  Total: ${all.length}`);

    // Step 2: Find accounts with errors (emailAccountError is an object with actual error data)
    // We need to identify which ones have the "Account Issue" flag
    // From the API data, accounts with issues have emailAccountError with relevant data
    // Let's check: accounts that are NOT isActive or have error info
    const withErrors = all.filter(a => {
        // Check if emailAccountError has meaningful error content
        if (!a.emailAccountError) return false;
        const err = a.emailAccountError;
        if (typeof err === 'object') {
            // Has error fields like errorMessage, hasError, etc.
            return err.hasError === true || err.errorMessage || err.error;
        }
        return true;
    });

    // Also check: accounts where isActive is false might have issues
    const inactive = all.filter(a => !a.isActive);

    console.log(`  Accounts with error objects: ${withErrors.length}`);
    console.log(`  Inactive accounts: ${inactive.length}`);

    // Let's look at the error structure more carefully
    if (withErrors.length > 0) {
        console.log('\n  Sample error structures:');
        for (let i = 0; i < Math.min(3, withErrors.length); i++) {
            console.log(`    ${withErrors[i].mailboxAddress}: ${JSON.stringify(withErrors[i].emailAccountError)}`);
        }
    }

    // Since ALL accounts have emailAccountError object, let's identify the ones that are 
    // truly broken by checking if they have hasError=true or specific error strings
    const realErrors = all.filter(a => {
        const err = a.emailAccountError;
        if (!err || typeof err !== 'object') return false;
        return err.hasError === true;
    });

    console.log(`\n  Accounts with hasError=true: ${realErrors.length}`);

    // If that doesn't work, try to identify by the domains we know have issues
    const errorDomains = [
        'privacy-checker-pro.cloud',
        'privacy-checker-pro.site',
        'privacy-checker-pro.website',
        // partial:
        'mailprivacycheckerpro.site',
        'mailprivacycheckerpro.icu',
        'privacy-checker-pro.online'
    ];

    // Get all accounts on these domains that are NOT in the working list
    // Actually, let's use a smarter approach: check which accounts have isActive=false 
    // or have error flags

    // Let's just find all accounts that Ditlead reports as having issues
    // by checking all relevant fields
    console.log('\n  Checking all account fields for error indicators...');
    const flagged = all.filter(a => {
        const err = a.emailAccountError;
        if (err && typeof err === 'object') {
            // Check various possible error fields
            if (err.hasError) return true;
            if (err.message) return true;
            if (err.errorMessage) return true;
            if (err.smtpError) return true;
            if (err.imapError) return true;
        }
        return false;
    });
    console.log(`  Flagged accounts: ${flagged.length}`);

    // Show sample of the emailAccountError for a known working vs known broken account
    const working = all.find(a => a.mailboxAddress === 'contact1@privacy-checker-pro.online');
    const broken = all.find(a => a.mailboxAddress === 'support1@mailprivacycheckerpro.icu');

    if (working) {
        console.log(`\n  WORKING example (contact1@privacy-checker-pro.online):`);
        console.log(`    isActive: ${working.isActive}`);
        console.log(`    isConnected: ${working.isConnected}`);
        console.log(`    emailAccountError: ${JSON.stringify(working.emailAccountError)}`);
    }
    if (broken) {
        console.log(`\n  BROKEN example (support1@mailprivacycheckerpro.icu):`);
        console.log(`    isActive: ${broken.isActive}`);
        console.log(`    isConnected: ${broken.isConnected}`);
        console.log(`    emailAccountError: ${JSON.stringify(broken.emailAccountError)}`);
    }

    // Let's determine the total number of accounts to reset
    // by comparing working vs broken
    const toReset = all.filter(a => {
        // Compare error structure of working vs broken
        const err = a.emailAccountError;
        if (!err || typeof err !== 'object') return false;
        // If error has any truthy fields besides empty defaults, flag it
        const hasRealError = Object.values(err).some(v =>
            v === true || (typeof v === 'string' && v.length > 0 && v !== 'none')
        );
        return hasRealError;
    });

    console.log(`\n  Accounts to reset (with real error data): ${toReset.length}`);

    if (toReset.length === 0 || toReset.length === all.length) {
        // Can't distinguish by error field — use domain-based approach
        console.log('  Using domain-based identification instead...');
        // Skip this approach and try the nuclear option
    }

    // For now, let's just print the full error object diff between working and broken
    // so we can figure out the right filter
    console.log('\n=== Full comparison ===');

    // Check a few known working accounts
    const knownWorking = ['sales1@privacy-checker-pro.online', 'team1@privacy-checker-pro.online', 'contact1@mailprivacycheckerpro.cloud'];
    const knownBroken = ['support1@mailprivacycheckerpro.icu', 'contact1@mailprivacycheckerpro.site', 'gdpr1@privacy-checker-pro.cloud'];

    console.log('\nWORKING accounts:');
    for (const email of knownWorking) {
        const acct = all.find(a => a.mailboxAddress === email);
        if (acct) console.log(`  ${email}: isActive=${acct.isActive}, err=${JSON.stringify(acct.emailAccountError)}`);
    }

    console.log('\nBROKEN accounts:');
    for (const email of knownBroken) {
        const acct = all.find(a => a.mailboxAddress === email);
        if (acct) console.log(`  ${email}: isActive=${acct.isActive}, err=${JSON.stringify(acct.emailAccountError)}`);
    }
}

main().catch(console.error);
