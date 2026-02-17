#!/usr/bin/env node
const { Client } = require('ssh2');
const VPS = { ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' };

function ex(cmd, t = 300000) {
  return new Promise((resolve, reject) => {
    const c = new Client();
    let o = '';
    const tm = setTimeout(() => { c.end(); reject(new Error('timeout')); }, t);
    c.on('ready', () => {
      c.exec(cmd, (err, stream) => {
        if (err) { clearTimeout(tm); c.end(); return reject(err); }
        stream.on('data', d => { o += d; process.stdout.write(d); });
        stream.stderr.on('data', d => { o += d; process.stdout.write(d); });
        stream.on('close', code => { clearTimeout(tm); c.end(); resolve({ code, output: o.trim() }); });
      });
    });
    c.on('error', e => { clearTimeout(tm); reject(e); });
    c.connect({ host: VPS.ip, port: 22, username: 'root', password: VPS.pass, readyTimeout: 15000 });
  });
}

const COMPOSE = `version: "3"
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3000:3000"
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
`;

async function main() {
  // Step 1: Write compose file
  console.log('Step 1: Writing docker-compose.yml...');
  const writeCmd = `mkdir -p /opt/umami && cat > /opt/umami/docker-compose.yml << 'COMPOSEEOF'
${COMPOSE}COMPOSEEOF`;
  await ex(writeCmd);
  console.log('Done.\n');

  // Step 2: Pull and start
  console.log('Step 2: Starting Umami (pulling images, may take 1-2 min)...');
  const r = await ex('cd /opt/umami && docker compose up -d', 300000);
  console.log('\nExit code:', r.code, '\n');

  // Step 3: Wait and check
  console.log('Step 3: Waiting 20s for startup...');
  await new Promise(r => setTimeout(r, 20000));
  const health = await ex('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000');
  console.log('HTTP status:', health.output);

  if (health.output === '200' || health.output === '302') {
    console.log('\n========================================');
    console.log('  UMAMI INSTALLED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`  Dashboard: http://${VPS.ip}:3000`);
    console.log('  Login:     admin / umami');
    console.log('========================================\n');
  } else {
    console.log('\nNot ready yet. Checking logs...');
    const logs = await ex('cd /opt/umami && docker compose logs --tail=30');
    console.log(logs.output);
  }
}

main().catch(e => console.error('ERROR:', e.message));
