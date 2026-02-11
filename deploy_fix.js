const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// ============================================================
// DEPLOY FIX TO ALL VPS + RE-FETCH + REGENERATE CSV
// Usage: node deploy_fix.js [--skip-deploy] [--skip-fetch] [--skip-ditlead]
// ============================================================

const VPS_LIST = [
    { id: 'vps-01', ip: '107.174.93.156', pw: '4uZeYG82Wgf5tf0Y7B', domains: ['privacy-checker-pro.online', 'privacy-checker-pro.cloud'] },
    { id: 'vps-02', ip: '198.12.71.145', pw: '7P6LB61mlnNaoo8S0Z', domains: ['privacy-checker-pro.site', 'privacy-checker-pro.website'] },
    { id: 'vps-03', ip: '206.217.139.115', pw: '20QEs9OSh8Bw3egI1q', domains: ['mailprivacycheckerpro.site', 'mailprivacycheckerpro.icu'] },
    { id: 'vps-04', ip: '206.217.139.116', pw: 'JvSg1HPu956fAt0dY0', domains: ['mailprivacycheckerpro.cloud', 'mailprivacycheckerpro.space'] },
    { id: 'vps-05', ip: '23.95.242.32', pw: 'v6Jk79EUE15reqJ3zB', domains: ['mailprivacycheckerpro.website', 'mail-privacy-checker-pro.cloud'] },
    { id: 'vps-06', ip: '192.3.86.156', pw: 'H77WKufh2r9lVX3iP6', domains: ['mail-privacy-checker-pro.site'] },
    { id: 'vps-07', ip: '107.175.83.186', pw: '1KiaL7RpwAng23B08L', domains: ['mail-privacy-checker-pro.website'] },
    { id: 'vps-08', ip: '23.226.135.153', pw: 'dIKsL94sx6o8u7SAA1', domains: ['reviewprivacycheckerpro.cloud'] },
    { id: 'vps-09', ip: '64.188.29.151', pw: '1EQpF0fSapC610hjK3', domains: ['reviewprivacycheckerpro.site'] },
    { id: 'vps-10', ip: '23.94.240.173', pw: 'L5fgrQ6I84E3uvR2Nn', domains: ['reviewprivacycheckerpro.online'] },
];

const FIX_SCRIPT_PATH = path.join(__dirname, 'fix_vps.sh');
const OUTPUT_DIR = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'All unique mails', 'Professional mails', 'URLS', 'Cleaned Chunks analysis', 'Domains with issues', 'Emails to contact', 'By languages', 'Real emails', 'Strategy');

// SSH helpers
function sshExec(vps, command, timeout = 120000) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        let output = '';
        let errOutput = '';
        const timer = setTimeout(() => { conn.end(); reject(new Error('SSH command timeout')); }, timeout);

        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                stream.on('data', chunk => { output += chunk.toString(); });
                stream.stderr.on('data', chunk => { errOutput += chunk.toString(); });
                stream.on('close', (code) => {
                    clearTimeout(timer);
                    conn.end();
                    resolve({ code, output, errOutput });
                });
            });
        });
        conn.on('error', err => { clearTimeout(timer); reject(err); });
        conn.connect({
            host: vps.ip,
            port: 22,
            username: 'root',
            password: vps.pw,
            readyTimeout: 15000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1',
                    'diffie-hellman-group14-sha256']
            }
        });
    });
}

function sshUpload(vps, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.sftp((err, sftp) => {
                if (err) { conn.end(); return reject(err); }
                const readStream = fs.createReadStream(localPath);
                const writeStream = sftp.createWriteStream(remotePath);
                writeStream.on('close', () => { conn.end(); resolve(); });
                writeStream.on('error', (err) => { conn.end(); reject(err); });
                readStream.pipe(writeStream);
            });
        });
        conn.on('error', err => reject(err));
        conn.connect({
            host: vps.ip,
            port: 22,
            username: 'root',
            password: vps.pw,
            readyTimeout: 15000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1',
                    'diffie-hellman-group14-sha256']
            }
        });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// PHASE 1: Deploy fix_vps.sh to all VPS
