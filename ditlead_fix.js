const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';

// Accounts that were imported via CSV and are broken
// These need to be deleted and re-imported via API
const BROKEN_ACCOUNTS = [
    'contact1@privacy-checker-pro.online',
    'contact2@privacy-checker-pro.online',
    'contact3@privacy-checker-pro.online',
    'contact4@privacy-checker-pro.online',
    'info1@privacy-checker-pro.online',
    'info2@privacy-checker-pro.online',
    'info3@privacy-checker-pro.online',
    'audit1@privacy-checker-pro.online',
    // Add more if needed
];

function apiRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: API_BASE,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            timeout: 30000
        };
        if (data) options.headers['Content-Length'] = Buffer.byteLength(data);

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(responseBody) }); }
                catch { resolve({ status: res.statusCode, body: responseBody }); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        if (data) req.write(data);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const action = process.argv[2] || 'list';

    if (action === 'list') {
        // List all mailboxes
        console.log('=== Fetching all mailboxes ===');
        const result = await apiRequest('GET', '/v1/mailbox');
        console.log(`Status: ${result.status}`);
        console.log(JSON.stringify(result.body, null, 2).substring(0, 5000));
    }

    else if (action === 'delete-broken') {
        console.log('=== Deleting broken accounts ===');
        for (const email of BROKEN_ACCOUNTS) {
            console.log(`Deleting: ${email}`);
            const result = await apiRequest('DELETE', '/v1/mailbox', { mailboxAddress: email });
            console.log(`  Status: ${result.status} - ${JSON.stringify(result.body)}`);
            await sleep(1000);
        }
        console.log('\nDone! Now re-run the import script to re-add these accounts.');
    }

    else if (action === 'reimport') {
        // Re-import specific broken accounts with proper SMTP/IMAP
        const accounts = [
            { email: 'contact1@privacy-checker-pro.online', pwd: 'Gx8BIEgao/ugKPwB', first: 'Contact' },
            { email: 'contact2@privacy-checker-pro.online', pwd: 'YFMZXWkDBIIr+8I+', first: 'Contact' },
            { email: 'contact3@privacy-checker-pro.online', pwd: 'zmzjw7X/y1zbB0sZ', first: 'Contact' },
            { email: 'contact4@privacy-checker-pro.online', pwd: '1a1xOalaOHriw7w5', first: 'Contact' },
            { email: 'info1@privacy-checker-pro.online', pwd: 'G3nYFuk2hcRgfTmF', first: 'Info' },
            { email: 'info2@privacy-checker-pro.online', pwd: 'O32fHgol0q5lqZf0', first: 'Info' },
            { email: 'info3@privacy-checker-pro.online', pwd: 'V5za2KQ45rwhFvMe', first: 'Info' },
            { email: 'audit1@privacy-checker-pro.online', pwd: '6ERRSxf4fIMnX7G8', first: 'Audit' },
        ];

        console.log('=== Re-importing broken accounts ===');
        for (const acc of accounts) {
            const payload = {
                firstName: acc.first,
                lastName: 'PrivacyChecker',
                smtp: {
                    host: '107.174.93.156',
                    port: '587',
                    username: acc.email,
                    password: acc.pwd,
                    emailAddress: acc.email,
                    secure: false
                },
                imap: {
                    host: '107.174.93.156',
                    port: '993',
                    username: acc.email,
                    password: acc.pwd
                }
            };

            const result = await apiRequest('POST', '/v1/mailbox', payload);
            if (result.status === 200 || result.status === 201) {
                if (result.body?.data === 'Email already exist') {
                    console.log(`⏭️ ${acc.email} - still exists, delete first!`);
                } else {
                    console.log(`✅ ${acc.email} - imported!`);
                }
            } else {
                console.log(`❌ ${acc.email} - Status ${result.status}: ${JSON.stringify(result.body)}`);
            }
            await sleep(2000);
        }
    }
}

main().catch(console.error);
