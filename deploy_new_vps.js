#!/usr/bin/env node
// ============================================================
// Deploy mail servers on 10 NEW VPS
// - Uploads and runs fix_vps.sh (virtual users - the correct version)
// - Assigns 15 domains across 10 VPS
// - Retrieves DKIM keys for DNS setup
// - Collects mailbox credentials into CSV
// ============================================================

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// ---- Configuration ----
const NEW_VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe' },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5' },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783' },
    { id: 'VPS-17', ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C' },
    { id: 'VPS-18', ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 'VPS-19', ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw' },
    { id: 'VPS-20', ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
];

// 15 new domains distributed across 10 VPS (some get 2, some get 1)
const DOMAIN_ASSIGNMENTS = {
    'VPS-11': ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'],
    'VPS-12': ['privacycheckermailpro.website', 'privacycheckermailpro.space'],
    'VPS-13': ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'],
    'VPS-14': ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'],
    'VPS-15': ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'],
    'VPS-16': ['privacy-checker-mail-pro.icu'],
    'VPS-17': ['theprivacycheckerpro.cloud'],
    'VPS-18': ['theprivacycheckerpro.site'],
    'VPS-19': ['theprivacycheckerpro.online'],
    'VPS-20': ['theprivacycheckerpro.website'],
};

// Path to the fix_vps.sh script (the corrected version with virtual users)
const SETUP_SCRIPT = path.join(__dirname, '..', 'Bureau', 'Mails', 'All unique mails',
    'Professional mails', 'URLS', 'fix_vps.sh');
// Fallback: try same directory
const SETUP_SCRIPT_LOCAL = path.join(__dirname, 'fix_vps.sh');

const CSV_OUTPUT = path.join(__dirname, 'ditlead_new_mailboxes.csv');
const DKIM_OUTPUT = path.join(__dirname, 'new_dkim_keys.json');

// ---- Helper functions ----
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function sshExec(conn, cmd, timeout = 600000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${cmd.substring(0, 80)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => {
                clearTimeout(timer);
                resolve({ stdout, stderr, code });
            });
        });
    });
}

function sshConnect(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: vps.ip,
            port: 22,
            username: 'root',
            password: vps.pass,
            readyTimeout: 30000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
                    'diffie-hellman-group14-sha1'],
            }
        });
    });
}

function sshUpload(conn, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        conn.sftp((err, sftp) => {
            if (err) return reject(err);
            const readStream = fs.createReadStream(localPath);
            const writeStream = sftp.createWriteStream(remotePath);
            writeStream.on('close', resolve);
            writeStream.on('error', reject);
            readStream.pipe(writeStream);
        });
    });
}

