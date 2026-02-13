#!/usr/bin/env node
/**
 * Check DNS propagation (dig) + Postfix status (SSH) for ALL 40 VPS.
 * DNS checks: A, MX, SPF, DKIM, DMARC, PTR
 * Postfix checks: service running, port 25 listening
 */
const { Client } = require('ssh2');
const dns = require('dns');
const { promisify } = require('util');

const resolve4 = promisify(dns.resolve4);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const reverse = promisify(dns.reverse);

// ALL 40 VPS
const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', domains: ['privacy-checker-pro.online', 'privacy-checker-pro.cloud'] },
    { id: 2, ip: '198.12.71.145', domains: ['privacy-checker-pro.site', 'privacy-checker-pro.website'] },
    { id: 3, ip: '206.217.139.115', domains: ['mailprivacycheckerpro.site', 'mailprivacycheckerpro.icu'] },
    { id: 4, ip: '206.217.139.116', domains: ['mailprivacycheckerpro.cloud', 'mailprivacycheckerpro.space'] },
    { id: 5, ip: '23.95.242.32', domains: ['mailprivacycheckerpro.website', 'mail-privacy-checker-pro.cloud'] },
    { id: 6, ip: '192.3.86.156', domains: ['mail-privacy-checker-pro.site'] },
    { id: 7, ip: '107.175.83.186', domains: ['mail-privacy-checker-pro.website'] },
    { id: 8, ip: '23.226.135.153', domains: ['reviewprivacycheckerpro.cloud'] },
    { id: 9, ip: '64.188.29.151', domains: ['reviewprivacycheckerpro.site'] },
    { id: 10, ip: '23.94.240.173', domains: ['reviewprivacycheckerpro.online'] },
    { id: 11, ip: '107.174.93.166', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 12, ip: '23.94.103.173', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 13, ip: '23.95.37.92', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 14, ip: '23.94.103.174', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 15, ip: '192.227.193.17', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 16, ip: '107.174.93.172', domains: ['privacy-checker-mail-pro.icu'] },
    { id: 17, ip: '107.174.88.210', domains: ['theprivacycheckerpro.cloud'] },
    { id: 18, ip: '23.95.215.19', domains: ['theprivacycheckerpro.site'] },
    { id: 19, ip: '107.175.214.243', domains: ['theprivacycheckerpro.online'] },
    { id: 20, ip: '107.172.30.53', domains: ['theprivacycheckerpro.website'] },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacy-audit.cloud'] },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v', domains: ['privacyaudit.cloud', 'privacyauditmail.cloud'] },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS', domains: ['mailprivacyaudit.online', 'mailprivacyaudit.cloud'] },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o', domains: ['mailprivacyaudit.site', 'mailprivacycheck.online'] },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q', domains: ['mailprivacycheck.cloud', 'mailprivacyreview.online'] },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK', domains: ['mailprivacyreview.info', 'mailprivacyreview.cloud'] },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v', domains: ['mailprivacyreview.site', 'mail-privacy-checker.online'] },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK', domains: ['mail-privacy-checker.info'] },
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A', domains: ['mailprivacychecker.info', 'mailprivacychecker.cloud'] },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz', domains: ['mailprivacychecker.site'] },
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

// VPS 1-20 passwords (from old fleet)
const OLD_PASSWORDS = {
    1: '4uZeYG82Wgf5tf0Y7B', 2: '7P6LB61mlnNaoo8S0Z', 3: '20QEs9OSh8Bw3egI1q',
    4: 'JvSg1HPu956fAt0dY0', 5: 'v6Jk79EUE15reqJ3zB', 6: 'H77WKufh2r9lVX3iP6',
    7: '1KiaL7RpwAng23B08L', 8: 'dIKsL94sx6o8u7SAA1', 9: '1EQpF0fSapC610hjK3',
    10: 'L5fgrQ6I84E3uvR2Nn', 11: 'Ny75V1Z3IwZ6ipB4xp', 12: 'pT2c5KJt7m87St0MBe',
    13: 'Qh10W3rf83vgwFEOC5', 14: '2gx5E8Anl9XTG0Sib7', 15: 'VgU8YQK36qE28cp9wm',
    16: 'rB4KMA9xfGaq1Ri783', 17: '4S0ekC9cuV22ouWB4C', 18: 'BX4MK9yHl4Cb85nxd9',
    19: '10bGou182OX4ZOtFqw', 20: 'CvouI95Q5n4Jk1F2aE',
};

// Fill in old passwords
ALL_VPS.forEach(v => { if (!v.pass && OLD_PASSWORDS[v.id]) v.pass = OLD_PASSWORDS[v.id]; });

