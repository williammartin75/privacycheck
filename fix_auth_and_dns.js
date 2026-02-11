#!/usr/bin/env node
// ============================================================
// Fix SMTP auth on 10 new VPS + Configure DNS via IONOS API
// 1. Fix Dovecot auth (include auth-system.conf.ext as fallback)
// 2. Configure DNS records for all 15 domains via IONOS API
// ============================================================

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const https = require('https');

// ---- VPS Config ----
const NEW_VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe' },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5' },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783' },
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
];

const DOMAIN_ASSIGNMENTS = {
    'VPS-11': ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'],
    'VPS-12': ['privacycheckermailpro.website', 'privacycheckermailpro.space'],
    'VPS-13': ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'],
    'VPS-14': ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'],
    'VPS-15': ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'],
    'VPS-16': ['privacy-checker-mail-pro.icu'],
    'VPS-17': ['theprivacycheckerpro.cloud'],
    'VPS-18': ['theprivacycheckerpro.site'],
    'VPS-19': ['theprivacycheckerpro.online'],
    'VPS-20': ['theprivacycheckerpro.website'],
};

// IONOS API
const IONOS_API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const IONOS_API_BASE = 'https://api.hosting.ionos.com/dns/v1';

// DKIM keys file
const DKIM_FILE = path.join(__dirname, 'new_dkim_keys.json');
const CSV_FILE = path.join(__dirname, 'ditlead_new_mailboxes.csv');

// ---- SSH Helpers ----
function sshExec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => { clearTimeout(timer); resolve({ stdout, stderr, code }); });
        });
    });
}

function sshConnect(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pass,
            readyTimeout: 30000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

// ---- HTTP Helper for IONOS API ----
function ionosRequest(method, urlPath, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(IONOS_API_BASE + urlPath);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method,
            headers: {
                'X-API-Key': IONOS_API_KEY,
                'Accept': 'application/json',
            }
        };
        if (body) {
            const data = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
                } catch {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ---- Part 1: Fix SMTP Auth ----
async function fixAuth(vps, domains) {
    let conn;
    try {
        conn = await sshConnect(vps);

        // Fix: use scheme=PLAIN in passdb args for Dovecot
        await sshExec(conn, `cat > /etc/dovecot/conf.d/10-auth.conf << 'EOF'
disable_plaintext_auth = no
auth_mechanisms = plain login
auth_verbose = yes
auth_debug = yes

passdb {
  driver = passwd-file
  args = scheme=PLAIN /etc/dovecot/users
}
userdb {
  driver = passwd-file
  args = /etc/dovecot/users
  default_fields = uid=vmail gid=vmail home=/var/mail/vhosts/%d/%n
}
EOF`);

        // Ensure passwd file format is correct: user@domain:{PLAIN}password:::::
        // Remove any {PLAIN} prefix since scheme=PLAIN in passdb handles it
        await sshExec(conn, `sed -i 's/{PLAIN}//g' /etc/dovecot/users`);

        await sshExec(conn, 'systemctl restart dovecot');

        // Quick test
        const creds = await sshExec(conn, 'head -1 /root/mailboxes.txt');
        const [email, password] = creds.stdout.trim().split(',');
        const authTest = await sshExec(conn, `echo -ne "\\0${email}\\0${password}" | openssl base64`);
        const authString = authTest.stdout.trim();
        const smtpTest = await sshExec(conn, `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${authString}"; sleep 1; echo "QUIT") | openssl s_client -starttls smtp -connect 127.0.0.1:587 -quiet 2>/dev/null | grep -E "235|535"`, 15000);

        const ok = smtpTest.stdout.includes('235');
        console.log(`  ${vps.id}: SMTP ${ok ? '✅ OK' : '❌ ' + smtpTest.stdout.trim()}`);

        // If not working, check dovecot log
        if (!ok) {
            const log = await sshExec(conn, 'journalctl -u dovecot --no-pager -n 5 2>/dev/null || tail -5 /var/log/mail.log');
            console.log(`    Log: ${log.stdout.trim().split('\n').slice(-2).join(' | ')}`);
        }

        conn.end();
        return ok;
    } catch (err) {
        console.error(`  ${vps.id}: ❌ ${err.message}`);
        if (conn) conn.end();
        return false;
    }
}

// ---- Part 2: Configure DNS via IONOS ----
async function configureDNS() {
    console.log('\n============================================================');
    console.log('  Configuring DNS via IONOS API');
    console.log('============================================================');

    // Load DKIM keys
    let dkimKeys = {};
    if (fs.existsSync(DKIM_FILE)) {
        dkimKeys = JSON.parse(fs.readFileSync(DKIM_FILE, 'utf8'));
    }

    // Step 1: Get all zones
    console.log('\n[1/2] Fetching IONOS zones...');
    const zonesResp = await ionosRequest('GET', '/zones');
    if (zonesResp.status !== 200) {
        console.error(`Failed to fetch zones: ${zonesResp.status}`, zonesResp.data);
        return false;
    }

    const zones = zonesResp.data;
    console.log(`  Found ${zones.length} zones`);

    // Step 2: For each domain, configure DNS
    console.log('\n[2/2] Creating DNS records...');

    for (const vps of NEW_VPS) {
        const domains = DOMAIN_ASSIGNMENTS[vps.id];
        for (const domain of domains) {
            // Find zone for this domain
            const zone = zones.find(z => z.name === domain);
            if (!zone) {
                console.log(`  ⚠️  Zone not found for ${domain}`);
                continue;
            }

            // Extract DKIM p= value from the raw DKIM record
            let dkimValue = '';
            const rawDkim = dkimKeys[domain] || '';
            const pMatch = rawDkim.match(/p=([A-Za-z0-9+/=\s]+)/);
            if (pMatch) {
                dkimValue = pMatch[1].replace(/[\s"()]/g, '');
            }

            // Create all 6 records
            const records = [
                { name: domain, type: 'A', content: vps.ip, ttl: 3600, prio: 0, disabled: false },
                { name: `mail.${domain}`, type: 'A', content: vps.ip, ttl: 3600, prio: 0, disabled: false },
                { name: domain, type: 'MX', content: `mail.${domain}`, ttl: 3600, prio: 10, disabled: false },
                { name: domain, type: 'TXT', content: `v=spf1 ip4:${vps.ip} ~all`, ttl: 3600, prio: 0, disabled: false },
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

            const resp = await ionosRequest('POST', `/zones/${zone.id}/records`, records);
            if (resp.status === 201 || resp.status === 200) {
                console.log(`  ✅ ${domain} → ${vps.ip} (${records.length} records)`);
            } else {
                console.log(`  ❌ ${domain}: ${resp.status} - ${JSON.stringify(resp.data).substring(0, 100)}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        }
    }

    return true;
}

// ---- Main ----
async function main() {
    console.log('============================================================');
    console.log('  PHASE 2: Fix Auth + DNS Configuration');
    console.log('============================================================');

    // Part 1: Fix SMTP Auth on all VPS
    console.log('\n--- Part 1: Fixing SMTP Auth ---');
    let authOk = 0;
    for (const vps of NEW_VPS) {
        const domains = DOMAIN_ASSIGNMENTS[vps.id];
        const ok = await fixAuth(vps, domains);
        if (ok) authOk++;
    }
    console.log(`\nSMTP Auth: ${authOk}/10 OK`);

    // Part 2: Configure DNS
    console.log('\n--- Part 2: DNS Configuration ---');
    await configureDNS();

    console.log('\n============================================================');
    console.log('  COMPLETE!');
    console.log('  Next: node import_new_ditlead.js');
    console.log('============================================================');
}

main().catch(console.error);
