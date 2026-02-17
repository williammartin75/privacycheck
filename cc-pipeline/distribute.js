#!/usr/bin/env node
/**
 * distribute.js — Common Crawl Pipeline Distributor
 * 
 * 1. Downloads wet.paths.gz from CC-MAIN-2026-04
 * 2. Splits ~72K WET file paths into 40 chunks
 * 3. SCPs extract.sh + chunk to each VPS
 * 4. Launches extraction via nohup on each VPS
 * 
 * Usage: node distribute.js [--deploy-only] [--launch-only] [--status]
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

// ── VPS inventory (same as test_all_40vps.js) ──
const ALL_VPS = [
    { id: 1, ip: '107.174.93.156', pass: '4uZeYG82Wgf5tf0Y7B' },
    { id: 2, ip: '198.12.71.145', pass: '7P6LB61mlnNaoo8S0Z' },
    { id: 3, ip: '206.217.139.115', pass: '20QEs9OSh8Bw3egI1q' },
    { id: 4, ip: '206.217.139.116', pass: 'JvSg1HPu956fAt0dY0' },
    { id: 5, ip: '23.95.242.32', pass: 'v6Jk79EUE15reqJ3zB' },
    { id: 6, ip: '192.3.86.156', pass: 'H77WKufh2r9lVX3iP6' },
    { id: 7, ip: '107.175.83.186', pass: '1KiaL7RpwAng23B08L' },
    { id: 8, ip: '23.226.135.153', pass: 'dIKsL94sx6o8u7SAA1' },
    { id: 9, ip: '64.188.29.151', pass: '1EQpF0fSapC610hjK3' },
    { id: 10, ip: '23.94.240.173', pass: 'L5fgrQ6I84E3uvR2Nn' },
    { id: 11, ip: '107.174.93.166', pass: 'Ny75V1Z3IwZ6ipB4xp' },
    { id: 12, ip: '23.94.103.173', pass: 'pT2c5KJt7m87St0MBe' },
    { id: 13, ip: '23.95.37.92', pass: 'Qh10W3rf83vgwFEOC5' },
    { id: 14, ip: '23.94.103.174', pass: '2gx5E8Anl9XTG0Sib7' },
    { id: 15, ip: '192.227.193.17', pass: 'VgU8YQK36qE28cp9wm' },
    { id: 16, ip: '107.174.93.172', pass: 'rB4KMA9xfGaq1Ri783' },
    { id: 17, ip: '107.174.88.210', pass: '4S0ekC9cuV22ouWB4C' },
    { id: 18, ip: '23.95.215.19', pass: 'BX4MK9yHl4Cb85nxd9' },
    { id: 19, ip: '107.175.214.243', pass: '10bGou182OX4ZOtFqw' },
    { id: 20, ip: '107.172.30.53', pass: 'CvouI95Q5n4Jk1F2aE' },
    { id: 21, ip: '192.227.234.211', pass: 'Jd5Fh769E0hnmX9CqK' },
    { id: 22, ip: '172.245.57.166', pass: 'MO6e9xJ3Ok7lCt3P6v' },
    { id: 23, ip: '192.227.137.91', pass: 'Cd28NF579B6fwKspvS' },
    { id: 24, ip: '107.174.93.184', pass: 'Y60nO78RYJ6nuhpL4o' },
    { id: 25, ip: '107.174.252.122', pass: 'G9620YWeSHlrkw9T7q' },
    { id: 26, ip: '23.94.102.141', pass: '3w7gp1UVM1ewt80ASK' },
    { id: 27, ip: '64.188.28.154', pass: '7iAg7FYXF1G92lew6v' },
    { id: 28, ip: '69.12.85.166', pass: 'Oh0n393dTIYV3hq6zK' },
    { id: 29, ip: '192.3.106.247', pass: 'BKv61x5X0opysQB03A' },
    { id: 30, ip: '192.227.148.204', pass: 'ZqU22d4B98Xv5iVfIz' },
    { id: 31, ip: '23.95.222.204', pass: 'SvmjOa0nW2o8Q0PK39' },
    { id: 32, ip: '23.226.132.16', pass: 'z77wSm41LCHKQ5jou4' },
    { id: 33, ip: '104.168.102.152', pass: '4mlaV2d7rJB3KO3cQ0' },
    { id: 34, ip: '104.168.102.202', pass: 'GYt6pvZ29wQP0u0aT3' },
    { id: 35, ip: '107.174.254.182', pass: '8yKJuv3GI6mU41rc4N' },
    { id: 36, ip: '172.245.226.174', pass: 'Jy0P5w6tr9p6OWY9Nm' },
    { id: 37, ip: '107.172.216.227', pass: '9p0XC5Y40arSeoGJ4y' },
    { id: 38, ip: '107.173.146.56', pass: 'Io9tApz8Rd17ZL9x7V' },
    { id: 39, ip: '198.23.246.94', pass: '0aZ3N5b36taPBS8iqS' },
    { id: 40, ip: '155.94.155.113', pass: 'Rqg0q802veErP6AOH9' },
];

const CRAWL_ID = 'CC-MAIN-2026-04';
const WET_PATHS_URL = `https://data.commoncrawl.org/crawl-data/${CRAWL_ID}/wet.paths.gz`;
const LOCAL_DIR = path.join(__dirname);
const EXTRACT_SCRIPT = path.join(LOCAL_DIR, 'extract.sh');

// ── SSH helper ──
function ssh(host, pass, cmd, timeout = 60000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: '[TIMEOUT]' }) }, timeout);
        c.on('ready', () => {
            c.exec(cmd, (err, s) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: '[EXEC_ERR]' }) }
                let o = ''; s.on('data', d => o += d); s.stderr.on('data', d => o += d);
                s.on('close', (code) => { clearTimeout(t); c.end(); resolve({ ok: code === 0 || code === null, out: o.trim() }) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

// ── SCP upload via SSH ──
function scpUpload(host, pass, localPath, remotePath, timeout = 60000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: '[TIMEOUT]' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: '[SFTP_ERR]' }) }
                const rs = fs.createReadStream(localPath);
                const ws = sftp.createWriteStream(remotePath);
                ws.on('close', () => { clearTimeout(t); c.end(); resolve({ ok: true, out: 'OK' }) });
                ws.on('error', (e) => { clearTimeout(t); c.end(); resolve({ ok: false, out: e.message }) });
                rs.pipe(ws);
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── SCP download helper ──
function scpDownload(host, pass, remotePath, localPath, timeout = 120000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: '[TIMEOUT]' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: '[SFTP_ERR]' }) }
                const ws = fs.createWriteStream(localPath);
                const rs = sftp.createReadStream(remotePath);
                rs.on('error', (e) => { clearTimeout(t); c.end(); resolve({ ok: false, out: e.message }) });
                rs.pipe(ws);
                ws.on('close', () => { clearTimeout(t); c.end(); resolve({ ok: true, out: 'OK' }) });
                ws.on('error', (e) => { clearTimeout(t); c.end(); resolve({ ok: false, out: e.message }) });
            });
        });
        c.on('error', e => { clearTimeout(t); resolve({ ok: false, out: 'SSH_ERR: ' + e.message }) });
        c.connect({
            host, port: 22, username: 'root', password: pass, readyTimeout: 15000,
            algorithms: { kex: ['ecdh-sha2-nistp256', 'diffie-hellman-group14-sha256', 'diffie-hellman-group14-sha1'] }
        });
    });
}

// ── Download and decompress wet.paths.gz via VPS-21 (faster) ──
async function downloadWetPaths() {
    const outFile = path.join(LOCAL_DIR, 'wet.paths.txt');
    if (fs.existsSync(outFile)) {
        const lines = fs.readFileSync(outFile, 'utf-8').trim().split('\n').length;
        console.log(`  ℹ️  ${outFile} already exists (${lines} paths), skipping download`);
        return outFile;
    }

    const VPS21 = ALL_VPS.find(v => v.id === 21);
    console.log(`  📥 Downloading WET paths via VPS-21 (${VPS21.ip})...`);

    // Step 1: Download + decompress on VPS-21
    const r1 = await ssh(VPS21.ip, VPS21.pass,
        `wget -q -O /tmp/wet.paths.gz ${WET_PATHS_URL} && zcat /tmp/wet.paths.gz > /tmp/wet.paths.txt && wc -l < /tmp/wet.paths.txt`,
        120000
    );
    if (!r1.ok) throw new Error(`VPS-21 download failed: ${r1.out}`);
    console.log(`  ✅ Downloaded on VPS-21: ${r1.out.trim()} paths`);

    // Step 2: SCP back to local
    console.log(`  📥 Transferring to local...`);
    const r2 = await scpDownload(VPS21.ip, VPS21.pass, '/tmp/wet.paths.txt', outFile, 300000);
    if (!r2.ok) throw new Error(`SCP download failed: ${r2.out}`);

    const lines = fs.readFileSync(outFile, 'utf-8').trim().split('\n').length;
    console.log(`  ✅ Saved locally: ${lines} paths`);
    return outFile;
}

// ── Split paths into N chunks ──
function splitPaths(filePath, n) {
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n').filter(l => l.trim());
    console.log(`  📄 ${lines.length} WET files total → ${Math.ceil(lines.length / n)} per VPS`);
    const chunks = [];
    const chunkSize = Math.ceil(lines.length / n);
    for (let i = 0; i < n; i++) {
        chunks.push(lines.slice(i * chunkSize, (i + 1) * chunkSize));
    }
    return chunks;
}

// ── Status check ──
async function checkStatus() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  COMMON CRAWL EXTRACTION — STATUS CHECK              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    const BATCH = 8;
    let totalEmails = 0, totalDone = 0, totalFiles = 0;
    const vpsStatus = [];

    for (let i = 0; i < ALL_VPS.length; i += BATCH) {
        const batch = ALL_VPS.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(vps =>
            ssh(vps.ip, vps.pass,
                'TOTAL=$(wc -l < /root/my_wet_files.txt 2>/dev/null || echo 0); ' +
                'DONE=$(wc -l < /root/cc_progress.log 2>/dev/null || echo 0); ' +
                'EMAILS=$(wc -l < /root/cc_results.ndjson 2>/dev/null || echo 0); ' +
                'RUNNING=$(pgrep -f "extract" | grep -v pgrep | wc -l); ' +
                'DISK=$(df -h / | tail -1 | awk \'{print $5}\'); ' +
                'echo "$TOTAL|$DONE|$EMAILS|$RUNNING|$DISK"',
                15000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            if (r.ok && r.out.includes('|')) {
                const [total, done, emails, running, disk] = r.out.split('|');
                const pct = parseInt(total) > 0 ? Math.round(parseInt(done) / parseInt(total) * 100) : 0;
                const icon = parseInt(running) > 0 ? '🔄' : (pct >= 100 ? '✅' : '⏸️');
                console.log(`  ${icon} VPS-${String(vps.id).padStart(2)}: ${done}/${total} files (${pct}%) | ${emails} emails | Disk: ${disk} | ${parseInt(running) > 0 ? 'RUNNING' : 'STOPPED'}`);
                totalEmails += parseInt(emails) || 0;
                totalDone += parseInt(done) || 0;
                totalFiles += parseInt(total) || 0;
                vpsStatus.push({ id: vps.id, total: parseInt(total), done: parseInt(done), emails: parseInt(emails), running: parseInt(running) > 0 });
            } else {
                console.log(`  ❌ VPS-${String(vps.id).padStart(2)}: ${r.out.substring(0, 50)}`);
            }
        });
    }

    const pct = totalFiles > 0 ? Math.round(totalDone / totalFiles * 100) : 0;
    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`  TOTAL: ${totalDone}/${totalFiles} files (${pct}%) | ${totalEmails.toLocaleString()} emails`);
    console.log(`  Running: ${vpsStatus.filter(v => v.running).length}/40 VPS`);
    console.log(`═══════════════════════════════════════════════════════`);
}

// ── Main ──
(async () => {
    const args = process.argv.slice(2);

    if (args.includes('--status')) {
        return await checkStatus();
    }

    const deployOnly = args.includes('--deploy-only');
    const launchOnly = args.includes('--launch-only');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  COMMON CRAWL CC-MAIN-2026-04 — DISTRIBUTOR          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // ── Step 1: Download WET paths list ──
    if (!launchOnly) {
        console.log('Step 1: Download WET file list\n');
        const wetPathsFile = await downloadWetPaths();
        const chunks = splitPaths(wetPathsFile, ALL_VPS.length);

        // Save chunks locally
        const chunksDir = path.join(LOCAL_DIR, 'chunks');
        if (!fs.existsSync(chunksDir)) fs.mkdirSync(chunksDir, { recursive: true });
        chunks.forEach((chunk, i) => {
            fs.writeFileSync(path.join(chunksDir, `chunk_${i + 1}.txt`), chunk.join('\n') + '\n');
        });
        console.log(`  ✅ ${chunks.length} chunks saved to ${chunksDir}\n`);

        // ── Step 2: Deploy to all VPS ──
        console.log('Step 2: Deploy extract.sh + chunk files (5 at a time)\n');
        const BATCH = 5;
        let deployed = 0;

        for (let i = 0; i < ALL_VPS.length; i += BATCH) {
            const batch = ALL_VPS.slice(i, i + BATCH);
            const results = await Promise.all(batch.map(async (vps, j) => {
                const chunkFile = path.join(chunksDir, `chunk_${vps.id}.txt`);

                // Upload extract.sh
                const r1 = await scpUpload(vps.ip, vps.pass, EXTRACT_SCRIPT, '/root/extract.sh', 30000);
                if (!r1.ok) return { vps, ok: false, out: `extract.sh: ${r1.out}` };

                // Upload chunk
                const r2 = await scpUpload(vps.ip, vps.pass, chunkFile, '/root/my_wet_files.txt', 30000);
                if (!r2.ok) return { vps, ok: false, out: `chunk: ${r2.out}` };

                // Make executable
                const r3 = await ssh(vps.ip, vps.pass, 'chmod +x /root/extract.sh', 10000);
                return { vps, ok: true, out: 'OK' };
            }));

            results.forEach(r => {
                const icon = r.ok ? '✅' : '❌';
                console.log(`  ${icon} VPS-${String(r.vps.id).padStart(2)} (${r.vps.ip}): ${r.out}`);
                if (r.ok) deployed++;
            });
        }
        console.log(`\n  ✅ Deployed to ${deployed}/${ALL_VPS.length} VPS\n`);

        if (deployOnly) {
            console.log('  --deploy-only flag: stopping here.');
            return;
        }
    }

    // ── Step 3: Launch extraction on all VPS ──
    console.log('Step 3: Launch extraction (nohup) on all VPS\n');
    const LAUNCH_BATCH = 10;
    let launched = 0;

    for (let i = 0; i < ALL_VPS.length; i += LAUNCH_BATCH) {
        const batch = ALL_VPS.slice(i, i + LAUNCH_BATCH);
        const results = await Promise.all(batch.map(vps =>
            ssh(vps.ip, vps.pass,
                // Fix Windows CRLF, kill any existing, then launch
                "sed -i 's/\\r$//' /root/extract.sh; " +
                'pkill -f "bash.*extract.sh" 2>/dev/null; sleep 1; ' +
                'nohup bash /root/extract.sh > /root/cc_extract.log 2>&1 & ' +
                'sleep 3; pgrep -f extract.sh > /dev/null && echo "LAUNCHED" || echo "FAILED"',
                25000
            )
        ));

        results.forEach((r, j) => {
            const vps = batch[j];
            const ok = r.ok && r.out.includes('LAUNCHED');
            console.log(`  ${ok ? '🚀' : '❌'} VPS-${String(vps.id).padStart(2)}: ${r.out.substring(0, 30)}`);
            if (ok) launched++;
        });
    }

    console.log(`\n  🚀 Launched on ${launched}/${ALL_VPS.length} VPS`);
    console.log(`\n  💡 Monitor progress: node distribute.js --status`);
})();
