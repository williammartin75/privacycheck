#!/usr/bin/env node
/** Find rate limit in HappyDeliver source + config, disable it, then test */
const { Client } = require('ssh2');
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
    // 1. Check HappyDeliver help for config options
    console.log('=== HappyDeliver config help ===');
    let r = await ssh('docker exec happydeliver /happyDeliver server --help 2>&1 | head -30', 10000);
    console.log(r);

    // 2. Search for rate limit in source
    console.log('\n=== Rate limit in source ===');
    r = await ssh('grep -rn "rate" /root/happyDeliver/ --include="*.go" | head -20', 15000);
    console.log(r || '(nothing found)');

    // 3. Check config files in container
    console.log('\n=== Config files in container ===');
    r = await ssh('docker exec happydeliver find / -name "*.yml" -o -name "*.yaml" -o -name "*.toml" -o -name "*.conf" -o -name "*.cfg" 2>/dev/null | grep -v proc | head -20', 10000);
    console.log(r || '(nothing)');

    // 4. Check env vars in container
    console.log('\n=== Env vars in container ===');
    r = await ssh('docker exec happydeliver env 2>&1 | grep -i rate || echo "no RATE env"');
    console.log(r);

    // 5. Check all env vars
    console.log('\n=== All env vars ===');
    r = await ssh('docker exec happydeliver env 2>&1');
    console.log(r);

    // 6. Check entrypoint script
    console.log('\n=== Entrypoint ===');
    r = await ssh('docker exec happydeliver cat /entrypoint.sh 2>&1 | head -50');
    console.log(r);
})();
