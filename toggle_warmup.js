#!/usr/bin/env node
// Toggle warmup OFF/ON on all accounts with stale 451 errors
// This forces Ditlead to re-test the SMTP connection
const https = require('https');
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';

function api(method, path, body) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.ditlead.com', port: 443,
            path: '/v1/' + path, method,
            headers: { 'Authorization': 'Bearer ' + API_KEY, 'Content-Type': 'application/json' },
            timeout: 60000
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ s: res.statusCode, d: JSON.parse(d) }); }
                catch { resolve({ s: res.statusCode, d }); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    // Fetch all mailboxes (single request)
    console.log('Fetching mailboxes...');
    const r = await api('GET', 'mailbox');
    const items = (r.d.data || []);
    console.log(`Total: ${items.length}`);

    // Find accounts with 451 in emailAccountError
    const errs = items.filter(m => {
        const e = m.emailAccountError;
        if (!e) return false;
        const s = JSON.stringify(e);
        return s.includes('451') || s.includes('unavailable');
    });
    console.log(`With 451: ${errs.length}\n`);

    if (errs.length === 0) {
        console.log('All clear!');
        return;
    }

    // Apply warmup OFF/ON toggle to all error accounts
    console.log(`Toggling warmup on ${errs.length} accounts...\n`);
    let ok = 0, fail = 0;

    for (let i = 0; i < errs.length; i++) {
        const m = errs[i];
        const email = m.mailboxAddress || 'unknown';
        try {
            // OFF
            await api('PUT', `mailbox/${m._id}`, { warmupEnabled: false });
            await sleep(200);
            // ON
            const res = await api('PUT', `mailbox/${m._id}`, { warmupEnabled: true });

            // Check if it cleared
            const newErr = res.d && res.d.data && res.d.data.emailAccountError;
            const stillHas451 = newErr && JSON.stringify(newErr).includes('451');

            ok++;
            if ((i + 1) % 25 === 0 || i === 0) {
                console.log(`  [${i + 1}/${errs.length}] ${email} — ${stillHas451 ? 'still error' : 'maybe cleared'}`);
            }
        } catch (e) {
            fail++;
            console.log(`  [${i + 1}/${errs.length}] ${email} — FAIL: ${e.message}`);
        }
        await sleep(100);
    }

    console.log(`\nToggle done: ${ok} success, ${fail} failed`);

    // Final check
    await sleep(3000);
    console.log('\nFinal check...');
    const r2 = await api('GET', 'mailbox');
    const items2 = (r2.d.data || []);
    const errs2 = items2.filter(m => {
        const e = m.emailAccountError;
        if (!e) return false;
        const s = JSON.stringify(e);
        return s.includes('451') || s.includes('unavailable');
    });
    console.log(`Still with 451: ${errs2.length} / ${items2.length}`);
}

main().catch(console.error);
