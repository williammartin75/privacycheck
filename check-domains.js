// Multi-threaded domain checker
// Run with: node check-domains.js

const dns = require('dns').promises;
const fs = require('fs');
const readline = require('readline');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

const INPUT_FILE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\UNIQUE_DOMAINS.txt';
const OUTPUT_ALIVE = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\DOMAINS_ALIVE.txt';
const OUTPUT_DEAD = 'C:\\Users\\willi\\OneDrive\\Bureau\\Mails\\DOMAINS_DEAD.txt';
const NUM_WORKERS = 500; // Adjust based on your network
const TIMEOUT = 3000;

let totalDomains = 0;
let checkedDomains = 0;
let aliveDomains = 0;
let deadDomains = 0;
let startTime;

async function checkDomain(domain) {
    try {
        // Quick DNS check
        await dns.lookup(domain, { timeout: TIMEOUT });
        return { domain, alive: true };
    } catch {
        return { domain, alive: false };
    }
}

async function processChunk(domains) {
    const results = [];
    for (const domain of domains) {
        results.push(await checkDomain(domain));
    }
    return results;
}

async function main() {
    console.log('=== Multi-threaded Domain Checker ===');
    console.log(`Workers: ${NUM_WORKERS}`);
    console.log(`Input: ${INPUT_FILE}`);
    console.log('');

    // Read domains
    console.log('Loading domains...');
    const domains = fs.readFileSync(INPUT_FILE, 'utf-8')
        .split('\n')
        .filter(d => d.trim().length > 0);

    totalDomains = domains.length;
    console.log(`Total domains: ${totalDomains.toLocaleString()}`);
    console.log('');

    // Prepare output files
    const aliveStream = fs.createWriteStream(OUTPUT_ALIVE);
    const deadStream = fs.createWriteStream(OUTPUT_DEAD);

    startTime = Date.now();

    // Process in batches with concurrency
    const batchSize = 1000;
    const concurrency = NUM_WORKERS;

    for (let i = 0; i < domains.length; i += batchSize * concurrency) {
        const promises = [];

        for (let j = 0; j < concurrency && i + j * batchSize < domains.length; j++) {
            const start = i + j * batchSize;
            const end = Math.min(start + batchSize, domains.length);
            const chunk = domains.slice(start, end);
            promises.push(processChunk(chunk));
        }

        const allResults = await Promise.all(promises);

        for (const results of allResults) {
            for (const result of results) {
                checkedDomains++;
                if (result.alive) {
                    aliveDomains++;
                    aliveStream.write(result.domain + '\n');
                } else {
                    deadDomains++;
                    deadStream.write(result.domain + '\n');
                }
            }
        }

        // Progress update
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = checkedDomains / elapsed;
        const remaining = (totalDomains - checkedDomains) / rate;
        const percent = (checkedDomains / totalDomains * 100).toFixed(1);

        process.stdout.write(`\r[${percent}%] Checked: ${checkedDomains.toLocaleString()} | Alive: ${aliveDomains.toLocaleString()} | Dead: ${deadDomains.toLocaleString()} | Rate: ${Math.round(rate)}/s | ETA: ${Math.round(remaining / 60)}min`);
    }

    aliveStream.end();
    deadStream.end();

    const totalTime = (Date.now() - startTime) / 1000 / 60;

    console.log('\n');
    console.log('=== DONE ===');
    console.log(`Total time: ${totalTime.toFixed(1)} minutes`);
    console.log(`Domains alive: ${aliveDomains.toLocaleString()} (${(aliveDomains / totalDomains * 100).toFixed(1)}%)`);
    console.log(`Domains dead: ${deadDomains.toLocaleString()} (${(deadDomains / totalDomains * 100).toFixed(1)}%)`);
    console.log(`Output: ${OUTPUT_ALIVE}`);
}

main().catch(console.error);
