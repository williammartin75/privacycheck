const { Client } = require('ssh2');

// ============================================================
// HOTFIX: Fix Dovecot SASL auth socket for Postfix SMTP AUTH
// The fix_vps.sh missed the proper auth-client socket config
// ============================================================

const VPS_LIST = [
    { id: 'vps-01', ip: '107.174.93.156', pw: '4uZeYG82Wgf5tf0Y7B' },
    { id: 'vps-02', ip: '198.12.71.145', pw: '7P6LB61mlnNaoo8S0Z' },
    { id: 'vps-03', ip: '206.217.139.115', pw: '20QEs9OSh8Bw3egI1q' },
    { id: 'vps-04', ip: '206.217.139.116', pw: 'JvSg1HPu956fAt0dY0' },
    { id: 'vps-05', ip: '23.95.242.32', pw: 'v6Jk79EUE15reqJ3zB' },
    { id: 'vps-06', ip: '192.3.86.156', pw: 'H77WKufh2r9lVX3iP6' },
    { id: 'vps-07', ip: '107.175.83.186', pw: '1KiaL7RpwAng23B08L' },
    { id: 'vps-08', ip: '23.226.135.153', pw: 'dIKsL94sx6o8u7SAA1' },
    { id: 'vps-09', ip: '64.188.29.151', pw: '1EQpF0fSapC610hjK3' },
    { id: 'vps-10', ip: '23.94.240.173', pw: 'L5fgrQ6I84E3uvR2Nn' },
];

function sshExec(vps, command, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('SSH timeout')); }, timeout);

        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                let output = '', errOutput = '';
                stream.on('data', chunk => output += chunk.toString());
                stream.stderr.on('data', chunk => errOutput += chunk.toString());
                stream.on('close', (code) => {
                    clearTimeout(timer);
                    conn.end();
                    resolve({ code, output, errOutput });
                });
            });
        });
        conn.on('error', err => { clearTimeout(timer); reject(err); });
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pw,
            readyTimeout: 15000,
            algorithms: {
                kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
                    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1',
                    'diffie-hellman-group14-sha256']
            }
        });
    });
}

// The hotfix command: rewrite 10-master.conf with proper auth socket
const HOTFIX_CMD = `
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
  # Auth socket for Postfix SASL - this is the critical part
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }

  # Auth socket for auth-userdb (needed for LDA/LMTP)
  unix_listener auth-userdb {
    mode = 0600
    user = vmail
    group = vmail
  }
}

service lmtp {
  unix_listener lmtp {
  }
}
EOF

# Also make sure 10-auth.conf includes auth_username_format
cat > /etc/dovecot/conf.d/10-auth.conf << 'EOF'
disable_plaintext_auth = no
auth_mechanisms = plain login
auth_username_format = %Lu

passdb {
  driver = passwd-file
  args = /etc/dovecot/users
}
userdb {
  driver = passwd-file
  args = /etc/dovecot/users
  default_fields = uid=vmail gid=vmail home=/var/mail/vhosts/%d/%n
}
EOF

# Restart dovecot
systemctl restart dovecot

# Test auth
FIRST_USER=$(head -1 /root/mailboxes.txt | cut -d, -f1)
FIRST_PASS=$(head -1 /root/mailboxes.txt | cut -d, -f2)
echo "Testing auth for: $FIRST_USER"
doveadm auth test "$FIRST_USER" "$FIRST_PASS" 2>&1

# Check the socket exists
ls -la /var/spool/postfix/private/auth 2>&1
`;

async function main() {
    console.log('=== HOTFIX: Dovecot SASL Auth Socket ===\n');

    for (const vps of VPS_LIST) {
        try {
            process.stdout.write(`[${vps.id}] ${vps.ip}... `);
            const result = await sshExec(vps, HOTFIX_CMD, 30000);
            if (result.output.includes('passdb') || result.output.includes('ok')) {
                console.log(`✅ ${result.output.split('\n').filter(l => l.includes('Testing') || l.includes('passdb') || l.includes('ok') || l.includes('auth')).join(' | ')}`);
            } else {
                console.log(`⚠️ Output: ${result.output.substring(0, 200)}`);
            }
            if (result.errOutput) {
                console.log(`  STDERR: ${result.errOutput.substring(0, 200)}`);
            }
        } catch (err) {
            console.log(`❌ ${err.message}`);
        }
    }

    // Test SMTP auth on VPS-01 after fix
    console.log('\n=== Testing SMTP AUTH on VPS-01 ===');
    try {
        const result = await sshExec(VPS_LIST[0], `
FIRST_USER=$(head -1 /root/mailboxes.txt | cut -d, -f1)
FIRST_PASS=$(head -1 /root/mailboxes.txt | cut -d, -f2)
echo "User: $FIRST_USER Pass: $FIRST_PASS"
# Test SMTP auth using swaks if available, otherwise try doveadm
which swaks > /dev/null 2>&1 && swaks --to test@example.com --from "$FIRST_USER" --server localhost --port 587 --auth LOGIN --auth-user "$FIRST_USER" --auth-password "$FIRST_PASS" --tls --quit-after AUTH 2>&1 || echo "swaks not installed, testing with openssl..."
# Alternative: test with openssl
echo "Testing with AUTH PLAIN via openssl..."
AUTH_STRING=$(printf "\\0$FIRST_USER\\0$FIRST_PASS" | base64)
echo "AUTH string: $AUTH_STRING"
(echo "EHLO test"; sleep 1; echo "AUTH PLAIN $AUTH_STRING"; sleep 1; echo "QUIT") | openssl s_client -connect localhost:587 -starttls smtp -quiet 2>/dev/null | head -20
`, 30000);
        console.log(result.output);
    } catch (err) {
        console.log(`Error: ${err.message}`);
    }
}

main().catch(console.error);
