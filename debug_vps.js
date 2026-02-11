const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
    console.log('Connected to VPS-11');

    // Get ALL zones with full names
    const cmd = `curl -s -H "X-API-Key: 45518a5114a44514bad5fbc6170252c3.F1dS3s6NfuDWqdFL27nm_XekAVBjRB_5tgHs9xxTimFQIS1r9-M0FDKBar81uAjr6CmyRs8qoBQzAZ2400lvaA" "https://api.hosting.ionos.com/dns/v1/zones" | python3 -c "import json,sys;zones=json.load(sys.stdin);[print(z['name'],'|',z['id']) for z in zones]"`;

    conn.exec(cmd, (err, stream) => {
        if (err) { console.log('Exec error:', err); conn.end(); return; }
        let out = '';
        stream.on('data', d => out += d.toString());
        stream.stderr.on('data', d => out += d.toString());
        stream.on('close', () => {
            console.log('All IONOS zones:\n' + out);
            conn.end();
            process.exit(0);
        });
    });
});

conn.on('error', e => { console.log('Connection error:', e.message); process.exit(1); });

conn.connect({
    host: '107.174.93.166',
    port: 22,
    username: 'root',
    password: 'Ny75V1Z3IwZ6ipB4xp',
    readyTimeout: 15000,
    algorithms: {
        kex: ['ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
            'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
            'diffie-hellman-group14-sha1'],
    }
});

setTimeout(() => { console.log('TIMEOUT'); process.exit(1); }, 30000);
