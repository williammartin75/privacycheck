/**
 * Deploy happyDeliver on VPS-29 (spare)
 * - Installs Docker
 * - Clones and runs happyDeliver
 * - Opens port 25 + 8080
 */
const { Client } = require('ssh2');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

function exec(conn, cmd, timeout = 120000) {
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
    console.log('Connected!\n');

    const steps = [
        {
            name: 'Check if Docker is installed',
            cmd: 'docker --version 2>&1 || echo "NOT_INSTALLED"'
        },
        {
            name: 'Install Docker (if needed)',
            cmd: `if ! command -v docker &>/dev/null; then
                apt-get update -qq && 
                apt-get install -y -qq docker.io docker-compose git &&
                systemctl enable docker && systemctl start docker &&
                echo "Docker installed"
            else
                echo "Docker already installed"
            fi`,
            timeout: 180000
        },
        {
            name: 'Stop any existing Postfix (frees port 25)',
            cmd: 'systemctl stop postfix 2>/dev/null; systemctl disable postfix 2>/dev/null; echo "Postfix stopped"'
        },
        {
            name: 'Open firewall ports 25 and 8080',
            cmd: `ufw allow 25/tcp 2>/dev/null; ufw allow 8080/tcp 2>/dev/null;
                  iptables -A INPUT -p tcp --dport 25 -j ACCEPT 2>/dev/null;
                  iptables -A INPUT -p tcp --dport 8080 -j ACCEPT 2>/dev/null;
                  echo "Ports opened"`
        },
        {
            name: 'Clone happyDeliver repo',
            cmd: `cd /root && rm -rf happydeliver 2>/dev/null;
                  git clone https://github.com/happyDomain/happydeliver.git 2>&1 | tail -3;
                  ls /root/happydeliver/`
        },
        {
            name: 'Check docker-compose.yml',
            cmd: 'cat /root/happydeliver/docker-compose.yml 2>/dev/null || echo "NO COMPOSE FILE"'
        },
        {
            name: 'Build and start happyDeliver',
            cmd: `cd /root/happydeliver &&
                  export HAPPYDELIVER_DOMAIN=${VPS29.ip} &&
                  sed -i "s/yourdomain.com/${VPS29.ip}/g" docker-compose.yml 2>/dev/null;
                  docker-compose up -d --build 2>&1 | tail -10`,
            timeout: 300000
        },
        {
            name: 'Wait for startup and check status',
            cmd: 'sleep 5 && docker ps && echo "---" && curl -s http://localhost:8080/api/status 2>&1 | head -5'
        },
        {
            name: 'Test API - create a test',
            cmd: 'curl -s -X POST http://localhost:8080/api/test 2>&1'
        }
    ];

    for (const step of steps) {
        console.log(`\n=== ${step.name} ===`);
        const result = await exec(conn, step.cmd, step.timeout || 120000);
        console.log(result);
    }

    conn.end();
    console.log('\n✅ Deployment complete!');
    console.log(`API: http://${VPS29.ip}:8080/api/status`);
    console.log(`SMTP: ${VPS29.ip}:25`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
