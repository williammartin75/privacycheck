/**
 * PRIVACYCHECKER BATCH AUDIT - PRODUCTION VERSION
 * 50+ checks: GDPR, EAA 2025, SEO, Security, Hidden Costs
 * Optimized for 12M domains in ~10 hours on GCP
 * 
 * Usage: node batch-audit.js --input domains.txt --output results/ --workers 15
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ============ CONFIGURATION ============
const CONFIG = {
    WORKERS: parseInt(process.env.WORKERS || '100'),   // Reduced workers for longer timeouts
    TIMEOUT_MS: parseInt(process.env.TIMEOUT_MS || '15000'), // 15s timeout
    DNS_TIMEOUT_MS: 3000,
    BATCH_SIZE: 200,   // Smaller batches for reliability
    DOMAIN_TIMEOUT_MS: 25000, // Per-domain hard timeout (includes all pages)
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 PrivacyChecker/2.0',
};

// ============ HIDDEN COSTS DATABASE (50+ services) ============
const SAAS_PRICING = {
    // Analytics
    'static.hotjar.com': { name: 'Hotjar', price: 31 },
    'hotjar.com': { name: 'Hotjar', price: 31 },
    'cdn.mxpnl.com': { name: 'Mixpanel', price: 25 },
    'cdn.segment.com': { name: 'Segment', price: 120 },
    'cdn.amplitude.com': { name: 'Amplitude', price: 49 },
    'cdn.usefathom.com': { name: 'Fathom', price: 14 },
    'script.crazyegg.com': { name: 'Crazy Egg', price: 24 },
    'cdn.mouseflow.com': { name: 'Mouseflow', price: 31 },
    'plausible.io': { name: 'Plausible', price: 9 },
    'fullstory.com': { name: 'FullStory', price: 199 },
    'luckyorange.com': { name: 'Lucky Orange', price: 18 },

    // Chat
    'widget.intercom.io': { name: 'Intercom', price: 74 },
    'intercomcdn.com': { name: 'Intercom', price: 74 },
    'cdn.crisp.chat': { name: 'Crisp', price: 25 },
    'widget.drift.com': { name: 'Drift', price: 50 },
    'js.driftt.com': { name: 'Drift', price: 50 },
    'static.zdassets.com': { name: 'Zendesk', price: 49 },
    'wchat.freshchat.com': { name: 'Freshchat', price: 15 },
    'cdn.livechatinc.com': { name: 'LiveChat', price: 20 },

    // CRM/Email
    'static.mailchimp.com': { name: 'Mailchimp', price: 13 },
    'static.klaviyo.com': { name: 'Klaviyo', price: 45 },
    'js.convertflow.co': { name: 'ConvertFlow', price: 29 },
    'js.hubspot.com': { name: 'HubSpot', price: 45 },
    'munchkin.marketo.net': { name: 'Marketo', price: 895 },
    'cdn.activecampaign.com': { name: 'ActiveCampaign', price: 29 },

    // Monitoring
    'browser.sentry-cdn.com': { name: 'Sentry', price: 26 },
    'sentry-cdn.com': { name: 'Sentry', price: 26 },
    'cdn.logrocket.io': { name: 'LogRocket', price: 99 },
    'cdn.bugsnag.com': { name: 'Bugsnag', price: 47 },
    'js.nr-data.net': { name: 'New Relic', price: 49 },
    'cdn.rollbar.com': { name: 'Rollbar', price: 25 },
    'datadoghq.com': { name: 'Datadog', price: 35 },

    // Consent
    'cdn.cookielaw.org': { name: 'OneTrust', price: 299 },
    'cdn.iubenda.com': { name: 'Iubenda', price: 27 },
    'cdn.cookiebot.com': { name: 'Cookiebot', price: 12 },
    'consent.cookiefirst.com': { name: 'CookieFirst', price: 49 },
    'termly.io': { name: 'Termly', price: 15 },
    'osano.com': { name: 'Osano', price: 99 },

    // A/B Testing
    'cdn.optimizely.com': { name: 'Optimizely', price: 199 },
    'cdn.vwo.com': { name: 'VWO', price: 199 },
    'abtasty.com': { name: 'AB Tasty', price: 149 },

    // Other
    'cdn.onesignal.com': { name: 'OneSignal', price: 9 },
    'cdn.contentful.com': { name: 'Contentful', price: 489 },
    'algolia.net': { name: 'Algolia', price: 35 },
    'trustpilot.com': { name: 'Trustpilot', price: 199 },
    'yotpo.com': { name: 'Yotpo', price: 79 },
};

// Trackers
const TRACKERS = [
    { name: 'Google Analytics', patterns: ['google-analytics.com', 'googletagmanager.com', 'gtag(', 'ga('] },
    { name: 'Facebook Pixel', patterns: ['connect.facebook.net', 'fbq(', 'facebook.com/tr'] },
    { name: 'Google Ads', patterns: ['googleadservices.com', 'googlesyndication.com', 'doubleclick.net'] },
    { name: 'Hotjar', patterns: ['hotjar.com'] },
    { name: 'Microsoft Clarity', patterns: ['clarity.ms'] },
    { name: 'LinkedIn Insight', patterns: ['snap.licdn.com'] },
    { name: 'TikTok Pixel', patterns: ['analytics.tiktok.com'] },
    { name: 'Twitter/X Pixel', patterns: ['static.ads-twitter.com'] },
    { name: 'Pinterest Tag', patterns: ['ct.pinterest.com'] },
    { name: 'Criteo', patterns: ['criteo.com', 'criteo.net'] },
    { name: 'Taboola', patterns: ['cdn.taboola.com'] },
    { name: 'Outbrain', patterns: ['outbrain.com'] },
];

// Stats
let stats = { processed: 0, success: 0, failed: 0, skipped: 0, startTime: Date.now() };
let lastProgressTime = Date.now(); // Watchdog

// ============ HELPER FUNCTIONS ============

function isValidDomain(line) {
    if (!line || line.length < 4 || line.length > 255) return false;
    if (line.includes('...') || line.startsWith('-') || line.startsWith('.')) return false;
    if (line.includes(' ') || line.includes('@')) return false;
    if (!line.includes('.')) return false;
    return /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(line);
}

async function checkDNS(name, contains) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`, {
            signal: AbortSignal.timeout(CONFIG.DNS_TIMEOUT_MS)
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.Answer?.some(a => a.data?.toLowerCase().includes(contains.toLowerCase())) || false;
    } catch { return false; }
}

async function checkDNSExists(name, type = 'CAA') {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, {
            signal: AbortSignal.timeout(CONFIG.DNS_TIMEOUT_MS)
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.Answer?.length > 0;
    } catch { return false; }
}

function detectTrackers(html) {
    const htmlLower = html.toLowerCase();
    const found = [];
    for (const t of TRACKERS) {
        for (const p of t.patterns) {
            if (htmlLower.includes(p.toLowerCase())) {
                if (!found.includes(t.name)) found.push(t.name);
                break;
            }
        }
    }
    return found;
}

function detectHiddenCosts(html) {
    const htmlLower = html.toLowerCase();
    const detected = [];
    const seen = new Set();
    for (const [domain, info] of Object.entries(SAAS_PRICING)) {
        if (htmlLower.includes(domain) && !seen.has(info.name)) {
            seen.add(info.name);
            detected.push({ name: info.name, price: info.price });
        }
    }
    return detected;
}

// Pages to crawl with full GET (5 key pages for speed)
const PAGES_TO_CRAWL = [
    { path: '/', category: 'home' },
    { path: '/privacy-policy', category: 'privacy' },
    { path: '/legal', category: 'legal' },
    { path: '/cookies', category: 'cookies' },
    { path: '/contact', category: 'contact' },
];

// Lightweight checks (just existence)
const FILES_TO_CHECK = [
    { path: '/robots.txt', name: 'robots' },
    { path: '/sitemap.xml', name: 'sitemap' },
    { path: '/.well-known/security.txt', name: 'securityTxt' },
];
async function crawlPages(baseUrl, maxPages = 5) {
    const pages = {
        found: { privacy: false, legal: false, cookies: false, contact: false, about: false, terms: false, accessibility: false },
        content: { privacy: '', legal: '', cookies: '', all: '' },
        files: { robots: false, sitemap: false, securityTxt: false },
        pagesScanned: 0,
        trackersFound: [],
        hiddenCosts: [],
    };

    // Crawl ALL pages in parallel (fast)
    const pagePromises = PAGES_TO_CRAWL.slice(0, maxPages).map(async (page) => {
        try {
            const response = await fetch(`${baseUrl}${page.path}`, {
                headers: { 'User-Agent': CONFIG.USER_AGENT },
                signal: AbortSignal.timeout(1500),
                redirect: 'follow',
            });
            if (response.ok) {
                const html = await response.text();
                pages.pagesScanned++;
                pages.found[page.category] = true;
                if (['privacy', 'legal', 'cookies'].includes(page.category)) {
                    pages.content[page.category] += ' ' + html.toLowerCase();
                }
                pages.content.all += ' ' + html.toLowerCase();
                const pageTrackers = detectTrackers(html);
                for (const t of pageTrackers) {
                    if (!pages.trackersFound.includes(t)) pages.trackersFound.push(t);
                }
                const pageCosts = detectHiddenCosts(html);
                for (const c of pageCosts) {
                    if (!pages.hiddenCosts.find(h => h.name === c.name)) pages.hiddenCosts.push(c);
                }
            }
        } catch { }
    });

    // Check files with HEAD (parallel, fast)
    const filePromises = FILES_TO_CHECK.map(async (file) => {
        try {
            const response = await fetch(`${baseUrl}${file.path}`, {
                method: 'HEAD',
                signal: AbortSignal.timeout(1000),
            });
            if (response.ok) pages.files[file.name] = true;
        } catch { }
    });

    await Promise.allSettled([...pagePromises, ...filePromises]);
    return pages;
}

async function auditDomain(domain) {
    const result = {
        domain,
        checksPassedList: [],
        issuesFoundList: [],
        trackersFound: [],
        hiddenCosts: { services: [], totalMonthly: 0 },
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(`https://${domain}`, {
            headers: { 'User-Agent': CONFIG.USER_AGENT },
            redirect: 'follow',
            signal: AbortSignal.timeout(CONFIG.TIMEOUT_MS)
        });

        if (!response.ok) {
            result.error = `HTTP ${response.status}`;
            return result;
        }

        const html = await response.text();
        const headers = response.headers;
        const htmlLower = html.toLowerCase();
        const rootDomain = domain.replace(/^www\./i, '');

        // ============ HIDDEN COSTS ============
        const hiddenServices = detectHiddenCosts(html);
        result.hiddenCosts.services = hiddenServices;
        result.hiddenCosts.totalMonthly = hiddenServices.reduce((sum, s) => sum + s.price, 0);

        // ============ DNS + CRAWL PAGES (parallel) ============
        const baseUrl = response.url.replace(/\/$/, '');
        const [hasSPF, hasDMARC, hasCAA, hasBIMI, crawledPages] = await Promise.all([
            checkDNS(rootDomain, 'v=spf1'),
            checkDNS(`_dmarc.${rootDomain}`, 'v=dmarc1'),
            checkDNSExists(rootDomain, 'CAA'),
            checkDNS(`default._bimi.${rootDomain}`, 'v=bimi1'),
            crawlPages(baseUrl, 20),
        ]);

        // Combine homepage + crawled content for analysis
        const allContent = htmlLower + ' ' + crawledPages.content.all;
        const privacyContent = crawledPages.content.privacy;
        const cookiesContent = crawledPages.content.cookies;

        // Merge trackers and hidden costs from all pages
        result.trackersFound = [...new Set([...detectTrackers(html), ...crawledPages.trackersFound])];
        const allHiddenCosts = [...hiddenServices, ...crawledPages.hiddenCosts];
        const uniqueCosts = allHiddenCosts.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i);
        result.hiddenCosts.services = uniqueCosts;
        result.hiddenCosts.totalMonthly = uniqueCosts.reduce((sum, s) => sum + s.price, 0);
        result.pagesScanned = 1 + crawledPages.pagesScanned;

        // ============ CHECKS PASSED ============

        // Security
        if (response.url.startsWith('https://')) {
            result.checksPassedList.push('HTTPS Enabled');
            result.checksPassedList.push('SSL Certificate Valid');
        }
        if (headers.get('strict-transport-security')) result.checksPassedList.push('HSTS Enabled');
        if (headers.get('x-frame-options')) result.checksPassedList.push('Clickjacking Protection');
        if (headers.get('content-security-policy')) result.checksPassedList.push('Content Security Policy');
        if (headers.get('x-content-type-options')) result.checksPassedList.push('MIME Sniffing Protection');
        if (headers.get('referrer-policy')) result.checksPassedList.push('Referrer Policy');
        if (headers.get('permissions-policy') || headers.get('feature-policy')) result.checksPassedList.push('Permissions Policy');
        if (!headers.get('server')) result.checksPassedList.push('Server Header Hidden');
        if (!headers.get('x-powered-by')) result.checksPassedList.push('Technology Stack Hidden');

        // GDPR
        if (htmlLower.match(/privacy.?policy|datenschutz|confidentialit|politique.?de.?confidentialit/)) result.checksPassedList.push('Privacy Policy');
        if (htmlLower.match(/cookie.?(consent|banner|notice)|gdpr|rgpd|accept.?cookie/)) result.checksPassedList.push('Cookie Consent');
        if (htmlLower.match(/impressum|imprint|legal.?(mention|notice)|mentions.?l[eé]gales/)) result.checksPassedList.push('Legal Imprint');
        if (htmlLower.match(/terms.?(of.?service|and.?conditions)|agb|cgv|cgu/)) result.checksPassedList.push('Terms of Service');

        // DNS
        if (hasSPF) result.checksPassedList.push('SPF Email Auth');
        if (hasDMARC) result.checksPassedList.push('DMARC Email Auth');
        if (hasCAA) result.checksPassedList.push('CAA DNS Record');
        if (hasBIMI) result.checksPassedList.push('BIMI Email Branding');

        // SEO/Accessibility
        if (html.match(/<html[^>]*lang=/i)) result.checksPassedList.push('HTML Lang Attribute');
        if (html.match(/<meta[^>]*viewport/i)) result.checksPassedList.push('Mobile Viewport');
        if (html.match(/<meta[^>]*description/i)) result.checksPassedList.push('Meta Description');
        if (html.match(/og:title|og:description/i)) result.checksPassedList.push('Open Graph Tags');
        if (html.match(/<h1[^>]*>/i)) result.checksPassedList.push('H1 Heading Present');
        if (html.match(/hreflang=/i)) result.checksPassedList.push('Hreflang Tags');
        if (html.match(/application\/ld\+json|schema\.org/i)) result.checksPassedList.push('Structured Data (JSON-LD)');
        if (headers.get('access-control-allow-origin')) result.checksPassedList.push('CORS Headers');

        // Key Pages (verified via full GET crawl)
        if (crawledPages.found.privacy) result.checksPassedList.push('Privacy Policy Page');
        if (crawledPages.found.legal) result.checksPassedList.push('Legal/Imprint Page');
        if (crawledPages.found.cookies) result.checksPassedList.push('Cookie Policy Page');
        if (crawledPages.found.contact) result.checksPassedList.push('Contact Page');
        if (crawledPages.files.robots) result.checksPassedList.push('Robots.txt');
        if (crawledPages.files.sitemap) result.checksPassedList.push('Sitemap.xml');
        if (crawledPages.found.accessibility) result.checksPassedList.push('Accessibility Page');
        if (crawledPages.files.securityTxt) result.checksPassedList.push('Security.txt');

        // Trackers (from all pages)
        if (result.trackersFound.length === 0) result.checksPassedList.push('No Third-Party Trackers');

        // Email
        const exposedEmails = html.match(/mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/gi) || [];
        if (exposedEmails.length === 0) result.checksPassedList.push('No Exposed Emails');

        // ============ ISSUES FOUND ============

        // === CRITICAL SECURITY ===
        if (!response.url.startsWith('https://')) result.issuesFoundList.push('🔴 No HTTPS Encryption');
        if (!headers.get('strict-transport-security')) result.issuesFoundList.push('Missing HSTS Header');
        if (!headers.get('content-security-policy')) result.issuesFoundList.push('Missing Content Security Policy');
        if (!headers.get('x-frame-options')) result.issuesFoundList.push('Clickjacking Vulnerability');
        if (!headers.get('x-content-type-options')) result.issuesFoundList.push('MIME Type Vulnerability');
        if (!headers.get('referrer-policy')) result.issuesFoundList.push('Missing Referrer Policy');
        if (!headers.get('permissions-policy') && !headers.get('feature-policy')) result.issuesFoundList.push('Missing Permissions Policy');
        if (headers.get('server')) result.issuesFoundList.push('Server Technology Exposed');
        if (headers.get('x-powered-by')) result.issuesFoundList.push('Technology Stack Exposed');

        // === DNS SECURITY ===
        if (!hasSPF) result.issuesFoundList.push('No SPF Record (Email Spoofing Risk)');
        if (!hasDMARC) result.issuesFoundList.push('No DMARC Record (Email Fraud Risk)');
        if (!hasCAA) result.issuesFoundList.push('No CAA DNS Record');
        if (!hasBIMI) result.issuesFoundList.push('No BIMI Record (Email Branding)');

        // === GDPR COMPLIANCE (checked across ALL crawled pages) ===
        if (!allContent.match(/privacy.?policy|datenschutz|confidentialit/)) result.issuesFoundList.push('No Privacy Policy');
        if (!allContent.match(/cookie.?(consent|banner|notice)|gdpr|rgpd/)) result.issuesFoundList.push('No Cookie Consent');
        if (!allContent.match(/cookie.?policy|politique.?cookie/)) result.issuesFoundList.push('No Cookie Policy Page');
        if (!allContent.match(/dpo@|data.?protection.?officer|datenschutzbeauftragte/)) result.issuesFoundList.push('No DPO Contact');
        if (!allContent.match(/delete.?data|data.?deletion|right.?to.?erasure|droit.?effacement|supprimer.?donn/)) result.issuesFoundList.push('No Data Deletion Info');
        if (!allContent.match(/data.?retention|conservation.?donn|dur.?e.?conservation/)) result.issuesFoundList.push('No Data Retention Period');
        if (!allContent.match(/consent.?withdraw|retirer.?consentement|widerrufen/)) result.issuesFoundList.push('No Consent Withdrawal');
        if (!allContent.match(/legal.?basis|base.?l[eé]gale|rechtsgrundlage/)) result.issuesFoundList.push('No Legal Basis Stated');
        if (!allContent.match(/third.?part|tiers|drittanbieter/)) result.issuesFoundList.push('No Third-Party Info');
        if (!allContent.match(/impressum|imprint|legal.?(mention|notice)|mentions.?l[eé]gales/)) result.issuesFoundList.push('No Legal Imprint');

        // === EAA 2025 ACCESSIBILITY ===
        if (!html.match(/<html[^>]*lang=/i)) result.issuesFoundList.push('🔴 Missing HTML Lang (EAA 2025)');
        if (!html.match(/<h1[^>]*>/i)) result.issuesFoundList.push('No H1 Heading (EAA 2025)');

        const imagesWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi) || [];
        if (imagesWithoutAlt.length > 0) result.issuesFoundList.push(`Images Without Alt Text (${imagesWithoutAlt.length})`);

        const inputsWithoutLabel = html.match(/<input(?![^>]*aria-label)[^>]*type=["'](?:text|email|password|tel)[^>]*>/gi) || [];
        if (inputsWithoutLabel.length > 3) result.issuesFoundList.push('Form Inputs Missing Labels');

        if (!htmlLower.match(/skip.?to.?content|skip.?nav|aller.?au.?contenu/)) result.issuesFoundList.push('No Skip Navigation Link');
        if (!htmlLower.match(/accessibilit[yé]|barrierefreiheit|wcag/)) result.issuesFoundList.push('No Accessibility Statement');

        // === SEO ===
        if (!html.match(/<meta[^>]*viewport/i)) result.issuesFoundList.push('No Mobile Viewport');
        if (!html.match(/<meta[^>]*description/i)) result.issuesFoundList.push('No Meta Description');
        if (!html.match(/og:title|og:image/i)) result.issuesFoundList.push('No Open Graph Tags');
        if (!html.match(/twitter:card/i)) result.issuesFoundList.push('No Twitter Card');
        if (!html.match(/rel=["']canonical/i)) result.issuesFoundList.push('No Canonical URL');
        if (!html.match(/hreflang=/i)) result.issuesFoundList.push('No Hreflang Tags (Multilingual)');
        if (!html.match(/application\/ld\+json|schema\.org/i)) result.issuesFoundList.push('No Structured Data (JSON-LD)');

        // === KEY PAGES (verified via full GET crawl) ===
        if (!crawledPages.found.privacy) result.issuesFoundList.push('No Privacy Policy Page Found');
        if (!crawledPages.found.legal) result.issuesFoundList.push('No Legal/Imprint Page Found');
        if (!crawledPages.found.cookies) result.issuesFoundList.push('No Cookie Policy Page Found');
        if (!crawledPages.files.robots) result.issuesFoundList.push('No Robots.txt Found');
        if (!crawledPages.files.sitemap) result.issuesFoundList.push('No Sitemap.xml Found');
        if (!crawledPages.found.accessibility) result.issuesFoundList.push('No Accessibility Page (EAA 2025)');

        // === ADVANCED SECURITY ===
        if (!allContent.includes('integrity=')) result.issuesFoundList.push('No Subresource Integrity');
        if (!crawledPages.files.securityTxt && !allContent.match(/vulnerability|bug.?bounty/)) result.issuesFoundList.push('No Security Disclosure');
        if (html.match(/src=["']http:\/\//i)) result.issuesFoundList.push('Mixed Content (HTTP resources)');
        if (html.match(/<a[^>]*target=["']_blank(?![^>]*rel=["'][^"]*noopener)/i)) result.issuesFoundList.push('External Links Without noopener');

        // === TRACKERS (from all pages) ===
        if (result.trackersFound.length > 0) {
            result.issuesFoundList.push(`Third-Party Trackers (${result.trackersFound.length}): ${result.trackersFound.slice(0, 3).join(', ')}${result.trackersFound.length > 3 ? '...' : ''}`);
        }
        if (exposedEmails.length > 0) result.issuesFoundList.push(`Exposed Email Addresses (${exposedEmails.length})`);

        // === USER RIGHTS ===
        if (!htmlLower.match(/opt.out|unsubscribe|d[eé]sinscri/)) result.issuesFoundList.push('No Opt-out Mechanism');
        if (!htmlLower.match(/children|minor|under.?1[36]|enfant/)) result.issuesFoundList.push("No Children's Privacy Info");

        // === HIDDEN COSTS ===
        if (result.hiddenCosts.totalMonthly > 0) {
            result.issuesFoundList.push(`💰 Hidden SaaS Costs: €${result.hiddenCosts.totalMonthly}/month`);
        }

    } catch (error) {
        result.error = error.name === 'AbortError' ? 'Timeout' : error.message;
    }

    return result;
}

// ============ BATCH PROCESSING ============

async function processBatch(domains) {
    const results = await Promise.allSettled(domains.map(d => {
        // Per-domain hard timeout to prevent freeze
        return Promise.race([
            auditDomain(d),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Domain timeout')), CONFIG.DOMAIN_TIMEOUT_MS)
            )
        ]).catch(err => ({
            domain: d,
            checksPassedList: [],
            issuesFoundList: [],
            error: err.message || 'Timeout',
            timestamp: new Date().toISOString(),
        }));
    }));
    lastProgressTime = Date.now(); // Reset watchdog
    return results.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        return {
            domain: domains[i],
            checksPassedList: [],
            issuesFoundList: [],
            error: r.reason?.message || 'Unknown error',
            timestamp: new Date().toISOString(),
        };
    });
}

async function* readDomains(inputFile) {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    for await (const line of rl) {
        const domain = line.trim();
        if (isValidDomain(domain)) yield domain;
        else stats.skipped++;
    }
}

function saveResults(results, outputDir, batchNum) {
    const filename = path.join(outputDir, `batch_${batchNum.toString().padStart(6, '0')}.json`);
    fs.writeFileSync(filename, JSON.stringify(results));
    return filename;
}

function printProgress() {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const rate = stats.processed / elapsed;
    const eta = stats.processed > 0 ? Math.round((12000000 - stats.processed) / rate / 60) : 0;
    console.log(`[${new Date().toISOString()}] Processed: ${stats.processed} | Success: ${stats.success} | Failed: ${stats.failed} | Rate: ${rate.toFixed(1)}/s | ETA: ${eta}min`);
}

// ============ MAIN ============

async function main() {
    const args = process.argv.slice(2);
    let inputFile = null;
    let outputDir = './results';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' && args[i + 1]) { inputFile = args[i + 1]; i++; }
        else if (args[i] === '--output' && args[i + 1]) { outputDir = args[i + 1]; i++; }
        else if (args[i] === '--workers' && args[i + 1]) { CONFIG.WORKERS = parseInt(args[i + 1]); i++; }
    }

    if (!inputFile) {
        console.error('Usage: node batch-audit.js --input domains.txt --output results/ --workers 15');
        process.exit(1);
    }

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    console.log(`\n${'='.repeat(60)}`);
    console.log('  PRIVACYCHECKER BATCH AUDIT v2.0');
    console.log('  50+ checks: GDPR, EAA 2025, SEO, Security, Hidden Costs');
    console.log(`${'='.repeat(60)}`);
    console.log(`Input: ${inputFile}`);
    console.log(`Output: ${outputDir}`);
    console.log(`Workers: ${CONFIG.WORKERS}`);
    console.log(`Timeout: ${CONFIG.TIMEOUT_MS}ms`);
    console.log(`${'='.repeat(60)}\n`);

    let batch = [];
    let batchNum = 0;
    let allResults = [];
    const progressInterval = setInterval(printProgress, 30000);

    try {
        for await (const domain of readDomains(inputFile)) {
            batch.push(domain);

            if (batch.length >= CONFIG.WORKERS) {
                const results = await processBatch(batch);
                for (const result of results) {
                    stats.processed++;
                    if (result.error) stats.failed++;
                    else stats.success++;
                    allResults.push(result);
                }

                if (allResults.length >= CONFIG.BATCH_SIZE) {
                    saveResults(allResults, outputDir, batchNum++);
                    allResults = [];
                }
                batch = [];
            }
        }

        if (batch.length > 0) {
            const results = await processBatch(batch);
            for (const result of results) {
                stats.processed++;
                if (result.error) stats.failed++;
                else stats.success++;
                allResults.push(result);
            }
        }

        if (allResults.length > 0) {
            saveResults(allResults, outputDir, batchNum++);
        }

    } finally {
        clearInterval(progressInterval);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('  COMPLETE');
    console.log(`${'='.repeat(60)}`);
    printProgress();
    console.log(`Output: ${outputDir} (${batchNum} files)`);
    console.log(`Skipped invalid: ${stats.skipped}`);
}

main().catch(console.error);
