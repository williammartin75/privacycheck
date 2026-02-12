/**
 * Provision VPS 21-30: Install Postfix + Dovecot + OpenDKIM base setup
 * Runs in parallel on all 10 VPS via SSH.
 * Domains will be configured separately once purchased.
 */
const { Client } = require('ssh2');

const VPS_LIST = [
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS' },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o' },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q' },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK' },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v' },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK' },
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
];

// The remote script to run on each VPS
const SETUP_SCRIPT = `#!/bin/bash
set -e

echo "=== [1/5] System update ==="
apt update && DEBIAN_FRONTEND=noninteractive apt upgrade -y

echo "=== [2/5] Installing Postfix + Dovecot + OpenDKIM ==="
DEBIAN_FRONTEND=noninteractive apt install -y \\
    postfix dovecot-imapd dovecot-pop3d \\
    opendkim opendkim-tools \\
    mailutils certbot

echo "=== [3/5] Configuring Postfix ==="
VPS_IP=$(curl -s ifconfig.me)

cat > /etc/postfix/main.cf << 'POSTFIX_EOF'
smtpd_banner = $myhostname ESMTP
biff = no
append_dot_mydomain = no

myhostname = localhost
myorigin = $myhostname
mydestination = localhost
mynetworks = 127.0.0.0/8

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
POSTFIX_EOF

cat > /etc/postfix/master.cf << 'MASTER_EOF'
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
MASTER_EOF

echo "=== [4/5] Configuring Dovecot ==="
cat > /etc/dovecot/conf.d/10-mail.conf << 'EOF'
mail_location = maildir:~/Maildir
namespace inbox {
  inbox = yes
}
EOF

cat > /etc/dovecot/conf.d/10-auth.conf << 'EOF'
disable_plaintext_auth = no
auth_mechanisms = plain login
!include auth-system.conf.ext
EOF

cat > /etc/dovecot/conf.d/10-ssl.conf << 'EOF'
ssl = yes
ssl_cert = </etc/ssl/certs/ssl-cert-snakeoil.pem
ssl_key = </etc/ssl/private/ssl-cert-snakeoil.key
EOF

cat > /etc/dovecot/conf.d/10-master.conf << 'EOF'
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
EOF

echo "=== [5/5] Configuring OpenDKIM ==="
mkdir -p /etc/opendkim/keys /run/opendkim
chown opendkim:opendkim /run/opendkim 2>/dev/null || true

cat > /etc/opendkim.conf << 'EOF'
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
EOF

cat > /etc/opendkim/TrustedHosts << 'EOF'
127.0.0.1
localhost
EOF

touch /etc/opendkim/KeyTable /etc/opendkim/SigningTable

systemctl restart postfix
systemctl restart dovecot
systemctl restart opendkim 2>/dev/null || true
systemctl enable postfix dovecot opendkim

echo "=== BASE SETUP COMPLETE ==="
echo "IP: $VPS_IP"
echo "Postfix: $(systemctl is-active postfix)"
echo "Dovecot: $(systemctl is-active dovecot)"
echo "OpenDKIM: $(systemctl is-active opendkim 2>/dev/null || echo 'waiting-for-keys')"
`;

function provisionVPS(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        let output = '';
        const tag = `[VPS-${vps.id}]`;
        const startTime = Date.now();

        conn.on('ready', () => {
            console.log(`${tag} ${vps.ip} — Connected, running setup...`);
            conn.exec(SETUP_SCRIPT, { timeout: 600000 }, (err, stream) => {
                if (err) { conn.end(); return reject(err); }

                stream.on('data', (data) => {
                    const line = data.toString();
                    output += line;
                    // Print progress markers
                    if (line.includes('===')) {
                        process.stdout.write(`${tag} ${line.trim()}\n`);
                    }
                });
                stream.stderr.on('data', (data) => {
                    output += data.toString();
                });
                stream.on('close', (code) => {
                    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
                    conn.end();
                    if (output.includes('BASE SETUP COMPLETE')) {
                        console.log(`${tag} ${vps.ip} — DONE in ${elapsed}s`);
                        resolve({ ...vps, ok: true, elapsed, output });
                    } else {
                        console.log(`${tag} ${vps.ip} — FAILED (exit ${code}) after ${elapsed}s`);
                        resolve({ ...vps, ok: false, elapsed, output });
                    }
                });
            });
        });

        conn.on('error', (err) => {
            console.error(`${tag} ${vps.ip} — Connection error: ${err.message}`);
            resolve({ ...vps, ok: false, elapsed: 0, output: err.message });
        });

        conn.connect({
            host: vps.ip,
            port: 22,
            username: 'root',
            password: vps.pass,
            readyTimeout: 30000,
        });
    });
}

async function main() {
    console.log('=============================================');
    console.log('  Provisioning 10 VPS (21-30) in parallel');
    console.log('=============================================\n');

    const results = await Promise.all(VPS_LIST.map(v => provisionVPS(v)));

    console.log('\n=============================================');
    console.log('  RESULTS');
    console.log('=============================================');

    const ok = results.filter(r => r.ok);
    const fail = results.filter(r => !r.ok);

    ok.forEach(r => console.log(`  ✓ VPS-${r.id} (${r.ip}) — OK in ${r.elapsed}s`));
    fail.forEach(r => {
        console.log(`  ✗ VPS-${r.id} (${r.ip}) — FAILED`);
        // Show last 5 lines of output for debugging
        const lines = r.output.split('\n').filter(l => l.trim());
        lines.slice(-5).forEach(l => console.log(`    ${l}`));
    });

    console.log(`\n  ${ok.length}/10 succeeded, ${fail.length}/10 failed`);
}

main().catch(console.error);
