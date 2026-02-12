#!/usr/bin/env node
/**
 * Step 1: SSH into each VPS, run setup_vps.sh with assigned domains,
 *         collect DKIM keys and mailbox credentials.
 * Step 2: Configure DNS via IONOS API (using VPS-21 as SSH proxy).
 * Step 3: Output summary and Ditlead import file.
 */
const { Client } = require('ssh2');
const fs = require('fs');

// ── IONOS API ──
const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

// ── Domain → VPS assignment (15 domains, 10 VPS) ──
const ASSIGNMENTS = [
    {
        id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK',
        domains: ['privacyaudit.online', 'privacy-audit.cloud']
    },
    {
        id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v',
        domains: ['privacyaudit.cloud', 'privacyauditmail.cloud']
    },
    {
        id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS',
        domains: ['mailprivacyaudit.online', 'mailprivacyaudit.cloud']
    },
    {
        id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o',
        domains: ['mailprivacyaudit.site', 'mailprivacycheck.online']
    },
    {
        id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q',
        domains: ['mailprivacycheck.cloud', 'mailprivacyreview.online']
    },
    {
        id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK',
        domains: ['mailprivacyreview.info', 'mailprivacyreview.cloud']
    },
    {
        id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v',
        domains: ['mailprivacyreview.site', 'mail-privacy-checker.online']
    },
    {
        id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK',
        domains: ['mail-privacy-checker.info']
    },
    {
        id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A',
        domains: []
    },  // spare VPS - no domains yet
    {
        id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz',
        domains: []
    },  // spare VPS - no domains yet
];

// ── Helpers ──
function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host, port: 22, username: 'root', password,
            readyTimeout: 30000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

