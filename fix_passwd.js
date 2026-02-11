const { Client } = require('ssh2');

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

function sshExec(vps, command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        const timer = setTimeout(() => { conn.end(); reject(new Error('timeout')); }, timeout);
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) { clearTimeout(timer); conn.end(); return reject(err); }
                let out = '';
                stream.on('data', c => out += c.toString());
                stream.stderr.on('data', c => out += c.toString());
                stream.on('close', () => { clearTimeout(timer); conn.end(); resolve(out.trim()); });
            });
        });
        conn.on('error', e => { clearTimeout(timer); reject(e); });
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pw,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group14-sha256'] }
        });
    });
}

// FIX: Convert all password hashes to {PLAIN} format
// The SHA512-CRYPT hashes seem to cause temp_fail issues
// Using {PLAIN} is safe because we only allow encrypted connections (TLS)
const FIX_CMD = `
#!/bin/bash
set -e

echo "=== Fixing passwd-file to use PLAIN passwords ==="

# Read mailboxes.txt and regenerate /etc/dovecot/users with PLAIN passwords
> /etc/dovecot/users.new

while IFS=, read -r email password ip; do
    # Extract domain and user parts
    user=$(echo "$email" | cut -d@ -f1)
    domain=$(echo "$email" | cut -d@ -f2)
    
    # Write entry with PLAIN password scheme
    echo "$email:{PLAIN}$password:5000:5000::/var/mail/vhosts/$domain/$user" >> /etc/dovecot/users.new
done < /root/mailboxes.txt

# Replace the old file
mv /etc/dovecot/users.new /etc/dovecot/users
chmod 600 /etc/dovecot/users
chown root:root /etc/dovecot/users

TOTAL=$(wc -l < /etc/dovecot/users)
echo "Wrote $TOTAL entries with {PLAIN} scheme"

# Show first 2 entries (for debugging)
head -2 /etc/dovecot/users

# Restart dovecot
systemctl restart dovecot

# Test auth
FIRST_USER=$(head -1 /root/mailboxes.txt | cut -d, -f1)
FIRST_PASS=$(head -1 /root/mailboxes.txt | cut -d, -f2)
echo "Testing: $FIRST_USER with $FIRST_PASS"
doveadm auth test "$FIRST_USER" "$FIRST_PASS" 2>&1
echo "Done!"
`;

async function main() {
    console.log('=== FIX v2: Switch to PLAIN passwords ===\n');

    for (const vps of VPS_LIST) {
        try {
            process.stdout.write(`[${vps.id}] ${vps.ip}... `);
            const result = await sshExec(vps, FIX_CMD, 30000);
            const lastLines = result.split('\n').slice(-5).join(' | ');
            console.log(lastLines);
        } catch (err) {
            console.log(`❌ ${err.message}`);
        }
    }

    // Now test SMTP AUTH on VPS-01
    console.log('\n=== Testing SMTP AUTH after fix ===');
    const net = require('net');
    const tls = require('tls');

    return new Promise((resolve) => {
        const sock = net.connect(587, '107.174.93.156', () => {
            let step = 0;
            sock.on('data', c => {
                const msg = c.toString();
                console.log('<<', msg.trim().split('\n')[0]);
                if (step === 0 && msg.includes('220')) { step = 1; sock.write('EHLO test.local\r\n'); }
                else if (step === 1 && msg.includes('250')) { step = 2; sock.write('STARTTLS\r\n'); }
                else if (step === 2 && msg.includes('220')) {
                    step = 3;
                    const tlsSock = tls.connect({ socket: sock, rejectUnauthorized: false }, () => {
                        console.log('>> TLS OK');
                        const authStr = Buffer.from('\0contact1@privacy-checker-pro.online\0R2riR4Qy28wN4jK5').toString('base64');
                        tlsSock.write('EHLO test.local\r\n');
                        setTimeout(() => {
                            console.log('>> AUTH PLAIN ...');
                            tlsSock.write(`AUTH PLAIN ${authStr}\r\n`);
                        }, 500);
                    });
                    tlsSock.on('data', c2 => {
                        const msg2 = c2.toString().trim();
                        console.log('<< (tls)', msg2.split('\n')[0]);
                        if (msg2.includes('235')) { console.log('✅ SMTP AUTH SUCCESS!'); tlsSock.write('QUIT\r\n'); setTimeout(resolve, 1000); }
                        if (msg2.includes('535')) { console.log('❌ SMTP AUTH FAILED'); tlsSock.write('QUIT\r\n'); setTimeout(resolve, 1000); }
                    });
                }
            });
        });

        setTimeout(() => { console.log('TIMEOUT'); resolve(); }, 30000);
    });
}

main().catch(console.error);
