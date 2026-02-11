#!/usr/bin/env node
// ============================================================
// Update DKIM DNS records in IONOS for ALL 15 domains
// Fetches fresh DKIM keys from ALL 10 VPS, then updates DNS
// Uses IONOS API via VPS-11 SSH proxy (API unreachable from local)
// ============================================================

const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

const ALL_VPS = [
    { ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
    { ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domains: ['theprivacycheckerpro.cloud'] },
    { ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domains: ['theprivacycheckerpro.site'] },
    { ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domains: ['theprivacycheckerpro.online'] },
    { ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domains: ['theprivacycheckerpro.website'] },
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
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

async function main() {
    console.log('============================================================');
    console.log('  Update DKIM DNS in IONOS — All 15 domains');
    console.log('============================================================\n');

    // Step 1: Fetch fresh DKIM keys from ALL VPS
    console.log('[1/3] Fetching DKIM keys from all 10 VPS...');
    const dkimRecords = {};

    for (const vps of ALL_VPS) {
        try {
            const conn = await sshConnect(vps.ip, vps.pass);
            for (const domain of vps.domains) {
                try {
                    const result = await sshExec(conn, `cat /etc/opendkim/keys/${domain}/mail.txt`);
                    const pMatch = result.stdout.match(/p=([A-Za-z0-9+/=\s"]+)/);
                    if (pMatch) {
                        const pValue = pMatch[1].replace(/[\s"()]/g, '');
                        dkimRecords[domain] = `v=DKIM1; h=sha256; k=rsa; p=${pValue}`;
                        console.log(`  ✅ ${domain}`);
                    } else {
                        console.log(`  ❌ ${domain} — no p= found`);
                    }
                } catch (e) {
                    console.log(`  ❌ ${domain} — ${e.message}`);
                }
            }
            conn.end();
        } catch (e) {
            console.log(`  ❌ VPS ${vps.ip} — ${e.message}`);
        }
    }

    console.log(`\nTotal DKIM records: ${Object.keys(dkimRecords).length} / 15\n`);

    if (Object.keys(dkimRecords).length === 0) {
        console.log('No DKIM records found. Aborting.');
        return;
    }

    // Step 2: Connect to VPS-11 for IONOS API proxy + fetch zones
    console.log('[2/3] Connecting to VPS-11 for IONOS API + fetching zones...');
    const conn = await sshConnect(ALL_VPS[0].ip, ALL_VPS[0].pass);
    console.log('  ✅ Connected');

    const zonesResult = await sshExec(conn,
        `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);

    let zones;
    try {
        zones = JSON.parse(zonesResult.stdout);
    } catch {
        console.error('Failed to parse zones:', zonesResult.stdout.substring(0, 300));
        conn.end();
        return;
    }
    console.log(`  Found ${zones.length} zones\n`);

    // Step 3: Update/create DKIM TXT record for each domain
    console.log('[3/3] Updating DKIM records...\n');
    let success = 0, failed = 0;

    for (const [domain, dkimValue] of Object.entries(dkimRecords)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) {
            console.log(`  ❌ ${domain} — zone not found in IONOS`);
            failed++;
            continue;
        }

        // Get zone records
        const recordsResult = await sshExec(conn,
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
            // Update existing via PUT
            const updateData = JSON.stringify({
                content: dkimValue,
                ttl: 3600,
                prio: 0,
                disabled: false
            });
            // Escape single quotes for shell
            const escapedData = updateData.replace(/'/g, "'\\''");

            const updateResult = await sshExec(conn,
                `curl -s -w "\\n%{http_code}" -X PUT -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${escapedData}' "${API_BASE}/zones/${zone.id}/records/${existingDkim.id}"`, 30000);

            const lines = updateResult.stdout.trim().split('\n');
            const httpStatus = lines[lines.length - 1];

            if (httpStatus === '200' || httpStatus === '201') {
                console.log(`  ✅ ${domain} — DKIM updated`);
                success++;
            } else {
                console.log(`  ⚠️ ${domain} — update HTTP ${httpStatus}, trying create...`);
                // Fall through to create
                await createDkimRecord(conn, zone.id, domain, dkimValue);
                success++;
            }
        } else {
            // Create new
            const created = await createDkimRecord(conn, zone.id, domain, dkimValue);
            if (created) {
                console.log(`  ✅ ${domain} — DKIM created (new)`);
                success++;
            } else {
                console.log(`  ❌ ${domain} — create failed`);
                failed++;
            }
        }

        await new Promise(r => setTimeout(r, 300));
    }

    conn.end();

    console.log(`\n============================================================`);
    console.log(`  DONE: ${success}/${Object.keys(dkimRecords).length} updated, ${failed} failed`);
    console.log(`============================================================`);
}

async function createDkimRecord(conn, zoneId, domain, dkimValue) {
    const createData = JSON.stringify([{
        name: `mail._domainkey.${domain}`,
        type: 'TXT',
        content: dkimValue,
        ttl: 3600,
        prio: 0,
        disabled: false
    }]);
    const escapedData = createData.replace(/'/g, "'\\''");

    const result = await sshExec(conn,
        `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${escapedData}' "${API_BASE}/zones/${zoneId}/records"`, 30000);

    const lines = result.stdout.trim().split('\n');
    const httpStatus = lines[lines.length - 1];
    return httpStatus === '200' || httpStatus === '201';
}

main().catch(console.error);