// ============================================================
async function deployFix() {
    console.log('\n========================================');
    console.log('  PHASE 1: Deploy fix_vps.sh to all VPS');
    console.log('========================================\n');

    const fixScript = fs.readFileSync(FIX_SCRIPT_PATH, 'utf-8');
    const results = [];

    for (const vps of VPS_LIST) {
        const domainArgs = vps.domains.join(' ');
        console.log(`\n[${vps.id}] ${vps.ip} — Domains: ${domainArgs}`);

        try {
            // Step 1: Upload fix script
            console.log(`  [1/3] Uploading fix_vps.sh...`);
            await sshUpload(vps, FIX_SCRIPT_PATH, '/root/fix_vps.sh');
            console.log(`  [1/3] ✅ Uploaded`);

            // Step 2: Make executable
            console.log(`  [2/3] Making executable...`);
            await sshExec(vps, 'chmod +x /root/fix_vps.sh');
            console.log(`  [2/3] ✅ Done`);

            // Step 3: Run fix script (allow 5 min per VPS)
            console.log(`  [3/3] Running fix_vps.sh ${domainArgs}...`);
            const result = await sshExec(vps, `bash /root/fix_vps.sh ${domainArgs}`, 300000);

            if (result.code === 0) {
                console.log(`  [3/3] ✅ Fix applied successfully!`);
                // Show last few lines of output
                const lastLines = result.output.split('\n').slice(-10).join('\n');
                console.log(`  Output:\n${lastLines}`);
                results.push({ vps: vps.id, ip: vps.ip, status: 'OK' });
            } else {
                console.log(`  [3/3] ❌ Exit code: ${result.code}`);
                console.log(`  STDERR: ${result.errOutput.substring(0, 500)}`);
                results.push({ vps: vps.id, ip: vps.ip, status: 'FAILED', error: result.errOutput.substring(0, 200) });
            }
        } catch (err) {
            console.log(`  ❌ Error: ${err.message}`);
            results.push({ vps: vps.id, ip: vps.ip, status: 'ERROR', error: err.message });
        }

        // Small delay between VPS
        await sleep(2000);
    }

    console.log('\n--- Phase 1 Summary ---');
    for (const r of results) {
        console.log(`  ${r.status === 'OK' ? '✅' : '❌'} ${r.vps} (${r.ip}): ${r.status}${r.error ? ' - ' + r.error : ''}`);
    }
    return results;
}

// ============================================================
// PHASE 2: Fetch new credentials from all VPS
// ============================================================
async function fetchCredentials() {
    console.log('\n========================================');
    console.log('  PHASE 2: Fetch new credentials');
    console.log('========================================\n');

    const allMailboxes = [];

    for (const vps of VPS_LIST) {
        try {
            console.log(`[${vps.id}] Fetching /root/mailboxes.txt...`);
            const result = await sshExec(vps, 'cat /root/mailboxes.txt');
            const lines = result.output.split('\n').filter(l => l.trim() && l.includes('@'));
            console.log(`[${vps.id}] ✅ ${lines.length} mailboxes`);

            for (const line of lines) {
                const parts = line.trim().split(',');
                if (parts.length >= 3) {
                    allMailboxes.push({
                        email: parts[0],
                        password: parts[1],
                        ip: parts[2],
                        vps: vps.id
                    });
                }
            }
        } catch (err) {
            console.error(`[${vps.id}] ❌ FAILED: ${err.message}`);
        }
    }

    console.log(`\nTotal: ${allMailboxes.length} mailboxes collected\n`);

    // Generate CSV
    const csvHeader = 'first_name,last_name,email,smtp_host,smtp_port,smtp_username,smtp_password,smtp_encryption,imap_host,imap_port,imap_username,imap_password,imap_encryption';
    const csvLines = allMailboxes.map(mb => {
        const prefix = mb.email.split('@')[0].replace(/\d+$/, '');
        const firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        const pw = mb.password.includes(',') ? `"${mb.password}"` : mb.password;
        return [firstName, 'PrivacyChecker', mb.email, mb.ip, 587, mb.email, pw, 'STARTTLS', mb.ip, 993, mb.email, pw, 'SSL'].join(',');
    });

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const csvPath = path.join(OUTPUT_DIR, 'ditlead_all_mailboxes.csv');

    // Backup old CSV
    if (fs.existsSync(csvPath)) {
        fs.copyFileSync(csvPath, csvPath.replace('.csv', '_backup.csv'));
        console.log('✅ Old CSV backed up');
    }

    fs.writeFileSync(csvPath, csvHeader + '\n' + csvLines.join('\n'), 'utf-8');
    console.log(`✅ New CSV written: ${csvPath} (${csvLines.length} rows)`);

    return allMailboxes;
}

