#!/usr/bin/env node
/** 
 * Restart HappyDeliver + debug API + send 1 real test 
 */
const { Client } = require('ssh2');
const http = require('http');
const VPS29 = { ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' };
const VPS31 = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function ssh(host, pass, cmd, timeout = 30000) {
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
            host, port: 22, username: 'root', password: pass, readyTimeout: 10000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function apiRaw(method, path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: VPS29.ip, port: 8080, path, method, timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')) });
        req.on('error', reject);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

(async () => {
    // 1. Restart container
    console.log('1. Restarting container...');
    let r = await ssh(VPS29.ip, VPS29.pass, 'docker start happydeliver 2>&1 || docker run -d --name happydeliver -p 25:25 -p 8080:8080 -e HAPPYDELIVER_DOMAIN=emailtester.local --hostname mail.emailtester.local happydeliver:latest 2>&1');
    console.log('   ' + r);

    await sleep(10000);

    // 2. Test API
    console.log('\n2. API test:');
    try {
        let resp = await apiRaw('GET', '/api/status');
        console.log(`   GET /api/status => ${resp.status} => ${resp.body}`);
    } catch (e) {
        console.log('   ❌ ' + e.message);
        // Check logs
        r = await ssh(VPS29.ip, VPS29.pass, 'docker logs happydeliver 2>&1 | tail -10');
        console.log('   Logs: ' + r);
        return;
    }

    // 3. Create 3 tests rapidly
    console.log('\n3. Create 3 tests:');
    const tests = [];
    for (let i = 0; i < 3; i++) {
        try {
            const resp = await apiRaw('POST', '/api/test');
            console.log(`   POST /api/test => ${resp.status} => ${resp.body.substring(0, 150)}`);
            const data = JSON.parse(resp.body);
            tests.push(data);
        } catch (e) {
            console.log(`   ❌ Test ${i}: ${e.message}`);
        }
    }

    if (tests.length === 0) return console.log('No tests created');

    // 4. Send a real email to the first test
    const test = tests[0];
    console.log(`\n4. Sending email to: ${test.email} from VPS-31...`);

    r = await ssh(VPS31.ip, VPS31.pass,
        `swaks --to "${test.email}" --from "contact1@mailprivacychecker.space" --server ${VPS29.ip} --port 25 --helo mail.mailprivacychecker.space --header "Subject: HappyDeliver Test" --body "Test from mailprivacychecker.space" --timeout 15 2>&1`,
        25000
    );
    console.log('   ' + r.split('\n').slice(-5).join('\n   '));

    // 5. Wait for analysis
    console.log('\n5. Waiting 20s for analysis...');
    await sleep(20000);

    // 6. Check report
    console.log('\n6. Report:');
    try {
        const resp = await apiRaw('GET', `/api/report/${test.id}`);
        console.log(`   GET /api/report/${test.id} => ${resp.status}`);
        const report = JSON.parse(resp.body);
        console.log('   ' + JSON.stringify(report, null, 2).substring(0, 1000));
    } catch (e) {
        console.log('   ❌ ' + e.message);
    }

    // 7. Check mail log inside container
    console.log('\n7. Container mail log:');
    r = await ssh(VPS29.ip, VPS29.pass, 'docker exec happydeliver cat /var/log/mail.log 2>/dev/null | tail -10 || docker logs happydeliver 2>&1 | tail -10');
    console.log('   ' + r);
})();
