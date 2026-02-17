#!/usr/bin/env node
/**
 * collect.js — Common Crawl Pipeline Collector
 * 
 * 1. Downloads cc_results.ndjson from each VPS
 * 2. Merges all into one file
 * 3. Deduplicates by email
 * 4. Enriches with country (TLD) and company size (page count)
 * 5. Outputs organized files to CC - January 2026/
 * 
 * Usage: node collect.js [--skip-download]
 */

const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── VPS inventory ──
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

const OUTPUT_DIR = path.join('C:', 'Users', 'willi', 'OneDrive', 'Bureau', 'Mails', 'CC - January 2026');
const RAW_DIR = path.join(__dirname, 'raw_results');

// ── TLD → Country ──
const TLD_COUNTRY = {
    fr: 'FR', de: 'DE', it: 'IT', es: 'ES', nl: 'NL', be: 'BE', ch: 'CH', at: 'AT',
    pl: 'PL', pt: 'PT', se: 'SE', no: 'NO', dk: 'DK', fi: 'FI', cz: 'CZ', sk: 'SK',
    ro: 'RO', hu: 'HU', bg: 'BG', hr: 'HR', si: 'SI', lt: 'LT', lv: 'LV', ee: 'EE',
    ie: 'IE', lu: 'LU', mt: 'MT', cy: 'CY', gr: 'GR', uk: 'GB', jp: 'JP', kr: 'KR',
    cn: 'CN', tw: 'TW', hk: 'HK', in: 'IN', ru: 'RU', ua: 'UA', br: 'BR', mx: 'MX',
    ar: 'AR', cl: 'CL', co: 'CO', ca: 'CA', au: 'AU', nz: 'NZ', za: 'ZA', ng: 'NG',
    ke: 'KE', eg: 'EG', il: 'IL', ae: 'AE', sa: 'SA', tr: 'TR', th: 'TH', vn: 'VN',
    ph: 'PH', id: 'ID', my: 'MY', sg: 'SG',
};
// Compound TLDs
const COMPOUND_TLDS = { 'co.uk': 'GB', 'org.uk': 'GB', 'net.uk': 'GB', 'co.nz': 'NZ', 'com.au': 'AU', 'co.za': 'ZA', 'com.br': 'BR', 'co.jp': 'JP', 'co.kr': 'KR', 'co.in': 'IN' };

function getCountryFromDomain(domain) {
    // Check compound TLDs
    for (const [tld, country] of Object.entries(COMPOUND_TLDS)) {
        if (domain.endsWith('.' + tld)) return country;
    }
    const tld = domain.split('.').pop();
    return TLD_COUNTRY[tld] || '';
}

