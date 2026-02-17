#!/usr/bin/env node
const { Client } = require('ssh2');

// Sample VPS with different mail queue states
const VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
];

function ssh(host, pass, cmd, timeout = 15000) {
    return new Promise((resolve) => {
        const c = new Client();
        const timer = setTimeout(() => { c.end(); resolve('[TIMEOUT]'); }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(timer); c.end(); resolve('[ERROR]'); return; }
                let out = '';
                stream.on('data', d => out += d);
                stream.stderr.on('data', d => out += d);
                stream.on('close', () => { clearTimeout(timer); c.end(); resolve(out.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(timer); resolve('[CONN ERROR]'); });
        c.connect({ host, port: 22, username: 'root', password: pass, readyTimeout: 10000 });
    });
}

(async () => {
    for (const v of VPS) {
        console.log(`\n====== VPS-${v.id} (${v.ip}) ======`);
        const result = await ssh(v.ip, v.pass, `
echo "=== PYTHON PROCESSES ===";
ps aux | grep python | grep -v grep;
echo "";
echo "=== SCREEN SESSIONS ===";
screen -ls 2>/dev/null;
echo "";
echo "=== CRON JOBS ===";
crontab -l 2>/dev/null;
echo "";
echo "=== MAIL QUEUE DETAIL ===";
mailq 2>/dev/null | head -20;
echo "";
echo "=== RUNNING SCRIPTS ===";
ls -la /root/*.py /root/*.sh /root/send*.* /root/mail*.* 2>/dev/null;
echo "";
echo "=== SYSTEMD CUSTOM ===";
systemctl list-units --type=service --state=running | grep -v -E '(ssh|cron|system|dbus|network|getty|snapd|postfix|opendkim|rsyslog|unattended|polkit|udisks|accounts|ModemManager|wpa)' | head -10;
`);
        console.log(result);
    }
    console.log('\nDone.');
})();
