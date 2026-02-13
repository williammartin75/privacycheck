#!/usr/bin/env node
/**
 * Test ALL mailbox domains via happyDeliver on VPS-29
 * 1. Make sure happyDeliver is running
 * 2. For each domain: create a test, send email from the right VPS, check report
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');
const path = require('path');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };
const HAPPYDELIVER_API = `http://${VPS29.ip}:8080`;

// All VPS with one test email per domain
const ALL_VPS = [
    // VPS 21-28 (old working ones)
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacyaudit.info'] },
    { id: 22, ip: '172.245.86.30', pass: 'Pk3m6fSn0qBu8bFH4c', domains: ['privacyaudit.click', 'privacyaudit.site'] },
    { id: 23, ip: '192.3.253.120', pass: '9Mc5yDr7Iv2TYXh1pW', domains: ['privacyscanner.site', 'privacyscanner.online'] },
    { id: 24, ip: '192.3.188.20', pass: 'Wz6bLxR4aN0pVe8sKd', domains: ['privacyscanner.click', 'privacyscanner.info'] },
    { id: 25, ip: '198.23.143.41', pass: 'Hf9wJn2gV5xC6mTr3q', domains: ['checkprivacy.site', 'checkprivacy.click'] },
    { id: 26, ip: '23.95.248.24', pass: '4eA7kYu0iP8s3bZx1Q', domains: ['checkprivacy.online', 'checkprivacy.info'] },
    { id: 27, ip: '172.245.184.200', pass: 'Sd2nX5vB7tM0gRw9jK', domains: ['checkmyprivacy.click', 'checkmyprivacy.online'] },
    { id: 28, ip: '23.95.132.82', pass: 'Gp8fW3cE6yU1hLm4nA', domains: ['checkmyprivacy.info', 'checkmyprivacy.site'] },
    // VPS 29-30
    { id: 30, ip: '192.3.165.139', pass: 'Tp1sLz9kX4w7vN0rYb', domains: ['privacyguardian.site', 'privacyguardian.info'] },
    // VPS 31-40 (new ones)
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

function sshExec(host, pass, cmd, timeout = 20000) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function apiRequest(method, apiPath, body) {
    return new Promise((resolve, reject) => {
        const u = new URL(`${HAPPYDELIVER_API}${apiPath}`);
        const opts = {
            hostname: u.hostname, port: u.port, path: u.pathname + (u.search || ''), method,
            headers: { 'Content-Type': 'application/json' }, timeout: 15000,
        };
        const req = http.request(opts, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); } catch { resolve(d); }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('API_TIMEOUT')); });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║  HAPPYDELIVER DELIVERABILITY TEST - ALL DOMAINS  ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    // Step 1: Check if happyDeliver is running
    console.log('1. Checking happyDeliver on VPS-29...');
    try {
        const status = await apiRequest('GET', '/api/status');
        console.log('   ✅ HappyDeliver is running:', JSON.stringify(status));
    } catch (e) {
        console.log('   ❌ HappyDeliver not reachable. Restarting...');
        const r = await sshExec(VPS29.ip, VPS29.pass, [
            'docker rm -f happydeliver 2>/dev/null',
            `docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local --hostname mail.emailtester.local -v /root/happydeliver-data:/var/lib/happydeliver -v /root/happydeliver-logs:/var/log/happydeliver happydomain/happydeliver:latest 2>&1`,
        ].join(' && '), 30000);
        console.log('   Restart result:', r.substring(0, 100));
        await sleep(10000);

        try {
            const status2 = await apiRequest('GET', '/api/status');
            console.log('   ✅ Now running:', JSON.stringify(status2));
        } catch {
            console.log('   ❌ Still not running. Aborting.');
            return;
        }
    }

    // Step 2: Create tests for all domains
    console.log('\n2. Creating tests and sending emails from each VPS...\n');

    const results = [];
    const testIds = [];

    for (const vps of ALL_VPS) {
        for (const domain of vps.domains) {
            const fromEmail = `contact1@${domain}`;
            process.stdout.write(`   VPS-${vps.id} ${domain}... `);

            try {
                // Create test
                const test = await apiRequest('POST', '/api/test');
                if (!test || !test.email) {
                    console.log('❌ no test email');
                    results.push({ vps: vps.id, domain, status: 'NO_TEST' });
                    continue;
                }

                testIds.push({ id: test.id, vps: vps.id, domain, from: fromEmail, to: test.email });

                // Send email from the VPS via raw SMTP to VPS-29:25
                const sendCmd = `printf "EHLO mail.${domain}\\r\\nMAIL FROM:<${fromEmail}>\\r\\nRCPT TO:<${test.email}>\\r\\nDATA\\r\\nSubject: Deliverability Test ${domain}\\r\\nFrom: ${fromEmail}\\r\\nTo: ${test.email}\\r\\nMIME-Version: 1.0\\r\\nContent-Type: text/plain\\r\\n\\r\\nTest from ${fromEmail}\\r\\n.\\r\\nQUIT\\r\\n" | nc -w10 ${VPS29.ip} 25 2>&1`;

                const sendResult = await sshExec(vps.ip, vps.pass, sendCmd, 15000);

                if (sendResult.includes('250') && sendResult.includes('queued')) {
                    process.stdout.write('sent ');
                } else if (sendResult.includes('250')) {
                    process.stdout.write('sent ');
                } else {
                    console.log(`SEND_FAIL: ${sendResult.substring(0, 80)}`);
                    results.push({ vps: vps.id, domain, status: 'SEND_FAIL', detail: sendResult.substring(0, 80) });
                    continue;
                }

                console.log('✅');
                results.push({ vps: vps.id, domain, status: 'SENT', testId: test.id });
            } catch (e) {
                console.log(`ERR: ${e.message}`);
                results.push({ vps: vps.id, domain, status: 'ERROR', detail: e.message });
            }
        }
    }

    // Step 3: Wait for delivery
    console.log(`\n3. Waiting 30s for emails to arrive (${testIds.length} tests)...`);
    await sleep(30000);

    // Step 4: Check reports
    console.log('\n4. Checking reports...\n');

    const table = [];
    for (const t of testIds) {
        try {
            const report = await apiRequest('GET', `/api/report/${t.id}`);
            const inbox = report?.inbox || report?.result?.inbox || '?';
            const spam = report?.spam || report?.result?.spam || '?';
            const received = report?.received || report?.result?.received;
            table.push({
                vps: `VPS-${t.vps}`,
                domain: t.domain,
                inbox: inbox,
                spam: spam,
                received: received,
                raw: JSON.stringify(report).substring(0, 120),
            });
            console.log(`   VPS-${t.vps} ${t.domain}: ${JSON.stringify(report).substring(0, 100)}`);
        } catch (e) {
            table.push({ vps: `VPS-${t.vps}`, domain: t.domain, inbox: '?', spam: '?', raw: e.message });
            console.log(`   VPS-${t.vps} ${t.domain}: ERR ${e.message}`);
        }
    }

    // Summary
    console.log('\n\n═══ SUMMARY ═══');
    console.log(`Tests created: ${testIds.length}`);
    console.log(`Send failures: ${results.filter(r => r.status !== 'SENT').length}`);

    const sent = results.filter(r => r.status === 'SENT');
    console.log(`Sent OK: ${sent.length}`);

    if (results.filter(r => r.status !== 'SENT').length > 0) {
        console.log('\nFailed sends:');
        for (const r of results.filter(r => r.status !== 'SENT')) {
            console.log(`  VPS-${r.vps} ${r.domain}: ${r.status} ${r.detail || ''}`);
        }
    }

    console.log('\n═══ DONE ═══');
})();
