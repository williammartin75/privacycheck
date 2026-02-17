#!/usr/bin/env node
/** Switch Umami to port 80 and verify external access */
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function ex(cmd, t = 60000) {
    return new Promise((resolve, reject) => {
        const c = new Client();
        let o = '';
        const tm = setTimeout(() => { c.end(); resolve(o.trim() || '[TIMEOUT]'); }, t);
        c.on('ready', () => {
            c.exec(cmd, (err, stream) => {
                if (err) { clearTimeout(tm); c.end(); return reject(err); }
                stream.on('data', d => o += d);
                stream.stderr.on('data', d => o += d);
                stream.on('close', () => { clearTimeout(tm); c.end(); resolve(o.trim()); });
            });
        });
        c.on('error', e => { clearTimeout(tm); reject(e); });
        c.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 15000 });
    });
}

async function main() {
    // Step 1: Check if anything is on port 80
    console.log('1. Check port 80:');
    console.log(await ex('ss -tlnp | grep :80'));

    // Step 2: Update docker-compose to use port 80
    console.log('\n2. Updating docker-compose to port 80...');
    await ex(`cat > /opt/umami/docker-compose.yml << 'EOF'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "80:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami2026secret@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: privacychecker-umami-2026
      TRACKER_SCRIPT_NAME: pctrack
    depends_on:
      db:
        condition: service_healthy
    restart: always
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami2026secret
    volumes:
      - umami-db:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  umami-db:
EOF`);

    // Step 3: Restart with new config
    console.log('3. Restarting containers...');
    console.log(await ex('cd /opt/umami && docker compose down 2>&1 && docker compose up -d 2>&1', 120000));

    // Step 4: Wait and check
    console.log('\n4. Waiting 15s...');
    await new Promise(r => setTimeout(r, 15000));

    console.log('5. Docker ps:');
    console.log(await ex('docker ps --format "{{.Names}} {{.Ports}}"'));

    console.log('\n6. Test localhost:80:');
    const test = await ex('wget -qO- --timeout=3 http://127.0.0.1:80/pctrack.js 2>&1 | head -3');
    console.log(test.substring(0, 200));
}

main().catch(e => console.error(e.message));
