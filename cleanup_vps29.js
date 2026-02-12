/**
 * Clean up happyDeliver from VPS-29
 */
const { Client } = require('ssh2');
const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

function exec(conn, cmd, timeout = 30000) {
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
    console.log('Connecting to VPS-29...');
    const conn = await sshConnect(VPS29.ip, VPS29.pass);

    console.log('Stopping and removing happyDeliver container...');
    console.log(await exec(conn, 'docker stop happydeliver 2>/dev/null; docker rm happydeliver 2>/dev/null; echo "Container removed"'));

    console.log('Removing Docker images...');
    console.log(await exec(conn, 'docker rmi happydomain/happydeliver:latest 2>/dev/null; docker image prune -f 2>/dev/null; echo "Images cleaned"'));

    console.log('Removing data...');
    console.log(await exec(conn, 'rm -rf /root/happydeliver /root/happydeliver-data /root/happydeliver-logs; echo "Data cleaned"'));

    console.log('Checking disk space recovered...');
    console.log(await exec(conn, 'df -h /'));

    console.log('\n✅ VPS-29 cleaned up!');
    conn.end();
}

main().catch(console.error);
