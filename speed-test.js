// Fixed DNS test - clean Windows line endings
const dns = require('dns');
const fs = require('fs');

const INPUT_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\UNIQUE_DOMAINS.txt';
const TEST_SIZE = 500;
const CONCURRENCY = 100;

const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '1.1.1.1']);

function checkDomain(domain) {
    return new Promise((resolve) => {
        resolver.resolve4(domain, (err, addresses) => {
            if (err) {
                resolve({ domain, alive: false, error: err.code });
            } else {
                resolve({ domain, alive: true, ip: addresses[0] });
            }
        });
    });
}

async function main() {
    console.log('=== DNS Test v4 (Fixed line endings) ===');
    console.log(`Concurrency: ${CONCURRENCY}`);

    // FIXED: Replace \r\n and \r with nothing
    const allDomains = fs.readFileSync(INPUT_FILE, 'utf-8')
        .replace(/\r/g, '')  // Remove all carriage returns
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)
        .slice(0, TEST_SIZE);

    console.log(`Testing ${allDomains.length} domains...`);
    console.log(`First 3: ${allDomains.slice(0, 3).join(', ')}\n`);

    const startTime = Date.now();
    let checked = 0;
    let alive = 0;

    for (let i = 0; i < allDomains.length; i += CONCURRENCY) {
        const batch = allDomains.slice(i, i + CONCURRENCY);
        const results = await Promise.all(batch.map(d => checkDomain(d)));

        checked += batch.length;
        alive += results.filter(r => r.alive).length;

        const elapsed = (Date.now() - startTime) / 1000;
        const rate = checked / elapsed;

        if (i === 0) {
            console.log('Sample results:');
            results.slice(0, 5).forEach(r => {
                console.log(`  ${r.domain}: ${r.alive ? 'ALIVE (' + r.ip + ')' : 'DEAD (' + r.error + ')'}`);
            });
            console.log('');
        }

        console.log(`Checked: ${checked} | Alive: ${alive} (${(alive / checked * 100).toFixed(0)}%) | Rate: ${Math.round(rate)}/sec`);
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const rate = TEST_SIZE / totalTime;

    console.log('\n=== RESULTS ===');
    console.log(`Time: ${totalTime.toFixed(1)} seconds`);
    console.log(`Rate: ${Math.round(rate)} domains/sec`);
    console.log(`Alive: ${alive} (${(alive / TEST_SIZE * 100).toFixed(1)}%)`);
    console.log(`\nEstimated for 6.8M: ${(6800000 / rate / 3600).toFixed(1)} hours`);
}

main().catch(console.error);
