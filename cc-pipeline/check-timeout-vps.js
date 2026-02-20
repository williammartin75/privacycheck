const { Client } = require('ssh2');
function ssh(h, p, cmd) {
    return new Promise(r => {
        const c = new Client();
        const t = setTimeout(() => { try { c.end() } catch (e) { } r('TIMEOUT') }, 20000);
        c.on('ready', () => {
            c.exec(cmd, { pty: false }, (e, s) => {
                if (e) { clearTimeout(t); c.end(); return r('ERR') }
                let o = '';
                s.on('data', d => o += d.toString());
                s.stderr.on('data', d => o += d.toString());
                s.on('close', () => { clearTimeout(t); c.end(); r(o.trim()) });
            });
        });
        c.on('error', e => { clearTimeout(t); r('SSH:' + e.message) });
        c.connect({
            host: h, port: 22, username: 'root', password: p, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
    { id: 3, ip: '206.217.139.115', pass: '20QEs9OSh8Bw3egI1q' },
    { id: 4, ip: '206.217.139.116', pass: 'JvSg1HPu956fAt0dY0' },
    { id: 5, ip: '23.95.242.32', pass: 'v6Jk79EUE15reqJ3zB' },
    { id: 10, ip: '23.94.240.173', pass: 'L5fgrQ6I84E3uvR2Nn' },
    { id: 15, ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

(async () => {
    console.log('Checking for old v1 results (results.ndjson) on sample VPS...\n');
    for (const v of ALL_VPS) {
        const result = await ssh(v.ip, v.pass,
            'ls -lh /root/results.ndjson 2>/dev/null && wc -l < /root/results.ndjson 2>/dev/null || echo "NOT FOUND"; ' +
            'echo "---"; ' +
            'ls -lh /root/cc_results.ndjson 2>/dev/null && wc -l < /root/cc_results.ndjson 2>/dev/null || echo "v2 NOT FOUND"; ' +
            'echo "---"; ' +
            'ls /root/*.ndjson 2>/dev/null || echo "NO NDJSON FILES"'
        );
        console.log(`VPS-${String(v.id).padStart(2)}: ${result}\n`);
    }
    process.exit(0);
})();
