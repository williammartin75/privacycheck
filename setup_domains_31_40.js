#!/usr/bin/env node
/**
 * Configure 15 new IONOS domains on ALL 10 new VPS (31-40).
 * - ALL 10 VPS are used (no spares)
 * - Setup runs IN PARALLEL across all VPS
 * - 30-minute timeout per VPS
 * - Checks if VPS already configured before running setup
 * 
 * Total: 15 domains × 40 mailboxes = 600 mailboxes
 */
const { Client } = require('ssh2');
const fs = require('fs');

// ── IONOS API ──
const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const API_PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

// ── 15 domains distributed across ALL 10 VPS ──
const ASSIGNMENTS = [
    {
        id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39',
        domains: ['mailprivacychecker.space', 'mailprivacychecker.website']
    },
    {
        id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4',
        domains: ['contactprivacychecker.info']
    },
    {
        id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0',
        domains: ['contactprivacychecker.cloud']
    },
    {
        id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3',
        domains: ['contactprivacychecker.site', 'contactprivacychecker.website']
    },
    {
        id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N',
        domains: ['reportprivacychecker.info', 'reportprivacychecker.cloud']
    },
    {
        id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm',
        domains: ['reportprivacychecker.site', 'reportprivacychecker.website']
    },
    {
        id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y',
        domains: ['checkprivacychecker.info', 'checkprivacychecker.cloud']
    },
    {
        id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V',
        domains: ['checkprivacychecker.site']
    },
    {
        id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS',
        domains: ['checkprivacychecker.space']
    },
    {
        id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9',
        domains: ['checkprivacychecker.website']
    },
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

function sshExec(conn, cmd, timeout = 1800000) {  // 30 min default
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout (30min)')), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve({ stdout, stderr }); });
        });
    });
}

// ── Full setup for ONE VPS: install + configure + collect — runs in parallel ──
async function setupVPS(vps) {
    const tag = `[VPS-${vps.id}]`;
    console.log(`${tag} ${vps.ip} — starting (${vps.domains.join(', ')})`);

    let conn;
    try {
        conn = await sshConnect(vps.ip, vps.pass);
    } catch (err) {
        console.error(`${tag} ❌ SSH failed: ${err.message}`);
        return { ...vps, ok: false, dkimKeys: {}, mailboxes: '' };
    }

    // Check if already configured
    const check = await sshExec(conn, 'test -f /root/mailboxes.txt && echo "ALREADY_DONE" || echo "NEEDS_SETUP"', 10000);
    if (check.stdout.includes('ALREADY_DONE')) {
        console.log(`${tag} Already configured — collecting data...`);
        const dkimKeys = {};
        for (const domain of vps.domains) {
            const dkimResult = await sshExec(conn, `cat /etc/opendkim/keys/${domain}/mail.txt 2>/dev/null || echo "NO_DKIM"`, 10000);
            if (!dkimResult.stdout.includes('NO_DKIM')) dkimKeys[domain] = dkimResult.stdout.trim();
        }
        const mbResult = await sshExec(conn, `cat /root/mailboxes.txt`, 10000);
        conn.end();
        const mbCount = mbResult.stdout.split('\n').filter(l => l.trim()).length;
        console.log(`${tag} ✅ Already done — ${mbCount} mailboxes collected`);
        return { ...vps, ok: true, dkimKeys, mailboxes: mbResult.stdout };
    }

    // Upload and run setup_vps.sh
    const setupScript = fs.readFileSync(
        'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\setup_vps.sh', 'utf8'
    ).replace(/\r\n/g, '\n');

    await sshExec(conn, `cat > /root/setup_vps.sh << 'SETUP_SCRIPT_EOF'\n${setupScript}\nSETUP_SCRIPT_EOF`, 30000);
    await sshExec(conn, `chmod +x /root/setup_vps.sh`, 10000);

    const domainArgs = vps.domains.join(' ');
    console.log(`${tag} Running setup (packages + Postfix + DKIM + mailboxes)...`);
    const result = await sshExec(conn, `export DEBIAN_FRONTEND=noninteractive && bash /root/setup_vps.sh ${domainArgs}`, 1800000);

    if (!result.stdout.includes('SETUP COMPLETE')) {
        console.error(`${tag} ❌ FAILED — last output:\n${result.stdout.slice(-300)}\n${result.stderr.slice(-200)}`);
        conn.end();
        return { ...vps, ok: false, dkimKeys: {}, mailboxes: '' };
    }
    console.log(`${tag} ✅ Setup complete!`);

    // Collect DKIM keys
    const dkimKeys = {};
    for (const domain of vps.domains) {
        const dkimResult = await sshExec(conn, `cat /etc/opendkim/keys/${domain}/mail.txt`, 10000);
        dkimKeys[domain] = dkimResult.stdout.trim();
    }

    // Collect mailboxes
    const mbResult = await sshExec(conn, `cat /root/mailboxes.txt`, 10000);
    conn.end();

    const mbCount = mbResult.stdout.split('\n').filter(l => l.trim()).length;
    console.log(`${tag} ${vps.ip} — DKIM + ${mbCount} mailboxes collected`);
    return { ...vps, ok: true, dkimKeys, mailboxes: mbResult.stdout };
}

