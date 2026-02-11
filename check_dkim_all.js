#!/usr/bin/env node
// Quick DKIM check on VPS 11-16
const { Client } = require('ssh2');

const VPS = [
    { id: 'VPS-11', ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp', domains: ['privacycheckermailpro.cloud', 'privacycheckermailpro.site'] },
    { id: 'VPS-12', ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe', domains: ['privacycheckermailpro.website', 'privacycheckermailpro.space'] },
    { id: 'VPS-13', ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5', domains: ['privacycheckermailpro.icu', 'privacy-checker-mail-pro.online'] },
    { id: 'VPS-14', ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7', domains: ['privacy-checker-mail-pro.cloud', 'privacy-checker-mail-pro.site'] },
    { id: 'VPS-15', ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm', domains: ['privacy-checker-mail-pro.space', 'privacy-checker-mail-pro.website'] },
    { id: 'VPS-16', ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783', domains: ['privacy-checker-mail-pro.icu'] },
];

function sshExec(conn, cmd, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let stdout = '';
            stream.on('data', d => stdout += d.toString());
            stream.stderr.on('data', () => { });
            stream.on('close', () => { clearTimeout(timer); resolve(stdout.trim()); });
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

async function main() {
    for (const vps of VPS) {
        try {
            const conn = await sshConnect(vps);
            const sigTable = await sshExec(conn, 'cat /etc/opendkim/signing.table 2>/dev/null || echo "MISSING"');
            const keyTable = await sshExec(conn, 'cat /etc/opendkim/key.table 2>/dev/null || echo "MISSING"');
            const dkimActive = await sshExec(conn, 'systemctl is-active opendkim');
            const errors = await sshExec(conn, 'tail -10 /var/log/mail.log | grep -c "milter-reject" 2>/dev/null || echo "0"');

            const sigOk = sigTable !== 'MISSING' && sigTable.includes('@');
            const keyOk = keyTable !== 'MISSING' && keyTable.includes('private');

            console.log(`${vps.id} (${vps.domains.join(', ')})`);
            console.log(`  OpenDKIM: ${dkimActive} | signing.table: ${sigOk ? '✅' : '❌ MISSING'} | key.table: ${keyOk ? '✅' : '❌ MISSING'} | milter-rejects: ${errors}`);
            if (!sigOk) console.log(`  signing.table content: ${sigTable}`);
            if (!keyOk) console.log(`  key.table content: ${keyTable}`);
            conn.end();
        } catch (e) {
            console.log(`${vps.id}: ❌ ${e.message}`);
        }
    }
}

main().catch(console.error);
