#!/usr/bin/env node
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };
function ex(cmd, t = 15000) {
    return new Promise((resolve, reject) => {
        const c = new Client();
        let o = '';
        const tm = setTimeout(() => { c.end(); resolve(o.trim() || '[TIMEOUT]'); }, t);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(tm); c.end(); return reject(err); }
                stream.on('data', d => o += d);
                stream.stderr.on('data', d => o += d);
                stream.on('close', () => { clearTimeout(tm); c.end(); resolve(o.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(tm); reject(e); });
        c.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 10000 });
    });
}
async function main() {
    console.log('1. Firewall (iptables):');
    console.log(await ex('iptables -L INPUT -n --line-numbers 2>&1 | head -20'));
    console.log('\n2. UFW status:');
    console.log(await ex('ufw status 2>&1'));
    console.log('\n3. Port 3000 listening:');
    console.log(await ex('ss -tlnp | grep 3000'));
    console.log('\n4. Docker containers:');
    console.log(await ex('docker ps --format "{{.Names}} {{.Ports}}"'));
    console.log('\n5. Test localhost access:');
    console.log(await ex('wget -qO- --timeout=3 http://127.0.0.1:3000/pctrack.js 2>&1 | head -3'));
    console.log('\n6. Test 0.0.0.0 access:');
    console.log(await ex('wget -qO- --timeout=3 http://0.0.0.0:3000/pctrack.js 2>&1 | head -3'));
}
main().catch(e => console.error(e.message));
