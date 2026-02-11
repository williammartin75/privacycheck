const fs = require('fs');
const https = require('https');

// ============================================
// CONFIGURATION - MODIFIE CES VALEURS
// ============================================
const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc'; // Platform API key from Ditlead
const API_BASE = 'api.ditlead.com'; // ou app.ditlead.com si ça ne marche pas
const CSV_PATH = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Strategy\\ditlead_all_mailboxes.csv';

// Delay between requests to avoid rate limiting (ms)
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds

// ============================================
// SCRIPT
// ============================================

function readCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const header = lines[0].split(',');
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        header.forEach((h, idx) => {
            row[h.trim()] = (values[idx] || '').trim();
        });
        rows.push(row);
    }
    return rows;
}

function buildPayload(row) {
    // SMTP: port 587 + STARTTLS = secure: false
    // SMTP: port 465 + SSL = secure: true
    const smtpSecure = row.smtp_encryption === 'SSL' || row.smtp_port === '465';

    return {
        firstName: row.first_name,
        lastName: row.last_name,
        smtp: {
            host: row.smtp_host,
            port: row.smtp_port,
            username: row.smtp_username,
            password: row.smtp_password,
            emailAddress: row.email,
            secure: smtpSecure
        },
        imap: {
            host: row.imap_host,
            port: row.imap_port,
            username: row.imap_username,
            password: row.imap_password
        }
    };
}

function postMailbox(payload) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);

        const options = {
            hostname: API_BASE,
            path: '/v1/mailbox',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.write(data);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('=== Ditlead Bulk Import ===');
    console.log(`API: https://${API_BASE}/v1/mailbox`);
    console.log(`CSV: ${CSV_PATH}`);
    console.log('');

    // Read CSV
    const rows = readCSV(CSV_PATH);
    console.log(`Total accounts to import: ${rows.length}`);
    console.log('');

    // Test with first account
    console.log('--- Testing with first account ---');
    const testPayload = buildPayload(rows[0]);
    console.log(`Email: ${testPayload.smtp.emailAddress}`);
    console.log(`SMTP: ${testPayload.smtp.host}:${testPayload.smtp.port} (secure: ${testPayload.smtp.secure})`);
    console.log(`IMAP: ${testPayload.imap.host}:${testPayload.imap.port}`);
    console.log('');

    try {
        const testResult = await postMailbox(testPayload);
        console.log(`Status: ${testResult.status}`);
        console.log(`Response: ${JSON.stringify(testResult.body, null, 2)}`);

        if (testResult.status === 403) {
            console.log('\n❌ AUTH ERROR - La clé API est incorrecte.');
            console.log('Va dans Ditlead > Settings > API pour copier ta clé API.');
            return;
        }

        if (testResult.status === 401) {
            console.log('\n❌ AUTH ERROR - Bearer token invalide.');
            console.log('Va dans Ditlead > Settings > API pour copier ta clé API.');
            return;
        }

        if (testResult.status !== 200 && testResult.status !== 201) {
            console.log(`\n⚠️ Unexpected status ${testResult.status}. Arrêt.`);
            console.log('Vérifie la réponse ci-dessus et ajuste la config.');
            return;
        }

        if (testResult.body && testResult.body.data === 'Email already exist') {
            console.log('\n⚠️ Ce compte existe déjà (normal). API fonctionne !');
        } else {
            console.log('\n✅ Premier compte importé avec succès !');
        }
        console.log('');
    } catch (e) {
        console.log(`\n❌ Error: ${e.message}`);
        if (e.message.includes('ENOTFOUND')) {
            console.log(`Le hostname "${API_BASE}" n'existe pas.`);
            console.log('Essaie de changer API_BASE en "app.ditlead.com"');
        }
        return;
    }

    // Ask to continue
    console.log(`Lancer l'import des ${rows.length - 1} comptes restants ?`);
    console.log('Relance avec: node ditlead_import.js --all');
    console.log('');

    if (!process.argv.includes('--all')) {
        console.log('(Ajoute --all pour importer tous les comptes)');
        return;
    }

    // Import all remaining accounts
    let success = 0;
    let skipped = 0;
    let failures = 0;
    const failedAccounts = [];

    for (let i = 0; i < rows.length; i++) {
        const payload = buildPayload(rows[i]);
        const email = payload.smtp.emailAddress;

        try {
            const result = await postMailbox(payload);

            if (result.status === 200 || result.status === 201) {
                if (result.body && result.body.data === 'Email already exist') {
                    skipped++;
                    console.log(`⏭️ [${i + 1}/${rows.length}] ${email} (déjà existant)`);
                } else {
                    success++;
                    console.log(`✅ [${i + 1}/${rows.length}] ${email}`);
                }
            } else {
                failures++;
                failedAccounts.push({ email, status: result.status, error: result.body });
                console.log(`❌ [${i + 1}/${rows.length}] ${email} - Status ${result.status}`);
            }
        } catch (e) {
            failures++;
            failedAccounts.push({ email, error: e.message });
            console.log(`❌ [${i + 1}/${rows.length}] ${email} - ${e.message}`);
        }

        // Rate limiting delay
        await sleep(DELAY_BETWEEN_REQUESTS);
    }

    // Summary
    console.log('\n=== RÉSUMÉ ===');
    console.log(`✅ Importés: ${success}`);
    console.log(`⏭️ Déjà existants: ${skipped}`);
    console.log(`❌ Échoués: ${failures}`);
    console.log(`📊 Total: ${rows.length}`);

    if (failedAccounts.length > 0) {
        fs.writeFileSync('ditlead_failed.json', JSON.stringify(failedAccounts, null, 2));
        console.log('\nLes comptes échoués sont sauvegardés dans ditlead_failed.json');
    }
}

main().catch(console.error);
