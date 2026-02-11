#!/usr/bin/env node
// Fix OpenDKIM on ALL VPS 11-16 (multi-domain support)
const { Client } = require('ssh2');

const VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
];

function sshExec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout: ${cmd.substring(0, 80)}`)), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '', stderr = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', d => stderr += d.toString());
            stream.on('close', (code) => { clearTimeout(timer); resolve({ stdout: stdout.trim(), stderr: stderr.trim(), code }); });
        });
    });
}

function sshConnect(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({
            host: vps.ip, port: 22, username: 'root', password: vps.pass,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

const allDkimRecords = {};

async function fixVPS(vps) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`  Fixing ${vps.id} — ${vps.ip} — ${vps.domains.join(', ')}`);
    console.log(`${'='.repeat(60)}`);

    let conn;
    try {
        conn = await sshConnect(vps);
        console.log('  ✅ SSH connected');

        // Build multi-domain fix script
        const domainsStr = vps.domains.join(' ');
        const firstDomain = vps.domains[0];

        // Generate signing and key tables for all domains
        let sigTableLines = '';
        let keyTableLines = '';
        let trustedLines = '';
        let genKeyCommands = '';

        for (const d of vps.domains) {
            sigTableLines += `*@${d} mail._domainkey.${d}\\n`;
            keyTableLines += `mail._domainkey.${d} ${d}:mail:/etc/opendkim/keys/${d}/mail.private\\n`;
            trustedLines += `${d}\\n*.${d}\\n`;
            genKeyCommands += `
mkdir -p /etc/opendkim/keys/${d}
opendkim-genkey -b 2048 -d ${d} -D /etc/opendkim/keys/${d} -s mail -v 2>&1
`;
        }

        const fixScript = `#!/bin/bash
set -e

# Generate keys for all domains
${genKeyCommands}

# Set permissions
chown -R opendkim:opendkim /etc/opendkim/keys/
find /etc/opendkim/keys/ -name "*.private" -exec chmod 600 {} \\;

# Configure signing table (multi-domain)
echo -e "${sigTableLines}" > /etc/opendkim/signing.table

# Configure key table (multi-domain)
echo -e "${keyTableLines}" > /etc/opendkim/key.table

# Configure trusted hosts
cat > /etc/opendkim/trusted.hosts << EOF
127.0.0.1
localhost
${vps.domains.map(d => `${d}\n*.${d}`).join('\n')}
EOF

# Configure opendkim.conf
cat > /etc/opendkim.conf << 'ODKIM'
AutoRestart             Yes
AutoRestartRate         10/1h
Syslog                  yes
SyslogSuccess           Yes
LogWhy                  Yes
Canonicalization        relaxed/simple
ExternalIgnoreList      refile:/etc/opendkim/trusted.hosts
InternalHosts           refile:/etc/opendkim/trusted.hosts
KeyTable                refile:/etc/opendkim/key.table
SigningTable            refile:/etc/opendkim/signing.table
Mode                    sv
PidFile                 /run/opendkim/opendkim.pid
SignatureAlgorithm      rsa-sha256
UserID                  opendkim:opendkim
Socket                  inet:8891@localhost
ODKIM

# Ensure socket directory
mkdir -p /run/opendkim
chown opendkim:opendkim /run/opendkim

# Restart services
systemctl restart opendkim
systemctl restart postfix

echo "DKIM_STATUS: $(systemctl is-active opendkim)"

# Output DKIM records for DNS
for d in ${domainsStr}; do
    echo "=== DKIM_RECORD:$d ==="
    cat /etc/opendkim/keys/$d/mail.txt
    echo "=== END:$d ==="
done
`;

        await sshExec(conn, `cat > /tmp/fix_dkim.sh << 'FIXEOF'
${fixScript}
FIXEOF
chmod +x /tmp/fix_dkim.sh`);

        const result = await sshExec(conn, 'bash /tmp/fix_dkim.sh', 60000);

        // Extract status
        const statusMatch = result.stdout.match(/DKIM_STATUS: (\w+)/);
        console.log(`  OpenDKIM status: ${statusMatch ? statusMatch[1] : 'unknown'}`);

        // Extract DKIM records for each domain
        for (const d of vps.domains) {
            const recordMatch = result.stdout.match(new RegExp(`=== DKIM_RECORD:${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ===\\n([\\s\\S]*?)\\n=== END:${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} ===`));
            if (recordMatch) {
                // Extract the p= value
                const pMatch = recordMatch[1].match(/p=([A-Za-z0-9+/=\s"]+)/);
                if (pMatch) {
                    const pValue = pMatch[1].replace(/[\s"]/g, '');
                    allDkimRecords[d] = `v=DKIM1; h=sha256; k=rsa; p=${pValue}`;
                    console.log(`  ✅ DKIM record for ${d}: ...${pValue.substring(pValue.length - 20)}`);
                }
            }
        }

        // Verify no more milter-reject errors
        await new Promise(r => setTimeout(r, 2000));
        const postLogs = await sshExec(conn, 'tail -5 /var/log/mail.log | grep -c "milter-reject" 2>/dev/null || echo "0"');
        console.log(`  Recent milter-rejects: ${postLogs.stdout}`);

        conn.end();
        return true;
    } catch (err) {
        console.log(`  ❌ FAILED: ${err.message}`);
        if (conn) conn.end();
        return false;
    }
}

async function main() {
    console.log('============================================================');
    console.log('  FIX OpenDKIM — VPS 11-16 (multi-domain)');
    console.log('============================================================');

    for (const vps of VPS) {
        await fixVPS(vps);
    }

    console.log('\n\n============================================================');
    console.log('  DKIM DNS Records to update in IONOS');
    console.log('============================================================');
    for (const [domain, record] of Object.entries(allDkimRecords)) {
        console.log(`\n${domain}:`);
        console.log(`  ${record.substring(0, 80)}...`);
    }

    // Save DKIM records for DNS update
    const fs = require('fs');
    fs.writeFileSync('new_dkim_records.json', JSON.stringify(allDkimRecords, null, 2));
    console.log('\nSaved to new_dkim_records.json');
}

main().catch(console.error);
