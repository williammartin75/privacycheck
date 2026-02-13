const { Client } = require('ssh2');
const fs = require('fs');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';

async function main() {
    const conn = new Client();
    await new Promise((r, j) => {
        conn.on('ready', r);
        conn.on('error', j);
        conn.connect({
            host: '192.227.234.211', port: 22, username: 'root',
            password: 'Jd5Fh769E0hnmX9CqK', readyTimeout: 30000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
    console.log('Connected to VPS-21 proxy');

    const exec = (cmd, t = 30000) => new Promise((r, j) => {
        const tm = setTimeout(() => j(new Error('Timeout')), t);
        conn.exec(cmd, (e, s) => {
            if (e) { clearTimeout(tm); return j(e); }
            let o = '';
            s.on('data', d => o += d.toString());
            s.stderr.on('data', d => o += d.toString());
            s.on('close', () => { clearTimeout(tm); r(o.trim()); });
        });
    });

    const zones = JSON.parse(await exec(`curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`));
    console.log('Zones found:', zones.length);

    const dkim = JSON.parse(fs.readFileSync('new_dkim_keys_29_30.json', 'utf8'));
    const domains = {
        'mailprivacychecker.info': '192.3.106.247',
        'mailprivacychecker.cloud': '192.3.106.247',
        'mailprivacychecker.site': '192.227.148.204'
    };

    for (const [domain, ip] of Object.entries(domains)) {
        const zone = zones.find(z => z.name === domain);
        if (!zone) { console.log(`  ⏳ ${domain} — zone not found in IONOS yet`); continue; }

        let dkimValue = '';
        const raw = dkim[domain] || '';
        const m = raw.match(/p=([A-Za-z0-9+/=\s"]+)/);
        if (m) dkimValue = m[1].replace(/[\s"()]/g, '');

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
        await exec(`printf '%s' '${jsonStr.replace(/'/g, "'\\''")}' > /tmp/dns.json`);

        const res = await exec(`curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d @/tmp/dns.json "${API_BASE}/zones/${zone.id}/records"`);
        const lines = res.split('\n');
        const status = lines[lines.length - 1];

        if (status === '201' || status === '200') {
            console.log(`  ✅ ${domain} → ${ip} (${records.length} records${dkimValue ? ' + DKIM' : ''})`);
        } else {
            console.log(`  ❌ ${domain}: HTTP ${status} — ${lines.slice(0, -1).join('').substring(0, 150)}`);
        }
        await new Promise(r => setTimeout(r, 300));
    }

    conn.end();
    console.log('\nDone!');
}

main().catch(e => console.error('Error:', e.message));