// ---- Main deployment ----
async function deployVPS(vps, domains, index, total) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  [${index}/${total}] ${vps.id} (${vps.ip}) — Domains: ${domains.join(', ')}`);
    console.log(`${'='.repeat(60)}`);

    let conn;
    try {
        // Step 1: Connect
        console.log(`  [1/7] Connecting via SSH...`);
        conn = await sshConnect(vps);
        console.log(`  ✅ Connected`);

        // Step 2: Check if already set up
        const check = await sshExec(conn, 'test -f /root/mailboxes.txt && echo "EXISTS" || echo "NEW"');
        if (check.stdout.trim() === 'EXISTS') {
            console.log(`  ⚠️  Already set up! Skipping setup, just fetching credentials...`);
            const creds = await sshExec(conn, 'cat /root/mailboxes.txt');
            const dkimKeys = {};
            for (const d of domains) {
                const dkim = await sshExec(conn, `cat /etc/opendkim/keys/${d}/mail.txt 2>/dev/null || echo "NOT_FOUND"`);
                dkimKeys[d] = dkim.stdout.trim();
            }
            conn.end();
            return { vps, credentials: creds.stdout.trim(), dkim: dkimKeys, status: 'already_done' };
        }

        // Step 3: System update (skip upgrade, just update package list + install)
        console.log(`  [2/7] Installing Postfix + Dovecot + OpenDKIM...`);
        await sshExec(conn, 'apt update', 120000);
        await sshExec(conn, 'DEBIAN_FRONTEND=noninteractive apt install -y postfix dovecot-imapd dovecot-pop3d opendkim opendkim-tools mailutils certbot', 600000);
        console.log(`  ✅ Packages installed`);

        // Step 5: Setup hostname + virtual users
        const primaryDomain = domains[0];
        const vpsIp = vps.ip;

        console.log(`  [4/7] Configuring Postfix + Dovecot (virtual users)...`);

        // Create vmail user
        await sshExec(conn, 'id -u vmail &>/dev/null || (groupadd -g 5000 vmail && useradd -u 5000 -g vmail -s /bin/false -d /var/mail/vhosts -m vmail)');
        await sshExec(conn, 'mkdir -p /var/mail/vhosts && chown -R vmail:vmail /var/mail/vhosts');

        // Set hostname
        await sshExec(conn, `hostnamectl set-hostname mail.${primaryDomain}`);
        await sshExec(conn, `echo "mail.${primaryDomain}" > /etc/mailname`);
        await sshExec(conn, `grep -q "mail.${primaryDomain}" /etc/hosts || echo "${vpsIp} mail.${primaryDomain}" >> /etc/hosts`);

        // Generate credentials
        console.log(`  [5/7] Generating mailbox credentials...`);
        const prefixes = 'contact info audit report team sales support hello privacy gdpr';
        let createCmds = [];

        createCmds.push('> /etc/dovecot/users');
        createCmds.push('> /root/mailboxes.txt');

        for (const d of domains) {
            createCmds.push(`mkdir -p /var/mail/vhosts/${d}`);
            for (const prefix of prefixes.split(' ')) {
                for (let i = 1; i <= 4; i++) {
                    const user = `${prefix}${i}`;
                    createCmds.push(`PASS=$(openssl rand -base64 12) && echo "${user}@${d}:{PLAIN}\\$PASS:::::" >> /etc/dovecot/users && echo "${user}@${d},\\$PASS,${vpsIp}" >> /root/mailboxes.txt`);
                }
            }
        }
        createCmds.push('chown -R vmail:vmail /var/mail/vhosts');
        createCmds.push('chmod 644 /etc/dovecot/users');

        // Execute in batches to avoid command too long
        const batchSize = 20;
        for (let i = 0; i < createCmds.length; i += batchSize) {
            const batch = createCmds.slice(i, i + batchSize).join(' && ');
            await sshExec(conn, batch, 120000);
        }

        // Build domain lists for configs
        const vdomains = domains.join(', ');

        // Virtual mailbox map
        let vmailboxCmds = ['> /etc/postfix/vmailbox'];
        for (const d of domains) {
            for (const prefix of prefixes.split(' ')) {
                for (let i = 1; i <= 4; i++) {
                    vmailboxCmds.push(`echo "${prefix}${i}@${d} ${d}/${prefix}${i}/Maildir/" >> /etc/postfix/vmailbox`);
                }
            }
        }
        vmailboxCmds.push('postmap /etc/postfix/vmailbox');
        for (let i = 0; i < vmailboxCmds.length; i += batchSize) {
            const batch = vmailboxCmds.slice(i, i + batchSize).join(' && ');
            await sshExec(conn, batch, 120000);
        }

        // Dovecot auth config
        await sshExec(conn, `cat > /etc/dovecot/conf.d/10-auth.conf << 'EOF'
disable_plaintext_auth = no
auth_mechanisms = plain login
passdb {
  driver = passwd-file
  args = /etc/dovecot/users
}
userdb {
  driver = passwd-file
  args = /etc/dovecot/users
  default_fields = uid=vmail gid=vmail home=/var/mail/vhosts/%d/%n
}
EOF`);

        // Dovecot mail config
        await sshExec(conn, `cat > /etc/dovecot/conf.d/10-mail.conf << 'EOF'
