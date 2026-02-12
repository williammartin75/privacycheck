/**
 * Bulk deliverability test: FIXED version.
 * The swaks "221 Bye" is normal — it means the email was accepted.
 * swaks exits 0 on success, non-0 on failure.
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const VPS29_IP = '192.3.106.247';
const HAPPYDELIVER_API = `http://${VPS29_IP}:8080`;

const VPS_FLEET = [
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
];

function exec(conn, cmd, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve('[TIMEOUT]'), timeout);
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
        conn.connect({ host: ip, port: 22, username: 'root', password: pass, readyTimeout: 10000 });
    });
}

function apiRequest(method, path) {
    return new Promise((resolve, reject) => {
        const u = new URL(`${HAPPYDELIVER_API}${path}`);
        const opts = {
            hostname: u.hostname, port: u.port, path: u.pathname, method,
            headers: { 'Content-Type': 'application/json' }, timeout: 10000,
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

async function main() {
    console.log('=== Bulk Deliverability Test (VPS 21-28, 15 domains) ===\n');

    // Step 1: Send all emails first, collect test IDs
    const tests = [];
    let testNum = 0;
    const totalTests = VPS_FLEET.reduce((a, v) => a + v.domains.length, 0);

    for (const vps of VPS_FLEET) {
        let conn;
        try {
            conn = await sshConnect(vps.ip, vps.pass);
        } catch (err) {
            console.log(`❌ VPS-${vps.id} (${vps.ip}) SSH failed: ${err.message}`);
            continue;
        }

        // Install swaks quietly
        await exec(conn, 'which swaks >/dev/null 2>&1 || apt-get install -y -qq swaks 2>/dev/null', 30000);

        for (const domain of vps.domains) {
            testNum++;
            const fromEmail = `contact1@${domain}`;
            const progress = `[${testNum}/${totalTests}]`;

            try {
                // Create test on happyDeliver
                const test = await apiRequest('POST', '/api/test');
                if (!test.id) {
                    console.log(`${progress} ❌ ${fromEmail} — API error`);
                    continue;
                }

                // Send via swaks — check exit code, not output text
                const swaksCmd = `swaks --to "${test.email}" --from "${fromEmail}" --server ${VPS29_IP} --port 25 --helo mail.${domain} --header "Subject: Test ${domain}" --body "Deliverability test from ${fromEmail}" --timeout 15 2>&1; echo "EXIT:$?"`;
                const result = await exec(conn, swaksCmd, 20000);
                const exitMatch = result.out.match(/EXIT:(\d+)/);
                const exitCode = exitMatch ? parseInt(exitMatch[1]) : -1;

                if (exitCode === 0) {
                    console.log(`${progress} 📧 ${fromEmail} — Sent OK (test: ${test.id})`);
                    tests.push({ vps: vps.id, ip: vps.ip, domain, fromEmail, testId: test.id });
                } else {
                    console.log(`${progress} ❌ ${fromEmail} — swaks exit ${exitCode}`);
                    // Show the error
                    const errLines = result.out.split('\n').filter(l => l.includes('***') || l.includes('550') || l.includes('554'));
                    if (errLines.length) console.log(`   ${errLines[0]}`);
                }
            } catch (err) {
                console.log(`${progress} ❌ ${fromEmail} — ${err.message}`);
            }
        }
        conn.end();
    }

    console.log(`\n📧 Sent ${tests.length}/${totalTests} emails. Waiting 15s for happyDeliver to process...\n`);
    await sleep(15000);

    // Step 2: Fetch all reports
    console.log('=== Fetching Reports ===\n');
    const results = [];

    for (const test of tests) {
        let report;
        for (let retry = 0; retry < 5; retry++) {
            report = await apiRequest('GET', `/api/report/${test.testId}`);
            if (report && report.summary) break;
            await sleep(3000);
        }

        if (report && report.summary) {
            const s = report.summary;
            const spam = report.spam_analysis;
            const avgScore = Math.round((s.dns_score + s.authentication_score + s.spam_score + s.blacklist_score + s.content_score + s.header_score) / 6);
            const icon = avgScore >= 80 ? '🟢' : avgScore >= 60 ? '🟡' : '🔴';

            console.log(`${icon} VPS-${test.vps} ${test.domain.padEnd(32)} Avg:${avgScore} | DNS:${s.dns_grade}(${s.dns_score}) Auth:${s.authentication_grade}(${s.authentication_score}) Spam:${s.spam_grade}(${s.spam_score}) BL:${s.blacklist_grade}(${s.blacklist_score}) Hdr:${s.header_grade}(${s.header_score}) Cnt:${s.content_grade}(${s.content_score})`);

            results.push({
                vps: test.vps, ip: test.ip, domain: test.domain,
                avgScore,
                dns: { grade: s.dns_grade, score: s.dns_score },
                auth: { grade: s.authentication_grade, score: s.authentication_score },
                spam: { grade: s.spam_grade, score: s.spam_score },
                blacklist: { grade: s.blacklist_grade, score: s.blacklist_score },
                content: { grade: s.content_grade, score: s.content_score },
                headers: { grade: s.header_grade, score: s.header_score },
                spamDetails: spam?.test_details || {},
            });
        } else {
            console.log(`⏳ VPS-${test.vps} ${test.domain.padEnd(32)} — Report not ready (testId: ${test.testId})`);
            results.push({ vps: test.vps, ip: test.ip, domain: test.domain, error: 'pending', testId: test.testId });
        }
    }

    // Summary
    console.log('\n\n════════════════════════════════════════════════════════════');
    console.log('                       SUMMARY');
    console.log('════════════════════════════════════════════════════════════\n');

    const graded = results.filter(r => r.dns);
    if (graded.length > 0) {
        const avg = Math.round(graded.reduce((a, r) => a + r.avgScore, 0) / graded.length);
        console.log(`Overall average score: ${avg}/100`);
        console.log(`Domains tested: ${graded.length}/${totalTests}\n`);

        // Per-category summary
        ['dns', 'auth', 'spam', 'blacklist', 'content', 'headers'].forEach(cat => {
            const grades = {};
            graded.forEach(r => {
                const g = r[cat]?.grade || '?';
                grades[g] = (grades[g] || 0) + 1;
            });
            const avgCat = Math.round(graded.reduce((a, r) => a + (r[cat]?.score || 0), 0) / graded.length);
            console.log(`${cat.padEnd(10)} avg:${avgCat} | ${Object.entries(grades).map(([g, c]) => `${g}:${c}`).join(' ')}`);
        });

        // Common spam issues
        const allIssues = {};
        graded.forEach(r => {
            Object.entries(r.spamDetails).forEach(([k, v]) => {
                if (v.score > 0) allIssues[k] = (allIssues[k] || []).concat(r.domain);
            });
        });
        if (Object.keys(allIssues).length > 0) {
            console.log('\nSpam issues found:');
            Object.entries(allIssues).sort((a, b) => b[1].length - a[1].length).forEach(([issue, domains]) => {
                console.log(`  ${issue}: ${domains.length}/${graded.length} domains`);
            });
        }
    }

    // Save
    fs.writeFileSync('mail_test_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to mail_test_results.json');
}

main().catch(console.error);
