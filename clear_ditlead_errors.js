#!/usr/bin/env node
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
    // Fetch first page only (always 1200)
    console.log('Fetching mailboxes...');
    const r = await api('GET', 'mailbox');
    const items = Array.isArray(r.d) ? r.d : (r.d.data || []);
    console.log(`Total: ${items.length}`);

    // Deduplicate by _id
    const unique = new Map();
    items.forEach(m => unique.set(m._id, m));
    const all = [...unique.values()];
    console.log(`Unique: ${all.length}`);

    const errs = all.filter(m => {
        const e = m.emailAccountError || m.errMsg;
        if (!e) return false;
        const s = JSON.stringify(e);
        return s.includes('451') || s.includes('unavailable');
    });
    console.log(`With 451: ${errs.length}\n`);

    if (errs.length === 0) return;

    // Test on first account
    const t = errs[0];
    console.log(`Testing on: ${t.mailboxAddress || t.email} (${t._id})`);
    console.log(`Error: ${JSON.stringify(t.emailAccountError || t.errMsg).substring(0, 100)}\n`);

    // A: Warmup toggle
    console.log('A: Warmup OFF...');
    let a1 = await api('PUT', `mailbox/${t._id}`, { warmupEnabled: false });
    console.log(`  ${a1.s}: ${JSON.stringify(a1.d).substring(0, 150)}`);
    await sleep(1000);
    console.log('A: Warmup ON...');
    let a2 = await api('PUT', `mailbox/${t._id}`, { warmupEnabled: true });
    console.log(`  ${a2.s}: ${JSON.stringify(a2.d).substring(0, 150)}`);

    // B: PUT reconnect
    console.log('\nB: PUT reconnect...');
    let b = await api('PUT', `mailbox/${t._id}/reconnect`);
    console.log(`  ${b.s}: ${JSON.stringify(b.d).substring(0, 150)}`);

    // C: POST reconnect
    console.log('\nC: POST reconnect...');
    let c = await api('POST', `mailbox/${t._id}/reconnect`);
    console.log(`  ${c.s}: ${JSON.stringify(c.d).substring(0, 150)}`);

    // D: Clear error
    console.log('\nD: PUT hasError=false...');
    let d = await api('PUT', `mailbox/${t._id}`, { hasError: false });
    console.log(`  ${d.s}: ${JSON.stringify(d.d).substring(0, 150)}`);

    // Check
    await sleep(2000);
    console.log('\nChecking final state...');
    let f = await api('GET', `mailbox/${t._id}`);
    let fd = f.d.data || f.d;
    console.log(`hasError: ${fd.hasError}`);
    console.log(`errMsg: ${JSON.stringify(fd.errMsg)}`);
    console.log(`emailAccountError: ${JSON.stringify(fd.emailAccountError).substring(0, 100)}`);

    // If it worked, apply to all
    if (!fd.hasError || (fd.errMsg && fd.errMsg[0] === 'reconnected.')) {
        console.log('\n=== Error cleared! Applying toggle to all 379... ===');
        let ok = 0;
        for (let i = 0; i < errs.length; i++) {
            try {
                await api('PUT', `mailbox/${errs[i]._id}`, { warmupEnabled: false });
                await sleep(100);
                await api('PUT', `mailbox/${errs[i]._id}`, { warmupEnabled: true });
                ok++;
                if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${errs.length}...`);
            } catch { }
            await sleep(50);
        }
        console.log(`\nDone: ${ok}/${errs.length} toggled`);
    } else {
        console.log('\n--- Error NOT cleared by any approach ---');
        console.log('These are cached errors that will clear on the next warmup cycle.');
    }
}

main().catch(console.error);
