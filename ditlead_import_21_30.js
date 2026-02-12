const fs = require('fs');
const https = require('https');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const CSV_PATH = 'all_mailboxes_21_30.csv';
const DELAY = 1000;

function parseCSV(p) {
    return fs.readFileSync(p, 'utf-8').split('\n').filter(l => l.trim()).map(l => {
        const [email, password, ip] = l.split(',').map(s => s.trim());
        return { email, password, ip };
    });
}

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
    const rows = parseCSV(CSV_PATH);
    console.log(`=== Ditlead Import v3 — ${rows.length} mailboxes ===\n`);

    let success = 0, skip = 0, fail = 0;
    const fails = [];
    const t0 = Date.now();

    for (let i = 0; i < rows.length; i++) {
        const { email, password, ip } = rows[i];
        const name = email.split('@')[0];
        const domain = email.split('@')[1];

        const payload = {
            firstName: name.replace(/[0-9]/g, ''),
            lastName: domain.split('.')[0],
            smtp: { host: ip, port: 587, username: email, password, emailAddress: email, secure: false },
            imap: { host: ip, port: 143, username: email, password }
        };

        const ts = new Date().toLocaleTimeString('fr-FR');
        try {
            const r = await post(payload);
            const b = r.body;

            if (r.status === 200 || r.status === 201) {
                if (b.includes('already exist')) {
                    skip++;
                    process.stdout.write(`⏭ `);
                } else {
                    success++;
                    process.stdout.write(`✅ `);
                }
            } else {
                fail++;
                fails.push({ i, email, status: r.status, body: b.substring(0, 200) });
                process.stdout.write(`❌ `);
            }
        } catch (e) {
            fail++;
            fails.push({ i, email, error: e.message });
            process.stdout.write(`⏱ `);
        }

        // Progress line every 20
        if ((i + 1) % 20 === 0) {
            const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
            const eta = (((rows.length - i - 1) * (elapsed / (i + 1))) / 60).toFixed(1);
            console.log(` [${i + 1}/${rows.length}] s:${success} skip:${skip} f:${fail} ${ts} ETA:${eta}m`);
        }

        await new Promise(r => setTimeout(r, DELAY));
    }

    console.log(`\n\n=== DONE in ${((Date.now() - t0) / 60000).toFixed(1)} min ===`);
    console.log(`✅ ${success} | ⏭ ${skip} | ❌ ${fail} | Total: ${rows.length}`);

    if (fails.length > 0) {
        fs.writeFileSync('ditlead_failed_21_30.json', JSON.stringify(fails, null, 2));
        console.log(`\nFails saved to ditlead_failed_21_30.json`);
    }
}

main().catch(console.error);
