const { Client } = require('ssh2');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const DOMAIN = 'contactprivacychecker.cloud';
const VPS33 = { ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' };
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
    // Step 1: Generate DKIM key on VPS-33 and configure OpenDKIM
    console.log('[1] Connecting to VPS-33...');
    const vps = await sshConnect(VPS33.ip, VPS33.pass);

    // Check what's there
    const existing = await exec(vps, 'ls /etc/opendkim/keys/ 2>/dev/null');
    console.log('  Existing DKIM dirs:', existing || '(none)');

    // Generate DKIM key for the domain
    console.log(`\n[2] Generating DKIM key for ${DOMAIN}...`);
    await exec(vps, `mkdir -p /etc/opendkim/keys/${DOMAIN}`);
    await exec(vps, `opendkim-genkey -b 2048 -d ${DOMAIN} -D /etc/opendkim/keys/${DOMAIN} -s mail -v`);
    await exec(vps, `chown -R opendkim:opendkim /etc/opendkim/keys/${DOMAIN}`);

    // Add to KeyTable and SigningTable
    console.log('[3] Updating OpenDKIM config...');
    await exec(vps, `grep -q "${DOMAIN}" /etc/opendkim/KeyTable || echo "mail._domainkey.${DOMAIN} ${DOMAIN}:mail:/etc/opendkim/keys/${DOMAIN}/mail.private" >> /etc/opendkim/KeyTable`);
    await exec(vps, `grep -q "${DOMAIN}" /etc/opendkim/SigningTable || echo "*@${DOMAIN} mail._domainkey.${DOMAIN}" >> /etc/opendkim/SigningTable`);
    await exec(vps, `grep -q "${DOMAIN}" /etc/opendkim/TrustedHosts || echo "${DOMAIN}" >> /etc/opendkim/TrustedHosts`);

    // Restart OpenDKIM + Postfix
    await exec(vps, 'systemctl restart opendkim postfix');
    const status = await exec(vps, 'systemctl is-active opendkim');
    console.log('  OpenDKIM status:', status);

    // Get DKIM key
    const dkimRaw = await exec(vps, `cat /etc/opendkim/keys/${DOMAIN}/mail.txt`);
    vps.end();
    console.log('  DKIM TXT record:\n  ' + dkimRaw.replace(/\n/g, '\n  '));

    const m = dkimRaw.match(/p=([A-Za-z0-9+/=\s"]+)/);
    if (!m) { console.error('  ❌ Could not extract DKIM p= value'); return; }
    const dkimValue = m[1].replace(/[\s"()]/g, '');

    // Step 2: Push to IONOS DNS
    console.log('\n[4] Pushing DKIM to IONOS DNS...');
    const proxy = await sshConnect(PROXY.ip, PROXY.pass);
    const zones = JSON.parse(await exec(proxy, `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`));
    const zone = zones.find(z => z.name === DOMAIN);
    if (!zone) { console.error('  ❌ Zone not found'); proxy.end(); return; }

    const record = [{
        name: `mail._domainkey.${DOMAIN}`, type: 'TXT',
        content: `v=DKIM1; h=sha256; k=rsa; p=${dkimValue}`,
        ttl: 3600, prio: 0, disabled: false
    }];

    const jsonStr = JSON.stringify(record);
    await exec(proxy, `printf '%s' '${jsonStr.replace(/'/g, "'\\''")}' > /tmp/dkim.json`);
    const res = await exec(proxy, `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/dkim.json "${API_BASE}/zones/${zone.id}/records"`);
    const lines = res.split('\n');
    const httpStatus = lines[lines.length - 1];
    proxy.end();

    if (httpStatus === '201' || httpStatus === '200') {
        console.log(`  ✅ DKIM record added for ${DOMAIN}!`);
    } else {
        console.log(`  ❌ HTTP ${httpStatus}: ${lines.slice(0, -1).join('')}`);
    }
}

main().catch(e => console.error('Error:', e.message));
