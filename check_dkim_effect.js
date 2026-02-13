#!/usr/bin/env node
/** Check: (1) DNS propagation of DKIM, (2) whether swaks goes through Postfix milter */
const { Client } = require('ssh2');
const dns = require('dns');
const http = require('http');
const fs = require('fs');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };
const VPS34 = { ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' };

function ssh(host, pass, cmd, timeout = 20000) {
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

(async () => {
    // 1. Check DNS propagation
    console.log('=== DNS DKIM CHECK ===\n');
    const domains = ['contactprivacychecker.site', 'checkprivacychecker.info', 'reportprivacychecker.info'];
    for (const d of domains) {
        const r = await new Promise(resolve => {
            dns.resolveTxt(`mail._domainkey.${d}`, (err, records) => {
                resolve(err ? `NONE (${err.code})` : records.map(r => r.join('')).join('').substring(0, 60));
            });
        });
        console.log(`  mail._domainkey.${d}: ${r}`);
    }

    // 2. CRITICAL: swaks sends directly to VPS-29 port 25, NOT through VPS-34's Postfix!
    // So the emails DON'T go through the VPS's milter. The DKIM fix won't work with this test method.
    // We need to either:
    //   a) Send through the VPS's own Postfix (port 25 on localhost) which then relays to VPS-29
    //   b) Or have the VPS's Postfix sign and then relay

    console.log('\n=== TEST: Send through VPS Postfix (with DKIM signing) ===\n');

    // Create test
    const test = await api('POST', '/api/test');
    console.log('Test:', test.id, test.email);

    // Send via VPS-34's own Postfix (uses sendmail, which goes through milter)
    const r = await ssh(VPS34.ip, VPS34.pass, `
        echo "Subject: DKIM send test via Postfix\nFrom: contact1@contactprivacychecker.site\nTo: ${test.email}\n\nDKIM test body" | /usr/sbin/sendmail -t -f contact1@contactprivacychecker.site 2>&1
        echo "SENT"
        sleep 3
        tail -10 /var/log/mail.log 2>/dev/null | grep -iE "(dkim|${test.id?.substring(0, 10) || 'test'})" | tail -5
    `, 15000);
    console.log('Send result:', r);

    // Wait for delivery
    console.log('\nWaiting 20s for delivery...');
    await new Promise(r => setTimeout(r, 20000));

    // Check report  
    const report = await api('GET', `/api/report/${test.id}/raw`);
    const raw = typeof report === 'string' ? report : JSON.stringify(report);

    // Check for DKIM-Signature header
    const hasDkim = raw.includes('DKIM-Signature');
    const dkimPass = raw.includes('dkim=pass');
    const dkimNone = raw.includes('dkim=none');

    console.log('\n=== RAW ANALYSIS ===');
    console.log('Has DKIM-Signature header:', hasDkim ? '✅ YES' : '❌ NO');
    console.log('DKIM result:', dkimPass ? '✅ dkim=pass' : dkimNone ? '❌ dkim=none' : '⚠️ unknown');

    // Show dkim-related lines
    const lines = raw.split('\\r\\n').filter(l => l.toLowerCase().includes('dkim'));
    console.log('\nDKIM-related lines:');
    lines.forEach(l => console.log('  ', l.substring(0, 100)));

    // 3. Now test: swaks with --server pointing to VPS-34's localhost
    console.log('\n=== TEST 2: swaks through VPS own Postfix ===\n');
    const test2 = await api('POST', '/api/test');
    console.log('Test2:', test2.id, test2.email);

    // Use swaks but through the VPS's own SMTP (relay)
    // Need to configure the VPS to relay to VPS-29
    const r2 = await ssh(VPS34.ip, VPS34.pass, `
        swaks --to "${test2.email}" --from "contact1@contactprivacychecker.site" --server 127.0.0.1 --port 25 --helo mail.contactprivacychecker.site --header "Subject: DKIM swaks local test" --body "Test" --timeout 15 2>&1
        echo "XIT:$?"
    `, 25000);
    console.log('swaks local:', r2.split('\n').filter(l => l.includes('***') || l.includes('250') || l.includes('XIT')).join('\n'));

    await new Promise(r => setTimeout(r, 20000));

    const report2 = await api('GET', `/api/report/${test2.id}/raw`);
    const raw2 = typeof report2 === 'string' ? report2 : JSON.stringify(report2);
    console.log('\nHas DKIM-Signature:', raw2.includes('DKIM-Signature') ? '✅' : '❌');
    console.log('DKIM result:', raw2.includes('dkim=pass') ? '✅ pass' : raw2.includes('dkim=none') ? '❌ none' : '⚠️ unknown');
})();
