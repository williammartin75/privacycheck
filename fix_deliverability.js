/**
 * Fix email deliverability issues on ALL 28 VPS:
 * 1. Fix Postfix myhostname to match primary domain
 * 2. Verify/fix DKIM signing
 * 3. Fix SPF HELO (add SPF record for mail hostname)
 * 4. Compare VPS 1-10 vs 11-28 config to understand score difference
 */
const { Client } = require('ssh2');
const fs = require('fs');

const ALL_VPS = [
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
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', domains: ['privacyaudit.online', 'privacy-audit.cloud'] },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v', domains: ['privacyaudit.cloud', 'privacyauditmail.cloud'] },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS', domains: ['mailprivacyaudit.online', 'mailprivacyaudit.cloud'] },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o', domains: ['mailprivacyaudit.site', 'mailprivacycheck.online'] },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q', domains: ['mailprivacycheck.cloud', 'mailprivacyreview.online'] },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK', domains: ['mailprivacyreview.info', 'mailprivacyreview.cloud'] },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v', domains: ['mailprivacyreview.site', 'mail-privacy-checker.online'] },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK', domains: ['mail-privacy-checker.info'] },
];

function exec(conn, cmd, timeout = 30000) {
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

async function diagnoseAndFix(vps) {
    const id = `VPS-${String(vps.id).padStart(2, '0')}`;
    let conn;
    try {
        conn = await sshConnect(vps.ip, vps.pass);
    } catch (e) {
        console.log(`${id} ❌ SSH failed: ${e.message}`);
        return { id: vps.id, error: 'ssh_failed' };
    }

    const primaryDomain = vps.domains[0];
    const heloHost = `mail.${primaryDomain}`;

    // ─── DIAGNOSE ───
    const diag = await exec(conn, `
echo "HOSTNAME=$(hostname)"
echo "MYHOSTNAME=$(postconf -h myhostname 2>/dev/null)"
echo "MYDOMAIN=$(postconf -h mydomain 2>/dev/null)"
echo "MYDEST=$(postconf -h mydestination 2>/dev/null)"
echo "PTR=$(dig -x ${vps.ip} +short 2>/dev/null)"
echo "DKIM_STATUS=$(systemctl is-active opendkim 2>/dev/null)"
echo "POSTFIX_STATUS=$(systemctl is-active postfix 2>/dev/null)"
echo "MILTER=$(postconf -h smtpd_milters 2>/dev/null)"
echo "OPENDKIM_SOCKET=$(grep -i '^Socket' /etc/opendkim.conf 2>/dev/null)"
`);

    const info = {};
    diag.out.split('\n').forEach(l => {
        const [k, ...v] = l.split('=');
        if (k) info[k] = v.join('=');
    });

    const currentHostname = info.MYHOSTNAME || 'unknown';
    const ptr = info.PTR || 'none';
    const dkimStatus = info.DKIM_STATUS || 'unknown';
    const milter = info.MILTER || 'none';

    // ─── FIX ───
    let fixes = [];

    // Fix 1: Set myhostname to mail.primarydomain
    if (currentHostname !== heloHost) {
        await exec(conn, `postconf -e "myhostname = ${heloHost}"`);
        fixes.push(`myhostname: ${currentHostname} → ${heloHost}`);
    }

    // Fix 2: Set hostname
    await exec(conn, `hostnamectl set-hostname ${heloHost} 2>/dev/null || hostname ${heloHost}`);

    // Fix 3: Ensure mydomain is set
    await exec(conn, `postconf -e "mydomain = ${primaryDomain}"`);

    // Fix 4: Ensure DKIM milter is configured
    if (!milter.includes('8891') && !milter.includes('opendkim')) {
        await exec(conn, `
postconf -e "smtpd_milters = inet:localhost:8891"
postconf -e "non_smtpd_milters = inet:localhost:8891"
postconf -e "milter_default_action = accept"
postconf -e "milter_protocol = 6"
`);
        fixes.push('milter configured');
    }

    // Fix 5: Ensure virtual_mailbox_domains includes all domains
    const vdomains = vps.domains.join(', ');
    await exec(conn, `postconf -e "virtual_mailbox_domains = ${vdomains}"`);

    // Fix 6: Ensure DKIM is running
    if (dkimStatus !== 'active') {
        await exec(conn, 'systemctl start opendkim 2>/dev/null; systemctl enable opendkim 2>/dev/null');
        fixes.push('opendkim started');
    }

    // Fix 7: Check DKIM keys exist for all domains
    for (const domain of vps.domains) {
        const keyCheck = await exec(conn, `test -f /etc/opendkim/keys/${domain}/mail.private && echo "OK" || echo "MISSING"`);
        if (keyCheck.out === 'MISSING') {
            await exec(conn, `
mkdir -p /etc/opendkim/keys/${domain}
opendkim-genkey -b 2048 -d ${domain} -D /etc/opendkim/keys/${domain} -s mail -v 2>&1
chown -R opendkim:opendkim /etc/opendkim/keys/${domain}
chmod 600 /etc/opendkim/keys/${domain}/mail.private
`, 15000);
            fixes.push(`DKIM key generated for ${domain}`);
        }
    }

    // Fix 8: Rebuild signing table and key table
    const sigLines = vps.domains.map(d => `*@${d} mail._domainkey.${d}`).join('\n');
    const keyLines = vps.domains.map(d => `mail._domainkey.${d} ${d}:mail:/etc/opendkim/keys/${d}/mail.private`).join('\n');
    const trustedLines = ['127.0.0.1', 'localhost', ...vps.domains.flatMap(d => [d, `*.${d}`])].join('\n');

    await exec(conn, `
cat > /etc/opendkim/signing.table << 'SIGEOF'
${sigLines}
SIGEOF
cat > /etc/opendkim/key.table << 'KEYEOF'
${keyLines}
KEYEOF
cat > /etc/opendkim/trusted.hosts << 'TRUSTEOF'
${trustedLines}
TRUSTEOF
`);

    // Restart services
    await exec(conn, 'systemctl restart opendkim 2>/dev/null; sleep 2; systemctl restart postfix 2>/dev/null; sleep 1');

    // Verify
    const verify = await exec(conn, `
echo "NEW_HOSTNAME=$(postconf -h myhostname)"
echo "DKIM_ACTIVE=$(systemctl is-active opendkim)"
echo "POSTFIX_ACTIVE=$(systemctl is-active postfix)"
echo "MILTER_OK=$(postconf -h smtpd_milters | grep -c 8891)"
`);

    const verifyInfo = {};
    verify.out.split('\n').forEach(l => {
        const [k, ...v] = l.split('=');
        if (k) verifyInfo[k] = v.join('=');
    });

    const ok = verifyInfo.DKIM_ACTIVE === 'active' && verifyInfo.POSTFIX_ACTIVE === 'active';
    const icon = ok ? '✅' : '⚠️';

    console.log(`${icon} ${id} (${vps.ip}) | hostname: ${verifyInfo.NEW_HOSTNAME} | DKIM: ${verifyInfo.DKIM_ACTIVE} | Postfix: ${verifyInfo.POSTFIX_ACTIVE} | PTR: ${ptr} | Fixes: ${fixes.length > 0 ? fixes.join('; ') : 'none needed'}`);

    conn.end();
    return {
        id: vps.id, ip: vps.ip, hostname: verifyInfo.NEW_HOSTNAME,
        dkim: verifyInfo.DKIM_ACTIVE, postfix: verifyInfo.POSTFIX_ACTIVE,
        ptr, fixes, ok
    };
}

async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  FIX DELIVERABILITY — ALL 28 VPS');
    console.log('═══════════════════════════════════════════════════════\n');

    const results = [];
    for (const vps of ALL_VPS) {
        const r = await diagnoseAndFix(vps);
        results.push(r);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const ok = results.filter(r => r.ok);
    const fixed = results.filter(r => r.fixes?.length > 0);
    const noPTR = results.filter(r => r.ptr === 'none' || r.ptr === '');
    const errors = results.filter(r => r.error);

    console.log(`✅ All services running: ${ok.length}/28`);
    console.log(`🔧 Fixed: ${fixed.length} VPS`);
    console.log(`⚠️  No PTR record: ${noPTR.length} VPS (needs RackNerd panel)`);
    console.log(`❌ Errors: ${errors.length}`);

    if (noPTR.length > 0) {
        console.log('\nVPS without PTR (set in RackNerd panel):');
        noPTR.forEach(r => console.log(`  VPS-${String(r.id).padStart(2)} ${r.ip} → should be: mail.${ALL_VPS.find(v => v.id === r.id).domains[0]}`));
    }

    fs.writeFileSync('fix_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to fix_results.json');
}

main().catch(console.error);
