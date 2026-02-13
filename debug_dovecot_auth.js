#!/usr/bin/env node
/**
 * Debug the users file on VPS-40 and compare with old VPS-21
 */
const { Client } = require('ssh2');

const OLD_VPS = { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' };
const NEW_VPS = { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' };

function sshExec(host, pass, cmd) {
    return new Promise((resolve) => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve('TIMEOUT'); }, 20000);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(t); c.end(); return resolve('ERR'); }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(t); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve('SSH_ERR: ' + e.message); });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

(async () => {
    // OLD VPS — show first 3 lines of users file
    console.log('=== OLD VPS-21 (working) ===');
    const old1 = await sshExec(OLD_VPS.ip, OLD_VPS.pass, 'head -3 /etc/dovecot/users');
    console.log(old1);
    const old2 = await sshExec(OLD_VPS.ip, OLD_VPS.pass, 'wc -l /etc/dovecot/users');
    console.log('Lines:', old2);
    const old3 = await sshExec(OLD_VPS.ip, OLD_VPS.pass, 'ls -la /etc/dovecot/users');
    console.log('Perms:', old3);
    const old4 = await sshExec(OLD_VPS.ip, OLD_VPS.pass, 'cat /etc/dovecot/conf.d/10-auth.conf | head -15');
    console.log('Auth config:', old4);

    console.log('\n=== NEW VPS-40 (broken) ===');
    const new1 = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'head -3 /etc/dovecot/users');
    console.log(new1);
    const new2 = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'wc -l /etc/dovecot/users');
    console.log('Lines:', new2);
    const new3 = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'ls -la /etc/dovecot/users');
    console.log('Perms:', new3);
    const new4 = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'cat /etc/dovecot/conf.d/10-auth.conf | head -15');
    console.log('Auth config:', new4);

    // Test auth with the actual first user's password from the file
    console.log('\n=== AUTH TEST ON VPS-40 ===');
    const firstLine = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'head -1 /etc/dovecot/users');
    console.log('First users line:', firstLine);
    // Parse it
    const parts = firstLine.split(':');
    const user = parts[0];
    const pw = parts[1].replace('{PLAIN}', '');
    console.log('User:', user, 'Pass:', pw);

    // Test with doveadm using the password from the file
    const authTest = await sshExec(NEW_VPS.ip, NEW_VPS.pass, `doveadm auth test '${user}' '${pw}' 2>&1`);
    console.log('Auth test:', authTest);

    // Check UID/GID mapping
    console.log('\n=== UID/GID CHECK ===');
    const idCheck = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'id contact1 2>&1');
    console.log('id contact1:', idCheck);
    const lsHome = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'ls -la /home/contact1/ 2>&1 | head -5');
    console.log('Home dir:', lsHome);

    // Check dovecot log for auth errors
    const dovelog = await sshExec(NEW_VPS.ip, NEW_VPS.pass, 'journalctl -u dovecot --no-pager -n 10 2>&1');
    console.log('\nDovecot journal:', dovelog);
})();
