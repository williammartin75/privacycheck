const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS40 = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };
const COLLECT_DIR = path.join('C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\CC - January 2026', 'vps40_final');

function ssh(h, p, c, timeout = 30000) {
    return new Promise(r => {
        const cl = new Client;
        const t = setTimeout(() => { cl.end(); r({ ok: false, out: 'TIMEOUT' }) }, timeout);
        cl.on('ready', () => {
            cl.exec(c, { pty: false }, (e, s) => {
                if (e) { clearTimeout(t); cl.end(); return r({ ok: false }) }
                let o = '';
                s.on('data', d => o += d);
                s.stderr.on('data', d => o += d);
                s.on('close', () => { clearTimeout(t); cl.end(); r({ ok: true, out: o.trim() }) });
            });
        });
        cl.on('error', e => { clearTimeout(t); r({ ok: false, out: e.message }) });
        cl.connect({
            host: h, port: 22, username: 'root', password: p, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function scpDownload(host, pass, remotePath, localPath, timeout = 600000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: 'TIMEOUT' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: 'SFTP_ERR' }) }
                sftp.fastGet(remotePath, localPath, { concurrency: 8, chunkSize: 65536 }, (err) => {
                    clearTimeout(t);
                    c.end();
                    if (err) return resolve({ ok: false, out: err.message });
                    resolve({ ok: true, out: 'OK' });
                });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    if (!fs.existsSync(COLLECT_DIR)) fs.mkdirSync(COLLECT_DIR, { recursive: true });

    // First check what files exist and their sizes
    console.log('Checking VPS-40 result files...\n');
    const check = await ssh(VPS40.ip, VPS40.pass,
        'ls -lh /root/cc_results_w*.ndjson 2>/dev/null; echo "---"; ' +
        'for f in /root/cc_results_w*.ndjson; do [ -f "$f" ] && echo "$(basename $f)|$(wc -l < $f)|$(du -h $f | cut -f1)"; done'
    );
    console.log(check.out);

    // Download each worker file with 10 min timeout
    const files = check.out.split('\n').filter(l => l.includes('|'));
    console.log(`\nFound ${files.length} result files. Downloading (10 min timeout each)...\n`);

    let totalEmails = 0;
    for (const f of files) {
        const [name, lines, size] = f.split('|');
        const remote = `/root/${name}`;
        const local = path.join(COLLECT_DIR, name);
        console.log(`  📥 ${name}: ${parseInt(lines).toLocaleString()} emails (${size})...`);
        const start = Date.now();
        const r = await scpDownload(VPS40.ip, VPS40.pass, remote, local);
        const elapsed = Math.round((Date.now() - start) / 1000);
        if (r.ok) {
            totalEmails += parseInt(lines);
            console.log(`    ✅ Downloaded in ${elapsed}s`);
        } else {
            console.log(`    ❌ ${r.out} (after ${elapsed}s)`);
        }
    }

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`  VPS-40 collection complete`);
    console.log(`  Total emails: ${totalEmails.toLocaleString()}`);
    console.log(`  Saved to: ${COLLECT_DIR}`);
    console.log(`═══════════════════════════════════════════════════════`);
})();
