const { Client } = require('ssh2');
function ssh(h, p, cmd) { return new Promise(r => { const c = new Client(); const t = setTimeout(() => { try { c.end() } catch (e) { } r('TIMEOUT') }, 12000); c.on('ready', () => { c.exec(cmd, { pty: false }, (e, s) => { if (e) { clearTimeout(t); c.end(); return r('ERR') } let o = ''; s.on('data', d => o += d.toString()); s.stderr.on('data', d => o += d.toString()); s.on('close', () => { clearTimeout(t); c.end(); r(o.trim()) }) }) }); c.on('error', e => { clearTimeout(t); r('SSH:' + e.message) }); c.connect({ host: h, port: 22, username: 'root', password: p, readyTimeout: 8000, algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] } }) }) }
const vps = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 10, ip: '23.94.240.173', pass: 'L5fgrQ6I84E3uvR2Nn' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];
(async () => {
    for (const v of vps) {
        console.log(`\n=== VPS-${v.id} ===`);
        const proc = await ssh(v.ip, v.pass, 'pgrep -fa extract_v3 | grep -v pgrep');
        console.log('PROCS:', proc);
        const log0 = await ssh(v.ip, v.pass, 'tail -5 /root/cc_extract_0.log 2>&1');
        console.log('LOG W0:', log0);
        const log1 = await ssh(v.ip, v.pass, 'tail -5 /root/cc_extract_1.log 2>&1');
        console.log('LOG W1:', log1);
        const sample = await ssh(v.ip, v.pass, 'tail -1 /root/cc_results.ndjson 2>&1 | python3 -m json.tool 2>&1 | head -15');
        console.log('SAMPLE:', sample);
    }
    process.exit(0);
})()
