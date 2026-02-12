const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

// Test 3 failing accounts with FULL error logging
const tests = [
    { email: 'contact2@privacyaudit.online', pass: '5Cg74VZyf7ftd8gh', ip: '192.227.234.211' },
    { email: 'audit1@privacyaudit.online', pass: 'DR54TSTJTQFNMexJ', ip: '192.227.234.211' },
    { email: 'team1@privacyaudit.online', pass: '8op043v7nlsdZjEp', ip: '192.227.234.211' },
];

function testImport(a) {
    const name = a.email.split('@')[0];
    const payload = {
        firstName: name.replace(/[0-9]/g, ''),
        lastName: 'privacyaudit',
        smtp: { host: a.ip, port: 587, username: a.email, password: a.pass, emailAddress: a.email, secure: false },
        imap: { host: a.ip, port: 143, username: name, password: a.pass }
    };

    console.log(`\n--- ${a.email} ---`);
    console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    return new Promise((res) => {
        const data = JSON.stringify(payload);
        const req = https.request({
            hostname: 'api.ditlead.com', path: '/v1/mailbox', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) },
            timeout: 45000
        }, (r) => {
            let body = '';
            r.on('data', c => body += c);
            r.on('end', () => {
                console.log(`HTTP ${r.statusCode}`);
                console.log(`Headers: ${JSON.stringify(r.headers)}`);
                console.log(`Body: ${body}`);
                res();
            });
        });
        req.on('error', e => { console.log(`ERROR: ${e.message}`); res(); });
        req.on('timeout', () => { req.destroy(); console.log('TIMEOUT after 45s'); res(); });
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('=== Ditlead Diagnostic — Testing 3 failing accounts ===');
    for (const t of tests) {
        await testImport(t);
        await new Promise(r => setTimeout(r, 3000));
    }
    console.log('\n=== Done ===');
}

main();
