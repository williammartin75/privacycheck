#!/usr/bin/env node
/**
 * Fix SPF records for ALL 43 domains: change ~all → -all
 * Uses IONOS API via VPS-21 SSH proxy
 */
const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

// All 43 domains needing SPF fix (from audit)
const DOMAINS_TO_FIX = [
    'privacycheckermailpro.cloud', 'privacycheckermailpro.site',
    'privacycheckermailpro.website', 'privacycheckermailpro.space',
    'privacycheckermailpro.icu', 'privacy-checker-mail-pro.online',
    'privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site',
    'privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website',
    'privacy-checker-mail-pro.icu',
    'theprivacycheckerpro.cloud', 'theprivacycheckerpro.site',
    'theprivacycheckerpro.online', 'theprivacycheckerpro.website',
    'privacyaudit.online', 'privacy-audit.cloud',
    'privacyaudit.cloud', 'privacyauditmail.cloud',
    'mailprivacyaudit.online', 'mailprivacyaudit.cloud',
    'mailprivacyaudit.site', 'mailprivacycheck.online',
    'mailprivacyreview.info', 'mailprivacyreview.cloud',
    'mailprivacyreview.site', 'mail-privacy-checker.online',
    'mail-privacy-checker.info',
    'mailprivacychecker.space', 'mailprivacychecker.website',
    'contactprivacychecker.info', 'contactprivacychecker.cloud',
    'contactprivacychecker.site', 'contactprivacychecker.website',
    'reportprivacychecker.info', 'reportprivacychecker.cloud',
    'reportprivacychecker.site', 'reportprivacychecker.website',
    'checkprivacychecker.info', 'checkprivacychecker.cloud',
    'checkprivacychecker.site', 'checkprivacychecker.space',
    'checkprivacychecker.website',
];

function sshConnect(host, pass) {
    return new Promise((r, j) => {
        const c = new Client();
        c.on('ready', () => r(c));
        c.on('error', j);
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function exec(conn, cmd, t = 30000) {
    return new Promise((r, j) => {
        const tm = setTimeout(() => j(new Error('Timeout')), t);
        conn.exec(cmd, (e, s) => {
            if (e) { clearTimeout(tm); return j(e); }
            let o = '';
            s.on('data', d => o += d.toString());
            s.stderr.on('data', d => o += d.toString());
            s.on('close', () => { clearTimeout(tm); r(o.trim()); });
        });
    });
}

async function main() {
    console.log('============================================================');
    console.log('  Fix SPF: ~all → -all for 43 domains');
    console.log('============================================================\n');

    const conn = await sshConnect(PROXY.ip, PROXY.pass);
    console.log('Connected to VPS-21 proxy\n');

    // Fetch all zones
    const zonesRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);
    const zones = JSON.parse(zonesRaw);
    console.log(`Found ${zones.length} IONOS zones\n`);

    let fixed = 0, skipped = 0, errors = 0;

    for (const domain of DOMAINS_TO_FIX) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) { console.log(`  ❌ ${domain} — zone not found`); errors++; continue; }

        // Get zone records
        const zoneRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}"`, 15000);
        const zoneData = JSON.parse(zoneRaw);

        // Find SPF records with ~all
        const spfRecords = (zoneData.records || []).filter(r =>
            r.type === 'TXT' && r.content && r.content.includes('v=spf1') && r.content.includes('~all')
        );

        if (spfRecords.length === 0) {
            console.log(`  ⏩ ${domain} — already fixed or no SPF`);
            skipped++;
            continue;
        }

        for (const rec of spfRecords) {
            // Delete old record
            await exec(conn, `curl -s -X DELETE -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}/records/${rec.id}"`, 10000);

            // Create new record with -all
            const newContent = rec.content.replace('~all', '-all');
            const newRecord = JSON.stringify([{
                name: rec.name, type: 'TXT',
                content: newContent,
                ttl: rec.ttl || 3600, prio: 0, disabled: false
            }]);
            await exec(conn, `printf '%s' '${newRecord.replace(/'/g, "'\\''")}' > /tmp/spf_fix.json`, 10000);
            const res = await exec(conn, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/spf_fix.json "${API_BASE}/zones/${zone.id}/records"`, 15000);
            const httpStatus = res.split('\n').pop();

            if (httpStatus === '201' || httpStatus === '200') {
                console.log(`  ✅ ${domain} — SPF fixed to -all`);
                fixed++;
            } else {
                console.log(`  ❌ ${domain} — HTTP ${httpStatus}`);
                errors++;
            }
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    conn.end();

    console.log('\n============================================================');
    console.log('  SPF FIX SUMMARY');
    console.log('============================================================');
    console.log(`  ✅ Fixed:   ${fixed}`);
    console.log(`  ⏩ Skipped: ${skipped}`);
    console.log(`  ❌ Errors:  ${errors}`);
    console.log(`  Total:     ${DOMAINS_TO_FIX.length}`);
}

main().catch(e => console.error('Error:', e.message));
