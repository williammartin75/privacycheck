/**
 * Publish DKIM DNS records for VPS-25 domains via IONOS API
 * Domains: mailprivacycheck.cloud, mailprivacyreview.online
 * DKIM keys already exist on the VPS — just need DNS TXT records
 */
const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

// VPS-21 as SSH proxy for IONOS API (API unreachable from local)
const PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
// VPS-25 where mail server lives
const VPS25 = { ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q' };

const DOMAINS = ['mailprivacycheck.cloud', 'mailprivacyreview.online'];

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

function exec(conn, cmd, t = 60000) {
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
    // Step 1: Read DKIM public keys from VPS-25
    console.log('[1/4] Connecting to VPS-25 to read DKIM keys...');
    const vps = await sshConnect(VPS25.ip, VPS25.pass);

    const dkimValues = {};
    for (const domain of DOMAINS) {
        const raw = await exec(vps, `cat /etc/opendkim/keys/${domain}/mail.txt`);
        console.log(`\n  ${domain} raw key:\n  ${raw.replace(/\n/g, '\n  ')}`);

        const m = raw.match(/p=([A-Za-z0-9+/=\s"]+)"/);
        if (!m) { console.error(`  ❌ Could not extract p= for ${domain}`); continue; }
        // Clean: remove quotes, spaces, newlines
        const pValue = raw.match(/p=([^)]+)/)[1].replace(/[\s"]/g, '');
        dkimValues[domain] = `v=DKIM1; h=sha256; k=rsa; p=${pValue}`;
        console.log(`  ✅ Extracted DKIM key (${pValue.length} chars)`);
    }
    vps.end();

    if (Object.keys(dkimValues).length === 0) {
        console.error('No DKIM keys found!');
        return;
    }

    // Step 2: Also fix SPF to use -all instead of ~all
    console.log('\n[2/4] Connecting to IONOS API via VPS-21...');
    const proxy = await sshConnect(PROXY.ip, PROXY.pass);

    // Get all zones
    const zonesRaw = await exec(proxy, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`);
    const zones = JSON.parse(zonesRaw);
    console.log(`  Found ${zones.length} IONOS zones`);

    // Step 3: Add DKIM records + fix SPF
    for (const domain of DOMAINS) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) { console.log(`  ❌ ${domain} — zone not found in IONOS`); continue; }
        console.log(`\n[3/4] Processing ${domain} (zone ${zone.id})...`);

        // Get existing records to check for existing DKIM
        const recsRaw = await exec(proxy, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}"`);
        const zoneData = JSON.parse(recsRaw);
        const existingDkim = zoneData.records?.filter(r => r.name === `mail._domainkey.${domain}` && r.type === 'TXT') || [];

        // Delete existing DKIM records if any
        for (const rec of existingDkim) {
            console.log(`  Deleting old DKIM record ${rec.id}...`);
            await exec(proxy, `curl -s -X DELETE -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}/records/${rec.id}"`);
        }

        // Also check for existing SPF and fix it
        const existingSPF = zoneData.records?.filter(r => r.type === 'TXT' && r.content?.includes('v=spf1')) || [];
        for (const rec of existingSPF) {
            if (rec.content.includes('~all')) {
                console.log(`  Fixing SPF: ~all → -all (record ${rec.id})`);
                await exec(proxy, `curl -s -X DELETE -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}/records/${rec.id}"`);
                // Re-add with -all
                const spfRecord = JSON.stringify([{
                    name: domain, type: 'TXT',
                    content: rec.content.replace('~all', '-all'),
                    ttl: 3600, prio: 0, disabled: false
                }]);
                await exec(proxy, `printf '%s' '${spfRecord.replace(/'/g, "'\\''")}' > /tmp/spf.json`);
                const spfRes = await exec(proxy, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/spf.json "${API_BASE}/zones/${zone.id}/records"`);
                const spfStatus = spfRes.split('\n').pop();
                console.log(`  SPF update: HTTP ${spfStatus}`);
            }
        }

        // Add DKIM record
        if (dkimValues[domain]) {
            console.log(`  Adding DKIM record for ${domain}...`);
            const record = JSON.stringify([{
                name: `mail._domainkey.${domain}`, type: 'TXT',
                content: dkimValues[domain],
                ttl: 3600, prio: 0, disabled: false
            }]);
            await exec(proxy, `printf '%s' '${record.replace(/'/g, "'\\''")}' > /tmp/dkim.json`);
            const res = await exec(proxy, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/dkim.json "${API_BASE}/zones/${zone.id}/records"`);
            const lines = res.split('\n');
            const httpStatus = lines[lines.length - 1];
            if (httpStatus === '201' || httpStatus === '200') {
                console.log(`  ✅ DKIM record added for ${domain}!`);
            } else {
                console.log(`  ❌ HTTP ${httpStatus}: ${lines.slice(0, -1).join('')}`);
            }
        }
    }
    proxy.end();

    // Step 4: Verify DNS propagation
    console.log('\n[4/4] Waiting 10s for DNS propagation...');
    await new Promise(r => setTimeout(r, 10000));

    const verify = await sshConnect(PROXY.ip, PROXY.pass);
    for (const domain of DOMAINS) {
        const dig = await exec(verify, `dig +short TXT mail._domainkey.${domain} @8.8.8.8`);
        if (dig.includes('DKIM1')) {
            console.log(`  ✅ ${domain}: DKIM propagated!`);
        } else {
            console.log(`  ⏳ ${domain}: Not yet propagated (may take up to 1h)`);
            console.log(`     Result: ${dig || '(empty)'}`);
        }
    }
    verify.end();

    console.log('\nDone! DKIM should resolve within 1 hour max.');
}

main().catch(e => console.error('Error:', e.message));
