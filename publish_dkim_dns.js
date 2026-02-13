#!/usr/bin/env node
/**
 * Publish DKIM DNS records for ALL 17 domains via IONOS API
 * Uses existing pattern: SSH proxy through VPS-21, X-API-Key header
 * Based on working update_dkim_dns.js pattern
 */
const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

const VPS_FLEET = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacyaudit.info'] },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'] },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', domains: ['contactprivacychecker.info'] },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', domains: ['contactprivacychecker.cloud'] },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', domains: ['contactprivacychecker.site', 'contactprivacychecker.website'] },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N', domains: ['reportprivacychecker.info', 'reportprivacychecker.cloud'] },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm', domains: ['reportprivacychecker.site', 'reportprivacychecker.website'] },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y', domains: ['checkprivacychecker.info', 'checkprivacychecker.cloud'] },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', domains: ['checkprivacychecker.site'] },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', domains: ['checkprivacychecker.space'] },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', domains: ['checkprivacychecker.website'] },
];

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

function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host, port: 22, username: 'root', password,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   PUBLISH DKIM DNS — ALL 17 DOMAINS          ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    // Step 1: Fetch DKIM keys from ALL VPS
    console.log('[1/3] Fetching DKIM keys from 11 VPS...\n');
    const dkimRecords = {};

    for (const vps of VPS_FLEET) {
        try {
            const conn = await sshConnect(vps.ip, vps.pass);
            for (const domain of vps.domains) {
                try {
                    const result = await sshExec(conn, `cat /etc/opendkim/keys/${domain}/mail.txt`);
                    const pMatch = result.stdout.match(/p=([A-Za-z0-9+/=\s"]+)/);
                    if (pMatch) {
                        const pValue = pMatch[1].replace(/[\s"()]/g, '');
                        dkimRecords[domain] = `v=DKIM1; h=sha256; k=rsa; p=${pValue}`;
                        console.log(`  ✅ VPS-${vps.id} ${domain}`);
                    } else {
                        console.log(`  ❌ VPS-${vps.id} ${domain} — no p= found`);
                    }
                } catch (e) {
                    console.log(`  ❌ VPS-${vps.id} ${domain} — ${e.message}`);
                }
            }
            conn.end();
        } catch (e) {
            console.log(`  ❌ VPS-${vps.id} ${vps.ip} — ${e.message}`);
        }
    }

    console.log(`\nTotal: ${Object.keys(dkimRecords).length}/17 keys\n`);

    // Step 2: Connect to VPS-21 for IONOS API proxy
    console.log('[2/3] Connecting to VPS-21 for IONOS API...');
    const proxy = await sshConnect(VPS_FLEET[0].ip, VPS_FLEET[0].pass);
    console.log('  ✅ Connected\n');

    // Get zones
    const zonesResult = await sshExec(proxy,
        `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);

    let zones;
    try {
        zones = JSON.parse(zonesResult.stdout);
    } catch {
        console.error('Failed to parse zones:', zonesResult.stdout.substring(0, 300));
        proxy.end();
        return;
    }
    console.log(`  Found ${zones.length} zones\n`);

    // Step 3: Create/update DKIM TXT records
    console.log('[3/3] Publishing DKIM records...\n');
    let success = 0, failed = 0;

    for (const [domain, dkimValue] of Object.entries(dkimRecords)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) {
            console.log(`  ❌ ${domain} — zone not found in IONOS`);
            failed++;
            continue;
        }

        // Get zone records
        const recordsResult = await sshExec(proxy,
            `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}"`, 30000);

        let zoneData;
        try {
            zoneData = JSON.parse(recordsResult.stdout);
        } catch {
            console.log(`  ❌ ${domain} — failed to get zone records`);
            failed++;
            continue;
        }

        const existingDkim = (zoneData.records || []).find(r =>
            r.type === 'TXT' && r.name === `mail._domainkey.${domain}`
        );

        if (existingDkim) {
            // Update existing
            const updateData = JSON.stringify({
                content: dkimValue,
                ttl: 3600,
                prio: 0,
                disabled: false
            }).replace(/'/g, "'\\''");

            const updateResult = await sshExec(proxy,
                `curl -s -w "\\n%{http_code}" -X PUT -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${updateData}' "${API_BASE}/zones/${zone.id}/records/${existingDkim.id}"`, 30000);

            const lines = updateResult.stdout.trim().split('\n');
            const httpStatus = lines[lines.length - 1];

            if (httpStatus === '200' || httpStatus === '201') {
                console.log(`  🔄 ${domain} — DKIM updated`);
                success++;
            } else {
                console.log(`  ⚠️ ${domain} — update ${httpStatus}, trying create...`);
                const created = await createDkimRecord(proxy, zone.id, domain, dkimValue);
                if (created) { success++; } else { failed++; }
            }
        } else {
            // Create new
            const created = await createDkimRecord(proxy, zone.id, domain, dkimValue);
            if (created) {
                console.log(`  ✅ ${domain} — DKIM created`);
                success++;
            } else {
                console.log(`  ❌ ${domain} — create failed`);
                failed++;
            }
        }

        await new Promise(r => setTimeout(r, 300));
    }

    proxy.end();

    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  DONE: ${success}/${Object.keys(dkimRecords).length} published, ${failed} failed       ║`);
    console.log(`╚══════════════════════════════════════════════╝`);
}

async function createDkimRecord(conn, zoneId, domain, dkimValue) {
    const createData = JSON.stringify([{
        name: `mail._domainkey.${domain}`,
        type: 'TXT',
        content: dkimValue,
        ttl: 3600,
        prio: 0,
        disabled: false
    }]).replace(/'/g, "'\\''");

    const result = await sshExec(conn,
        `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${createData}' "${API_BASE}/zones/${zoneId}/records"`, 30000);

    const lines = result.stdout.trim().split('\n');
    const httpStatus = lines[lines.length - 1];
    return httpStatus === '200' || httpStatus === '201';
}

main().catch(console.error);
