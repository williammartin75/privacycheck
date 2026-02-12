const { Client } = require('ssh2');
const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

function exec(conn, cmd, timeout = 60000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve('[TIMEOUT]'), timeout);
        conn.exec(cmd, (err, stream) => {
            if (err) { clearTimeout(timer); return reject(err); }
            let out = '';
            stream.on('data', d => out += d.toString());
            stream.stderr.on('data', d => out += d.toString());
            stream.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
        });
    });
}

function sshConnect(ip, pass) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => resolve(conn));
        conn.on('error', reject);
        conn.connect({ host: ip, port: 22, username: 'root', password: pass, readyTimeout: 15000 });
    });
}

async function main() {
    const conn = await sshConnect(VPS29.ip, VPS29.pass);

    // Remove old container
    console.log('=== Removing old container ===');
    console.log(await exec(conn, 'docker rm -f happydeliver 2>/dev/null; echo "Done"'));

    // Start with a proper domain hostname
    console.log('\n=== Starting happyDeliver with proper hostname ===');
    const runCmd = `docker run -d \\
        --name happydeliver \\
        -p 25:25 \\
        -p 8080:8080 \\
        -e HAPPYDELIVER_DOMAIN=emailtester.local \\
        --hostname mail.emailtester.local \\
        -v /root/happydeliver-data:/var/lib/happydeliver \\
        -v /root/happydeliver-logs:/var/log/happydeliver \\
        happydomain/happydeliver:latest 2>&1`;
    console.log(await exec(conn, runCmd));

    // Wait for startup
    console.log('\n=== Waiting 10s ===');
    await new Promise(r => setTimeout(r, 10000));

    console.log('\n=== Docker status ===');
    console.log(await exec(conn, 'docker ps -a | head -5'));

    console.log('\n=== Docker logs ===');
    console.log(await exec(conn, 'docker logs happydeliver 2>&1 | tail -20'));

    console.log('\n=== Ports ===');
    console.log(await exec(conn, 'ss -tlnp | grep -E ":25 |:8080"'));

    console.log('\n=== Test API ===');
    console.log(await exec(conn, 'curl -s http://localhost:8080/api/status 2>&1'));

    console.log('\n=== Create test ===');
    console.log(await exec(conn, 'curl -s -X POST http://localhost:8080/api/test 2>&1'));

    conn.end();
}

main().catch(console.error);
