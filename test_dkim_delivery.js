#!/usr/bin/env node
/**
 * HappyDeliver test with DKIM signing:
 * - Send emails through VPS's local Postfix (which adds DKIM-Signature via opendkim milter)
 * - Configure transport_maps to route HappyDeliver emails to VPS-29
 * - Then collect results
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

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

function api(method, path) {
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
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  DKIM-SIGNED HAPPYDELIVER TEST (via local SMTP)  ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Phase 0: Restart HappyDeliver
    console.log('Phase 0: Restart HappyDeliver...');
    await ssh(HAPPY_VPS.ip, HAPPY_VPS.pass, 'docker rm -f happydeliver 2>/dev/null; sleep 1');
    const cResult = await ssh(HAPPY_VPS.ip, HAPPY_VPS.pass,
        'docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local -e HAPPYDELIVER_RATE_LIMIT=0 happydeliver 2>&1',
        30000
    );
    console.log('  Container:', cResult.substring(0, 20));
    await sleep(15000);

    const status = await api('GET', '/api/status');
    console.log('  API:', status.version || 'OK', '\n');

    // Phase 1: Configure transport_maps on each VPS to route @emailtester.local to VPS-29
    console.log('Phase 1: Configure transport to relay HappyDeliver emails\n');
    for (const vps of VPS_FLEET) {
        const r = await ssh(vps.ip, vps.pass, `
            # Add transport for emailtester.local -> VPS-29 port 25
            grep -q 'emailtester.local' /etc/postfix/transport 2>/dev/null || echo "emailtester.local smtp:[${HAPPY_VPS.ip}]:25" >> /etc/postfix/transport
            postmap /etc/postfix/transport
            postconf -e "transport_maps = hash:/etc/postfix/transport"
            postfix reload 2>&1 >/dev/null
            echo "VPS-${vps.id} OK"
        `);
        process.stdout.write(`  ${r} `);
    }
    console.log('\n');

    // Phase 2: Create tests and send via local sendmail (goes through milter for DKIM)
    console.log('Phase 2: Send 17 test emails via local Postfix (DKIM-signed)\n');
    const tests = [];

    for (const vps of VPS_FLEET) {
        for (const domain of vps.domains) {
            try {
                const test = await api('POST', '/api/test');
                if (!test.id) { console.log(`  ❌ ${domain}: no test created`); continue; }

                // Send via swaks to localhost:25 (goes through Postfix milter for DKIM signing)
                const r = await ssh(vps.ip, vps.pass, `
                    swaks --to "${test.email}" \\
                          --from "contact1@${domain}" \\
                          --server 127.0.0.1 --port 25 \\
                          --helo mail.${domain} \\
                          --header "Subject: HD Test ${domain}" \\
                          --body "HappyDeliver DKIM test for ${domain}" \\
                          --timeout 15 2>&1 | tail -3
                `, 25000);

                const success = r.includes('250 2.0.0') || r.includes('250 Ok');
                tests.push({ id: test.id, domain, vps: vps.id, success });
                console.log(`  [${tests.length}/17] ${success ? '📧' : '❌'} VPS-${vps.id} ${domain}`);
            } catch (e) {
                console.log(`  ❌ ${domain}: ${e.message}`);
            }
            await sleep(500);
        }
    }

    console.log(`\n📧 ${tests.filter(t => t.success).length}/17 sent. Waiting 60s for analysis...\n`);
    await sleep(60000);

    // Phase 3: Collect results
    console.log('Phase 3: Reports\n');
    let totalScore = 0, graded = 0;
    const categories = { dns: [], auth: [], spam: [], bl: [], hdr: [], cnt: [] };

    for (const test of tests) {
        try {
            const report = await api('GET', `/api/report/${test.id}`);
            if (!report.score) {
                console.log(`  ⏳ ${test.domain}: not graded yet`);
                continue;
            }

            const s = report.score;
            totalScore += s.total;
            graded++;
            categories.dns.push(s.dns || 0);
            categories.auth.push(s.authentication || 0);
            categories.spam.push(s.spam || 0);
            categories.bl.push(s.blacklist || 0);
            categories.hdr.push(s.headers || 0);
            categories.cnt.push(s.content || 0);

            const grade = (v) => v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 70 ? 'C' : v >= 60 ? 'D' : 'F';
            console.log(`${s.total >= 85 ? '🟢' : '🟡'} VPS-${test.vps} ${test.domain}`);
            console.log(`${s.total}/100`);
            console.log(`   DNS:${grade(s.dns || 0)}(${s.dns || 0}) Auth:${grade(s.authentication || 0)}(${s.authentication || 0}) Spam:${grade(s.spam || 0)}(${s.spam || 0}) BL:${grade(s.blacklist || 0)}(${s.blacklist || 0}) Hdr:${grade(s.headers || 0)}(${s.headers || 0}) Cnt:${grade(s.content || 0)}(${s.content || 0})`);

            // Check raw for DKIM
            try {
                const raw = await api('GET', `/api/report/${test.id}/raw`);
                const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
                const hasDkim = rawStr.includes('DKIM-Signature');
                const dkimResult = rawStr.match(/dkim=(\w+)/);
                console.log(`   DKIM: ${hasDkim ? '✅ signed' : '❌ unsigned'} | Result: ${dkimResult ? dkimResult[1] : 'N/A'}`);
            } catch { }
        } catch (e) {
            console.log(`  ❌ ${test.domain}: ${e.message}`);
        }
    }

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  OVERALL: ${graded ? Math.round(totalScore / graded) : '?'}/100 (${graded}/${tests.length} graded)${' '.repeat(15)}║`);
    console.log(`╠══════════════════════════════════════════════╣`);
    console.log(`║  DNS         ${avg(categories.dns)}/100${' '.repeat(20)}║`);
    console.log(`║  AUTH        ${avg(categories.auth)}/100${' '.repeat(20)}║`);
    console.log(`║  SPAM        ${avg(categories.spam)}/100${' '.repeat(20)}║`);
    console.log(`║  BL         ${avg(categories.bl)}/100${' '.repeat(20)}║`);
    console.log(`║  CONTENT    ${avg(categories.cnt)}/100${' '.repeat(20)}║`);
    console.log(`║  HEADERS    ${avg(categories.hdr)}/100${' '.repeat(20)}║`);
    console.log(`╚══════════════════════════════════════════════╝`);

    // Save
    fs.writeFileSync('happydeliver_results_dkim.json', JSON.stringify({ tests, categories, graded, avgScore: graded ? Math.round(totalScore / graded) : 0 }, null, 2));
    console.log('\n✅ saved → happydeliver_results_dkim.json');
})();
