#!/usr/bin/env node
/**
 * Audit DKIM + SPF DNS records for ALL 45 mail domains.
 * Uses VPS-21 as SSH proxy to run dig commands.
 * Reports: ✅ DKIM OK, ⚠️ SPF softfail, ❌ DKIM missing
 */
const { Client } = require('ssh2');

const PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };

// ALL domains across ALL VPS
const ALL_DOMAINS = [
    // VPS 01-10 (from vps_inventory — these are worker VPS, may not have mail)
    // VPS 11-16
    'privacycheckermailpro.cloud', 'privacycheckermailpro.site',
    'privacycheckermailpro.website', 'privacycheckermailpro.space',
    'privacycheckermailpro.icu', 'privacy-checker-mail-pro.online',
    'privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site',
    'privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website',
    'privacy-checker-mail-pro.icu',
    // VPS 17-20
    'theprivacycheckerpro.cloud', 'theprivacycheckerpro.site',
    'theprivacycheckerpro.online', 'theprivacycheckerpro.website',
    // VPS 21-28
    'privacyaudit.online', 'privacy-audit.cloud',
    'privacyaudit.cloud', 'privacyauditmail.cloud',
    'mailprivacyaudit.online', 'mailprivacyaudit.cloud',
    'mailprivacyaudit.site', 'mailprivacycheck.online',
    'mailprivacycheck.cloud', 'mailprivacyreview.online',
    'mailprivacyreview.info', 'mailprivacyreview.cloud',
    'mailprivacyreview.site', 'mail-privacy-checker.online',
    'mail-privacy-checker.info',
    // VPS 31-40
    'mailprivacychecker.space', 'mailprivacychecker.website',
    'contactprivacychecker.info', 'contactprivacychecker.cloud',
    'contactprivacychecker.site', 'contactprivacychecker.website',
    'reportprivacychecker.info', 'reportprivacychecker.cloud',
    'reportprivacychecker.site', 'reportprivacychecker.website',
    'checkprivacychecker.info', 'checkprivacychecker.cloud',
    'checkprivacychecker.site', 'checkprivacychecker.space',
    'checkprivacychecker.website',
];

function sshConnect(host, pass) {
    return new Promise((r, j) => {
        const c = new Client();
        c.on('ready', () => r(c));
        c.on('error', j);
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function exec(conn, cmd, t = 30000) {
    return new Promise((r, j) => {
        const tm = setTimeout(() => j(new Error('Timeout')), t);
        conn.exec(cmd, (e, s) => {
            if (e) { clearTimeout(tm); return j(e); }
            let o = '';
            s.on('data', d => o += d.toString());
            s.stderr.on('data', d => o += d.toString());
            s.on('close', () => { clearTimeout(tm); r(o.trim()); });
        });
    });
}

async function main() {
    console.log('============================================================');
    console.log('  DKIM + SPF DNS Audit — ALL domains');
    console.log('============================================================\n');

    const conn = await sshConnect(PROXY.ip, PROXY.pass);
    console.log('Connected to VPS-21 proxy\n');

    const results = { ok: [], dkimMissing: [], spfSoftfail: [], spfMissing: [], errors: [] };

    for (const domain of ALL_DOMAINS) {
        try {
            // Check DKIM
            const dkim = await exec(conn, `dig +short TXT mail._domainkey.${domain} @8.8.8.8`);
            const hasDkim = dkim.includes('DKIM1') || dkim.includes('p=');

            // Check SPF
            const spf = await exec(conn, `dig +short TXT ${domain} @8.8.8.8 | grep spf`);
            const hasSpf = spf.includes('v=spf1');
            const isSoftfail = spf.includes('~all');
            const isHardfail = spf.includes('-all');

            // Status
            let status = '';
            if (hasDkim && hasSpf && isHardfail) {
                status = '✅';
                results.ok.push(domain);
            } else {
                const issues = [];
                if (!hasDkim) { issues.push('❌ DKIM MISSING'); results.dkimMissing.push(domain); }
                if (!hasSpf) { issues.push('❌ SPF MISSING'); results.spfMissing.push(domain); }
                else if (isSoftfail) { issues.push('⚠️  SPF ~all (softfail)'); results.spfSoftfail.push(domain); }
                if (hasDkim && hasSpf && !isSoftfail) { results.ok.push(domain); }
                status = issues.join(' | ');
            }

            const spfShort = hasSpf ? (isHardfail ? '-all' : '~all') : 'NONE';
            console.log(`  ${hasDkim ? '✅' : '❌'} DKIM  ${spfShort.padEnd(5)} SPF  ${domain}`);
            if (status.includes('❌') || status.includes('⚠️')) {
                console.log(`    → ${status}`);
            }
        } catch (err) {
            console.log(`  ⚠️  ${domain}: ${err.message}`);
            results.errors.push(domain);
        }
    }

    conn.end();

    // Summary
    console.log('\n============================================================');
    console.log('  AUDIT SUMMARY');
    console.log('============================================================');
    console.log(`  Total domains:     ${ALL_DOMAINS.length}`);
    console.log(`  ✅ Fully OK:        ${results.ok.length}`);
    console.log(`  ❌ DKIM missing:    ${results.dkimMissing.length}`);
    console.log(`  ⚠️  SPF softfail:   ${results.spfSoftfail.length}`);
    console.log(`  ❌ SPF missing:     ${results.spfMissing.length}`);
    console.log(`  ⚠️  Errors:         ${results.errors.length}`);

    if (results.dkimMissing.length > 0) {
        console.log('\n  DKIM missing domains:');
        results.dkimMissing.forEach(d => console.log(`    - ${d}`));
    }
    if (results.spfSoftfail.length > 0) {
        console.log('\n  SPF softfail domains (should use -all):');
        results.spfSoftfail.forEach(d => console.log(`    - ${d}`));
    }

    // Save results
    const fs = require('fs');
    fs.writeFileSync('dkim_audit_results.json', JSON.stringify(results, null, 2));
    console.log('\n  Results saved to dkim_audit_results.json');
}

main().catch(e => console.error('Error:', e.message));
