#!/usr/bin/env node
/**
 * Fix DKIM for privacyaudit.info on VPS-21
 * Read key from VPS, publish to IONOS DNS
 */
const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const VPS21 = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
const DOMAIN = 'privacyaudit.info';

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
    console.log(`Fixing DKIM for ${DOMAIN} on VPS-21...\n`);

    const conn = await sshConnect(VPS21.ip, VPS21.pass);
    console.log('Connected to VPS-21');

    // Step 1: Check if DKIM key exists on VPS
    const keyCheck = await exec(conn, `cat /etc/opendkim/keys/${DOMAIN}/mail.txt 2>/dev/null`);
    if (!keyCheck || keyCheck.includes('No such file')) {
        console.log('DKIM key does not exist, generating...');
        await exec(conn, `mkdir -p /etc/opendkim/keys/${DOMAIN}`);
        await exec(conn, `opendkim-genkey -b 2048 -d ${DOMAIN} -D /etc/opendkim/keys/${DOMAIN} -s mail -v`);
        await exec(conn, `chown -R opendkim:opendkim /etc/opendkim/keys/${DOMAIN}`);
        // Add to KeyTable and SigningTable
        await exec(conn, `grep -q "${DOMAIN}" /etc/opendkim/KeyTable || echo "mail._domainkey.${DOMAIN} ${DOMAIN}:mail:/etc/opendkim/keys/${DOMAIN}/mail.private" >> /etc/opendkim/KeyTable`);
        await exec(conn, `grep -q "${DOMAIN}" /etc/opendkim/SigningTable || echo "*@${DOMAIN} mail._domainkey.${DOMAIN}" >> /etc/opendkim/SigningTable`);
        await exec(conn, `grep -q "${DOMAIN}" /etc/opendkim/TrustedHosts || echo "${DOMAIN}" >> /etc/opendkim/TrustedHosts`);
        await exec(conn, 'systemctl restart opendkim postfix');
    }

    // Read the key
    const raw = await exec(conn, `cat /etc/opendkim/keys/${DOMAIN}/mail.txt`);
    console.log(`\nDKIM key:\n${raw}\n`);

    const pMatch = raw.match(/p=([^)]+)/);
    if (!pMatch) { console.error('Could not extract p= value'); conn.end(); return; }
    const pValue = pMatch[1].replace(/[\s"]/g, '');
    const dkimValue = `v=DKIM1; h=sha256; k=rsa; p=${pValue}`;
    console.log(`Extracted key (${pValue.length} chars)`);

    // Step 2: Publish to IONOS DNS
    console.log('\nPublishing to IONOS...');
    const zonesRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`);
    const zones = JSON.parse(zonesRaw);
    const zone = zones.find(z => z.name === DOMAIN);
    if (!zone) { console.error('Zone not found in IONOS!'); conn.end(); return; }

    // Check if record already exists
    const zoneRaw = await exec(conn, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}"`);
    const zoneData = JSON.parse(zoneRaw);
    const existingDkim = (zoneData.records || []).filter(r => r.name === `mail._domainkey.${DOMAIN}` && r.type === 'TXT');
    for (const rec of existingDkim) {
        console.log(`Deleting old DKIM record ${rec.id}...`);
        await exec(conn, `curl -s -X DELETE -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones/${zone.id}/records/${rec.id}"`);
    }

    // Add new record
    const record = JSON.stringify([{
        name: `mail._domainkey.${DOMAIN}`, type: 'TXT',
        content: dkimValue, ttl: 3600, prio: 0, disabled: false
    }]);
    await exec(conn, `printf '%s' '${record.replace(/'/g, "'\\''")}' > /tmp/dkim.json`);
    const res = await exec(conn, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/dkim.json "${API_BASE}/zones/${zone.id}/records"`);
    const httpStatus = res.split('\n').pop();

    if (httpStatus === '201' || httpStatus === '200') {
        console.log(`✅ DKIM record added for ${DOMAIN}!`);
    } else {
        console.log(`❌ HTTP ${httpStatus}: ${res}`);
    }

    // Step 3: Verify
    console.log('\nWaiting 10s for propagation...');
    await new Promise(r => setTimeout(r, 10000));
    const dig = await exec(conn, `dig +short TXT mail._domainkey.${DOMAIN} @8.8.8.8`);
    if (dig.includes('DKIM1') || dig.includes('p=')) {
        console.log(`✅ ${DOMAIN}: DKIM propagated!`);
    } else {
        console.log(`⏳ ${DOMAIN}: Not yet propagated (may take up to 1h)`);
    }

    conn.end();
    console.log('\nDone!');
}

main().catch(e => console.error('Error:', e.message));
