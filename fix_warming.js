const https = require('https');
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function apiRequest(method, path) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: 'api.ditlead.com', path, method,
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 30000,
        };
        const req = https.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const res = await apiRequest('GET', '/v1/mailbox?limit=2000');
    const all = res.data || res || [];

    const targetIds = new Set([
        'ma-g4l3nnl', 'ma-megga6v', 'ma-0hfxqj6', 'ma-d7xijzz',
        'ma-xu6cica', 'ma-2ai1l7i', 'ma-ckqiork', 'ma-o0g1zgr', 'ma-4k8pjkc'
    ]);

    console.log('=== Non-warming accounts — full details ===\n');
    for (const a of all) {
        if (targetIds.has(a.mailboxId)) {
            const domain = a.mailboxAddress.split('@')[1];
            console.log(`Email: ${a.mailboxAddress}`);
            console.log(`  mailboxId: ${a.mailboxId}`);
            console.log(`  isActive: ${a.isActive}`);
            console.log(`  isConnected: ${a.isConnected}`);
            console.log(`  providerType: ${a.providerType}`);
            console.log(`  warmingData.isActive: ${a.warmingData?.isActive}`);
            console.log(`  warmingData.suspended: ${JSON.stringify(a.warmingData?.suspended)}`);
            console.log(`  error: ${JSON.stringify(a.emailAccountError)}`);

            // Find SMTP host from other accounts on same domain
            const sameDomain = all.find(x => x.mailboxAddress.includes(domain) && x.warmingData?.isActive);
            if (sameDomain) {
                console.log(`  [Other account on same domain IS warming: ${sameDomain.mailboxAddress}]`);
            } else {
                console.log(`  [NO other account on this domain is warming]`);
            }
            console.log('');
        }
    }
}

main().catch(console.error);
