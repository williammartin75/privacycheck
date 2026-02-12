/**
 * Deploy happyDeliver on VPS-30, then test ALL 28 VPS (1-28) with domains.
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const VPS30 = { ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' };
const HAPPYDELIVER_API = `http://${VPS30.ip}:8080`;

// ALL 28 VPS with domains
const ALL_VPS = [
    // VPS 1-10 (old fleet)
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
    // VPS 11-20
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
    // VPS 21-28
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacy-audit.cloud'] },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v', domains: ['privacyaudit.cloud', 'privacyauditmail.cloud'] },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS', domains: ['mailprivacyaudit.online', 'mailprivacyaudit.cloud'] },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o', domains: ['mailprivacyaudit.site', 'mailprivacycheck.online'] },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q', domains: ['mailprivacycheck.cloud', 'mailprivacyreview.online'] },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK', domains: ['mailprivacyreview.info', 'mailprivacyreview.cloud'] },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v', domains: ['mailprivacyreview.site', 'mail-privacy-checker.online'] },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK', domains: ['mail-privacy-checker.info'] },
    // VPS 29 (spare - no domains but test anyway)
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A', domains: [] },
];

function exec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve({ out: '[TIMEOUT]', code: -1 }), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', (code) => { clearTimeout(timer); resolve({ out: out.trim(), code }); });
        });
    });
}

function sshConnect(ip, pass) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({ host: ip, port: 22, username: 'root', password: pass, readyTimeout: 15000 });
    });
}

function apiRequest(method, path) {
    return new Promise((resolve, reject) => {
        const u = new URL(`${HAPPYDELIVER_API}${path}`);
        const opts = {
            hostname: u.hostname, port: u.port, path: u.pathname, method,
            headers: { 'Content-Type': 'application/json' }, timeout: 15000,
        };
        const req = http.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch { resolve(d); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── PHASE 1: DEPLOY ───
async function deploy() {
    console.log('═══════════════════════════════════════════');
    console.log('  PHASE 1: Deploy happyDeliver on VPS-30');
    console.log('═══════════════════════════════════════════\n');

    const conn = await sshConnect(VPS30.ip, VPS30.pass);

    // Install Docker
    console.log('Installing Docker...');
    const dockerCheck = await exec(conn, 'docker --version 2>&1');
    if (dockerCheck.out.includes('not found') || dockerCheck.out.includes('NOT_INSTALLED')) {
        console.log('  Docker not found, installing...');
        await exec(conn, 'apt-get update -qq && apt-get install -y -qq docker.io 2>/dev/null', 180000);
        await exec(conn, 'systemctl enable docker && systemctl start docker');
        console.log('  Docker installed!');
    } else {
        console.log(`  ${dockerCheck.out}`);
    }

    // Stop conflicting services
    await exec(conn, 'systemctl stop postfix 2>/dev/null; systemctl disable postfix 2>/dev/null');
    await exec(conn, 'ufw allow 25/tcp 2>/dev/null; ufw allow 8080/tcp 2>/dev/null');

    // Pull and start happyDeliver
    console.log('Pulling happyDeliver image...');
    const pullResult = await exec(conn, 'docker pull happydomain/happydeliver:latest 2>&1 | tail -3', 180000);
    console.log(`  ${pullResult.out}`);

    // Remove old container if exists
    await exec(conn, 'docker rm -f happydeliver 2>/dev/null');

    console.log('Starting container...');
    const runCmd = `docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local --hostname mail.emailtester.local -v /root/hd-data:/var/lib/happydeliver -v /root/hd-logs:/var/log/happydeliver happydomain/happydeliver:latest 2>&1`;
    const runResult = await exec(conn, runCmd);
    console.log(`  Container: ${runResult.out.substring(0, 20)}...`);

    console.log('Waiting 12s for startup...');
    await sleep(12000);

    // Verify
    const status = await exec(conn, 'curl -s http://localhost:8080/api/status 2>&1');
    console.log(`  API status: ${status.out}`);

    const test = await exec(conn, 'curl -s -X POST http://localhost:8080/api/test 2>&1');
    console.log(`  Test create: ${test.out.substring(0, 80)}`);

    conn.end();

    if (!status.out.includes('healthy')) {
        console.log('\n❌ happyDeliver not ready! Check VPS-30.');
        process.exit(1);
    }
    console.log('\n✅ happyDeliver ready on VPS-30!\n');
}

// ─── PHASE 2: TEST ALL VPS ───
async function testAll() {
    console.log('═══════════════════════════════════════════');
    console.log('  PHASE 2: Test all VPS (1-29)');
    console.log('═══════════════════════════════════════════\n');

    const vpsWithDomains = ALL_VPS.filter(v => v.domains.length > 0);
    const totalTests = vpsWithDomains.reduce((a, v) => a + v.domains.length, 0);
    console.log(`Testing ${totalTests} domains across ${vpsWithDomains.length} VPS\n`);

    // Send all emails first
    const tests = [];
    let testNum = 0;

    for (const vps of vpsWithDomains) {
        let conn;
        try {
            conn = await sshConnect(vps.ip, vps.pass);
        } catch (err) {
            console.log(`❌ VPS-${vps.id} (${vps.ip}) SSH failed: ${err.message}`);
            for (const d of vps.domains) {
                tests.push({ vps: vps.id, ip: vps.ip, domain: d, error: 'ssh_failed' });
            }
            continue;
        }

        // Install swaks quietly
        await exec(conn, 'which swaks >/dev/null 2>&1 || apt-get install -y -qq swaks 2>/dev/null', 30000);

        for (const domain of vps.domains) {
            testNum++;
            const fromEmail = `contact1@${domain}`;
            const progress = `[${testNum}/${totalTests}]`;

            try {
                const test = await apiRequest('POST', '/api/test');
                if (!test.id) { console.log(`${progress} ❌ ${fromEmail} — API error`); continue; }

                const swaksCmd = `swaks --to "${test.email}" --from "${fromEmail}" --server ${VPS30.ip} --port 25 --helo mail.${domain} --header "Subject: Test ${domain}" --body "Deliverability test from ${fromEmail}" --timeout 15 2>&1; echo "EXIT:$?"`;
                const result = await exec(conn, swaksCmd, 25000);
                const exitMatch = result.out.match(/EXIT:(\d+)/);
                const exitCode = exitMatch ? parseInt(exitMatch[1]) : -1;

                if (exitCode === 0) {
                    console.log(`${progress} 📧 VPS-${String(vps.id).padStart(2)} ${fromEmail}`);
                    tests.push({ vps: vps.id, ip: vps.ip, domain, fromEmail, testId: test.id });
                } else {
                    console.log(`${progress} ❌ ${fromEmail} — exit ${exitCode}`);
                    tests.push({ vps: vps.id, ip: vps.ip, domain, error: `swaks_exit_${exitCode}` });
                }
            } catch (err) {
                console.log(`${progress} ❌ ${fromEmail} — ${err.message}`);
                tests.push({ vps: vps.id, ip: vps.ip, domain, error: err.message });
            }
        }
        conn.end();
    }

    const sent = tests.filter(t => t.testId);
    console.log(`\n📧 Sent ${sent.length}/${totalTests}. Waiting 20s for processing...\n`);
    await sleep(20000);

    // Fetch reports
    console.log('═══════════════════════════════════════════');
    console.log('  PHASE 3: Fetch Reports');
    console.log('═══════════════════════════════════════════\n');

    const results = [];
    for (const test of sent) {
        let report;
        for (let retry = 0; retry < 5; retry++) {
            report = await apiRequest('GET', `/api/report/${test.testId}`);
            if (report && report.summary) break;
            await sleep(3000);
        }

        if (report && report.summary) {
            const s = report.summary;
            const avgScore = Math.round((s.dns_score + s.authentication_score + s.spam_score + s.blacklist_score + s.content_score + s.header_score) / 6);
            const icon = avgScore >= 80 ? '🟢' : avgScore >= 60 ? '🟡' : '🔴';

            console.log(`${icon} VPS-${String(test.vps).padStart(2)} ${test.domain.padEnd(35)} Avg:${String(avgScore).padStart(2)} | DNS:${s.dns_grade}(${s.dns_score}) Auth:${s.authentication_grade}(${s.authentication_score}) Spam:${s.spam_grade}(${s.spam_score}) BL:${s.blacklist_grade}(${s.blacklist_score}) Hdr:${s.header_grade}(${s.header_score}) Cnt:${s.content_grade}(${s.content_score})`);

            results.push({
                vps: test.vps, ip: test.ip, domain: test.domain, avgScore,
                dns: { grade: s.dns_grade, score: s.dns_score },
                auth: { grade: s.authentication_grade, score: s.authentication_score },
                spam: { grade: s.spam_grade, score: s.spam_score },
                blacklist: { grade: s.blacklist_grade, score: s.blacklist_score },
                content: { grade: s.content_grade, score: s.content_score },
                headers: { grade: s.header_grade, score: s.header_score },
                spamDetails: report.spam_analysis?.test_details || {},
            });
        } else {
            console.log(`⏳ VPS-${test.vps} ${test.domain.padEnd(35)} — pending (${test.testId})`);
            results.push({ vps: test.vps, ip: test.ip, domain: test.domain, error: 'pending', testId: test.testId });
        }
    }

    // Add failed tests
    const failed = tests.filter(t => t.error);
    results.push(...failed);

    // ─── SUMMARY ───
    console.log('\n\n══════════════════════════════════════════════════════════════');
    console.log('                         SUMMARY');
    console.log('══════════════════════════════════════════════════════════════\n');

    const graded = results.filter(r => r.dns);
    const errors = results.filter(r => r.error);

    if (graded.length > 0) {
        const avg = Math.round(graded.reduce((a, r) => a + r.avgScore, 0) / graded.length);
        console.log(`Overall average: ${avg}/100`);
        console.log(`Tested: ${graded.length}/${totalTests} domains\n`);

        ['dns', 'auth', 'spam', 'blacklist', 'content', 'headers'].forEach(cat => {
            const grades = {};
            graded.forEach(r => { const g = r[cat]?.grade || '?'; grades[g] = (grades[g] || 0) + 1; });
            const avgCat = Math.round(graded.reduce((a, r) => a + (r[cat]?.score || 0), 0) / graded.length);
            console.log(`${cat.padEnd(10)} avg:${String(avgCat).padStart(3)} | ${Object.entries(grades).map(([g, c]) => `${g}:${c}`).join(' ')}`);
        });

        // Common spam issues
        const allIssues = {};
        graded.forEach(r => Object.entries(r.spamDetails).forEach(([k, v]) => {
            if (v.score > 0) allIssues[k] = (allIssues[k] || 0) + 1;
        }));
        if (Object.keys(allIssues).length > 0) {
            console.log('\nSpam issues:');
            Object.entries(allIssues).sort((a, b) => b[1] - a[1]).forEach(([i, c]) => console.log(`  ${i}: ${c}/${graded.length}`));
        }

        // Per-VPS summary
        console.log('\nPer-VPS average:');
        const vpsScores = {};
        graded.forEach(r => { if (!vpsScores[r.vps]) vpsScores[r.vps] = []; vpsScores[r.vps].push(r.avgScore); });
        Object.entries(vpsScores).sort((a, b) => a[0] - b[0]).forEach(([vps, scores]) => {
            const avg = Math.round(scores.reduce((a, s) => a + s, 0) / scores.length);
            const icon = avg >= 80 ? '🟢' : avg >= 60 ? '🟡' : '🔴';
            console.log(`  ${icon} VPS-${String(vps).padStart(2)}: ${avg}/100`);
        });
    }

    if (errors.length > 0) {
        console.log(`\nErrors (${errors.length}):`);
        errors.forEach(r => console.log(`  VPS-${r.vps} ${r.domain}: ${r.error}`));
    }

    fs.writeFileSync('mail_test_results_full.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to mail_test_results_full.json');
}

async function main() {
    await deploy();
    await testAll();
}

main().catch(console.error);
