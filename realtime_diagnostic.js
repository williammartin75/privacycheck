#!/usr/bin/env node
/**
 * Real-time diagnostic: What does Ditlead actually see?
 * 1. Get ALL account statuses from Ditlead API
 * 2. Check real-time dovecot/postfix logs on VPS-40
 * 3. Check if there are any successful IMAP sessions
 */
const https = require('https');
const { Client } = require('ssh2');

const API_KEY = 'pl_tspdmxsjvc6sxdis03op7x5rdsbybmvc';
const API_BASE = 'api.ditlead.com';

function api(method, path) {
    return new Promise((resolve, reject) => {
        const opts = {
            hostname: API_BASE, port: 443,
            path: `/v1/${path}`, method,
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 60000,
        };
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try { resolve(JSON.parse(d)); }
                catch { resolve(d); }
            });
        });
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        req.on('error', reject);
        req.end();
    });
}

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 30000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR'); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

const VPS_DOMAINS = {
    'checkprivacychecker.website': { ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
    'checkprivacychecker.space': { ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    'checkprivacychecker.site': { ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    'checkprivacychecker.info': { ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    'checkprivacychecker.cloud': { ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    'mailprivacychecker.space': { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    'mailprivacychecker.website': { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    'contactprivacychecker.info': { ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    'contactprivacychecker.cloud': { ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    'contactprivacychecker.site': { ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    'contactprivacychecker.website': { ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    'reportprivacychecker.info': { ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    'reportprivacychecker.cloud': { ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    'reportprivacychecker.site': { ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    'reportprivacychecker.website': { ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
};

(async () => {
    // 1. Get ALL accounts from Ditlead
    console.log('═══ DITLEAD ACCOUNT STATUS ═══\n');
    const data = await api('GET', 'mailbox');
    const items = Array.isArray(data) ? data : (data?.data || []);

    // Filter VPS 31-40 domains
    const vps31_40_domains = Object.keys(VPS_DOMAINS);
    const ourAccounts = items.filter(m => {
        const email = m.mailboxAddress || m.email || '';
        const domain = email.split('@')[1];
        return vps31_40_domains.includes(domain);
    });

    console.log(`Total Ditlead accounts: ${items.length}`);
    console.log(`VPS 31-40 accounts: ${ourAccounts.length}\n`);

    // Categorize by status
    const byStatus = {};
    const errorsByDomain = {};
    const errorExamples = [];

    for (const m of ourAccounts) {
        const email = m.mailboxAddress || m.email || '';
        const domain = email.split('@')[1];
        const hasError = m.emailAccountError?.hasError;
        const errMsg = m.emailAccountError?.errMsg?.[0] || '';
        const isActive = m.isActive;
        const isConnected = m.isConnected;

        let status = 'unknown';
        if (hasError) {
            status = `error: ${errMsg.substring(0, 50)}`;
            if (!errorsByDomain[domain]) errorsByDomain[domain] = { count: 0, err: errMsg };
            errorsByDomain[domain].count++;
            if (errorExamples.length < 5) {
                errorExamples.push({ email, hasError, errMsg, isActive, isConnected, warmup: m.warmingData?.warmupEnabled });
            }
        } else if (isActive) {
            status = 'active';
        } else if (isConnected) {
            status = 'connected_not_active';
        } else {
            status = 'disconnected';
        }

        if (!byStatus[status]) byStatus[status] = 0;
        byStatus[status]++;
    }

    console.log('Status breakdown:');
    for (const [status, count] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${count}x ${status}`);
    }

    if (Object.keys(errorsByDomain).length > 0) {
        console.log('\nErrors by domain:');
        for (const [domain, info] of Object.entries(errorsByDomain)) {
            console.log(`  ${domain}: ${info.count} errors — "${info.err}"`);
        }
    }

    if (errorExamples.length > 0) {
        console.log('\nExample broken accounts (full details):');
        for (const ex of errorExamples) {
            console.log(`  ${ex.email}: active=${ex.isActive} connected=${ex.isConnected} warmup=${ex.warmup}`);
            console.log(`    error: ${ex.errMsg}`);
        }
    }

    // 2. Check live logs on VPS-40
    console.log('\n\n═══ LIVE VPS-40 LOGS (last 2 min) ═══');
    const vps40 = VPS_DOMAINS['checkprivacychecker.website'];
    const logs = await sshExec(vps40.ip, vps40.pass,
        'journalctl -u dovecot -u postfix --since "2 minutes ago" --no-pager 2>/dev/null | tail -30');
    console.log(logs);

    // 3. Check if any IMAP auth SUCCEEDED in recent logs
    console.log('\n\n═══ RECENT IMAP AUTH SUCCESSES (VPS-40) ═══');
    const imapSuccess = await sshExec(vps40.ip, vps40.pass,
        'journalctl -u dovecot --since "10 minutes ago" --no-pager 2>/dev/null | grep -i "Login:" | tail -10');
    console.log(imapSuccess || 'NONE');

    // 4. Check which IPs Ditlead connects from and what happens  
    console.log('\n\n═══ DITLEAD IP CONNECTIONS (VPS-40, last 10 min) ═══');
    const ditleadConns = await sshExec(vps40.ip, vps40.pass,
        'journalctl -u dovecot --since "10 minutes ago" --no-pager 2>/dev/null | grep -v "::1" | grep -v "127.0.0.1" | tail -20');
    console.log(ditleadConns || 'NONE');

    // 5. Check postfix submission logs
    console.log('\n\n═══ POSTFIX SMTP SUBMISSION LOGS (VPS-40, last 10 min) ═══');
    const smtpLogs = await sshExec(vps40.ip, vps40.pass,
        'journalctl -u postfix --since "10 minutes ago" --no-pager 2>/dev/null | grep -i "submission\\|smtp\\|sasl" | tail -20');
    console.log(smtpLogs || 'NONE — no SMTP submission attempts');

    console.log('\n═══ DONE ═══');
})();