mail_location = maildir:/var/mail/vhosts/%d/%n/Maildir
namespace inbox {
  inbox = yes
}
mail_uid = vmail
mail_gid = vmail
first_valid_uid = 5000
last_valid_uid = 5000
EOF`);

        // Dovecot SSL config
        await sshExec(conn, `cat > /etc/dovecot/conf.d/10-ssl.conf << 'EOF'
ssl = yes
ssl_cert = </etc/ssl/certs/ssl-cert-snakeoil.pem
ssl_key = </etc/ssl/private/ssl-cert-snakeoil.key
EOF`);

        // Generate DH params (fixes TLS handshake issue)
        console.log(`  [5b/7] Generating DH params (this can take a minute)...`);
        await sshExec(conn, 'openssl dhparam -out /etc/dovecot/dh.pem 2048 2>/dev/null', 300000);
        await sshExec(conn, `grep -q ssl_dh /etc/dovecot/conf.d/10-ssl.conf || echo 'ssl_dh = </etc/dovecot/dh.pem' >> /etc/dovecot/conf.d/10-ssl.conf`);

        // Dovecot master config
        await sshExec(conn, `cat > /etc/dovecot/conf.d/10-master.conf << 'EOF'
service imap-login {
  inet_listener imap {
    port = 143
  }
  inet_listener imaps {
    port = 993
    ssl = yes
  }
}
service pop3-login {
  inet_listener pop3 {
    port = 110
  }
}
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}
service lmtp {
  unix_listener lmtp {
  }
}
EOF`);

        // Postfix main.cf
        await sshExec(conn, `cat > /etc/postfix/main.cf << EOF
smtpd_banner = \\$myhostname ESMTP
biff = no
append_dot_mydomain = no

myhostname = mail.${primaryDomain}
mydomain = ${primaryDomain}
myorigin = \\$mydomain
mydestination = localhost
mynetworks = 127.0.0.0/8

virtual_mailbox_domains = ${vdomains}
virtual_mailbox_base = /var/mail/vhosts
virtual_mailbox_maps = hash:/etc/postfix/vmailbox
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000

smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_tls_security_level = may
smtp_tls_security_level = may

smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_recipient_restrictions = permit_sasl_authenticated, permit_mynetworks, reject_unauth_destination

milter_protocol = 6
milter_default_action = accept
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891

smtpd_client_message_rate_limit = 100
smtpd_client_connection_rate_limit = 50
default_process_limit = 50

maximal_queue_lifetime = 1d
bounce_queue_lifetime = 1d
message_size_limit = 10240000
EOF`);

        // Postfix master.cf
        await sshExec(conn, `cat > /etc/postfix/master.cf << 'EOF'
smtp      inet  n       -       y       -       -       smtpd
submission inet n       -       y       -       -       smtpd
  -o syslog_name=postfix/submission
  -o smtpd_tls_security_level=may
  -o smtpd_sasl_auth_enable=yes
  -o smtpd_recipient_restrictions=permit_sasl_authenticated,reject
