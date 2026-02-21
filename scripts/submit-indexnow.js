/**
 * submit-indexnow.js
 * 
 * Quick script to submit all PrivacyChecker URLs to IndexNow.
 * Run after deploying new pages: node scripts/submit-indexnow.js
 * 
 * Or submit specific URLs: node scripts/submit-indexnow.js https://privacychecker.pro/blog/new-article
 */

const BASE = 'https://privacychecker.pro';
const SECRET = process.env.INDEXNOW_SECRET || 'indexnow-privacychecker-2026';

async function submit() {
    const specificUrls = process.argv.slice(2);

    const body = specificUrls.length > 0
        ? { urls: specificUrls }
        : { all: true };

    console.log(specificUrls.length > 0
        ? `Submitting ${specificUrls.length} specific URL(s)...`
        : 'Submitting ALL sitemap URLs...');

    try {
        const res = await fetch(`${BASE}/api/indexnow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SECRET}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (res.ok) {
            console.log(`✅ Success! ${data.totalUrls} URLs submitted to IndexNow`);
            console.log('Results:', JSON.stringify(data.results, null, 2));
        } else {
            console.error('❌ Error:', data.error);
        }
    } catch (err) {
        console.error('❌ Request failed:', err.message);
    }
}

submit();
