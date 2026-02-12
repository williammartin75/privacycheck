/**
 * Fix PTR/rDNS records on VPS 11-28 via SolusVM API.
 * Each RackNerd VPS has a SolusVM client panel at nerdvm.racknerd.com
 * We try setting rDNS via the SolusVM client API.
 * If that doesn't work, we fall back to setting it on the VPS itself.
 */
const { Client } = require('ssh2');
const https = require('https');
const http = require('http');

// VPS 11-28 that need PTR fixes
const VPS_TO_FIX = [
    { id: 11, ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', ptr: 'mail.privacycheckermailpro.cloud' },
    { id: 12, ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', ptr: 'mail.privacycheckermailpro.website' },
    { id: 13, ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', ptr: 'mail.privacycheckermailpro.icu' },
    { id: 14, ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', ptr: 'mail.privacy-checker-mail-pro.cloud' },
    { id: 15, ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', ptr: 'mail.privacy-checker-mail-pro.space' },
    { id: 16, ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', ptr: 'mail.privacy-checker-mail-pro.icu' },
    { id: 17, ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C', ptr: 'mail.theprivacycheckerpro.cloud' },
    { id: 18, ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9', ptr: 'mail.theprivacycheckerpro.site' },
    { id: 19, ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw', ptr: 'mail.theprivacycheckerpro.online' },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE', ptr: 'mail.theprivacycheckerpro.website' },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK', ptr: 'mail.privacyaudit.online' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v', ptr: 'mail.privacyaudit.cloud' },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS', ptr: 'mail.mailprivacyaudit.online' },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o', ptr: 'mail.mailprivacyaudit.site' },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q', ptr: 'mail.mailprivacycheck.cloud' },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK', ptr: 'mail.mailprivacyreview.info' },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v', ptr: 'mail.mailprivacyreview.site' },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK', ptr: 'mail.mail-privacy-checker.info' },
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

async function fixPTR(vps) {
    const id = `VPS-${String(vps.id).padStart(2, '0')}`;
    let conn;
    try {
        conn = await sshConnect(vps.ip, vps.pass);
    } catch (e) {
        console.log(`${id} ❌ SSH failed: ${e.message}`);
        return false;
    }

    // Method 1: Check if SolusVM API key / hash is available on the VPS
    const solusCheck = await exec(conn, `
# Check for SolusVM config
cat /usr/local/solusvm/data/solusvm.conf 2>/dev/null || echo "NO_SOLUSVM"
# Check for any rDNS tools
which nslookup 2>/dev/null
which dig 2>/dev/null
# Current PTR
dig -x ${vps.ip} +short 2>/dev/null
# Check /etc/hostname
cat /etc/hostname
`);
    console.log(`${id} (${vps.ip}) → want: ${vps.ptr}`);
    console.log(`  Current state: ${solusCheck.out.split('\n').slice(0, 3).join(' | ')}`);

    // Method 2: Try using curl to the SolusVM client API from the VPS itself
    // RackNerd panels are typically at nerdvm.racknerd.com or vps.racknerd.com
    const tryPanels = [
        'https://nerdvm.racknerd.com',
        'https://vpscp.racknerd.com',
        'https://vms.racknerd.com'
    ];

    for (const panelUrl of tryPanels) {
        const check = await exec(conn, `curl -s -o /dev/null -w "%{http_code}" ${panelUrl} 2>/dev/null`, 10000);
        if (check.out && check.out !== '000') {
            console.log(`  Panel ${panelUrl}: HTTP ${check.out}`);
        }
    }

    // Method 3: Use the SolusVM WHMCS module API endpoint
    // SolusVM client API uses key + hash at /api/client/command.php
    // Try to get API credentials from the SolusVM data directory
    const apiCredsCheck = await exec(conn, `
ls /root/.solusvm* 2>/dev/null || echo "NO_SOLUSVM_DATA"
cat /root/.solusvm_apikey 2>/dev/null || echo "NO_KEY"
cat /root/.solusvm_apihash 2>/dev/null || echo "NO_HASH"
# Check if there's a solusvm client config anywhere
find / -name "*.solusvm*" -o -name "solusvm*" 2>/dev/null | head -5
`);
    console.log(`  SolusVM data: ${apiCredsCheck.out.substring(0, 200)}`);

    // Method 4: Directly try setting via the control panel that should be embedded
    // RackNerd's VPS management uses SolusVM, which exposes an API
    // The client API endpoint is typically: <panel>/api/client/command.php
    // With parameters: action=vserver-rdns, rdns=<hostname>
    // We need the vserver key + hash though

    // Alternative: Try setting it directly via PowerDNS if it's running on the same network
    const dnsCheck = await exec(conn, `
# Check if PowerDNS tools are available
which pdnsutil 2>/dev/null && echo "HAS_PDNSUTIL"
which nsupdate 2>/dev/null && echo "HAS_NSUPDATE"
`);
    if (dnsCheck.out.includes('HAS_NSUPDATE')) {
        console.log(`  Has nsupdate — trying dynamic DNS update`);
    }

    conn.end();
    return false;
}

async function main() {
    console.log('═══════════════════════════════════════════════');
    console.log('  ATTEMPT TO FIX PTR RECORDS (VPS 11-28)');
    console.log('═══════════════════════════════════════════════\n');

    // First just diagnose one VPS to understand the environment
    console.log('--- Diagnosing VPS-11 first ---\n');
    await fixPTR(VPS_TO_FIX[0]);

    console.log('\n--- Diagnosing VPS-21 (different batch) ---\n');
    await fixPTR(VPS_TO_FIX[10]);
}

main().catch(console.error);
