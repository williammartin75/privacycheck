#!/usr/bin/env node
/**
 * Diagnose VPS-30 via VPS-21 proxy hop
 */
const { Client } = require('ssh2');

const PROXY = { ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
const VPS30 = { ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' };
const DOMAIN = 'mailprivacychecker.site';

function sshConnect(host, pass) {
    return new Promise((r, j) => {
        const c = new Client();
        c.on('ready', () => r(c));
        c.on('error', j);
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function exec(conn, cmd, t = 15000) {
    return new Promise((r, j) => {
        const tm = setTimeout(() => j(new Error('Timeout')), t);
        conn.exec(cmd, (e, s) => {
            if (e) { clearTimeout(tm); return j(e); }
            let o = '';
            s.on('data', d => o += d.toString());
            s.stderr.on('data', d => o += d.toString());
            s.on('close', () => { clearTimeout(tm); r(o.trim()); });
        });
    });
}

async function main() {
    console.log(`=== Diagnosing VPS-30 (${VPS30.ip}) — ${DOMAIN} ===\n`);

    // Try direct first
    let conn;
    try {
        console.log('Trying direct SSH...');
        conn = await sshConnect(VPS30.ip, VPS30.pass);
        console.log('Direct connection OK!\n');
    } catch (e) {
        console.log(`Direct failed: ${e.message}`);
        console.log('Trying via proxy VPS-21...');

        // Connect to proxy and run sshpass to VPS-30
        const proxy = await sshConnect(PROXY.ip, PROXY.pass);

        // Run commands on VPS-30 through proxy using sshpass
        const cmds = [
            'systemctl is-active postfix opendkim dovecot',
            `grep "${DOMAIN}" /etc/opendkim/KeyTable`,
            `grep "${DOMAIN}" /etc/opendkim/SigningTable`,
            `ls -la /etc/opendkim/keys/${DOMAIN}/mail.private`,
            'postconf myhostname mydomain smtpd_milters non_smtpd_milters',
            `opendkim-testkey -d ${DOMAIN} -s mail -vvv 2>&1`,
            'tail -30 /var/log/mail.log | grep -iE "error|warning|reject|denied|fail|451|550"',
            'tail -15 /var/log/mail.log',
            `dig +short TXT ${DOMAIN} @8.8.8.8 | grep spf`,
            `dig +short TXT mail._domainkey.${DOMAIN} @8.8.8.8`,
            `dig +short -x ${VPS30.ip} @8.8.8.8`,
        ];

        for (const cmd of cmds) {
            try {
                const result = await exec(proxy,
                    `sshpass -p '${VPS30.pass}' ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@${VPS30.ip} '${cmd.replace(/'/g, "'\\''")}'`,
                    20000);
                console.log(`\n>>> ${cmd}`);
                console.log(result || '(empty)');
            } catch (err) {
                console.log(`\n>>> ${cmd}`);
                console.log(`ERROR: ${err.message}`);
            }
        }

        proxy.end();
        console.log('\nDone (via proxy)!');
        return;
    }

    // Direct connection path
    const checks = [
        ['SERVICE STATUS', 'systemctl is-active postfix opendkim dovecot'],
        ['KEYTABLE', `grep "${DOMAIN}" /etc/opendkim/KeyTable`],
        ['SIGNINGTABLE', `grep "${DOMAIN}" /etc/opendkim/SigningTable`],
        ['KEY FILE', `ls -la /etc/opendkim/keys/${DOMAIN}/mail.private`],
        ['POSTFIX CONFIG', 'postconf myhostname mydomain smtpd_milters non_smtpd_milters'],
        ['DKIM TEST', `opendkim-testkey -d ${DOMAIN} -s mail -vvv 2>&1`],
        ['ERRORS IN MAILLOG', 'tail -30 /var/log/mail.log | grep -iE "error|warning|reject|denied|fail|451|550"'],
        ['LAST 15 MAIL LOG', 'tail -15 /var/log/mail.log'],
        ['SPF DNS', `dig +short TXT ${DOMAIN} @8.8.8.8 | grep spf`],
        ['DKIM DNS', `dig +short TXT mail._domainkey.${DOMAIN} @8.8.8.8`],
        ['PTR', `dig +short -x ${VPS30.ip} @8.8.8.8`],
        ['PORT 25 TEST', `echo "QUIT" | timeout 5 nc -w5 gmail-smtp-in.l.google.com 25 2>&1 | head -2`],
    ];

    for (const [label, cmd] of checks) {
        try {
            const result = await exec(conn, cmd, 15000);
            console.log(`--- ${label} ---`);
            console.log(result || '(empty)');
            console.log();
        } catch (err) {
            console.log(`--- ${label} ---`);
            console.log(`ERROR: ${err.message}\n`);
        }
    }

    conn.end();
    console.log('Done!');
}

main().catch(e => console.error('Fatal:', e.message));
