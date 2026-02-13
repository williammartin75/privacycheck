#!/usr/bin/env node
/**
 * 1. Publish DKIM DNS for privacyaudit.info (search zones more carefully)
 * 2. Re-run full HappyDeliver test via local Postfix (DKIM-signed)
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const API_KEY = '45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA';
const API_BASE = 'https://api.hosting.ionos.com/dns/v1';
const HAPPY_VPS = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

const VPS_FLEET = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacyaudit.info'] },
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

function ssh(host, pass, cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('[TIMEOUT]') }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, s) => {
                if (err) { clearTimeout(t); c.end(); return resolve('[ERR]') }
                let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d);
                s.on('close', () => { clearTimeout(t); c.end(); resolve(o.trim()) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function sshExec(conn, cmd, timeout = 30000) {
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

function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host, port: 22, username: 'root', password,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function api(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: HAPPY_VPS.ip, port: 8080, path, method, timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')) });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  FIX privacyaudit.info DKIM + FULL RETEST            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ── STEP 0: Publish DKIM for privacyaudit.info ──
    console.log('STEP 0: Publish DKIM DNS for privacyaudit.info\n');

    // Get DKIM key
    const keyResult = await ssh(VPS_FLEET[0].ip, VPS_FLEET[0].pass,
        'cat /etc/opendkim/keys/privacyaudit.info/mail.txt');
    const pMatch = keyResult.match(/p=([A-Za-z0-9+/=\s"]+)/);
    const pValue = pMatch ? pMatch[1].replace(/[\s"()]/g, '') : null;
    const dkimValue = pValue ? `v=DKIM1; h=sha256; k=rsa; p=${pValue}` : null;
    console.log('  DKIM key:', dkimValue ? dkimValue.substring(0, 50) + '...' : 'NOT FOUND');

    if (dkimValue) {
        const proxy = await sshConnect(VPS_FLEET[0].ip, VPS_FLEET[0].pass);

        // Search all zones for privacyaudit.info
        const zonesResult = await sshExec(proxy,
            `curl -s -H "X-API-Key: ${API_KEY}" "${API_BASE}/zones"`, 30000);
        const zones = JSON.parse(zonesResult.stdout);

        // Search with partial match too
        const exactZone = zones.find(z => z.name === 'privacyaudit.info');
        const partialZones = zones.filter(z => z.name.includes('privacyaudit'));

        console.log('  Exact zone match:', exactZone ? `✅ ${exactZone.id}` : '❌ not found');
        console.log('  Partial matches:', partialZones.map(z => z.name).join(', ') || 'none');
        console.log('  Total zones:', zones.length);

        // List all zone names that contain "privacy" for debugging
        const privacyZones = zones.filter(z => z.name.includes('privacy'));
        console.log('  Privacy-related zones:', privacyZones.map(z => z.name).join(', '));

        if (exactZone) {
            const createData = JSON.stringify([{
                name: `mail._domainkey.privacyaudit.info`,
                type: 'TXT',
                content: dkimValue,
                ttl: 3600,
                prio: 0,
                disabled: false
            }]).replace(/'/g, "'\\''");

            const result = await sshExec(proxy,
                `curl -s -w "\\n%{http_code}" -X POST -H "X-API-Key: ${API_KEY}" -H "Content-Type: application/json" -d '${createData}' "${API_BASE}/zones/${exactZone.id}/records"`, 30000);
            const lines = result.stdout.trim().split('\n');
            const status = lines[lines.length - 1];
            console.log('  Create result:', status === '200' || status === '201' ? '✅ published' : `❌ HTTP ${status}`);
        }
        proxy.end();
    }

    // ── STEP 1: Restart HappyDeliver (fresh DB) ──
    console.log('\nSTEP 1: Restart HappyDeliver\n');
    await ssh(HAPPY_VPS.ip, HAPPY_VPS.pass, 'docker rm -f happydeliver 2>/dev/null');
    await sleep(2000);
    const cResult = await ssh(HAPPY_VPS.ip, HAPPY_VPS.pass,
        'docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local -e HAPPYDELIVER_RATE_LIMIT=0 happydeliver 2>&1',
        30000
    );
    console.log('  Container:', cResult.substring(0, 20));
    await sleep(15000);
    const status = await api('GET', '/api/status');
    console.log('  API:', status.version || JSON.stringify(status).substring(0, 50));

    // ── STEP 2: Ensure transport + swaks on all VPS ──
    console.log('\nSTEP 2: Ensure transport maps + swaks\n');
    for (const vps of VPS_FLEET) {
        const r = await ssh(vps.ip, vps.pass, `
            which swaks >/dev/null 2>&1 || apt-get install -y -qq swaks 2>&1 | tail -1
            grep -q 'emailtester.local' /etc/postfix/transport 2>/dev/null || echo "emailtester.local smtp:[${HAPPY_VPS.ip}]:25" >> /etc/postfix/transport
            postmap /etc/postfix/transport 2>/dev/null
            postconf -e "transport_maps = hash:/etc/postfix/transport" 2>/dev/null
            postfix reload 2>/dev/null
            echo "VPS-${vps.id} OK"
        `, 30000);
        process.stdout.write(r.split('\n').pop() + ' ');
    }
    console.log('\n');

    // ── STEP 3: Send 17 emails via local Postfix (DKIM-signed) ──
    console.log('STEP 3: Send 17 emails via local Postfix\n');
    const tests = [];

    for (const vps of VPS_FLEET) {
        for (const domain of vps.domains) {
            try {
                const test = await api('POST', '/api/test');
                if (!test.id || !test.email) { console.log(`  ❌ ${domain}: API error`); continue; }

                // Send via swaks to localhost (goes through Postfix milter → DKIM signing → relay to VPS-29)
                const r = await ssh(vps.ip, vps.pass, `
                    swaks --to "${test.email}" \
                          --from "contact1@${domain}" \
                          --server 127.0.0.1 --port 25 \
                          --helo mail.${domain} \
                          --header "Subject: HD Test ${domain}" \
                          --body "HappyDeliver deliverability test for ${domain}" \
                          --timeout 15 2>&1
                `, 25000);

                // swaks outputs "=== Connected to ..." and "*** 250" on success
                const accepted = r.includes('<~') || r.includes('250 ') || r.includes('Ok');
                tests.push({ id: test.id, domain, vps: vps.id, email: test.email });
                console.log(`  [${tests.length}/17] 📧 VPS-${vps.id} ${domain} → ${accepted ? 'queued' : 'sent'}`);
            } catch (e) {
                console.log(`  ❌ ${domain}: ${e.message}`);
            }
            await sleep(500);
        }
    }

    console.log(`\n📧 ${tests.length}/17 submitted. Waiting 90s for delivery + analysis...\n`);
    await sleep(90000);

    // ── STEP 4: Collect reports ──
    console.log('STEP 4: Reports\n');
    let totalScore = 0, graded = 0;
    const cats = { dns: [], auth: [], spam: [], bl: [], hdr: [], cnt: [] };

    for (const t of tests) {
        try {
            const report = await api('GET', `/api/report/${t.id}`);

            // Try to get raw for DKIM check
            let dkimResult = 'N/A', iprevResult = 'N/A';
            try {
                const raw = await api('GET', `/api/report/${t.id}/raw`);
                const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
                const dm = rawStr.match(/dkim=(\w+)/);
                const im = rawStr.match(/iprev=(\w+)/);
                dkimResult = dm ? dm[1] : 'N/A';
                iprevResult = im ? im[1] : 'N/A';
            } catch { }

            if (!report.score || !report.score.total) {
                console.log(`  ⏳ ${t.domain} — not graded | DKIM:${dkimResult} PTR:${iprevResult}`);
                continue;
            }

            const s = report.score;
            totalScore += s.total;
            graded++;
            cats.dns.push(s.dns || 0);
            cats.auth.push(s.authentication || 0);
            cats.spam.push(s.spam || 0);
            cats.bl.push(s.blacklist || 0);
            cats.hdr.push(s.headers || 0);
            cats.cnt.push(s.content || 0);

            const g = (v) => v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 70 ? 'C' : v >= 60 ? 'D' : 'F';
            console.log(`${s.total >= 85 ? '🟢' : s.total >= 70 ? '🟡' : '🔴'} VPS-${t.vps} ${t.domain}`);
            console.log(`   ${s.total}/100  DNS:${g(s.dns || 0)}(${s.dns || 0}) Auth:${g(s.authentication || 0)}(${s.authentication || 0}) Spam:${g(s.spam || 0)}(${s.spam || 0}) BL:${g(s.blacklist || 0)}(${s.blacklist || 0}) Hdr:${g(s.headers || 0)}(${s.headers || 0}) Cnt:${g(s.content || 0)}(${s.content || 0})`);
            console.log(`   DKIM:${dkimResult} PTR:${iprevResult}`);
        } catch (e) {
            console.log(`  ❌ ${t.domain}: ${e.message}`);
        }
    }

    // If not all graded, try again after 60s
    if (graded < tests.length) {
        console.log(`\n⏳ Only ${graded}/${tests.length} graded. Waiting 60s more...\n`);
        await sleep(60000);

        for (const t of tests) {
            if (cats.dns.length >= tests.length) break;
            try {
                const report = await api('GET', `/api/report/${t.id}`);
                if (!report.score || !report.score.total) continue;
                // Check if already counted
                const already = graded; // skip if already counted
                const s = report.score;
                if (s.total && !cats.dns.includes(s.dns)) {
                    totalScore += s.total;
                    graded++;
                    cats.dns.push(s.dns || 0);
                    cats.auth.push(s.authentication || 0);
                    cats.spam.push(s.spam || 0);
                    cats.bl.push(s.blacklist || 0);
                    cats.hdr.push(s.headers || 0);
                    cats.cnt.push(s.content || 0);

                    let dkimResult = 'N/A';
                    try {
                        const raw = await api('GET', `/api/report/${t.id}/raw`);
                        const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
                        const dm = rawStr.match(/dkim=(\w+)/);
                        dkimResult = dm ? dm[1] : 'N/A';
                    } catch { }

                    const g = (v) => v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 70 ? 'C' : v >= 60 ? 'D' : 'F';
                    console.log(`${s.total >= 85 ? '🟢' : '🟡'} VPS-${t.vps} ${t.domain}: ${s.total}/100 DKIM:${dkimResult}`);
                }
            } catch { }
        }
    }

    const avg = (a) => a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : 0;
    const overall = graded ? Math.round(totalScore / graded) : 0;

    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  OVERALL: ${overall}/100 (${graded}/${tests.length} graded)${' '.repeat(22)}║`);
    console.log(`╠══════════════════════════════════════════════════╣`);
    console.log(`║  DNS         ${avg(cats.dns)}/100  (was 68)${' '.repeat(17)}║`);
    console.log(`║  AUTH        ${avg(cats.auth)}/100  (was 67)${' '.repeat(17)}║`);
    console.log(`║  SPAM        ${avg(cats.spam)}/100  (was 82)${' '.repeat(17)}║`);
    console.log(`║  BL         ${avg(cats.bl)}/100  (was 100)${' '.repeat(16)}║`);
    console.log(`║  CONTENT    ${avg(cats.cnt)}/100  (was 100)${' '.repeat(16)}║`);
    console.log(`║  HEADERS    ${avg(cats.hdr)}/100  (was 100)${' '.repeat(16)}║`);
    console.log(`╚══════════════════════════════════════════════════╝`);

    fs.writeFileSync('happydeliver_results_final.json', JSON.stringify({ tests, categories: cats, graded, avgScore: overall }, null, 2));
    console.log('\n✅ saved → happydeliver_results_final.json');
})();
