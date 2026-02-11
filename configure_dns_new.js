#!/usr/bin/env node
// ============================================================
// Configure DNS via IONOS API — runs API calls through VPS-11 SSH
// (IONOS API unreachable from local machine, works from VPS)
// ============================================================

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

const VPS_SSH = { host: '107.174.93.166', password: 'Ny75V1Z3IwZ6ipB4xp' };

const DOMAIN_IP_MAP = {
    'privacycheckermailpro.cloud': '107.174.93.166',
    'privacycheckermailpro.site': '107.174.93.166',
    'privacycheckermailpro.website': '23.94.103.173',
    'privacycheckermailpro.space': '23.94.103.173',
    'privacycheckermailpro.icu': '23.95.37.92',
    'privacy-checker-mail-pro.online': '23.95.37.92',
    'privacy-checker-mail-pro.cloud': '23.94.103.174',
    'privacy-checker-mail-pro.site': '23.94.103.174',
    'privacy-checker-mail-pro.space': '192.227.193.17',
    'privacy-checker-mail-pro.website': '192.227.193.17',
    'privacy-checker-mail-pro.icu': '107.174.93.172',
    'theprivacycheckerpro.cloud': '107.174.88.210',
    'theprivacycheckerpro.site': '23.95.215.19',
    'theprivacycheckerpro.online': '107.175.214.243',
    'theprivacycheckerpro.website': '107.172.30.53',
};

const DKIM_FILE = path.join(__dirname, 'new_dkim_keys.json');

function sshExec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve({ stdout, stderr }); });
        });
    });
}

function sshConnect() {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: VPS_SSH.host, port: 22, username: 'root', password: VPS_SSH.password,
            readyTimeout: 15000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

async function main() {
    console.log('============================================================');
    console.log('  IONOS DNS Configuration — via VPS-11 SSH proxy');
    console.log('============================================================\n');

    // Load DKIM keys
    let dkimKeys = {};
    if (fs.existsSync(DKIM_FILE)) {
        dkimKeys = JSON.parse(fs.readFileSync(DKIM_FILE, 'utf8'));
        console.log(`Loaded DKIM keys for ${Object.keys(dkimKeys).length} domains\n`);
    }

    const conn = await sshConnect();
    console.log('Connected to VPS-11 for API proxy\n');

    // Step 1: Get zones
    console.log('[1/2] Fetching zones...');
    const zonesResult = await sshExec(conn,
        `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);

    let zones;
    try {
        zones = JSON.parse(zonesResult.stdout);
    } catch {
        console.error('Failed to parse zones:', zonesResult.stdout.substring(0, 200));
        conn.end();
        return;
    }
    console.log(`  Found ${zones.length} zones\n`);

    // Step 2: Create records for each domain
    console.log('[2/2] Creating DNS records...\n');
    let success = 0, failed = 0;

    for (const [domain, ip] of Object.entries(DOMAIN_IP_MAP)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) {
            console.log(`  ❌ ${domain} — zone not found`);
            failed++;
            continue;
        }

        // Extract DKIM p= value
        let dkimValue = '';
        const rawDkim = dkimKeys[domain] || '';
        const pMatch = rawDkim.match(/p=([A-Za-z0-9+/=\s"]+)/);
        if (pMatch) {
            dkimValue = pMatch[1].replace(/[\s"()]/g, '');
        }

        // Build records JSON
        const records = [
            { name: domain, type: 'A', content: ip, ttl: 3600, prio: 0, disabled: false },
            { name: `mail.${domain}`, type: 'A', content: ip, ttl: 3600, prio: 0, disabled: false },
            { name: domain, type: 'MX', content: `mail.${domain}`, ttl: 3600, prio: 10, disabled: false },
            { name: domain, type: 'TXT', content: `v=spf1 ip4:${ip} ~all`, ttl: 3600, prio: 0, disabled: false },
            { name: `_dmarc.${domain}`, type: 'TXT', content: 'v=DMARC1; p=quarantine; pct=100', ttl: 3600, prio: 0, disabled: false },
        ];

        if (dkimValue) {
            records.push({
                name: `mail._domainkey.${domain}`,
                type: 'TXT',
                content: `v=DKIM1; h=sha256; k=rsa; p=${dkimValue}`,
                ttl: 3600,
                prio: 0,
                disabled: false
            });
        }

        const jsonData = JSON.stringify(records).replace(/'/g, "'\\''");

        // POST via curl through SSH
        const curlCmd = `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${jsonData}' "${API_BASE}/zones/${zone.id}/records"`;

        const result = await sshExec(conn, curlCmd, 30000);
        const lines = result.stdout.trim().split('\n');
        const httpStatus = lines[lines.length - 1];

        if (httpStatus === '201' || httpStatus === '200') {
            console.log(`  ✅ ${domain} → ${ip} (${records.length} records)`);
            success++;
        } else {
            console.log(`  ❌ ${domain}: HTTP ${httpStatus} — ${lines.slice(0, -1).join('').substring(0, 100)}`);
            failed++;
        }

        // Small delay
        await new Promise(r => setTimeout(r, 300));
    }

    conn.end();

    console.log(`\n============================================================`);
    console.log(`  DNS COMPLETE: ${success}/15 domains OK, ${failed} failed`);
    console.log(`============================================================`);
    console.log(`\nNext: Import mailboxes to Ditlead`);
}

main().catch(console.error);