pickup    unix  n       -       y       60      1       pickup
cleanup   unix  n       -       y       -       0       cleanup
qmgr      unix  n       -       n       300     1       qmgr
tlsmgr    unix  -       -       y       1000?   1       tlsmgr
rewrite   unix  -       -       y       -       -       trivial-rewrite
bounce    unix  -       -       y       -       0       bounce
defer     unix  -       -       y       -       0       bounce
trace     unix  -       -       y       -       0       bounce
verify    unix  -       -       y       -       1       verify
flush     unix  n       -       y       1000?   0       flush
proxymap  unix  -       -       n       -       -       proxymap
proxywrite unix -       -       n       -       1       proxymap
smtp      unix  -       -       y       -       -       smtp
relay     unix  -       -       y       -       -       smtp
showq     unix  n       -       y       -       -       showq
error     unix  -       -       y       -       -       error
retry     unix  -       -       y       -       -       error
discard   unix  -       -       y       -       -       discard
local     unix  -       n       n       -       -       local
virtual   unix  -       n       n       -       -       virtual
lmtp      unix  -       -       y       -       -       lmtp
anvil     unix  -       -       y       -       1       anvil
scache    unix  -       -       y       -       1       scache
postlog   unix-dgram n  -       n       -       1       postlogd
EOF`);

        // Step 6: OpenDKIM
        console.log(`  [6/7] Configuring OpenDKIM...`);
        await sshExec(conn, 'mkdir -p /etc/opendkim/keys');

        for (const d of domains) {
            await sshExec(conn, `mkdir -p /etc/opendkim/keys/${d} && opendkim-genkey -D /etc/opendkim/keys/${d} -d ${d} -s mail -b 2048 && chown -R opendkim:opendkim /etc/opendkim/keys/${d}`);
        }

        // KeyTable
        let keyTableEntries = domains.map(d => `echo "mail._domainkey.${d} ${d}:mail:/etc/opendkim/keys/${d}/mail.private" >> /etc/opendkim/KeyTable`).join(' && ');
        await sshExec(conn, `> /etc/opendkim/KeyTable && ${keyTableEntries}`);

        // SigningTable
        let signingEntries = domains.map(d => `echo "*@${d} mail._domainkey.${d}" >> /etc/opendkim/SigningTable`).join(' && ');
        await sshExec(conn, `> /etc/opendkim/SigningTable && ${signingEntries}`);

        // TrustedHosts
        await sshExec(conn, `cat > /etc/opendkim/TrustedHosts << 'EOF'
127.0.0.1
localhost
EOF`);

        // OpenDKIM config
        await sshExec(conn, `cat > /etc/opendkim.conf << 'EOF'
