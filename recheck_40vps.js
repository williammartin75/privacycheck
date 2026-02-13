#!/usr/bin/env node
/** Quick re-check of all 63 test reports — raw data only (DKIM+PTR) */
const http = require('http');
const fs = require('fs');

const HAPPY = '192.3.106.247';
const prev = JSON.parse(fs.readFileSync('happydeliver_40vps_results.json', 'utf-8'));

function api(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: HAPPY, port: 8080, path, method: 'GET', timeout: 10000,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('T')) });
        req.on('error', reject);
        req.end();
    });
}

(async () => {
    let dkimPass = 0, dkimFail = 0, dkimNone = 0, dkimUnk = 0;
    let ptrPass = 0, ptrFail = 0, ptrUnk = 0;
    let scored = 0, totalScore = 0;
    const issues = [];

    console.log('VPS  Domain                              DKIM    PTR     Score');
    console.log('───  ──────                              ────    ───     ─────');

    for (const t of prev.tests) {
        let dk = '?', ptr = '?', score = '⏳';
        try {
            const report = await api(`/api/report/${t.id}`);
            if (report.score && report.score.total) {
                score = report.score.total + '/100';
                scored++; totalScore += report.score.total;
            }
        } catch { }

        try {
            const raw = await api(`/api/report/${t.id}/raw`);
            const rs = typeof raw === 'string' ? raw : JSON.stringify(raw);
            const dm = rs.match(/dkim=(\w+)/); dk = dm ? dm[1] : '?';
            const im = rs.match(/iprev=(\w+)/); ptr = im ? im[1] : '?';
        } catch { }

        if (dk === 'pass') dkimPass++; else if (dk === 'fail' || dk === 'invalid') dkimFail++; else if (dk === 'none') dkimNone++; else dkimUnk++;
        if (ptr === 'pass') ptrPass++; else if (ptr === 'fail') ptrFail++; else ptrUnk++;

        const dkIcon = dk === 'pass' ? '✅' : dk === 'none' ? '⚠️' : '❌';
        const ptIcon = ptr === 'pass' ? '✅' : ptr === 'fail' ? '❌' : '❓';
        const dom = t.domain.padEnd(40);
        console.log(`${String(t.vps).padStart(3)}  ${dom} ${dkIcon}${dk.padEnd(6)} ${ptIcon}${ptr.padEnd(6)} ${score}`);

        if (dk !== 'pass' || ptr !== 'pass') {
            issues.push({ vps: t.vps, domain: t.domain, dkim: dk, ptr });
        }
    }

    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`DKIM: ${dkimPass}✅ pass  ${dkimNone}⚠️ none  ${dkimFail}❌ fail  ${dkimUnk}❓ unknown`);
    console.log(`PTR:  ${ptrPass}✅ pass  ${ptrFail}❌ fail  ${ptrUnk}❓ unknown`);
    console.log(`Score: ${scored}/63 graded, avg ${scored ? Math.round(totalScore / scored) : '?'}/100`);

    if (issues.length) {
        console.log(`\n⚠️ Issues (${issues.length}):`);
        issues.forEach(i => console.log(`  VPS-${i.vps} ${i.domain}: DKIM=${i.dkim} PTR=${i.ptr}`));
    }
})();
