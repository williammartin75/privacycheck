#!/usr/bin/env node
/**
 * Final DKIM test: just re-check reports from the last run
 * (emails were already delivered with DKIM=pass)
 */
const http = require('http');
const fs = require('fs');

const HAPPY_VPS = '192.3.106.247';

function api(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: HAPPY_VPS, port: 8080, path, method: 'GET', timeout: 15000,
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
    // Load previous test IDs
    const prev = JSON.parse(fs.readFileSync('happydeliver_results_dkim.json', 'utf-8'));
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   DKIM TEST RESULTS (re-check scores)        ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    let totalScore = 0, graded = 0;
    const cats = { dns: [], auth: [], spam: [], bl: [], hdr: [], cnt: [] };

    for (const t of prev.tests) {
        try {
            const report = await api(`/api/report/${t.id}`);
            if (!report.score || !report.score.total) {
                console.log(`  ⏳ ${t.domain}: not yet graded`);
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
            console.log(`   ${s.total}/100  DNS:${g(s.dns || 0)}(${s.dns || 0}) Auth:${g(s.authentication || 0)}(${s.authentication || 0}) Spam:${g(s.spam || 0)}(${s.spam || 0}) BL:${g(s.blacklist || 0)}(${s.blacklist || 0})`);

            // Check DKIM in raw report
            try {
                const raw = await api(`/api/report/${t.id}/raw`);
                const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);
                const dm = rawStr.match(/dkim=(\w+)/);
                const im = rawStr.match(/iprev=(\w+)/);
                console.log(`   DKIM: ${dm ? dm[1] : 'N/A'} | PTR: ${im ? im[1] : 'N/A'}`);
            } catch { }
        } catch (e) {
            console.log(`  ❌ ${t.domain}: ${e.message}`);
        }
    }

    const avg = (a) => a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : 0;
    console.log(`\n╔══════════════════════════════════════════════╗`);
    console.log(`║  OVERALL: ${graded ? Math.round(totalScore / graded) : '?'}/100 (${graded}/${prev.tests.length})${' '.repeat(20)}║`);
    console.log(`╠══════════════════════════════════════════════╣`);
    console.log(`║  DNS         ${avg(cats.dns)}/100 (was 68)${' '.repeat(13)}║`);
    console.log(`║  AUTH        ${avg(cats.auth)}/100 (was 67)${' '.repeat(13)}║`);
    console.log(`║  SPAM        ${avg(cats.spam)}/100 (was 82)${' '.repeat(13)}║`);
    console.log(`║  BL         ${avg(cats.bl)}/100 (was 100)${' '.repeat(12)}║`);
    console.log(`║  CONTENT    ${avg(cats.cnt)}/100 (was 100)${' '.repeat(12)}║`);
    console.log(`║  HEADERS    ${avg(cats.hdr)}/100 (was 100)${' '.repeat(12)}║`);
    console.log(`╚══════════════════════════════════════════════╝`);
})();