// ============================================================
// PHASE 3: Delete all Ditlead accounts & re-import
// ============================================================
async function resetDitlead(allMailboxes) {
    console.log('\n========================================');
    console.log('  PHASE 3: Reset Ditlead accounts');
    console.log('========================================\n');

    const https = require('https');
    const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
    const API_BASE = 'api.ditlead.com';

    function apiRequest(method, apiPath, body) {
        return new Promise((resolve, reject) => {
            const data = body ? JSON.stringify(body) : null;
            const options = {
                hostname: API_BASE, path: apiPath, method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
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

    // Step 1: Get all existing mailboxes
    console.log('Fetching existing Ditlead mailboxes...');
    const existing = await apiRequest('GET', '/v1/mailbox');
    if (existing.status !== 200 || !existing.body?.success) {
        console.log('❌ Failed to fetch existing mailboxes:', JSON.stringify(existing.body));
        return;
    }

    const existingEmails = existing.body.data || [];
    console.log(`Found ${existingEmails.length} existing mailboxes\n`);

    // Step 2: Delete all existing
    if (existingEmails.length > 0) {
        console.log('Deleting all existing mailboxes...');
        let deleted = 0;
        for (const mb of existingEmails) {
            try {
                const del = await apiRequest('DELETE', '/v1/mailbox', { mailboxAddress: mb.mailboxAddress });
                deleted++;
                process.stdout.write(`\r  Deleted: ${deleted}/${existingEmails.length}`);
                await sleep(500);
            } catch (err) {
                console.log(`\n  ❌ Failed to delete ${mb.mailboxAddress}: ${err.message}`);
            }
        }
        console.log(`\n✅ Deleted ${deleted} mailboxes\n`);
    }

    // Step 3: Re-import all mailboxes
    console.log(`Importing ${allMailboxes.length} mailboxes...\n`);

    let success = 0, skipped = 0, failures = 0;
    const failedAccounts = [];

    for (let i = 0; i < allMailboxes.length; i++) {
        const mb = allMailboxes[i];
        const prefix = mb.email.split('@')[0].replace(/\d+$/, '');
        const firstName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        const smtpSecure = false; // port 587 = STARTTLS = secure: false

        const payload = {
            firstName,
            lastName: 'PrivacyChecker',
            smtp: {
                host: mb.ip,
                port: '587',
                username: mb.email,
                password: mb.password,
                emailAddress: mb.email,
                secure: smtpSecure
            },
            imap: {
                host: mb.ip,
                port: '993',
                username: mb.email,
                password: mb.password
            }
        };

        try {
            const result = await apiRequest('POST', '/v1/mailbox', payload);
            if (result.status === 200 || result.status === 201) {
                if (result.body?.data === 'Email already exist') {
                    skipped++;
                    process.stdout.write(`\r⏭️ [${i + 1}/${allMailboxes.length}] ${mb.email} (exists)     `);
                } else {
                    success++;
                    process.stdout.write(`\r✅ [${i + 1}/${allMailboxes.length}] ${mb.email}              `);
                }
            } else {
                failures++;
                failedAccounts.push({ email: mb.email, status: result.status, error: result.body });
                process.stdout.write(`\r❌ [${i + 1}/${allMailboxes.length}] ${mb.email} - ${result.status}  `);
            }
        } catch (err) {
            failures++;
            failedAccounts.push({ email: mb.email, error: err.message });
            process.stdout.write(`\r❌ [${i + 1}/${allMailboxes.length}] ${mb.email} - ${err.message}  `);
        }

        await sleep(2000); // Rate limit
    }

    console.log('\n\n=== RÉSUMÉ FINAL ===');
    console.log(`✅ Importés: ${success}`);
    console.log(`⏭️ Déjà existants: ${skipped}`);
    console.log(`❌ Échoués: ${failures}`);
    console.log(`📊 Total: ${allMailboxes.length}`);

    if (failedAccounts.length > 0) {
        const failPath = path.join(OUTPUT_DIR, 'ditlead_failed.json');
        fs.writeFileSync(failPath, JSON.stringify(failedAccounts, null, 2));
        console.log(`\nÉchoués sauvegardés: ${failPath}`);
    }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  DITLEAD FIX & DEPLOY - All-in-One     ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`\nVPS count: ${VPS_LIST.length}`);
    console.log(`Total domains: ${VPS_LIST.reduce((a, v) => a + v.domains.length, 0)}`);
    console.log(`Fix script: ${FIX_SCRIPT_PATH}`);
    console.log('');

    const skipDeploy = process.argv.includes('--skip-deploy');
    const skipFetch = process.argv.includes('--skip-fetch');
    const skipDitlead = process.argv.includes('--skip-ditlead');

    // Phase 1: Deploy fix
    let deployResults;
    if (!skipDeploy) {
        deployResults = await deployFix();
        const failedCount = deployResults.filter(r => r.status !== 'OK').length;
        if (failedCount > 0) {
            console.log(`\n⚠️ ${failedCount} VPS failed. Fix these manually before continuing.`);
            console.log('Re-run with: node deploy_fix.js --skip-deploy');
            if (failedCount === VPS_LIST.length) return;
        }
    } else {
        console.log('⏭️ Skipping deploy (--skip-deploy)');
    }

    // Phase 2: Fetch credentials
    let allMailboxes;
    if (!skipFetch) {
        allMailboxes = await fetchCredentials();
        if (allMailboxes.length === 0) {
            console.log('❌ No mailboxes fetched. Aborting.');
            return;
        }
    } else {
        console.log('⏭️ Skipping fetch (--skip-fetch)');
    }

    // Phase 3: Ditlead reset & re-import
    if (!skipDitlead && allMailboxes) {
        await resetDitlead(allMailboxes);
    } else if (skipDitlead) {
        console.log('⏭️ Skipping Ditlead (--skip-ditlead)');
    }

    console.log('\n✅ All done!');
}

main().catch(console.error);
