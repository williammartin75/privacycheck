#!/usr/bin/env node
/**
 * Submit all PrivacyChecker URLs to IndexNow (Bing, Yandex, Naver, Seznam)
 * Usage: node scripts/submit-indexnow.js
 */

const https = require('https');

const INDEXNOW_KEY = 'dacc1a6089234ef8a0e3581c3cd5db77';
const HOST = 'privacychecker.pro';
const BASE = `https://${HOST}`;

// All indexable URLs
const urls = [
    `${BASE}/`,
    `${BASE}/about`,
    `${BASE}/glossary`,
    `${BASE}/blog`,
    `${BASE}/docs/consent-mode`,
    `${BASE}/legal`,
    `${BASE}/legal/cookies`,
    `${BASE}/legal/dpa`,
    `${BASE}/privacy`,
    `${BASE}/terms`,
];

// Blog slugs — pulled from data.ts
const blogSlugs = [
    'gdpr-compliance-checklist-2026', 'ccpa-vs-gdpr-differences', 'eaa-2025-accessibility-requirements',
    'eu-ai-act-website-compliance', 'cookie-consent-banner-guide', 'dark-patterns-detection',
    'spf-dkim-dmarc-email-deliverability', 'website-security-headers-guide',
    'third-party-scripts-supply-chain-security', 'domain-security-typosquatting-protection',
    'how-to-audit-website-privacy', 'website-privacy-score-meaning', 'reduce-saas-costs-hidden-tools',
    'vendor-risk-assessment-gdpr', 'compliance-monitoring-drift-detection',
    'google-consent-mode-v2-setup', 'privacy-policy-generator-vs-custom',
    'wordpress-gdpr-compliance-guide', 'shopify-privacy-compliance',
    'data-protection-impact-assessment-guide', 'data-breach-response-plan',
    'cookie-free-analytics-alternatives', 'pecr-eprivacy-cookie-rules',
    'coppa-children-privacy-website', 'cross-border-data-transfers-schrems',
    'privacy-by-design-implementation', 'consent-management-platform-comparison',
    'website-trust-signals-conversion', 'core-web-vitals-privacy-impact',
    'ecommerce-checkout-privacy-compliance', 'free-gdpr-compliance-checker',
    'do-you-need-a-cookie-banner', 'biggest-gdpr-fines-2025-2026',
    'find-cookies-on-your-website', 'google-analytics-4-gdpr-legal',
    'ai-crawlers-robots-txt', 'saas-gdpr-compliance-guide', 'lgpd-vs-gdpr-brazil',
    'ai-privacy-policy-requirements', 'website-privacy-checklist-2026',
    'pipeda-canada-privacy-law', 'us-state-privacy-laws-2026',
    'browser-fingerprinting-privacy', 'saas-tools-gdpr-compliance',
    'google-consent-mode-v2-audit', 'gdpr-privacy-policy-template',
    'wix-gdpr-compliance-guide', 'gdpr-for-small-businesses',
    'block-ai-crawlers-website', 'google-fonts-gdpr-compliant',
    'nis2-directive-website-requirements', 'dora-compliance-checklist-2026',
    'what-data-does-my-website-collect', 'swiss-ndsg-compliance-guide',
    'uk-gdpr-post-brexit-differences', 'kvkk-turkey-privacy-law-guide',
    'thailand-pdpa-vs-gdpr',
    // New SEO articles
    'gdpr-ai-compliance-guide', 'gdpr-data-subject-rights-guide',
    'age-verification-compliance-guide', 'transfer-impact-assessment-template',
    'privacy-enhancing-technologies-guide', 'cookie-banner-requirements-by-country',
    'global-privacy-control-gpc-guide', 'gdpr-fines-database-2026',
    'squarespace-gdpr-compliance', 'webflow-gdpr-compliance',
    'framer-gdpr-compliance', 'nextjs-gdpr-compliance',
];

blogSlugs.forEach(slug => urls.push(`${BASE}/blog/${slug}`));

console.log(`📡 Submitting ${urls.length} URLs to IndexNow...\n`);

const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
});

const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/IndexNow',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
    },
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 202) {
            console.log(`✅ IndexNow accepted! Status: ${res.statusCode}`);
            console.log(`   ${urls.length} URLs submitted to Bing, Yandex, Naver, Seznam`);
        } else {
            console.log(`⚠️  IndexNow response: ${res.statusCode}`);
            console.log(`   Body: ${data}`);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Error: ${e.message}`);
});

req.write(payload);
req.end();
