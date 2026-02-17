#!/usr/bin/env node
/** Configure Umami: login, change password, add website, get tracking ID */
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };
const UMAMI_URL = 'http://localhost:3000';
const NEW_PASSWORD = 'Pr1vacyCh3ck2026!';

function ex(cmd, t = 30000) {
    return new Promise((resolve, reject) => {
        const c = new Client();
        let o = '';
        const tm = setTimeout(() => { c.end(); reject(new Error('timeout')); }, t);
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
    // Step 1: Login with default creds
    console.log('Step 1: Logging in with default admin/umami...');
    const loginRes = await ex(`curl -s -X POST ${UMAMI_URL}/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"umami"}'`);
    let loginData;
    try {
        loginData = JSON.parse(loginRes.output);
    } catch {
        // Maybe password was already changed, try with new password
        console.log('Default login failed, trying with new password...');
        const retryRes = await ex(`curl -s -X POST ${UMAMI_URL}/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"${NEW_PASSWORD}"}'`);
        loginData = JSON.parse(retryRes.output);
    }

    if (!loginData.token) {
        console.error('Login failed:', loginData);
        return;
    }
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('Logged in! User ID:', userId);

    // Step 2: Change password
    console.log('\nStep 2: Changing admin password...');
    const pwRes = await ex(`curl -s -X POST ${UMAMI_URL}/api/users/${userId}/password -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"currentPassword":"umami","newPassword":"${NEW_PASSWORD}"}'`);
    if (pwRes.output === '' || pwRes.output.includes('ok')) {
        console.log('Password changed successfully!');
    } else {
        console.log('Password change response:', pwRes.output);
    }

    // Step 3: Add website
    console.log('\nStep 3: Adding privacychecker.pro...');
    const addRes = await ex(`curl -s -X POST ${UMAMI_URL}/api/websites -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"name":"PrivacyChecker","domain":"privacychecker.pro"}'`);
    let website;
    try {
        website = JSON.parse(addRes.output);
    } catch {
        console.log('Add website response:', addRes.output);
        // Try to list existing websites
        const listRes = await ex(`curl -s ${UMAMI_URL}/api/websites -H "Authorization: Bearer ${token}"`);
        const list = JSON.parse(listRes.output);
        if (list.data && list.data.length > 0) {
            website = list.data.find(w => w.domain === 'privacychecker.pro') || list.data[0];
        }
    }

    if (website && website.id) {
        console.log('Website added!');
        console.log('\n========================================');
        console.log('  UMAMI FULLY CONFIGURED');
        console.log('========================================');
        console.log(`  Dashboard:  http://${VPS.ip}:3000`);
        console.log(`  Login:      admin / ${NEW_PASSWORD}`);
        console.log(`  Website ID: ${website.id}`);
        console.log('========================================\n');
    } else {
        console.log('Could not get website ID:', JSON.stringify(website));
    }
}

main().catch(e => console.error('ERROR:', e.message));
