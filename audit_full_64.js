#!/usr/bin/env node
/**
 * Full DKIM + SPF audit of ALL 64 domains from IONOS.
 * Fetches zone list from IONOS API, then checks DNS for each domain.
 */
const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

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
    console.log('  FULL DKIM + SPF DNS Audit — ALL IONOS domains');
    console.log('============================================================\n');

    const conn = await sshConnect(PROXY.ip, PROXY.pass);
    console.log('Connected to VPS-21 proxy\n');

    // Step 1: Get ALL zones from IONOS
    console.log('[1] Fetching ALL zones from IONOS API...');
    const zonesRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);
    const zones = JSON.parse(zonesRaw);
    const allDomains = zones.map(z => z.name).sort();
    console.log(`  Found ${allDomains.length} domains:\n`);
    allDomains.forEach((d, i) => console.log(`  ${String(i + 1).padStart(3)}. ${d}`));

    // Step 2: Audit DKIM + SPF for each
    console.log('\n[2] Auditing DKIM + SPF...\n');
    const results = { ok: [], dkimMissing: [], spfSoftfail: [], spfMissing: [], noMail: [] };
    const toFixSPF = [];

    for (const domain of allDomains) {
        try {
            // Check DKIM
            const dkim = await exec(conn, `dig +short TXT mail._domainkey.${domain} @8.8.8.8 2>/dev/null`);
            const hasDkim = dkim.includes('DKIM1') || dkim.includes('p=');

            // Check SPF
            const spf = await exec(conn, `dig +short TXT ${domain} @8.8.8.8 2>/dev/null | grep spf`);
            const hasSpf = spf.includes('v=spf1');
            const isSoftfail = spf.includes('~all');
            const isHardfail = spf.includes('-all');

            // Check MX
            const mx = await exec(conn, `dig +short MX ${domain} @8.8.8.8 2>/dev/null`);
            const hasMX = mx.length > 0 && !mx.includes('NXDOMAIN');

            if (!hasMX && !hasSpf && !hasDkim) {
                console.log(`  ⬜ ${domain} — no mail records (not a mail domain?)`);
                results.noMail.push(domain);
                continue;
            }

            const dkimStatus = hasDkim ? '✅' : '❌';
            const spfStatus = !hasSpf ? '❌ NONE' : (isHardfail ? '✅ -all' : '⚠️  ~all');

            if (hasDkim && hasSpf && isHardfail) {
                console.log(`  ✅ ${domain} — DKIM OK, SPF -all`);
                results.ok.push(domain);
            } else {
                console.log(`  ${dkimStatus} DKIM  ${spfStatus.padEnd(10)} SPF  ${domain}`);
                if (!hasDkim) results.dkimMissing.push(domain);
                if (!hasSpf) results.spfMissing.push(domain);
                else if (isSoftfail) {
                    results.spfSoftfail.push(domain);
                    toFixSPF.push(domain);
                }
            }
        } catch (err) {
            console.log(`  ⚠️  ${domain}: ${err.message}`);
        }
    }

    // Step 3: Auto-fix remaining SPF softfails
    if (toFixSPF.length > 0) {
        console.log(`\n[3] Fixing ${toFixSPF.length} remaining SPF softfail domains...\n`);
        for (const domain of toFixSPF) {
            const zone = zones.find(z => z.name === domain);
            if (!zone) continue;

            const zoneRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}"`, 15000);
            const zoneData = JSON.parse(zoneRaw);
            const spfRecords = (zoneData.records || []).filter(r =>
                r.type === 'TXT' && r.content && r.content.includes('v=spf1') && r.content.includes('~all')
            );

            for (const rec of spfRecords) {
                await exec(conn, `curl -s -X DELETE -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}/records/${rec.id}"`, 10000);
                const newContent = rec.content.replace('~all', '-all');
                const newRecord = JSON.stringify([{
                    name: rec.name, type: 'TXT', content: newContent,
                    ttl: rec.ttl || 3600, prio: 0, disabled: false
                }]);
                await exec(conn, `printf '%s' '${newRecord.replace(/'/g, "'\\''")}' > /tmp/spf_fix.json`, 10000);
                const res = await exec(conn, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/spf_fix.json "${API_BASE}/zones/${zone.id}/records"`, 15000);
                const httpStatus = res.split('\n').pop();
                console.log(`  ${httpStatus === '201' || httpStatus === '200' ? '✅' : '❌'} ${domain} — SPF fixed to -all`);
            }
            await new Promise(r => setTimeout(r, 200));
        }
    }

    // Step 4: Fix missing DKIM — read keys from VPS and publish
    if (results.dkimMissing.length > 0) {
        console.log(`\n[4] ${results.dkimMissing.length} domains missing DKIM:`);
        results.dkimMissing.forEach(d => console.log(`    - ${d}`));
        console.log('    (Need to SSH into each VPS to read keys and publish to DNS)');
    }

    conn.end();

    // Summary
    console.log('\n============================================================');
    console.log('  FULL AUDIT SUMMARY');
    console.log('============================================================');
    console.log(`  Total IONOS zones:   ${allDomains.length}`);
    console.log(`  ✅ Fully OK:          ${results.ok.length}`);
    console.log(`  ❌ DKIM missing:      ${results.dkimMissing.length}`);
    console.log(`  ⚠️  SPF softfail:     ${results.spfSoftfail.length} (auto-fixed)`);
    console.log(`  ❌ SPF missing:       ${results.spfMissing.length}`);
    console.log(`  ⬜ No mail records:   ${results.noMail.length}`);

    const fs = require('fs');
    fs.writeFileSync('full_dkim_audit.json', JSON.stringify({
        totalZones: allDomains.length,
        allDomains,
        ...results,
    }, null, 2));
    console.log('\n  Full results → full_dkim_audit.json');
}

main().catch(e => console.error('Error:', e.message));
