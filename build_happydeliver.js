#!/usr/bin/env node
/**
 * Step 1: Start Docker build on VPS-29 in background
 * Step 2: Poll until build is done
 * Step 3: Start container
 * Step 4: Run tests
 */
const { Client } = require('ssh2');
const http = require('http');
const fs = require('fs');

const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };

function ssh(cmd, timeout = 30000) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('[TIMEOUT]'); }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('[ERR]'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host: VPS29.ip, port: 22, username: 'root', password: VPS29.pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    // Check if image already exists
    let r = await ssh('docker images happydeliver --format "{{.Repository}}:{{.Tag}}" 2>&1');
    console.log('Existing image:', r || 'none');

    if (r.includes('happydeliver')) {
        console.log('✅ Image already built! Skipping build.');
    } else {
        // Check if build is already running
        r = await ssh('pgrep -a "docker build" 2>&1 | head -3');
        if (r && !r.includes('[TIMEOUT]') && !r.includes('ERR') && r.length > 3) {
            console.log('Build already in progress, monitoring...');
        } else {
            // Start build in background
            console.log('Starting Docker build in background...');
            r = await ssh('cd /root/happyDeliver && nohup docker build -t happydeliver:latest . > /root/docker_build.log 2>&1 & echo PID=$!');
            console.log(r);
        }

        // Poll until done (max 15 min)
        for (let i = 0; i < 30; i++) {
            await sleep(30000);

            // Check if build is still running
            r = await ssh('pgrep -f "docker build" >/dev/null 2>&1 && echo RUNNING || echo DONE');
            const building = r.includes('RUNNING');

            // Show last few lines of build log
            const log = await ssh('tail -3 /root/docker_build.log 2>&1');
            console.log(`[${(i + 1) * 30}s] ${building ? '🏗️' : '✅'} ${log.split('\n').pop()}`);

            if (!building) break;
        }

        // Check final result
        r = await ssh('docker images happydeliver --format "{{.Repository}}:{{.Tag}} {{.Size}}" 2>&1');
        console.log('\nFinal image:', r);

        if (!r.includes('happydeliver')) {
            console.log('❌ Build failed. Last logs:');
            r = await ssh('tail -20 /root/docker_build.log 2>&1');
            console.log(r);
            return;
        }
    }

    // Start container
    console.log('\nStarting happyDeliver container...');
    await ssh('docker rm -f happydeliver 2>/dev/null; systemctl stop postfix 2>/dev/null; fuser -k 25/tcp 2>/dev/null');

    r = await ssh([
        'docker run -d --name happydeliver',
        '-p 25:25 -p 8080:8080',
        `-e HAPPYDELIVER_DOMAIN=${VPS29.ip}`,
        '--hostname mail.test.local',
        '-v /root/hd-data:/var/lib/happydeliver',
        'happydeliver:latest 2>&1'
    ].join(' '));
    console.log('Container:', r);

    await sleep(10000);

    // Test API
    try {
        const status = await new Promise((resolve, reject) => {
            const req = http.get({ hostname: VPS29.ip, port: 8080, path: '/api/status', timeout: 10000 }, res => {
                let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve(d) } });
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')) });
        });
        console.log('✅ API:', JSON.stringify(status));
    } catch (e) {
        console.log('❌ API still down:', e.message);
        r = await ssh('docker logs happydeliver 2>&1 | tail -15');
        console.log('Logs:', r);
    }
})();