// ── DNS Checks ──
async function checkDNS(domain, expectedIP) {
    const results = { domain, a: '❌', mx: '❌', spf: '❌', dkim: '❌', dmarc: '❌' };

    try {
        const ips = await resolve4(domain);
        results.a = ips.includes(expectedIP) ? '✅' : `⚠️ ${ips[0]}`;
    } catch { results.a = '❌'; }

    try {
        const mx = await resolveMx(domain);
        results.mx = mx.some(r => r.exchange.includes('mail.')) ? '✅' : '⚠️';
    } catch { results.mx = '❌'; }

    try {
        const txt = await resolveTxt(domain);
        const flat = txt.map(r => r.join(''));
        results.spf = flat.some(t => t.includes('v=spf1')) ? '✅' : '❌';
    } catch { results.spf = '❌'; }

    try {
        const txt = await resolveTxt(`mail._domainkey.${domain}`);
        const flat = txt.map(r => r.join(''));
        results.dkim = flat.some(t => t.includes('v=DKIM1')) ? '✅' : '❌';
    } catch { results.dkim = '❌'; }

    try {
        const txt = await resolveTxt(`_dmarc.${domain}`);
        const flat = txt.map(r => r.join(''));
        results.dmarc = flat.some(t => t.includes('v=DMARC1')) ? '✅' : '❌';
    } catch { results.dmarc = '❌'; }

    return results;
}

async function checkPTR(ip) {
    try {
        const names = await reverse(ip);
        return names[0] || '❌';
    } catch { return '❌'; }
}

// ── Postfix Check via SSH ──
function sshConnect(host, password) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('SSH timeout')); }, 15000);
        conn.on('ready', () => { clearTimeout(timer); resolve(conn); });
        conn.on('error', (err) => { clearTimeout(timer); reject(err); });
        conn.connect({
            host, port: 22, username: 'root', password, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function sshExec(conn, cmd) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => resolve('TIMEOUT'), 10000);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return resolve('ERROR'); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
        });
    });
}

async function checkPostfix(vps) {
    const tag = `VPS-${vps.id}`;
    if (!vps.pass) return { id: vps.id, postfix: '⚠️ no pass', port25: '?' };

    try {
        const conn = await sshConnect(vps.ip, vps.pass);
        const status = await sshExec(conn, 'systemctl is-active postfix');
        const port = await sshExec(conn, 'ss -tlnp | grep :25 | head -1');
        conn.end();
        return {
            id: vps.id,
            postfix: status === 'active' ? '✅' : `❌ ${status}`,
            port25: port.includes(':25') ? '✅' : '❌'
        };
    } catch (err) {
        return { id: vps.id, postfix: `❌ ${err.message}`, port25: '❌' };
    }
}

// ── Main ──
async function main() {
    console.log('============================================================');
    console.log('  Full Infrastructure Check — 40 VPS, 60 domains');
    console.log('============================================================\n');

    // 1. DNS propagation (all domains in parallel)
    console.log('=== CHECK 1: DNS Propagation ===\n');
    console.log('VPS  | Domain                              | A  | MX | SPF | DKIM | DMARC');
    console.log('-----|-------------------------------------|----|----|-----|------|------');

    let dnsOk = 0, dnsTotal = 0;
    for (const vps of ALL_VPS) {
        const checks = await Promise.all(vps.domains.map(d => checkDNS(d, vps.ip)));
        for (const c of checks) {
            dnsTotal++;
            const allGreen = [c.a, c.mx, c.spf, c.dkim, c.dmarc].every(v => v === '✅');
            if (allGreen) dnsOk++;
            const pad = (s, n) => s.padEnd(n);
            console.log(`  ${String(vps.id).padStart(2)} | ${pad(c.domain, 35)} | ${c.a.padEnd(2)} | ${c.mx.padEnd(2)} | ${c.spf.padEnd(3)} | ${c.dkim.padEnd(4)} | ${c.dmarc}`);
        }
    }
    console.log(`\n  DNS: ${dnsOk}/${dnsTotal} fully propagated\n`);

    // 2. PTR records
    console.log('=== CHECK 2: PTR Records ===\n');
    for (const vps of ALL_VPS) {
        const ptr = await checkPTR(vps.ip);
        const icon = ptr !== '❌' ? '✅' : '❌';
        console.log(`  VPS-${String(vps.id).padStart(2)} ${vps.ip.padEnd(18)} PTR: ${icon} ${ptr}`);
    }

    // 3. Postfix status (parallel, 10 at a time)
    console.log('\n=== CHECK 3: Postfix Status ===\n');
    console.log('VPS  | Postfix  | Port 25');
    console.log('-----|----------|--------');

    const BATCH = 10;
    let postfixOk = 0;
    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(v => checkPostfix(v)));
        for (const r of results) {
            if (r.postfix === '✅' && r.port25 === '✅') postfixOk++;
            console.log(`  ${String(r.id).padStart(2)} | ${r.postfix.padEnd(8)} | ${r.port25}`);
        }
    }
    console.log(`\n  Postfix: ${postfixOk}/${ALL_VPS.length} running\n`);

    console.log('============================================================');
    console.log('  CHECK COMPLETE');
    console.log('============================================================');
}

main().catch(console.error);
