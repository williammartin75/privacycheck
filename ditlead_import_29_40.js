const fs = require('fs');
const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const DELAY = 500; // 500ms between requests for speed

// Merge both CSVs
const csv1 = fs.readFileSync('all_mailboxes_29_30.csv', 'utf-8');
const csv2 = fs.readFileSync('all_mailboxes_31_40.csv', 'utf-8');
const allRows = (csv1 + '\n' + csv2).split('\n').filter(l => l.trim()).map(l => {
    const [email, password, ip] = l.split(',').map(s => s.trim());
    return { email, password, ip };
});

function post(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const req = https.request({
            hostname: 'api.ditlead.com', path: '/v1/mailbox', method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) },
            timeout: 30000
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', e => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')); });
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log(`=== Ditlead Import — ALL ${allRows.length} mailboxes (VPS 29-40) ===\n`);

    let success = 0, skip = 0, fail = 0;
    const fails = [];
    const t0 = Date.now();

    for (let i = 0; i < allRows.length; i++) {
        const { email, password, ip } = allRows[i];
        const name = email.split('@')[0];
        const domain = email.split('@')[1];

        const payload = {
            firstName: name.replace(/[0-9]/g, ''),
            lastName: domain.split('.')[0],
            smtp: { host: ip, port: 587, username: email, password, emailAddress: email, secure: false },
            imap: { host: ip, port: 143, username: email, password }
        };

        try {
            const r = await post(payload);
            if (r.status === 200 || r.status === 201) {
                if (r.body.includes('already exist')) {
                    skip++;
                    process.stdout.write(`⏭ `);
                } else {
                    success++;
                    process.stdout.write(`✅ `);
                }
            } else {
                fail++;
                fails.push({ i, email, status: r.status, body: r.body.substring(0, 200) });
                process.stdout.write(`❌ `);
            }
        } catch (e) {
            fail++;
            fails.push({ i, email, error: e.message });
            process.stdout.write(`⏱ `);
        }

        if ((i + 1) % 20 === 0) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
            const eta = (((allRows.length - i - 1) * (elapsed / (i + 1))) / 60).toFixed(1);
            console.log(` [${i + 1}/${allRows.length}] ✅${success} ⏭${skip} ❌${fail} ETA:${eta}m`);
        }

        await new Promise(r => setTimeout(r, DELAY));
    }

    console.log(`\n\n=== DONE in ${((Date.now() - t0) / 60000).toFixed(1)} min ===`);
    console.log(`✅ ${success} | ⏭ ${skip} | ❌ ${fail} | Total: ${allRows.length}`);

    if (fails.length > 0) {
        fs.writeFileSync('ditlead_failed_29_40.json', JSON.stringify(fails, null, 2));
        console.log(`\nFails saved to ditlead_failed_29_40.json`);
    }
}

main().catch(console.error);
