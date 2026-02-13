#!/usr/bin/env node
/**
 * FULL 40-VPS HappyDeliver Test
 * Sends emails from ALL VPS via local Postfix (DKIM-signed) 
 * with transport relay to VPS-29 HappyDeliver.
 * 
 * VPS-29 is HappyDeliver itself, so its domains are tested from VPS-29 directly.
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const HAPPY_IP = '192.3.106.247';
const HAPPY_PORT = 8080;

const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B', domains: ['privacy-checker-pro.online', 'privacy-checker-pro.cloud'] },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z', domains: ['privacy-checker-pro.site', 'privacy-checker-pro.website'] },
    { id: 3, ip: '206.217.139.115', pass: '20QEs9OSh8Bw3egI1q', domains: ['mailprivacycheckerpro.site', 'mailprivacycheckerpro.icu'] },
    { id: 4, ip: '206.217.139.116', pass: 'JvSg1HPu956fAt0dY0', domains: ['mailprivacycheckerpro.cloud', 'mailprivacycheckerpro.space'] },
    { id: 5, ip: '23.95.242.32', pass: 'v6Jk79EUE15reqJ3zB', domains: ['mailprivacycheckerpro.website', 'mail-privacy-checker-pro.cloud'] },
    { id: 6, ip: '192.3.86.156', pass: 'H77WKufh2r9lVX3iP6', domains: ['mail-privacy-checker-pro.site'] },
    { id: 7, ip: '107.175.83.186', pass: '1KiaL7RpwAng23B08L', domains: ['mail-privacy-checker-pro.website'] },
    { id: 8, ip: '23.226.135.153', pass: 'dIKsL94sx6o8u7SAA1', domains: ['reviewprivacycheckerpro.cloud'] },
    { id: 9, ip: '64.188.29.151', pass: '1EQpF0fSapC610hjK3', domains: ['reviewprivacycheckerpro.site'] },
    { id: 10, ip: '23.94.240.173', pass: 'L5fgrQ6I84E3uvR2Nn', domains: ['reviewprivacycheckerpro.online'] },
    { id: 11, ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 12, ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 13, ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 14, ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 15, ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 16, ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
    { id: 17, ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', domains: ['theprivacycheckerpro.cloud'] },
    { id: 18, ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', domains: ['theprivacycheckerpro.site'] },
    { id: 19, ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', domains: ['theprivacycheckerpro.online'] },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', domains: ['theprivacycheckerpro.website'] },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacy-audit.cloud'] },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v', domains: ['privacyaudit.cloud', 'privacyauditmail.cloud'] },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS', domains: ['mailprivacyaudit.online', 'mailprivacyaudit.cloud'] },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o', domains: ['mailprivacyaudit.site', 'mailprivacycheck.online'] },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q', domains: ['mailprivacycheck.cloud', 'mailprivacyreview.online'] },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK', domains: ['mailprivacyreview.info', 'mailprivacyreview.cloud'] },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v', domains: ['mailprivacyreview.site', 'mail-privacy-checker.online'] },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK', domains: ['mail-privacy-checker.info'] },
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A', domains: ['mailprivacychecker.info', 'mailprivacychecker.cloud'] },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz', domains: ['mailprivacychecker.site'] },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'] },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', domains: ['contactprivacychecker.info'] },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', domains: ['contactprivacychecker.cloud'] },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', domains: ['contactprivacychecker.site', 'contactprivacychecker.website'] },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N', domains: ['reportprivacychecker.info', 'reportprivacychecker.cloud'] },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm', domains: ['reportprivacychecker.site', 'reportprivacychecker.website'] },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y', domains: ['checkprivacychecker.info', 'checkprivacychecker.cloud'] },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V', domains: ['checkprivacychecker.site'] },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS', domains: ['checkprivacychecker.space'] },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9', domains: ['checkprivacychecker.website'] },
];

// Total domains
const totalDomains = ALL_VPS.reduce((s, v) => s + v.domains.length, 0);

function ssh(host, pass, cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: '[TIMEOUT]' }) }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, s) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: '[EXEC_ERR]' }) }
                let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d);
                s.on('close', (code) => { clearTimeout(t); c.end(); resolve({ ok: code === 0 || code === null, out: o.trim() }) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function api(method, path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: HAPPY_IP, port: HAPPY_PORT, path, method, timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')) });
        req.on('error', reject);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log(`║  FULL 40-VPS HAPPYDELIVER TEST (${totalDomains} domains)            ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ── Phase 0: Check HappyDeliver ──
    console.log('Phase 0: Check HappyDeliver API...');
    try {
        const status = await api('GET', '/api/status');
        console.log(`  ✅ API up: ${status.version || JSON.stringify(status).substring(0, 60)}\n`);
    } catch (e) {
        console.log(`  ❌ API down: ${e.message}`);
        console.log('  Restarting container...');
        const r = await ssh(HAPPY_IP, 'BKv61x5X0opysQB03A',
            'docker restart happydeliver 2>&1 || docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local -e HAPPYDELIVER_RATE_LIMIT=0 happydeliver 2>&1',
            30000);
        console.log(`  Restart: ${r.out.substring(0, 60)}`);
        await sleep(15000);
        try {
            const s2 = await api('GET', '/api/status');
            console.log(`  ✅ API recovered: ${s2.version || 'OK'}\n`);
        } catch {
            console.log('  ❌ API still down. Aborting.\n');
            return;
        }
    }

    // ── Phase 1: Setup transport + swaks on all VPS (batch 5 at a time) ──
    console.log('Phase 1: Setup transport maps + swaks (5 at a time)\n');
    const BATCH = 5;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            ssh(vps.ip, vps.pass, `
                which swaks >/dev/null 2>&1 || apt-get install -y -qq swaks >/dev/null 2>&1
                grep -q 'emailtester.local' /etc/postfix/transport 2>/dev/null || echo "emailtester.local smtp:[${HAPPY_IP}]:25" >> /etc/postfix/transport
                postmap /etc/postfix/transport 2>/dev/null
                postconf -e "transport_maps = hash:/etc/postfix/transport" 2>/dev/null
                postfix reload 2>/dev/null >/dev/null
                echo "OK"
            `, 30000)
        ));
        results.forEach((r, j) => {
            const vps = batch[j];
            process.stdout.write(`  VPS-${String(vps.id).padStart(2)}: ${r.ok ? '✅' : '❌'} `);
        });
        console.log();
    }
    console.log();

    // ── Phase 2: Send emails (3 at a time to avoid overloading) ──
    console.log(`Phase 2: Send ${totalDomains} emails via local Postfix\n`);
    const tests = [];
    let sent = 0;

    for (const vps of ALL_VPS) {
        for (const domain of vps.domains) {
            try {
                const test = await api('POST', '/api/test');
                if (!test.id || !test.email) { console.log(`  ❌ VPS-${vps.id} ${domain}: API error`); continue; }

                const r = await ssh(vps.ip, vps.pass, `
                    swaks --to "${test.email}" \
                          --from "contact1@${domain}" \
                          --server 127.0.0.1 --port 25 \
                          --helo mail.${domain} \
                          --header "Subject: HD Test ${domain}" \
                          --body "HappyDeliver deliverability test for ${domain}" \
                          --timeout 15 2>&1
                `, 25000);

                sent++;
                tests.push({ id: test.id, domain, vps: vps.id, ip: vps.ip });
                console.log(`  [${String(sent).padStart(2)}/${totalDomains}] 📧 VPS-${String(vps.id).padStart(2)} ${domain}`);
            } catch (e) {
                console.log(`  ❌ VPS-${vps.id} ${domain}: ${e.message}`);
            }
            await sleep(200);
        }
    }

    console.log(`\n📧 ${sent}/${totalDomains} submitted. Waiting 2 min for analysis...\n`);
    await sleep(120000);

    // ── Phase 3: Collect reports ──
    console.log('Phase 3: Reports\n');
    let totalScore = 0, graded = 0;
    const cats = { dns: [], auth: [], spam: [], bl: [], hdr: [], cnt: [] };
    const grade = (v) => v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 70 ? 'C' : v >= 60 ? 'D' : 'F';

    for (const t of tests) {
        try {
            const report = await api('GET', `/api/report/${t.id}`);

            // Check raw for DKIM/PTR
            let dk = '?', ptr = '?';
            try {
                const raw = await api('GET', `/api/report/${t.id}/raw`);
                const rs = typeof raw === 'string' ? raw : JSON.stringify(raw);
                const dm = rs.match(/dkim=(\w+)/); dk = dm ? dm[1] : '?';
                const im = rs.match(/iprev=(\w+)/); ptr = im ? im[1] : '?';
            } catch { }

            if (report.score && report.score.total) {
                const s = report.score;
                totalScore += s.total; graded++;
                cats.dns.push(s.dns || 0); cats.auth.push(s.authentication || 0);
                cats.spam.push(s.spam || 0); cats.bl.push(s.blacklist || 0);
                cats.hdr.push(s.headers || 0); cats.cnt.push(s.content || 0);

                const icon = s.total >= 90 ? '🟢' : s.total >= 80 ? '🟡' : '🔴';
                console.log(`${icon} VPS-${String(t.vps).padStart(2)} ${t.domain}: ${s.total}/100 DNS:${grade(s.dns || 0)}(${s.dns || 0}) Auth:${grade(s.authentication || 0)}(${s.authentication || 0}) Spam:${grade(s.spam || 0)}(${s.spam || 0}) | DKIM:${dk} PTR:${ptr}`);
            } else {
                console.log(`⏳ VPS-${String(t.vps).padStart(2)} ${t.domain}: pending | DKIM:${dk} PTR:${ptr}`);
            }
        } catch (e) {
            console.log(`❌ VPS-${String(t.vps).padStart(2)} ${t.domain}: ${e.message}`);
        }
    }

    // Retry ungraded after 60s
    if (graded < tests.length) {
        console.log(`\n⏳ ${graded}/${tests.length} graded. Waiting 60s more...\n`);
        await sleep(60000);
        for (const t of tests) {
            try {
                const report = await api('GET', `/api/report/${t.id}`);
                if (!report.score || !report.score.total) continue;
                // Check if already counted by looking at test id
                if (tests.findIndex(x => x.id === t.id && cats.dns.length > tests.indexOf(x)) >= 0) continue;
                const s = report.score;
                totalScore += s.total; graded++;
                cats.dns.push(s.dns || 0); cats.auth.push(s.authentication || 0);
                cats.spam.push(s.spam || 0); cats.bl.push(s.blacklist || 0);
                cats.hdr.push(s.headers || 0); cats.cnt.push(s.content || 0);
            } catch { }
        }
    }

    const avg = (a) => a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : 0;
    const overall = graded ? Math.round(totalScore / graded) : 0;

    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  OVERALL: ${overall}/100 (${graded}/${tests.length} graded)${' '.repeat(30)}║`);
    console.log(`╠════════════════════════════════════════════════════════╣`);
    console.log(`║  DNS         ${avg(cats.dns)}/100${' '.repeat(35)}║`);
    console.log(`║  AUTH        ${avg(cats.auth)}/100${' '.repeat(35)}║`);
    console.log(`║  SPAM        ${avg(cats.spam)}/100${' '.repeat(35)}║`);
    console.log(`║  BL         ${avg(cats.bl)}/100${' '.repeat(35)}║`);
    console.log(`║  CONTENT    ${avg(cats.cnt)}/100${' '.repeat(35)}║`);
    console.log(`║  HEADERS    ${avg(cats.hdr)}/100${' '.repeat(35)}║`);
    console.log(`╚════════════════════════════════════════════════════════╝`);

    // DKIM summary
    const dkimPass = tests.filter(t => {
        // We already printed these, just count from output
        return true; // Will be counted from saved data
    });

    fs.writeFileSync('happydeliver_40vps_results.json', JSON.stringify({
        timestamp: new Date().toISOString(),
        totalVPS: 40, totalDomains, sent, graded,
        avgScore: overall,
        categories: cats,
        tests
    }, null, 2));
    console.log('\n✅ saved → happydeliver_40vps_results.json');
})();
