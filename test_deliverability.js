#!/usr/bin/env node
/**
 * HAPPYDELIVER FULL TEST v3
 * - Disables rate limit via HAPPYDELIVER_RATE_LIMIT=0
 * - Installs swaks on VPS that need it
 * - Tests all 17 domains
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };
const HD_DOMAIN = 'emailtester.local';

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

function sshExec(host, pass, cmd, timeout = 30000) {
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

function apiCall(method, path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: VPS29.ip, port: 8080, path, method, timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve({ code: res.statusCode, data: JSON.parse(d) }) }
                catch { resolve({ code: res.statusCode, data: d }) }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('API_TIMEOUT')) });
        req.on('error', reject);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

(async () => {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║  HAPPYDELIVER BULK TEST — RATE LIMIT OFF ║');
    console.log('╚══════════════════════════════════════════╝\n');

    // === PHASE 1: RESTART WITH RATE LIMIT DISABLED ===
    console.log('PHASE 1: Restart HappyDeliver (no rate limit)\n');

    await sshExec(VPS29.ip, VPS29.pass,
        'docker rm -f happydeliver 2>/dev/null; systemctl stop postfix 2>/dev/null; fuser -k 25/tcp 2>/dev/null; fuser -k 8080/tcp 2>/dev/null; sleep 2; echo OK'
    );

    let r = await sshExec(VPS29.ip, VPS29.pass, [
        'docker run -d --name happydeliver',
        '-p 25:25 -p 8080:8080',
        `-e HAPPYDELIVER_DOMAIN=${HD_DOMAIN}`,
        '-e HAPPYDELIVER_RATE_LIMIT=0',
        `--hostname mail.${HD_DOMAIN}`,
        'happydeliver:latest 2>&1'
    ].join(' '));
    console.log('  Container:', r.substring(0, 12) + '...');

    console.log('  Waiting 20s...');
    await sleep(20000);

    // Verify
    let apiOk = false;
    for (let i = 0; i < 5; i++) {
        try {
            const { code, data } = await apiCall('GET', '/api/status');
            if (code === 200 && data?.status === 'healthy') {
                console.log(`  ✅ API healthy (v:${data.version} uptime:${data.uptime}s)`);
                apiOk = true; break;
            }
        } catch { }
        await sleep(5000);
    }

    if (!apiOk) {
        r = await sshExec(VPS29.ip, VPS29.pass, 'docker logs happydeliver 2>&1 | tail -15');
        console.log('  ❌ FAILED:\n' + r);
        return;
    }

    // Quick test: create 3 tests to verify no rate limit
    console.log('  Rate limit test:');
    for (let i = 0; i < 3; i++) {
        const { code, data } = await apiCall('POST', '/api/test');
        const ok = code === 201 && data?.id;
        console.log(`    Test ${i + 1}: HTTP ${code} ${ok ? '✅' : '❌ ' + JSON.stringify(data).substring(0, 60)}`);
        if (!ok) { console.log('  Rate limit still active!'); return; }
    }
    console.log('  ✅ No rate limit!\n');

    // === PHASE 1.5: INSTALL SWAKS ON VPS THAT NEED IT ===
    console.log('PHASE 1.5: Install swaks on VPS 35-40\n');
    const swaksVPS = VPS_FLEET.filter(v => v.id >= 35);
    for (const vps of swaksVPS) {
        r = await sshExec(vps.ip, vps.pass, 'which swaks >/dev/null 2>&1 && echo OK || (apt-get update -qq && apt-get install -y -qq swaks 2>&1 | tail -1)', 60000);
        console.log(`  VPS-${vps.id}: ${r.includes('OK') || r.includes('swaks') ? '✅' : '⚠️ ' + r.substring(0, 40)}`);
    }

    // === PHASE 2: SEND TESTS ===
    const totalDomains = VPS_FLEET.reduce((a, v) => a + v.domains.length, 0);
    console.log(`\nPHASE 2: Send ${totalDomains} test emails\n`);

    const sentTests = [];
    let n = 0;

    for (const vps of VPS_FLEET) {
        for (const domain of vps.domains) {
            n++;
            const from = `contact1@${domain}`;

            // Create test
            let test;
            try {
                const { code, data } = await apiCall('POST', '/api/test');
                if (code !== 201 || !data?.id) {
                    console.log(`[${String(n).padStart(2)}/${totalDomains}] ❌ ${domain} — API ${code}: ${JSON.stringify(data).substring(0, 50)}`);
                    continue;
                }
                test = data;
            } catch (e) {
                console.log(`[${String(n).padStart(2)}/${totalDomains}] ❌ ${domain} — ${e.message}`);
                continue;
            }

            // Send
            const sendResult = await sshExec(vps.ip, vps.pass,
                `swaks --to "${test.email}" --from "${from}" --server ${VPS29.ip} --port 25 --helo mail.${domain} --header "Subject: HD Test ${domain}" --body "Deliverability test from ${from}" --timeout 15 2>&1; echo "XIT:$?"`,
                25000
            );

            if (sendResult.includes('SSH_ERR') || sendResult === '[TIMEOUT]') {
                console.log(`[${String(n).padStart(2)}/${totalDomains}] ❌ VPS-${vps.id} ${domain} — SSH fail`);
                continue;
            }

            const m = sendResult.match(/XIT:(\d+)/);
            if (m && m[1] === '0') {
                console.log(`[${String(n).padStart(2)}/${totalDomains}] 📧 VPS-${vps.id} ${domain} → OK`);
                sentTests.push({ vps: vps.id, domain, from, testId: test.id });
            } else {
                const errLine = sendResult.split('\n').find(l => l.includes('***') || l.includes('55') || l.includes('error'));
                console.log(`[${String(n).padStart(2)}/${totalDomains}] ❌ VPS-${vps.id} ${domain} — ${errLine?.substring(0, 60) || 'exit ' + (m ? m[1] : '?')}`);
            }

            await sleep(300);
        }
    }

    // === PHASE 3: COLLECT REPORTS ===
    console.log(`\n📧 ${sentTests.length}/${totalDomains} sent. Waiting 30s for analysis...\n`);
    await sleep(30000);

    console.log('PHASE 3: Reports\n');
    const results = [];

    for (const test of sentTests) {
        let report = null;
        for (let retry = 0; retry < 5; retry++) {
            try {
                const { data } = await apiCall('GET', `/api/report/${test.testId}`);
                if (data?.summary) { report = data; break; }
            } catch { }
            await sleep(3000);
        }

        if (report?.summary) {
            const s = report.summary;
            const scores = [];
            for (const k of ['dns_score', 'authentication_score', 'spam_score', 'blacklist_score', 'content_score', 'header_score']) {
                if (typeof s[k] === 'number') scores.push(s[k]);
            }
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            const icon = avg >= 80 ? '🟢' : avg >= 60 ? '🟡' : '🔴';

            console.log(`${icon} VPS-${test.vps} ${test.domain.padEnd(35)} ${avg}/100`);
            console.log(`   DNS:${s.dns_grade || '?'}(${s.dns_score ?? '?'}) Auth:${s.authentication_grade || '?'}(${s.authentication_score ?? '?'}) Spam:${s.spam_grade || '?'}(${s.spam_score ?? '?'}) BL:${s.blacklist_grade || '?'}(${s.blacklist_score ?? '?'}) Hdr:${s.header_grade || '?'}(${s.header_score ?? '?'}) Cnt:${s.content_grade || '?'}(${s.content_score ?? '?'})`);

            results.push({ vps: test.vps, domain: test.domain, score: avg, summary: s, spam: report.spam_analysis, dns: report.dns_analysis, auth: report.authentication_analysis });
        } else {
            console.log(`⏳ VPS-${test.vps} ${test.domain.padEnd(35)} — pending (${test.testId.substring(0, 10)})`);
            results.push({ vps: test.vps, domain: test.domain, pending: true, testId: test.testId });
        }
    }

    // Summary
    const graded = results.filter(r => r.score);
    if (graded.length > 0) {
        const avg = Math.round(graded.reduce((a, r) => a + r.score, 0) / graded.length);
        console.log(`\n╔══════════════════════════════════════════════╗`);
        console.log(`║  OVERALL SCORE: ${avg}/100 (${graded.length}/${sentTests.length} graded)           ║`);
        console.log(`╠══════════════════════════════════════════════╣`);

        // Category averages
        const catNames = { dns_score: 'DNS', authentication_score: 'AUTH', spam_score: 'SPAM', blacklist_score: 'BL', content_score: 'CONTENT', header_score: 'HEADERS' };
        for (const [key, label] of Object.entries(catNames)) {
            const vals = graded.map(r => r.summary?.[key]).filter(v => typeof v === 'number');
            const catAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : '?';
            console.log(`║  ${label.padEnd(10)} ${String(catAvg).padStart(3)}/100                              ║`);
        }
        console.log(`╚══════════════════════════════════════════════╝`);

        // Low scorers
        const low = graded.filter(r => r.score < 60);
        if (low.length) {
            console.log('\n⚠️ Low scorers (<60):');
            low.forEach(r => console.log(`  🔴 VPS-${r.vps} ${r.domain} → ${r.score}/100`));
        }
    }

    fs.writeFileSync('happydeliver_results.json', JSON.stringify(results, null, 2));
    console.log('\n✅ saved → happydeliver_results.json');
    console.log(`HappyDeliver running: http://${VPS29.ip}:8080/api/status`);
})();
