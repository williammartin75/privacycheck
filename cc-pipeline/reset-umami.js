#!/usr/bin/env node
/** Reset Umami by recreating the containers with fresh DB */
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function ex(cmd, t = 60000) {
    return new Promise((resolve, reject) => {
        const c = new Client();
        let o = '';
        const tm = setTimeout(() => { c.end(); resolve({ code: -1, output: o.trim() + '\n[TIMEOUT]' }); }, t);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(tm); c.end(); return reject(err); }
                stream.on('data', d => o += d);
                stream.stderr.on('data', d => o += d);
                stream.on('close', code => { clearTimeout(tm); c.end(); resolve({ code, output: o.trim() }); });
            });
        });
        c.on('error', e => { clearTimeout(tm); reject(e); });
        c.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 15000 });
    });
}

async function main() {
    console.log('Step 1: Stopping containers...');
    const stop = await ex('cd /opt/umami && docker compose down -v 2>&1');
    console.log(stop.output);

    console.log('\nStep 2: Restarting with fresh DB...');
    const start = await ex('cd /opt/umami && docker compose up -d 2>&1', 120000);
    console.log(start.output);

    console.log('\nStep 3: Waiting 20s for Umami to initialize...');
    await new Promise(r => setTimeout(r, 20000));

    console.log('Step 4: Testing login with admin/umami...');
    const login = await ex("curl -s -X POST http://localhost:3000/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"umami\"}'");
    console.log('Response:', login.output.substring(0, 300));

    try {
        const data = JSON.parse(login.output);
        if (data.token) {
            console.log('\n✅ Login works! Token received.');
            console.log('\nDefault credentials:');
            console.log('  Username: admin');
            console.log('  Password: umami');
        } else {
            console.log('\n❌ Login failed:', JSON.stringify(data));
        }
    } catch {
        console.log('\n❌ Could not parse response');
    }
}

main().catch(e => console.error('ERROR:', e.message));