function sshExec(conn, cmd, timeout = 600000) {
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

// ── Step 1: Run setup_vps.sh on each VPS (configures domains, DKIM, mailboxes) ──
async function configureVPS(vps) {
    const tag = `[VPS-${vps.id}]`;
    if (vps.domains.length === 0) {
        console.log(`${tag} ${vps.ip} — no domains assigned, skipping`);
        return { ...vps, ok: true, dkimKeys: {}, mailboxes: '' };
    }

    console.log(`${tag} ${vps.ip} — configuring ${vps.domains.join(', ')}...`);
    const conn = await sshConnect(vps.ip, vps.pass);

    // Upload and run setup_vps.sh
    const domainArgs = vps.domains.join(' ');
    const setupScript = fs.readFileSync(
        'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\setup_vps.sh', 'utf8'
    ).replace(/\r\n/g, '\n');

    // Write the script to VPS
    const escapedScript = setupScript.replace(/'/g, "'\\''");
    await sshExec(conn, `cat > /root/setup_vps.sh << 'SETUP_SCRIPT_EOF'\n${setupScript}\nSETUP_SCRIPT_EOF`);
    await sshExec(conn, `chmod +x /root/setup_vps.sh`);

    // Run setup
    console.log(`${tag} Running setup_vps.sh ${domainArgs}...`);
    const result = await sshExec(conn, `bash /root/setup_vps.sh ${domainArgs}`, 600000);

    if (!result.stdout.includes('SETUP COMPLETE')) {
        console.error(`${tag} FAILED — last output:\n${result.stdout.slice(-500)}\n${result.stderr.slice(-500)}`);
        conn.end();
        return { ...vps, ok: false, dkimKeys: {}, mailboxes: '' };
    }
    console.log(`${tag} Setup complete!`);

    // Collect DKIM keys
    const dkimKeys = {};
    for (const domain of vps.domains) {
        const dkimResult = await sshExec(conn, `cat /etc/opendkim/keys/${domain}/mail.txt`);
        dkimKeys[domain] = dkimResult.stdout.trim();
    }

    // Collect mailboxes
    const mbResult = await sshExec(conn, `cat /root/mailboxes.txt`);

    conn.end();
    console.log(`${tag} ${vps.ip} — DKIM keys + ${mbResult.stdout.split('\n').filter(l => l.trim()).length} mailboxes collected`);

    return { ...vps, ok: true, dkimKeys, mailboxes: mbResult.stdout };
}

// ── Step 2: Configure DNS via IONOS API (proxied through VPS-21) ──
async function configureDNS(domainIpMap, dkimKeys) {
    console.log('\n============================================================');
    console.log('  IONOS DNS Configuration — via VPS-21 SSH proxy');
    console.log('============================================================\n');

    const proxy = ASSIGNMENTS[0]; // VPS-21
    const conn = await sshConnect(proxy.ip, proxy.pass);
    console.log(`Connected to VPS-21 (${proxy.ip}) as API proxy\n`);

    // Fetch zones
    console.log('[DNS] Fetching zones...');
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

    let success = 0, failed = 0;
    const total = Object.keys(domainIpMap).length;

    for (const [domain, ip] of Object.entries(domainIpMap)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) {
            console.log(`  ❌ ${domain} — zone not found in IONOS`);
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

        // Build records
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

        const jsonStr = JSON.stringify(records);
        // Escape for shell: write to temp file to avoid quoting
        const writeCmd = `echo '${jsonStr.replace(/'/g, "'\\''")}' > /tmp/dns_records.json`;
        await sshExec(conn, writeCmd);

        const curlCmd = `curl -s -w "\\n%{http_code}" -X POST ` +
            `-H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" ` +
            `-d @/tmp/dns_records.json "${API_BASE}/zones/${zone.id}/records"`;

        const result = await sshExec(conn, curlCmd, 30000);
        const lines = result.stdout.trim().split('\n');
        const httpStatus = lines[lines.length - 1];

        if (httpStatus === '201' || httpStatus === '200') {
            console.log(`  ✅ ${domain} → ${ip} (${records.length} records${dkimValue ? ' + DKIM' : ' ⚠ no DKIM'})`);
            success++;
        } else {
            console.log(`  ❌ ${domain}: HTTP ${httpStatus} — ${lines.slice(0, -1).join('').substring(0, 150)}`);
            failed++;
        }

        await new Promise(r => setTimeout(r, 300));
    }

    conn.end();
    console.log(`\n  DNS: ${success}/${total} OK, ${failed} failed`);
}

// ── Main ──
async function main() {
    console.log('============================================================');
    console.log('  Full Setup: 15 domains on 10 VPS');
    console.log('============================================================\n');

    // Step 1: Configure all VPS with domains in parallel
    console.log('=== STEP 1: Configure VPS (setup domains, DKIM, mailboxes) ===\n');
    const activeVPS = ASSIGNMENTS.filter(v => v.domains.length > 0);
    const results = await Promise.all(activeVPS.map(v => configureVPS(v)));

    const ok = results.filter(r => r.ok);
    const fail = results.filter(r => !r.ok);
    console.log(`\n  VPS Setup: ${ok.length}/${activeVPS.length} OK, ${fail.length} failed`);

    if (fail.length > 0) {
        console.log('  Failed VPS:', fail.map(r => `VPS-${r.id}`).join(', '));
    }

    // Merge all data
    const allDkimKeys = {};
    const domainIpMap = {};
    let allMailboxes = '';

    for (const r of ok) {
        Object.assign(allDkimKeys, r.dkimKeys);
        for (const d of r.domains) {
            domainIpMap[d] = r.ip;
        }
        allMailboxes += r.mailboxes;
    }

    // Save data
    fs.writeFileSync('new_dkim_keys_21_30.json', JSON.stringify(allDkimKeys, null, 2));
    fs.writeFileSync('all_mailboxes_21_30.csv', allMailboxes);
    console.log(`\n  Saved DKIM keys → new_dkim_keys_21_30.json`);
    console.log(`  Saved mailboxes → all_mailboxes_21_30.csv (${allMailboxes.split('\n').filter(l => l.trim()).length} total)`);

    // Step 2: Configure DNS
    console.log('\n=== STEP 2: Configure DNS via IONOS API ===\n');
    await configureDNS(domainIpMap, allDkimKeys);

    console.log('\n============================================================');
    console.log('  ALL DONE!');
    console.log('============================================================');
    console.log('\nNext steps:');
    console.log('  1. Wait 10-30 minutes for DNS propagation');
    console.log('  2. Import mailboxes to Ditlead from all_mailboxes_21_30.csv');
    console.log('  3. Start warmup');
}

main().catch(console.error);
