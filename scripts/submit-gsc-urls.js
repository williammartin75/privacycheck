#!/usr/bin/env node
/**
 * Generate a prioritized list of URLs to submit to Google Search Console
 * Copy each URL → paste into GSC "URL Inspection" → click "Request Indexing"
 * 
 * Usage: node scripts/submit-gsc-urls.js
 */

const BASE = 'https://privacychecker.pro';

const priority1 = [
    // Core pages
    { url: `${BASE}/`, note: 'Homepage' },
    { url: `${BASE}/blog`, note: 'Blog index' },
    { url: `${BASE}/about`, note: 'About page' },
    { url: `${BASE}/glossary`, note: 'Glossary' },
];

const priority2 = [
    // High-traffic target articles (new SEO batch)
    { url: `${BASE}/blog/gdpr-ai-compliance-guide`, note: 'NEW — AI + GDPR' },
    { url: `${BASE}/blog/gdpr-data-subject-rights-guide`, note: 'NEW — DSAR guide' },
    { url: `${BASE}/blog/age-verification-compliance-guide`, note: 'NEW — Age verification' },
    { url: `${BASE}/blog/transfer-impact-assessment-template`, note: 'NEW — TIA template' },
    { url: `${BASE}/blog/cookie-banner-requirements-by-country`, note: 'NEW — Cookie banner map' },
    { url: `${BASE}/blog/gdpr-fines-database-2026`, note: 'NEW — Fines database' },
    { url: `${BASE}/blog/global-privacy-control-gpc-guide`, note: 'NEW — GPC guide' },
    { url: `${BASE}/blog/privacy-enhancing-technologies-guide`, note: 'NEW — PETs guide' },
];

const priority3 = [
    // CMS-specific guides (new)
    { url: `${BASE}/blog/squarespace-gdpr-compliance`, note: 'NEW — Squarespace' },
    { url: `${BASE}/blog/webflow-gdpr-compliance`, note: 'NEW — Webflow' },
    { url: `${BASE}/blog/framer-gdpr-compliance`, note: 'NEW — Framer' },
    { url: `${BASE}/blog/nextjs-gdpr-compliance`, note: 'NEW — Next.js' },
];

const priority4 = [
    // Existing high-value articles that may not be indexed yet
    { url: `${BASE}/blog/free-gdpr-compliance-checker`, note: 'Money page' },
    { url: `${BASE}/blog/gdpr-compliance-checklist-2026`, note: 'Pillar content' },
    { url: `${BASE}/blog/do-you-need-a-cookie-banner`, note: 'High search volume' },
    { url: `${BASE}/blog/biggest-gdpr-fines-2025-2026`, note: 'Trending topic' },
    { url: `${BASE}/blog/google-analytics-4-gdpr-legal`, note: 'High search volume' },
    { url: `${BASE}/blog/cookie-consent-banner-guide`, note: 'Core topic' },
    { url: `${BASE}/blog/wordpress-gdpr-compliance-guide`, note: 'CMS guide' },
    { url: `${BASE}/blog/shopify-privacy-compliance`, note: 'CMS guide' },
    { url: `${BASE}/blog/wix-gdpr-compliance-guide`, note: 'CMS guide' },
    { url: `${BASE}/blog/ccpa-vs-gdpr-differences`, note: 'Comparison' },
    { url: `${BASE}/blog/gdpr-privacy-policy-template`, note: 'Template' },
    { url: `${BASE}/blog/find-cookies-on-your-website`, note: 'How-to' },
    { url: `${BASE}/blog/ai-crawlers-robots-txt`, note: 'Trending' },
    { url: `${BASE}/blog/google-consent-mode-v2-setup`, note: 'Technical' },
];

console.log('═══════════════════════════════════════════════════════════');
console.log('  Google Search Console — URL Submission Checklist');
console.log('  Open: https://search.google.com/search-console');
console.log('  For each URL: Inspect → Request Indexing');
console.log('═══════════════════════════════════════════════════════════\n');

const groups = [
    { name: '🔴 PRIORITY 1 — Core Pages (submit first)', items: priority1 },
    { name: '🟠 PRIORITY 2 — New High-Traffic Articles', items: priority2 },
    { name: '🟡 PRIORITY 3 — New CMS Guides', items: priority3 },
    { name: '🟢 PRIORITY 4 — Existing Articles', items: priority4 },
];

let total = 0;
groups.forEach(({ name, items }) => {
    console.log(`\n${name}`);
    console.log('─'.repeat(60));
    items.forEach((item, i) => {
        total++;
        console.log(`  ${total.toString().padStart(2)}. ${item.url}`);
        console.log(`      ${item.note}`);
    });
});

console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  Total: ${total} URLs to submit`);
console.log(`  Tip: GSC limits ~10-20 indexing requests per day`);
console.log(`  Submit Priority 1+2 today, Priority 3+4 tomorrow`);
console.log(`═══════════════════════════════════════════════════════════\n`);
