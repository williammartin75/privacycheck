#!/usr/bin/env node
/** Check + start happyDeliver on VPS-29 */
const { Client } = require('ssh2');
const http = require('http');
const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

function ssh(cmd, timeout = 30000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('[TIMEOUT]') }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, s) => {
                if (err) { clearTimeout(t); c.end(); return resolve('[ERR]') }
                let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d);
                s.on('close', () => { clearTimeout(t); c.end(); resolve(o.trim()) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message) });
        c.connect({
            host: VPS29.ip, port: 22, username: 'root', password: VPS29.pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    // Check if build is still running
    let r = await ssh('pgrep -a "docker build" 2>&1 | head -3');
    console.log('Build process:', r || 'NOT RUNNING');

    // Check build log
    r = await ssh('tail -5 /root/docker_build.log 2>&1');
    console.log('\nBuild log (last 5 lines):\n' + r);

    // Check if image exists
    r = await ssh('docker images --format "{{.Repository}}:{{.Tag}} {{.Size}} {{.CreatedSince}}" 2>&1');
    console.log('\nDocker images:\n' + r);

    // Check running containers
    r = await ssh('docker ps -a --format "{{.Names}} {{.Status}}" 2>&1');
    console.log('\nContainers:', r);

    // Check ports
    r = await ssh('ss -tlnp | grep -E ":25 |:8080" 2>&1');
    console.log('\nPorts:', r || 'none');

    // Try API
    try {
        const status = await new Promise((resolve, reject) => {
            const req = http.get({ hostname: VPS29.ip, port: 8080, path: '/api/status', timeout: 5000 }, res => {
                let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } });
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')) });
        });
        console.log('\n✅ API READY:', JSON.stringify(status));
    } catch (e) {
        console.log('\n❌ API not ready:', e.message);
    }
})();
