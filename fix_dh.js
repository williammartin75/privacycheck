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

function sshExec(vps, command, timeout = 120000) {
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

// Use a single heredoc with no variable interpolation issues
const FIX_CMD = [
    'set -e',
    // Step 1: Generate DH params
    'echo "Step 1: Generate DH params..."',
    'if [ ! -f /etc/dovecot/dh.pem ]; then openssl dhparam -out /etc/dovecot/dh.pem 2048 2>/dev/null && echo "  Generated"; else echo "  Already exists"; fi',
    // Step 2: Find cert path
    'echo "Step 2: Find cert..."',
    'FIRST_DOMAIN=$(head -1 /root/mailboxes.txt | cut -d@ -f2 | cut -d, -f1)',
    'HOSTNAME_F=$(hostname -f)',
    'CERT=""',
    'for D in "$HOSTNAME_F" "$FIRST_DOMAIN" "mail.$FIRST_DOMAIN"; do if [ -f "/etc/letsencrypt/live/$D/fullchain.pem" ]; then CERT="/etc/letsencrypt/live/$D"; break; fi; done',
    'if [ -z "$CERT" ]; then CERT=$(find /etc/letsencrypt/live/ -name "fullchain.pem" 2>/dev/null | head -1 | xargs dirname 2>/dev/null || echo ""); fi',
    'if [ -z "$CERT" ]; then echo "  WARNING: No cert found"; CERT_LINE="ssl_cert = </etc/ssl/certs/ssl-cert-snakeoil.pem"; KEY_LINE="ssl_key = </etc/ssl/private/ssl-cert-snakeoil.key"; else echo "  Using: $CERT"; CERT_LINE="ssl_cert = <$CERT/fullchain.pem"; KEY_LINE="ssl_key = <$CERT/privkey.pem"; fi',
    // Step 3: Write SSL config
    'echo "Step 3: Write 10-ssl.conf..."',
    'echo "ssl = yes" > /etc/dovecot/conf.d/10-ssl.conf',
    'echo "$CERT_LINE" >> /etc/dovecot/conf.d/10-ssl.conf',
    'echo "$KEY_LINE" >> /etc/dovecot/conf.d/10-ssl.conf',
    'echo "ssl_dh = </etc/dovecot/dh.pem" >> /etc/dovecot/conf.d/10-ssl.conf',
    'echo "ssl_min_protocol = TLSv1.2" >> /etc/dovecot/conf.d/10-ssl.conf',
    'cat /etc/dovecot/conf.d/10-ssl.conf',
    // Step 4: Remove debug
    'sed -i "/auth_debug/d" /etc/dovecot/dovecot.conf',
    // Step 5: Restart
    'echo "Step 5: Restart dovecot..."',
    'systemctl restart dovecot',
    // Step 6: Test
    'echo "Step 6: Auth test..."',
    'FIRST_USER=$(head -1 /root/mailboxes.txt | cut -d, -f1)',
    'FIRST_PASS=$(head -1 /root/mailboxes.txt | cut -d, -f2)',
    'doveadm auth test "$FIRST_USER" "$FIRST_PASS" 2>&1 | head -2',
    'echo "DONE"'
].join(' && ');

async function main() {
    console.log('=== Fix DH params + SSL on all VPS ===\n');

    for (const vps of VPS_LIST) {
        try {
            console.log(`\n[${vps.id}] ${vps.ip}...`);
            const result = await sshExec(vps, FIX_CMD, 180000); // DH gen can take ~60s
            console.log(result);
        } catch (err) {
            console.log(`  ERROR: ${err.message}`);
        }
    }

    console.log('\n\nAll done!');
}

main().catch(console.error);
