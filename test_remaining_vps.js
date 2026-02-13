#!/usr/bin/env node
/** Test remaining VPS 31-34 AND get detailed DNS/Auth reports */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

const VPS_REMAINING = [
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39', domains: ['mailprivacychecker.space', 'mailprivacychecker.website'] },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4', domains: ['contactprivacychecker.info'] },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0', domains: ['contactprivacychecker.cloud'] },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3', domains: ['contactprivacychecker.site', 'contactprivacychecker.website'] },
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

function api(method, path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: VPS29.ip, port: 8080, path, method, timeout: 15000,
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

(async () => {
    // 1. Install swaks on VPS 31-34
    console.log('=== Installing swaks on VPS 31-34 ===\n');
    for (const vps of VPS_REMAINING) {
        const r = await sshExec(vps.ip, vps.pass,
            'which swaks >/dev/null 2>&1 && echo "ALREADY_INSTALLED" || (apt-get update -qq && apt-get install -y -qq swaks 2>&1 | tail -1)',
            60000
        );
        console.log(`VPS-${vps.id}: ${r}`);
    }

    // 2. Test HappyDeliver API is still up
    console.log('\n=== Verify API ===');
    try {
        const s = await api('GET', '/api/status');
        console.log('API:', JSON.stringify(s));
    } catch (e) {
        console.log('❌ API down:', e.message);
        return;
    }

    // 3. Send tests
    console.log('\n=== Send tests ===\n');
    const tests = [];
    for (const vps of VPS_REMAINING) {
        for (const domain of vps.domains) {
            const from = `contact1@${domain}`;
            const test = await api('POST', '/api/test');
            if (!test?.id) { console.log(`❌ ${domain}: no test`); continue; }

            const r = await sshExec(vps.ip, vps.pass,
                `swaks --to "${test.email}" --from "${from}" --server ${VPS29.ip} --port 25 --helo mail.${domain} --header "Subject: HD Test ${domain}" --body "Test from ${from}" --timeout 15 2>&1; echo "XIT:$?"`,
                25000
            );
            const m = r.match(/XIT:(\d+)/);
            if (m && m[1] === '0') {
                console.log(`📧 VPS-${vps.id} ${domain} → OK`);
                tests.push({ vps: vps.id, domain, testId: test.id });
            } else {
                console.log(`❌ VPS-${vps.id} ${domain}: ${r.split('\n').find(l => l.includes('***'))?.substring(0, 60) || 'exit ' + (m ? m[1] : '?')}`);
            }
            await sleep(300);
        }
    }

    // 4. Wait for analysis
    console.log(`\n📧 ${tests.length} sent. Waiting 30s...\n`);
    await sleep(30000);

    // 5. Get reports + DETAILED DATA
    console.log('=== Reports ===\n');
    const results = [];
    for (const test of tests) {
        let report;
        for (let i = 0; i < 5; i++) {
            try { report = await api('GET', `/api/report/${test.testId}`); if (report?.summary) break; } catch { }
            await sleep(3000);
        }
        if (report?.summary) {
            const s = report.summary;
            const scores = [s.dns_score, s.authentication_score, s.spam_score, s.blacklist_score, s.content_score, s.header_score].filter(x => typeof x === 'number');
            const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
            const icon = avg >= 80 ? '🟢' : avg >= 60 ? '🟡' : '🔴';
            console.log(`${icon} VPS-${test.vps} ${test.domain.padEnd(35)} ${avg}/100`);
            console.log(`   DNS:${s.dns_grade}(${s.dns_score}) Auth:${s.authentication_grade}(${s.authentication_score}) Spam:${s.spam_grade}(${s.spam_score}) BL:${s.blacklist_grade}(${s.blacklist_score})`);
            results.push({ vps: test.vps, domain: test.domain, score: avg, summary: s });
        } else {
            console.log(`⏳ VPS-${test.vps} ${test.domain} — pending`);
        }
    }

    // 6. Get detailed report for first test to understand DNS/Auth D grade
    if (tests.length > 0) {
        console.log('\n=== DETAILED REPORT (first domain) ===\n');
        try {
            // Use /api/report/{id}/raw for full details
            const raw = await api('GET', `/api/report/${tests[0].testId}/raw`);
            console.log(JSON.stringify(raw, null, 2).substring(0, 3000));
        } catch (e) {
            console.log('Raw report error:', e.message);
            // Try regular
            const report = await api('GET', `/api/report/${tests[0].testId}`);
            console.log(JSON.stringify(report, null, 2).substring(0, 3000));
        }
    }

    // Also inspect the first test from previous run
    console.log('\n=== DETAILED REPORT (privacyaudit.online) from previous run ===');
    const prev = JSON.parse(fs.readFileSync('happydeliver_results.json'));
    // We don't have testId for previous — query one more
    const prevTest = await api('POST', '/api/test');
    const sendR = await sshExec('192.227.234.211', 'Jd5Fh769E0hnmX9CqK',
        `swaks --to "${prevTest.email}" --from "contact1@privacyaudit.online" --server ${VPS29.ip} --port 25 --helo mail.privacyaudit.online --header "Subject: Detail test" --body "Test" --timeout 15 2>&1; echo "XIT:$?"`,
        25000
    );
    if (sendR.includes('XIT:0')) {
        await sleep(20000);
        const raw = await api('GET', `/api/report/${prevTest.id}/raw`);
        console.log(JSON.stringify(raw, null, 2).substring(0, 3000));
    }

    // Merge results
    const existing = JSON.parse(fs.readFileSync('happydeliver_results.json'));
    existing.push(...results);
    fs.writeFileSync('happydeliver_results.json', JSON.stringify(existing, null, 2));
    console.log('\n✅ Updated happydeliver_results.json');
})();
