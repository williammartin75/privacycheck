#!/usr/bin/env node
/**
 * Check IONOS zones and configure DNS for the 15 new domains.
 * Uses VPS-11 as SSH proxy (confirmed working in previous runs).
 */
const { Client } = require('ssh2');
const fs = require('fs');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

// Use an old VPS that previously worked as proxy
const PROXY = { host: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' };

// Domain → IP mapping (from setup results)
const DOMAIN_IP = {
    'privacyaudit.online': '192.227.234.211',
    'privacy-audit.cloud': '192.227.234.211',
    'privacyaudit.cloud': '172.245.57.166',
    'privacyauditmail.cloud': '172.245.57.166',
    'mailprivacyaudit.online': '192.227.137.91',
    'mailprivacyaudit.cloud': '192.227.137.91',
    'mailprivacyaudit.site': '107.174.93.184',
    'mailprivacycheck.online': '107.174.93.184',
    'mailprivacycheck.cloud': '107.174.252.122',
    'mailprivacyreview.online': '107.174.252.122',
    'mailprivacyreview.info': '23.94.102.141',
    'mailprivacyreview.cloud': '23.94.102.141',
    'mailprivacyreview.site': '64.188.28.154',
    'mail-privacy-checker.online': '64.188.28.154',
    'mail-privacy-checker.info': '69.12.85.166',
};

function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => reject(new Error('SSH connect timeout')), 15000);
        conn.on('ready', () => { clearTimeout(timer); resolve(conn); });
        conn.on('error', (e) => { clearTimeout(timer); reject(e); });
        conn.connect({
            host, port: 22, username: 'root', password,
            readyTimeout: 15000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

function sshExec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Exec timeout: ${cmd.substring(0, 80)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve({ stdout, stderr }); });
        });
    });
}

async function main() {
    console.log('=== IONOS DNS Configuration ===\n');

    // Connect to proxy VPS
    let conn;
    try {
        console.log(`Connecting to proxy VPS (${PROXY.host})...`);
        conn = await sshConnect(PROXY.host, PROXY.pass);
        console.log('Connected!\n');
    } catch (e) {
        console.error('Cannot connect to proxy VPS:', e.message);
        // Try VPS-21 as fallback
        console.log('Trying VPS-21 as fallback...');
        try {
            conn = await sshConnect('192.227.234.211', 'Jd5Fh769E0hnmX9CqK');
            console.log('Connected to VPS-21!\n');
        } catch (e2) {
            console.error('Cannot connect to VPS-21 either:', e2.message);
            process.exit(1);
        }
    }

    // Step 1: List zones
    console.log('[1/2] Fetching IONOS zones...');
    const zonesResult = await sshExec(conn,
        `curl -s --connect-timeout 10 -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 20000);

    let zones;
    try {
        zones = JSON.parse(zonesResult.stdout);
    } catch {
        console.error('Failed to parse zones response.');
        console.error('stdout:', zonesResult.stdout.substring(0, 300));
        console.error('stderr:', zonesResult.stderr.substring(0, 300));
        conn.end();
        process.exit(1);
    }

    const zoneNames = zones.map(z => z.name);
    console.log(`  Total zones: ${zones.length}`);

    // Check which new domains are available
    const newDomains = Object.keys(DOMAIN_IP);
    const found = [];
    const missing = [];
    for (const d of newDomains) {
        if (zoneNames.includes(d)) {
            found.push(d);
        } else {
            missing.push(d);
        }
    }
    console.log(`  New domains found in IONOS: ${found.length}/15`);
    if (missing.length > 0) {
        console.log(`  Missing (not yet propagated): ${missing.join(', ')}`);
    }

    if (found.length === 0) {
        console.log('\n  ⚠️  No new domains found yet. They may need more time to propagate.');
        console.log('  Run this script again in 10-20 minutes.\n');

        // Show all available zones for debugging
        console.log('  Available zones:');
        zoneNames.forEach(n => console.log(`    - ${n}`));
        conn.end();
        process.exit(0);
    }

    // Step 2: Configure DNS for found domains
    console.log('\n[2/2] Configuring DNS records...\n');

    // Load DKIM keys
    let dkimKeys = {};
    try {
        dkimKeys = JSON.parse(fs.readFileSync('new_dkim_keys_21_30.json', 'utf8'));
        console.log(`  Loaded DKIM keys for ${Object.keys(dkimKeys).length} domains\n`);
    } catch {
        console.log('  ⚠️ No DKIM keys file, proceeding without DKIM records\n');
    }

    let success = 0, failed = 0;

    for (const domain of found) {
        const ip = DOMAIN_IP[domain];
        const zone = zones.find(z => z.name === domain);

        // Extract DKIM
        let dkimValue = '';
        const rawDkim = dkimKeys[domain] || '';
        const pMatch = rawDkim.match(/p=([A-Za-z0-9+/=\s"]+)/);
        if (pMatch) {
            dkimValue = pMatch[1].replace(/[\s"()]/g, '');
        }

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
                ttl: 3600, prio: 0, disabled: false
            });
        }

        // Write JSON to temp file on proxy, then POST
        const b64 = Buffer.from(JSON.stringify(records)).toString('base64');
        await sshExec(conn, `echo '${b64}' | base64 -d > /tmp/dns_records.json`);

        const curlCmd = `curl -s -w "\\n%{http_code}" -X POST ` +
            `-H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" ` +
            `-d @/tmp/dns_records.json "${API_BASE}/zones/${zone.id}/records"`;

        const result = await sshExec(conn, curlCmd, 15000);
        const lines = result.stdout.trim().split('\n');
        const httpStatus = lines[lines.length - 1];

        if (httpStatus === '201' || httpStatus === '200') {
            console.log(`  ✅ ${domain} → ${ip} (${records.length} recs${dkimValue ? ' +DKIM' : ''})`);
            success++;
        } else {
            console.log(`  ❌ ${domain}: HTTP ${httpStatus}`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    conn.end();
    console.log(`\n  DNS: ${success}/${found.length} OK, ${failed} failed`);
    if (missing.length > 0) {
        console.log(`  ${missing.length} domains still missing — re-run later`);
    }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
