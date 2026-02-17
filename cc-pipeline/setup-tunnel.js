#!/usr/bin/env node
/** Install cloudflared and create a tunnel for Umami */
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function ex(cmd, t = 120000) {
    return new Promise((resolve, reject) => {
        const c = new Client();
        let o = '';
        const tm = setTimeout(() => { c.end(); resolve(o.trim() || '[TIMEOUT]'); }, t);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(tm); c.end(); return reject(err); }
                stream.on('data', d => { o += d; process.stdout.write(d); });
                stream.stderr.on('data', d => { o += d; process.stdout.write(d); });
                stream.on('close', () => { clearTimeout(tm); c.end(); resolve(o.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(tm); reject(e); });
        c.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 15000 });
    });
}

async function main() {
    // Step 1: Check if cloudflared is already installed
    console.log('Step 1: Checking cloudflared...');
    const check = await ex('cloudflared --version 2>/dev/null || echo NOT_INSTALLED');
    console.log(check);

    if (check.includes('NOT_INSTALLED')) {
        // Step 2: Install cloudflared
        console.log('\nStep 2: Installing cloudflared...');
        await ex(`
            wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared.deb && \
            dpkg -i /tmp/cloudflared.deb && \
            rm /tmp/cloudflared.deb && \
            cloudflared --version
        `, 60000);
    }

    // Step 3: Create a systemd service for the quick tunnel
    console.log('\nStep 3: Setting up persistent quick tunnel...');
    await ex(`cat > /etc/systemd/system/cloudflared-tunnel.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel for Umami Analytics
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:80 --no-autoupdate
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF`);

    // Step 4: Start the tunnel
    console.log('\nStep 4: Starting tunnel...');
    await ex('systemctl daemon-reload && systemctl enable cloudflared-tunnel && systemctl start cloudflared-tunnel');

    // Step 5: Wait and get the tunnel URL
    console.log('\nStep 5: Waiting for tunnel URL (10s)...');
    await new Promise(r => setTimeout(r, 10000));
    const logs = await ex('journalctl -u cloudflared-tunnel --no-pager -n 30 2>&1');

    // Extract the trycloudflare.com URL from logs
    const urlMatch = logs.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (urlMatch) {
        console.log('\n========================================');
        console.log('  TUNNEL URL:', urlMatch[0]);
        console.log('========================================');
    } else {
        console.log('\nCould not find tunnel URL. Logs:');
        console.log(logs.substring(logs.length - 1000));
    }
}

main().catch(e => console.error('ERROR:', e.message));
