const { Client } = require('ssh2');
const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 5, ip: '23.95.242.32', pass: 'v6Jk79EUE15reqJ3zB' },
    { id: 11, ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

function ssh(h, p, c) {
    return new Promise(r => {
        const cl = new Client;
        const t = setTimeout(() => { cl.end(); r({ ok: false, out: 'TIMEOUT' }) }, 20000);
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

(async () => {
    console.log('Checking download failures on sample VPS...\n');
    for (const v of ALL_VPS) {
        const r = await ssh(v.ip, v.pass,
            'FAILED=$(grep -r -c "Download failed" /root/cc_extract_*.log 2>/dev/null | awk -F: "{s+=\\$NF}END{print s+0}"); ' +
            'DONE=$(wc -l < /root/cc_progress.log 2>/dev/null || echo 0); ' +
            'TOTAL=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
            'EMAILS=0; for f in /root/cc_results_w*.ndjson; do [ -f "$f" ] && C=$(wc -l < "$f"); EMAILS=$((EMAILS + C)); done; ' +
            'echo "$DONE|$FAILED|$TOTAL|$EMAILS"'
        );
        if (r.ok && r.out.includes('|')) {
            const [done, failed, total, emails] = r.out.split('|').map(Number);
            const success = done - failed;
            const emailsPerSuccess = success > 0 ? Math.round(emails / success) : 0;
            const skipPct = done > 0 ? Math.round(failed / done * 100) : 0;
            console.log(`VPS-${String(v.id).padStart(2)}: ${done} done | ${failed} FAILED (${skipPct}%) | ${success} OK | ${emails.toLocaleString()} emails | ~${emailsPerSuccess} emails/file`);
        } else {
            console.log(`VPS-${v.id}: ERR - ${r.out}`);
        }
    }
})();