// ── SCP download ──
function scpDownload(host, pass, remotePath, localPath, timeout = 120000) {
    return new Promise(resolve => {
        const c = new Client();
        const t = setTimeout(() => { c.end(); resolve({ ok: false, out: '[TIMEOUT]' }) }, timeout);
        c.on('ready', () => {
            c.sftp((err, sftp) => {
                if (err) { clearTimeout(t); c.end(); return resolve({ ok: false, out: '[SFTP_ERR]' }) }
                const ws = fs.createWriteStream(localPath);
                const rs = sftp.createReadStream(remotePath);
                rs.on('error', (e) => {
                    clearTimeout(t); c.end();
                    if (e.message.includes('No such file')) resolve({ ok: false, out: 'NO_FILE' });
                    else resolve({ ok: false, out: e.message });
                });
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Process NDJSON line by line (streaming) ──
async function processFile(filePath, emailMap, domainPageCount) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });
        let count = 0;
        rl.on('line', line => {
            try {
                const obj = JSON.parse(line);
                if (!obj.email || !obj.domain) return;

                // Deduplicate: keep first occurrence
                if (!emailMap.has(obj.email)) {
                    emailMap.set(obj.email, {
                        email: obj.email,
                        domain: obj.domain,
                        source_url: obj.source_url || '',
                        source_domain: obj.source_domain || '',
                    });
                }

                // Count pages per domain
                const sd = obj.source_domain || obj.domain;
                domainPageCount.set(sd, (domainPageCount.get(sd) || 0) + 1);
                count++;
            } catch { /* skip malformed */ }
        });
        rl.on('close', () => resolve(count));
        rl.on('error', reject);
    });
}

(async () => {
    const args = process.argv.slice(2);
    const skipDownload = args.includes('--skip-download');

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  COMMON CRAWL CC-MAIN-2026-04 — COLLECTOR            ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Ensure dirs exist
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
    const byCountryDir = path.join(OUTPUT_DIR, 'by_country');
    const bySizeDir = path.join(OUTPUT_DIR, 'by_size');
    if (!fs.existsSync(byCountryDir)) fs.mkdirSync(byCountryDir, { recursive: true });
    if (!fs.existsSync(bySizeDir)) fs.mkdirSync(bySizeDir, { recursive: true });

    // ── Step 1: Download from all VPS ──
    if (!skipDownload) {
        console.log('Step 1: Download results from 40 VPS (5 at a time)\n');
        const BATCH = 5;
        let downloaded = 0;

        for (let i = 0; i < ALL_VPS.length; i += BATCH) {
            const batch = ALL_VPS.slice(i, i + BATCH);
            const results = await Promise.all(batch.map(vps => {
                const localFile = path.join(RAW_DIR, `results_vps${vps.id}.ndjson`);
                return scpDownload(vps.ip, vps.pass, '/root/cc_results.ndjson', localFile, 300000)
                    .then(r => ({ vps, ...r }));
            }));

            results.forEach(r => {
                if (r.ok) {
                    const size = fs.statSync(path.join(RAW_DIR, `results_vps${r.vps.id}.ndjson`)).size;
                    console.log(`  ✅ VPS-${String(r.vps.id).padStart(2)}: ${(size / 1024 / 1024).toFixed(1)} MB`);
                    downloaded++;
                } else {
                    console.log(`  ❌ VPS-${String(r.vps.id).padStart(2)}: ${r.out}`);
                }
            });
        }
        console.log(`\n  📦 Downloaded from ${downloaded}/${ALL_VPS.length} VPS\n`);
    } else {
        console.log('Step 1: SKIPPED (--skip-download)\n');
    }

    // ── Step 2: Merge and deduplicate ──
    console.log('Step 2: Merge & deduplicate\n');
    const emailMap = new Map();       // email → record
    const domainPageCount = new Map(); // domain → page count

    const rawFiles = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.ndjson'));
    let totalRaw = 0;

    for (const file of rawFiles) {
        const count = await processFile(path.join(RAW_DIR, file), emailMap, domainPageCount);
        totalRaw += count;
        console.log(`  📄 ${file}: ${count.toLocaleString()} records`);
    }

    console.log(`\n  📊 Raw: ${totalRaw.toLocaleString()} → Unique emails: ${emailMap.size.toLocaleString()}\n`);

    // ── Step 3: Enrich ──
    console.log('Step 3: Enrich (country + company size)\n');

    const countryBuckets = {};
    const sizeBuckets = { small: [], medium: [], large: [] };
    const allRecords = [];

    for (const [email, record] of emailMap) {
        // Country from domain TLD
        const country = getCountryFromDomain(record.domain);

        // Company size from page count
        const pages = domainPageCount.get(record.source_domain || record.domain) || 1;
        let size_bucket;
        if (pages < 10) size_bucket = 'small';
        else if (pages < 100) size_bucket = 'medium';
        else size_bucket = 'large';

        const enriched = {
            ...record,
            country: country || 'UNKNOWN',
            pages_seen: pages,
            size_bucket,
        };

        allRecords.push(enriched);

        // Country bucket
        const cc = country || 'UNKNOWN';
        if (!countryBuckets[cc]) countryBuckets[cc] = [];
        countryBuckets[cc].push(enriched);

        // Size bucket
        sizeBuckets[size_bucket].push(enriched);
    }

    // ── Step 4: Write output files ──
    console.log('Step 4: Write output files\n');

    // All emails
    const allStream = fs.createWriteStream(path.join(OUTPUT_DIR, 'all_emails.ndjson'));
    for (const rec of allRecords) {
        allStream.write(JSON.stringify(rec) + '\n');
    }
    allStream.end();
    console.log(`  📄 all_emails.ndjson: ${allRecords.length.toLocaleString()} records`);

    // By country
    for (const [cc, records] of Object.entries(countryBuckets)) {
        const ws = fs.createWriteStream(path.join(byCountryDir, `${cc}.ndjson`));
        for (const rec of records) ws.write(JSON.stringify(rec) + '\n');
        ws.end();
    }
    const countries = Object.keys(countryBuckets).sort();
    console.log(`  🌍 by_country/: ${countries.length} countries`);

    // By size
    for (const [size, records] of Object.entries(sizeBuckets)) {
        const ws = fs.createWriteStream(path.join(bySizeDir, `${size}.ndjson`));
        for (const rec of records) ws.write(JSON.stringify(rec) + '\n');
        ws.end();
    }
    console.log(`  📏 by_size/: small=${sizeBuckets.small.length.toLocaleString()}, medium=${sizeBuckets.medium.length.toLocaleString()}, large=${sizeBuckets.large.length.toLocaleString()}`);

    // Stats
    const stats = {
        timestamp: new Date().toISOString(),
        crawl_id: 'CC-MAIN-2026-04',
        total_raw: totalRaw,
        total_unique: allRecords.length,
        by_country: Object.fromEntries(Object.entries(countryBuckets).map(([cc, recs]) => [cc, recs.length])),
        by_size: {
            small: sizeBuckets.small.length,
            medium: sizeBuckets.medium.length,
            large: sizeBuckets.large.length,
        },
        top_countries: countries
            .map(cc => ({ country: cc, count: countryBuckets[cc].length }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20),
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'stats.json'), JSON.stringify(stats, null, 2));
    console.log(`  📊 stats.json written`);

    console.log(`\n╔════════════════════════════════════════════════════════╗`);
    console.log(`║  DONE                                                 ║`);
    console.log(`║  Output: ${OUTPUT_DIR.padEnd(42)}  ║`);
    console.log(`║  Unique emails: ${String(allRecords.length.toLocaleString()).padEnd(35)}  ║`);
    console.log(`╚════════════════════════════════════════════════════════╝`);
})();
