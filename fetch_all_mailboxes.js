const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

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

const OUTPUT_DIR = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\All unique mails\\Professional mails\\URLS\\Cleaned Chunks analysis\\Domains with issues\\Emails to contact\\By languages\\Real emails\\Strategy';

function sshGetMailboxes(vps) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec('cat /root/mailboxes.txt', (err, stream) => {
                if (err) { conn.end(); return reject(err); }
                let data = '';
                stream.on('data', chunk => data += chunk.toString());
                stream.stderr.on('data', chunk => process.stderr.write(`[${vps.id}] STDERR: ${chunk}`));
                stream.on('close', () => { conn.end(); resolve(data); });
            });
        });
        conn.on('error', err => reject(err));
        conn.connect({
            host: vps.ip,
            port: 22,
            username: 'root',
            password: vps.pw,
            readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521', 'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha1', 'diffie-hellman-group14-sha256'] }
        });
    });
}

function extractFirstName(email) {
    const prefix = email.split('@')[0].replace(/\d+$/, '');
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function extractDomain(email) {
    return email.split('@')[1];
}

async function main() {
    console.log('=== Fetching mailboxes from all 10 VPS ===\n');

    const allMailboxes = [];

    // Connect to all VPS in parallel
    const promises = VPS_LIST.map(async (vps) => {
        try {
            console.log(`[${vps.id}] Connecting to ${vps.ip}...`);
            const data = await sshGetMailboxes(vps);
            const lines = data.split('\n').filter(l => l.trim() && l.includes('@'));
            console.log(`[${vps.id}] ✓ ${lines.length} mailboxes retrieved`);

            for (const line of lines) {
                const parts = line.trim().split(',');
                if (parts.length >= 3) {
                    allMailboxes.push({
                        email: parts[0],
                        password: parts[1],
                        ip: parts[2],
                        vps: vps.id
                    });
                }
            }
        } catch (err) {
            console.error(`[${vps.id}] ✗ FAILED: ${err.message}`);
        }
    });

    await Promise.all(promises);

    console.log(`\n=== Total: ${allMailboxes.length} mailboxes retrieved ===\n`);

    // Generate Ditlead CSV
    // Format: first_name,last_name,email,smtp_host,smtp_port,smtp_username,smtp_password,smtp_encryption,imap_host,imap_port,imap_username,imap_password,imap_encryption
    const csvHeader = 'first_name,last_name,email,smtp_host,smtp_port,smtp_username,smtp_password,smtp_encryption,imap_host,imap_port,imap_username,imap_password,imap_encryption';

    const csvLines = allMailboxes.map(mb => {
        const firstName = extractFirstName(mb.email);
        const domain = extractDomain(mb.email);
        // Escape passwords that contain commas or special chars
        const escapedPw = mb.password.includes(',') ? `"${mb.password}"` : mb.password;
        return [
            firstName,
            'PrivacyChecker',
            mb.email,
            mb.ip,
            587,
            mb.email,
            escapedPw,
            'STARTTLS',
            mb.ip,
            993,
            mb.email,
            escapedPw,
            'SSL'
        ].join(',');
    });

    // Ensure output dir exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Write single CSV with all mailboxes
    const csvPath = path.join(OUTPUT_DIR, 'ditlead_all_mailboxes.csv');
    fs.writeFileSync(csvPath, csvHeader + '\n' + csvLines.join('\n'), 'utf-8');
    console.log(`✓ Full CSV written: ${csvPath} (${csvLines.length} rows)`);

    // Also write a summary JSON for reference
    const summaryPath = path.join(OUTPUT_DIR, 'mailboxes_summary.json');
    const summary = {};
    for (const mb of allMailboxes) {
        const domain = extractDomain(mb.email);
        if (!summary[mb.vps]) summary[mb.vps] = { ip: mb.ip, domains: {}, total: 0 };
        if (!summary[mb.vps].domains[domain]) summary[mb.vps].domains[domain] = 0;
        summary[mb.vps].domains[domain]++;
        summary[mb.vps].total++;
    }
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`✓ Summary JSON written: ${summaryPath}`);

    console.log('\n=== Done! Upload ditlead_all_mailboxes.csv to Ditlead Bulk CSV Upload ===');
}

main().catch(console.error);