// ── DNS Configuration ──
async function configureDNS(domainIpMap, dkimKeys) {
    console.log('\n============================================================');
    console.log('  IONOS DNS Configuration');
    console.log('============================================================\n');

    const conn = await sshConnect(API_PROXY.ip, API_PROXY.pass);
    const zonesResult = await sshExec(conn,
        `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);

    let zones;
    try { zones = JSON.parse(zonesResult.stdout); }
    catch { console.error('Failed to parse zones'); conn.end(); return; }
    console.log(`  Found ${zones.length} zones\n`);

    let success = 0, failed = 0;
    for (const [domain, ip] of Object.entries(domainIpMap)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) { console.log(`  ⏳ ${domain} — not yet in IONOS`); failed++; continue; }

        let dkimValue = '';
        const rawDkim = dkimKeys[domain] || '';
        const pMatch = rawDkim.match(/p=([A-Za-z0-9+/=\s"]+)/);
        if (pMatch) dkimValue = pMatch[1].replace(/[\s"()]/g, '');

        const records = [
            { name: domain, type: 'A', content: ip, ttl: 3600, prio: 0, disabled: false },
            { name: `mail.${domain}`, type: 'A', content: ip, ttl: 3600, prio: 0, disabled: false },
            { name: domain, type: 'MX', content: `mail.${domain}`, ttl: 3600, prio: 10, disabled: false },
            { name: domain, type: 'TXT', content: `v=spf1 ip4:${ip} ~all`, ttl: 3600, prio: 0, disabled: false },
            { name: `_dmarc.${domain}`, type: 'TXT', content: 'v=DMARC1; p=quarantine; pct=100', ttl: 3600, prio: 0, disabled: false },
        ];
        if (dkimValue) {
            records.push({
                name: `mail._domainkey.${domain}`, type: 'TXT',
                content: `v=DKIM1; h=sha256; k=rsa; p=${dkimValue}`, ttl: 3600, prio: 0, disabled: false
            });
        }

        const jsonStr = JSON.stringify(records);
        await sshExec(conn, `echo '${jsonStr.replace(/'/g, "'\\''")}' > /tmp/dns_records.json`, 10000);
        const curlCmd = `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/dns_records.json "${API_BASE}/zones/${zone.id}/records"`;
        const result = await sshExec(conn, curlCmd, 30000);
        const lines = result.stdout.trim().split('\n');
        const httpStatus = lines[lines.length - 1];

        if (httpStatus === '201' || httpStatus === '200') {
            console.log(`  ✅ ${domain} → ${ip} (${records.length} records${dkimValue ? ' + DKIM' : ''})`);
            success++;
        } else {
            console.log(`  ❌ ${domain}: HTTP ${httpStatus}`);
            failed++;
        }
        await new Promise(r => setTimeout(r, 300));
    }
    conn.end();
    console.log(`\n  DNS: ${success}/${Object.keys(domainIpMap).length} OK, ${failed} pending`);
}

// ── Main ──
async function main() {
    console.log('============================================================');
    console.log(`  Setup: 15 domains on ALL 10 VPS (31-40) — PARALLEL`);
    console.log('  Target: 600 mailboxes | Timeout: 30 min per VPS');
    console.log('============================================================\n');

    // Run ALL VPS in parallel
    console.log('=== PHASE 1: Setup ALL VPS in parallel ===\n');
    const results = await Promise.all(ASSIGNMENTS.map(v => setupVPS(v)));

    const ok = results.filter(r => r.ok);
    const fail = results.filter(r => !r.ok);
    console.log(`\n  VPS Setup: ${ok.length}/${ASSIGNMENTS.length} OK, ${fail.length} failed`);
    if (fail.length > 0) console.log('  Failed:', fail.map(r => `VPS-${r.id} (${r.ip})`).join(', '));

    // Merge data
    const allDkimKeys = {};
    const domainIpMap = {};
    let allMailboxes = '';
    for (const r of ok) {
        Object.assign(allDkimKeys, r.dkimKeys);
        for (const d of r.domains) domainIpMap[d] = r.ip;
        allMailboxes += r.mailboxes;
    }

    const totalMB = allMailboxes.split('\n').filter(l => l.trim()).length;
    fs.writeFileSync('new_dkim_keys_31_40.json', JSON.stringify(allDkimKeys, null, 2));
    fs.writeFileSync('all_mailboxes_31_40.csv', allMailboxes);
    console.log(`\n  Saved: DKIM keys + ${totalMB} mailboxes`);

    // Phase 2: DNS
    if (Object.keys(domainIpMap).length > 0) {
        console.log('\n=== PHASE 2: Configure DNS ===\n');
        await configureDNS(domainIpMap, allDkimKeys);
    }

    // Summary
    console.log('\n============================================================');
    console.log('  COMPLETE!');
    console.log('============================================================');
    console.log(`  VPS: ${ok.length}/${ASSIGNMENTS.length} | Mailboxes: ${totalMB} | Domains: ${Object.keys(domainIpMap).length}/15`);

    if (ok.length > 0) {
        console.log('\nPTR records to request from RackNerd:');
        for (const r of ok) {
            console.log(`  ${r.ip} → mail.${r.domains[0]}`);
        }
    }
}

main().catch(console.error);
