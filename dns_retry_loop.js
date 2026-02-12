#!/usr/bin/env node
/**
 * Auto-retry IONOS DNS configuration every 2 minutes until all domains appear.
 */
const { execSync } = require('child_process');

const MAX_RETRIES = 30; // 30 * 2min = 1 hour max
const DELAY_MS = 120000; // 2 minutes

async function main() {
    for (let i = 1; i <= MAX_RETRIES; i++) {
        const now = new Date().toLocaleTimeString('fr-FR');
        console.log(`\n[Attempt ${i}/${MAX_RETRIES}] ${now}`);
        console.log('─'.repeat(50));

        try {
            const result = execSync('node configure_dns_21_30.js', {
                cwd: __dirname,
                timeout: 120000,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });

            console.log(result);

            // Check if any domains were configured
            const match = result.match(/DNS: (\d+)\/(\d+) OK/);
            if (match) {
                const [, ok, total] = match;
                if (parseInt(ok) > 0) {
                    console.log(`\n✅ ${ok}/${total} domains configured!`);
                    if (ok === total) {
                        console.log('🎉 ALL DOMAINS DONE!');
                        process.exit(0);
                    }
                }
            }

            // Check for "no domains found" — need to wait
            if (result.includes('No new domains found yet')) {
                console.log(`⏳ Waiting 2 minutes before retry...`);
            }

        } catch (e) {
            console.error('Error:', e.message);
        }

        if (i < MAX_RETRIES) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    console.log('\n⚠️  Max retries reached. Run manually: node configure_dns_21_30.js');
}

main();
