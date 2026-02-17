#!/usr/bin/env node
/**
 * Ping Google and Bing about sitemap updates
 * Usage: node scripts/ping-search-engines.js
 */

const https = require('https');
const http = require('http');

const SITEMAP_URL = 'https://privacychecker.pro/sitemap.xml';

const targets = [
    { name: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
    { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}` },
];

console.log(`🔔 Pinging search engines about sitemap update...\n`);

targets.forEach(({ name, url }) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                console.log(`✅ ${name}: Pinged successfully (${res.statusCode})`);
            } else {
                console.log(`⚠️  ${name}: Status ${res.statusCode}`);
            }
        });
    }).on('error', (e) => {
        console.error(`❌ ${name}: ${e.message}`);
    });
});