Syslog                  yes
SyslogSuccess           yes
LogWhy                  yes
UMask                   007
Socket                  inet:8891@localhost
PidFile                 /run/opendkim/opendkim.pid
OversignHeaders         From
TrustAnchorFile         /usr/share/dns/root.key
Canonicalization        relaxed/simple
Mode                    sv
SubDomains              no
AutoRestart             yes
AutoRestartRate         10/1M
Background              yes
DNSTimeout              5
SignatureAlgorithm      rsa-sha256
KeyTable                /etc/opendkim/KeyTable
SigningTable            refile:/etc/opendkim/SigningTable
ExternalIgnoreList      /etc/opendkim/TrustedHosts
InternalHosts           /etc/opendkim/TrustedHosts
EOF`);

        await sshExec(conn, 'mkdir -p /run/opendkim && chown opendkim:opendkim /run/opendkim');

        // Step 7: Start services
        console.log(`  [7/7] Starting services...`);
        await sshExec(conn, 'systemctl restart opendkim && systemctl restart postfix && systemctl restart dovecot');
        await sshExec(conn, 'systemctl enable postfix opendkim dovecot');

        // Verify services
        const status = await sshExec(conn, 'systemctl is-active postfix dovecot opendkim');
        console.log(`  Services: ${status.stdout.trim().replace(/\n/g, ', ')}`);

        // Retrieve credentials
        const creds = await sshExec(conn, 'cat /root/mailboxes.txt');

        // Retrieve DKIM keys
        const dkimKeys = {};
        for (const d of domains) {
            const dkim = await sshExec(conn, `cat /etc/opendkim/keys/${d}/mail.txt`);
            dkimKeys[d] = dkim.stdout.trim();
        }

        // Test SMTP auth
        console.log(`  Testing SMTP auth...`);
        const firstLine = creds.stdout.split('\n')[0];
        if (firstLine) {
            const [email, password] = firstLine.split(',');
            const authTest = await sshExec(conn, `echo -ne "\\0${email}\\0${password}" | openssl base64`);
            const authString = authTest.stdout.trim();
            const smtpTest = await sshExec(conn, `(echo "EHLO test"; sleep 1; echo "AUTH PLAIN ${authString}"; sleep 1; echo "QUIT") | openssl s_client -starttls smtp -connect 127.0.0.1:587 -quiet 2>/dev/null | grep -E "235|535|454"`, 15000);
            if (smtpTest.stdout.includes('235')) {
                console.log(`  ✅ SMTP auth OK`);
            } else {
                console.log(`  ⚠️  SMTP auth test: ${smtpTest.stdout.trim()}`);
            }
        }

        const mbCount = creds.stdout.trim().split('\n').length;
        console.log(`  ✅ ${vps.id} COMPLETE — ${mbCount} mailboxes, ${domains.length} domains`);

        conn.end();
        return { vps, credentials: creds.stdout.trim(), dkim: dkimKeys, status: 'success' };

    } catch (err) {
        console.error(`  ❌ ${vps.id} FAILED: ${err.message}`);
        if (conn) conn.end();
        return { vps, credentials: '', dkim: {}, status: 'failed', error: err.message };
    }
}

// ---- Main ----
async function main() {
    console.log('============================================================');
    console.log('  DEPLOY NEW VPS — 10 VPS × 15 domains × 600 mailboxes');
    console.log('============================================================');
    console.log('');

    const allCredentials = [];
    const allDkim = {};
    const results = [];

    for (let idx = 0; idx < NEW_VPS.length; idx++) {
        const vps = NEW_VPS[idx];
        const domains = DOMAIN_ASSIGNMENTS[vps.id];
        if (!domains || domains.length === 0) {
            console.log(`\n⚠️  No domains assigned to ${vps.id}, skipping`);
            continue;
        }

        const result = await deployVPS(vps, domains, idx + 1, NEW_VPS.length);
        results.push(result);

        if (result.credentials) {
            allCredentials.push(result.credentials);
        }
        if (result.dkim) {
            Object.assign(allDkim, result.dkim);
        }

        // Small delay between VPS deployments
        await sleep(2000);
    }

    // Save CSV
    const csvHeader = 'email,password,ip';
    const csvContent = csvHeader + '\n' + allCredentials.join('\n');
    fs.writeFileSync(CSV_OUTPUT, csvContent);
    console.log(`\n✅ CSV saved: ${CSV_OUTPUT}`);

    // Save DKIM keys
    fs.writeFileSync(DKIM_OUTPUT, JSON.stringify(allDkim, null, 2));
    console.log(`✅ DKIM keys saved: ${DKIM_OUTPUT}`);

    // Summary
    const success = results.filter(r => r.status === 'success' || r.status === 'already_done').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const totalMb = allCredentials.join('\n').split('\n').filter(l => l.includes('@')).length;

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  DEPLOYMENT SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    console.log(`  VPS deployed: ${success}/${NEW_VPS.length}`);
    console.log(`  VPS failed:   ${failed}`);
    console.log(`  Mailboxes:    ${totalMb}`);
    console.log(`  CSV file:     ${CSV_OUTPUT}`);
    console.log(`  DKIM keys:    ${DKIM_OUTPUT}`);
    console.log(`${'='.repeat(60)}`);

    if (failed > 0) {
        console.log(`\n⚠️  Failed VPS:`);
        results.filter(r => r.status === 'failed').forEach(r => {
            console.log(`   ${r.vps.id} (${r.vps.ip}): ${r.error}`);
        });
    }

    console.log(`\nNext steps:`);
    console.log(`  1. Run: node configure_dns_new.js  (configure DNS via IONOS API)`);
    console.log(`  2. Run: node import_new_ditlead.js  (import to Ditlead for warmup)`);
}

main().catch(console.error);
