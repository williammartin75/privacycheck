const https = require('https');
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

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
            res.on('end', () => resolve({ status: res.statusCode, body: d, headers: res.headers }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function main() {
    // Get one error account to test with
    const resp = await apiRequest('GET', '/v1/mailbox?limit=5');
    const data = JSON.parse(resp.body);
    const accounts = data.data || [];

    // Get one with error
    const errAcct = accounts.find(a => a.emailAccountError && a.emailAccountError.hasError === true);
    const goodAcct = accounts.find(a => !a.emailAccountError || !a.emailAccountError.hasError);

    if (errAcct) {
        console.log('Error account sample:');
        console.log('  mailboxId:', errAcct.mailboxId);
        console.log('  _id:', errAcct._id);
        console.log('  id:', errAcct.id);
        console.log('  email:', errAcct.mailboxAddress);
        console.log('  All keys:', Object.keys(errAcct).join(', '));

        // Try different DELETE patterns
        const id = errAcct.mailboxId || errAcct._id || errAcct.id;
        console.log('\nTesting DELETE endpoints:');

        const endpoints = [
            `/v1/mailbox/${id}`,
            `/v1/mailbox/delete/${id}`,
            `/v1/mailboxes/${id}`,
            `/v1/email-account/${id}`,
            `/v1/email-accounts/${id}`,
        ];

        for (const ep of endpoints) {
            const res = await apiRequest('DELETE', ep);
            console.log(`  DELETE ${ep} => ${res.status}: ${res.body.substring(0, 150)}`);
            if (res.status === 200) {
                console.log('  ✅ FOUND IT!');
                break;
            }
        }

        // Also try POST-based delete
        console.log('\nTrying POST-based delete:');
        const postEndpoints = [
            { path: '/v1/mailbox/delete', body: { mailboxId: id } },
            { path: '/v1/mailbox/delete', body: { id: id } },
            { path: '/v1/mailbox/delete', body: { ids: [id] } },
            { path: '/v1/mailbox/delete', body: { mailboxIds: [id] } },
        ];

        for (const ep of postEndpoints) {
            const res = await apiRequest('POST', ep.path, ep.body);
            console.log(`  POST ${ep.path} ${JSON.stringify(ep.body)} => ${res.status}: ${res.body.substring(0, 150)}`);
            if (res.status === 200) {
                console.log('  ✅ FOUND IT!');
                break;
            }
        }
    }

    // Also just print ALL key names from the API response to understand the data model
    if (accounts[0]) {
        console.log('\nFull account object sample (first 500 chars):');
        console.log(JSON.stringify(accounts[0], null, 2).substring(0, 500));
    }
}

main().catch(console.error);
