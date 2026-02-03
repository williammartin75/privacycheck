/**
 * Merge all batch result files into a single consolidated file
 * Usage: node merge-results.js --input ./results --output audit-results.json
 */

const fs = require('fs');
const path = require('path');

async function main() {
    const args = process.argv.slice(2);
    let inputDir = './results';
    let outputFile = './audit-results.json';
    let summaryFile = './audit-summary.json';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' && args[i + 1]) { inputDir = args[i + 1]; i++; }
        else if (args[i] === '--output' && args[i + 1]) { outputFile = args[i + 1]; i++; }
    }

    console.log(`Merging results from: ${inputDir}`);

    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} batch files`);

    let allResults = [];
    let stats = {
        total: 0,
        success: 0,
        failed: 0,
        withIssues: 0,
        withHiddenCosts: 0,
        avgIssues: 0,
        avgPassed: 0,
        topIssues: {},
        totalHiddenCosts: { services: {}, total: 0 },
    };

    for (const file of files) {
        const filepath = path.join(inputDir, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const batch = JSON.parse(content);

        for (const result of batch) {
            stats.total++;

            if (result.error) {
                stats.failed++;
            } else {
                stats.success++;
                stats.avgIssues += result.issuesFoundList?.length || 0;
                stats.avgPassed += result.checksPassedList?.length || 0;

                if (result.issuesFoundList?.length > 0) stats.withIssues++;

                // Count issues
                for (const issue of (result.issuesFoundList || [])) {
                    const issueKey = issue.replace(/\(\d+\).*$/, '').replace(/€\d+.*$/, '').trim();
                    stats.topIssues[issueKey] = (stats.topIssues[issueKey] || 0) + 1;
                }

                // Count hidden costs
                if (result.hiddenCosts?.totalMonthly > 0) {
                    stats.withHiddenCosts++;
                    stats.totalHiddenCosts.total += result.hiddenCosts.totalMonthly;
                    for (const svc of result.hiddenCosts.services) {
                        stats.totalHiddenCosts.services[svc.name] = (stats.totalHiddenCosts.services[svc.name] || 0) + 1;
                    }
                }
            }

            // Minimal result for storage
            allResults.push({
                d: result.domain,
                p: result.checksPassedList?.length || 0,
                i: result.issuesFoundList?.length || 0,
                pi: result.checksPassedList?.slice(0, 5) || [],
                ii: result.issuesFoundList?.slice(0, 8) || [],
                hc: result.hiddenCosts?.totalMonthly || 0,
                e: result.error || null,
            });
        }

        process.stdout.write(`\rProcessed: ${stats.total.toLocaleString()}`);
    }

    console.log('\n');

    // Calculate averages
    if (stats.success > 0) {
        stats.avgIssues = Math.round(stats.avgIssues / stats.success * 10) / 10;
        stats.avgPassed = Math.round(stats.avgPassed / stats.success * 10) / 10;
    }

    // Sort top issues
    const sortedIssues = Object.entries(stats.topIssues)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    stats.topIssues = Object.fromEntries(sortedIssues);

    // Sort hidden costs services
    const sortedServices = Object.entries(stats.totalHiddenCosts.services)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    stats.totalHiddenCosts.services = Object.fromEntries(sortedServices);

    // Save summary
    fs.writeFileSync(summaryFile, JSON.stringify(stats, null, 2));
    console.log(`Summary saved to: ${summaryFile}`);

    // Save all results
    fs.writeFileSync(outputFile, JSON.stringify(allResults));
    console.log(`Results saved to: ${outputFile} (${(fs.statSync(outputFile).size / 1024 / 1024).toFixed(2)} MB)`);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('  AUDIT SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total domains: ${stats.total.toLocaleString()}`);
    console.log(`Successful: ${stats.success.toLocaleString()} (${(stats.success / stats.total * 100).toFixed(1)}%)`);
    console.log(`Failed: ${stats.failed.toLocaleString()}`);
    console.log(`With issues: ${stats.withIssues.toLocaleString()} (${(stats.withIssues / stats.success * 100).toFixed(1)}%)`);
    console.log(`With hidden costs: ${stats.withHiddenCosts.toLocaleString()}`);
    console.log(`Avg issues/domain: ${stats.avgIssues}`);
    console.log(`Avg passed/domain: ${stats.avgPassed}`);
    console.log('\nTop 10 Issues:');
    sortedIssues.slice(0, 10).forEach(([issue, count], i) => {
        console.log(`  ${i + 1}. ${issue}: ${count.toLocaleString()}`);
    });
}

main().catch(console.error);
