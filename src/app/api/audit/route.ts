import { NextRequest, NextResponse } from 'next/server';
import { getVendorRisk, getRiskLabel, VendorRisk } from '@/lib/vendor-risk';
import { calculateRiskPrediction, RiskPrediction } from '@/lib/risk-predictor';

interface Cookie {
    name: string;
    category: 'necessary' | 'analytics' | 'marketing' | 'preferences' | 'unknown';
    description: string;
    provider: string;
}

interface PageScan {
    url: string;
    title: string;
    cookiesFound: number;
    trackersFound: string[];
}

interface SecurityHeaders {
    csp: boolean;
    xFrameOptions: boolean;
    xContentType: boolean;
    strictTransportSecurity: boolean;
    referrerPolicy: boolean;
    permissionsPolicy: boolean;
}

interface SSLInfo {
    valid: boolean;
    hsts: boolean;
    hstsMaxAge: number | null;
}

interface EmailSecurity {
    spf: boolean;
    dmarc: boolean;
    domain: string;
}

interface AuditResult {
    score: number;
    domain: string;
    pagesScanned: number;
    pages: PageScan[];
    issues: {
        cookies: {
            count: number;
            undeclared: number;
            list: Cookie[];
        };
        consentBanner: boolean;
        privacyPolicy: boolean;
        https: boolean;
        trackers: string[];
        legalMentions: boolean;
        dpoContact: boolean;
        dataDeleteLink: boolean;
        secureforms: boolean;
        optOutMechanism: boolean;
        ageVerification: boolean;
        cookiePolicy: boolean;
        // P0 Security modules
        ssl: SSLInfo;
        securityHeaders: SecurityHeaders;
        emailSecurity: EmailSecurity;
        // Email Exposure
        exposedEmails: string[];
        // External Resources
        externalResources: {
            scripts: { src: string; provider: string }[];
            fonts: { src: string; provider: string }[];
            iframes: { src: string; provider: string }[];
        };
        // Social Trackers
        socialTrackers: { name: string; risk: 'high' | 'medium' | 'low' }[];
        // Data Breaches
        dataBreaches: { name: string; date: string; count: number }[];
        // Vendor Risk Assessment
        vendorRisks: {
            name: string;
            category: string;
            riskScore: number;
            riskLevel: 'low' | 'medium' | 'high' | 'critical';
            jurisdiction: string;
            dataTransfer: string;
            concerns: string[];
            gdprCompliant: boolean;
        }[];
    };
    regulations: string[];
    scoreBreakdown: { item: string; points: number; passed: boolean }[];
    // Risk Prediction - GDPR Fine Estimation
    riskPrediction?: {
        minFine: number;
        maxFine: number;
        avgFine: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        probability: number;
        factors: {
            issue: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            fineContribution: number;
            gdprArticle?: string;
            description: string;
        }[];
        recommendation: string;
    };
}

// Known cookies database
const KNOWN_COOKIES: Record<string, Cookie> = {
    '_ga': { name: '_ga', category: 'analytics', description: 'Google Analytics - Distinguishes users', provider: 'Google' },
    '_gid': { name: '_gid', category: 'analytics', description: 'Google Analytics - Distinguishes users (24h)', provider: 'Google' },
    '_gat': { name: '_gat', category: 'analytics', description: 'Google Analytics - Throttle request rate', provider: 'Google' },
    '_gcl_au': { name: '_gcl_au', category: 'marketing', description: 'Google Ads conversion tracking', provider: 'Google' },
    '_fbp': { name: '_fbp', category: 'marketing', description: 'Facebook Pixel - Identifies browsers', provider: 'Facebook' },
    '_fbc': { name: '_fbc', category: 'marketing', description: 'Facebook Click ID', provider: 'Facebook' },
    'fr': { name: 'fr', category: 'marketing', description: 'Facebook advertising cookie', provider: 'Facebook' },
    '_hjid': { name: '_hjid', category: 'analytics', description: 'Hotjar user ID', provider: 'Hotjar' },
    '_hjSessionUser': { name: '_hjSessionUser', category: 'analytics', description: 'Hotjar session user', provider: 'Hotjar' },
    'intercom-id': { name: 'intercom-id', category: 'preferences', description: 'Intercom user identification', provider: 'Intercom' },
    'hubspotutk': { name: 'hubspotutk', category: 'marketing', description: 'HubSpot visitor tracking', provider: 'HubSpot' },
    '__hstc': { name: '__hstc', category: 'marketing', description: 'HubSpot main tracking cookie', provider: 'HubSpot' },
    '__hssc': { name: '__hssc', category: 'marketing', description: 'HubSpot session tracking', provider: 'HubSpot' },
    '_clck': { name: '_clck', category: 'analytics', description: 'Microsoft Clarity user ID', provider: 'Microsoft' },
    '_clsk': { name: '_clsk', category: 'analytics', description: 'Microsoft Clarity session', provider: 'Microsoft' },
    'li_gc': { name: 'li_gc', category: 'marketing', description: 'LinkedIn guest consent', provider: 'LinkedIn' },
    'lidc': { name: 'lidc', category: 'marketing', description: 'LinkedIn data center routing', provider: 'LinkedIn' },
    'mp_': { name: 'mp_', category: 'analytics', description: 'Mixpanel tracking', provider: 'Mixpanel' },
    'amplitude_id': { name: 'amplitude_id', category: 'analytics', description: 'Amplitude user tracking', provider: 'Amplitude' },
    'ajs_user_id': { name: 'ajs_user_id', category: 'analytics', description: 'Segment user ID', provider: 'Segment' },
    'ajs_anonymous_id': { name: 'ajs_anonymous_id', category: 'analytics', description: 'Segment anonymous ID', provider: 'Segment' },
    'PHPSESSID': { name: 'PHPSESSID', category: 'necessary', description: 'PHP session identifier', provider: 'Website' },
    'JSESSIONID': { name: 'JSESSIONID', category: 'necessary', description: 'Java session identifier', provider: 'Website' },
    'csrf_token': { name: 'csrf_token', category: 'necessary', description: 'CSRF protection', provider: 'Website' },
    '_csrf': { name: '_csrf', category: 'necessary', description: 'CSRF protection', provider: 'Website' },
    'session': { name: 'session', category: 'necessary', description: 'Session management', provider: 'Website' },
    'auth_token': { name: 'auth_token', category: 'necessary', description: 'Authentication token', provider: 'Website' },
};

// Known trackers patterns
const TRACKER_PATTERNS = [
    { name: 'Google Analytics', patterns: ['google-analytics.com', 'googletagmanager.com', 'ga.js', 'gtag', 'analytics.js'] },
    { name: 'Facebook Pixel', patterns: ['facebook.net', 'fbq(', 'connect.facebook', 'facebook.com/tr'] },
    { name: 'Google Ads', patterns: ['googleadservices.com', 'googlesyndication.com', 'doubleclick.net'] },
    { name: 'Hotjar', patterns: ['hotjar.com', 'static.hotjar.com', 'vars.hotjar.com'] },
    { name: 'LinkedIn', patterns: ['linkedin.com/px', 'snap.licdn.com', 'linkedin.com/insight'] },
    { name: 'Twitter/X', patterns: ['static.ads-twitter.com', 't.co/i/adsct', 'analytics.twitter.com'] },
    { name: 'TikTok', patterns: ['analytics.tiktok.com', 'tiktok.com/i18n'] },
    { name: 'Mixpanel', patterns: ['mixpanel.com', 'cdn.mxpnl.com', 'api.mixpanel.com'] },
    { name: 'Segment', patterns: ['segment.io', 'segment.com', 'cdn.segment.com', 'api.segment.io'] },
    { name: 'Amplitude', patterns: ['amplitude.com', 'cdn.amplitude.com', 'api.amplitude.com'] },
    { name: 'HubSpot', patterns: ['hubspot.com', 'hs-analytics', 'hs-scripts', 'hsforms.net'] },
    { name: 'Intercom', patterns: ['intercom.io', 'widget.intercom.io', 'intercomcdn.com'] },
    { name: 'Clarity', patterns: ['clarity.ms', 'microsoft clarity', 'c.bing.com'] },
    { name: 'Heap', patterns: ['heap.io', 'heapanalytics.com', 'cdn.heapanalytics.com'] },
    { name: 'FullStory', patterns: ['fullstory.com', 'rs.fullstory.com'] },
    { name: 'Optimizely', patterns: ['optimizely.com', 'cdn.optimizely.com'] },
    { name: 'Crazy Egg', patterns: ['crazyegg.com', 'dnn506yrbagrg.cloudfront.net'] },
];

// Pattern collections
const CONSENT_PATTERNS = [
    'cookie-consent', 'cookie-banner', 'cookieconsent', 'cookie-notice',
    'gdpr-consent', 'consent-banner', 'privacy-notice', 'cookie-popup',
    'onetrust', 'cookiebot', 'quantcast', 'trustarc', 'cc-window', 'cc-banner',
    'accept cookies', 'cookie preferences', 'manage cookies', 'cookie settings',
];

const PRIVACY_PATTERNS = [
    '/privacy', '/privacy-policy', '/privacypolicy', '/datenschutz',
    '/politique-de-confidentialite', '/politica-de-privacidad',
    'privacy policy', 'data protection', 'datenschutzerklärung',
];

const LEGAL_PATTERNS = [
    '/legal', '/terms', '/tos', '/terms-of-service', '/impressum', '/imprint',
    '/mentions-legales', 'terms of service', 'terms and conditions', 'mentions légales',
];

const DPO_PATTERNS = [
    'dpo@', 'privacy@', 'gdpr@', 'dataprotection@', 'data protection officer',
    'délégué à la protection', 'datenschutzbeauftragter',
];

const DELETE_PATTERNS = [
    'delete my data', 'right to erasure', 'data deletion', 'delete account',
    'remove my data', 'right to be forgotten', 'data subject request', 'dsar',
];

const OPT_OUT_PATTERNS = [
    'opt-out', 'optout', 'unsubscribe', 'manage preferences', 'email preferences',
    'withdraw consent', 'communication preferences',
];

const AGE_PATTERNS = [
    'age verification', 'age gate', '18+', '21+', 'confirm your age', 'must be 18',
];

const COOKIE_POLICY_PATTERNS = [
    '/cookie-policy', '/cookies', 'cookie policy', 'use of cookies', 'we use cookies',
];

// Social Trackers Detection
const SOCIAL_TRACKERS: { name: string; patterns: string[]; risk: 'high' | 'medium' | 'low' }[] = [
    {
        name: 'Facebook Pixel',
        patterns: ['fbq(', 'facebook.com/tr', 'connect.facebook.net', 'fbevents.js', '_fbp'],
        risk: 'high'
    },
    {
        name: 'TikTok Pixel',
        patterns: ['analytics.tiktok.com', 'ttq.load', 'tiktok.com/i18n'],
        risk: 'high'
    },
    {
        name: 'LinkedIn Insight',
        patterns: ['snap.licdn.com', 'linkedin.com/px', '_linkedin_partner_id', 'linkedin.com/insight'],
        risk: 'medium'
    },
    {
        name: 'Twitter/X Pixel',
        patterns: ['static.ads-twitter.com', 'analytics.twitter.com', 'twq(', 't.co/i/adsct'],
        risk: 'medium'
    },
    {
        name: 'Pinterest Tag',
        patterns: ['pintrk(', 'ct.pinterest.com', 'assets.pinterest.com'],
        risk: 'medium'
    },
    {
        name: 'Snapchat Pixel',
        patterns: ['sc-static.net', 'snaptr(', 'tr.snapchat.com'],
        risk: 'medium'
    },
    {
        name: 'Google Ads',
        patterns: ['googleadservices.com', 'gtag/js?id=AW-', 'google_conversion', 'googlesyndication'],
        risk: 'medium'
    },
    {
        name: 'Microsoft/Bing Ads',
        patterns: ['bat.bing.com', 'clarity.ms', 'uetq'],
        risk: 'medium'
    },
    {
        name: 'Reddit Pixel',
        patterns: ['rdt(', 'alb.reddit.com', 'www.redditstatic.com/ads'],
        risk: 'low'
    },
];

function detectSocialTrackers(html: string): { name: string; risk: 'high' | 'medium' | 'low' }[] {
    const detected: { name: string; risk: 'high' | 'medium' | 'low' }[] = [];
    const htmlLower = html.toLowerCase();

    for (const tracker of SOCIAL_TRACKERS) {
        for (const pattern of tracker.patterns) {
            if (htmlLower.includes(pattern.toLowerCase())) {
                if (!detected.find(d => d.name === tracker.name)) {
                    detected.push({ name: tracker.name, risk: tracker.risk });
                }
                break;
            }
        }
    }

    return detected;
}

// P0 Security: Check security headers from response
function checkSecurityHeaders(headers: Headers): SecurityHeaders {
    return {
        csp: !!headers.get('content-security-policy'),
        xFrameOptions: !!headers.get('x-frame-options'),
        xContentType: headers.get('x-content-type-options') === 'nosniff',
        strictTransportSecurity: !!headers.get('strict-transport-security'),
        referrerPolicy: !!headers.get('referrer-policy'),
        permissionsPolicy: !!headers.get('permissions-policy') || !!headers.get('feature-policy'),
    };
}

// P0 Security: Parse HSTS max-age value
function parseHstsMaxAge(hstsHeader: string | null): number | null {
    if (!hstsHeader) return null;
    const match = hstsHeader.match(/max-age=(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
}

// Check for data breaches using HIBP public API
async function checkDataBreaches(domain: string): Promise<{ name: string; date: string; count: number }[]> {
    try {
        // HIBP public breaches endpoint (free)
        const response = await fetch('https://haveibeenpwned.com/api/v3/breaches', {
            headers: {
                'User-Agent': 'PrivacyChecker-Audit',
            },
        });

        if (!response.ok) return [];

        const breaches = await response.json();
        const domainLower = domain.toLowerCase().replace('www.', '');

        // Find breaches matching this domain
        const matches = breaches.filter((breach: { Domain: string }) => {
            const breachDomain = breach.Domain?.toLowerCase() || '';
            return breachDomain === domainLower ||
                breachDomain.endsWith('.' + domainLower) ||
                domainLower.endsWith('.' + breachDomain);
        });

        return matches.slice(0, 5).map((breach: { Name: string; BreachDate: string; PwnCount: number }) => ({
            name: breach.Name,
            date: breach.BreachDate,
            count: breach.PwnCount,
        }));
    } catch (error) {
        console.error('HIBP check error:', error);
        return [];
    }
}

// P0 Security: Check DNS record via Google DNS-over-HTTPS (free, no lib needed)
async function checkDNSRecord(name: string, contains: string): Promise<boolean> {
    try {
        const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`, {
            headers: { 'Accept': 'application/dns-json' },
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.Answer?.some((a: { data?: string }) => a.data?.toLowerCase().includes(contains.toLowerCase())) || false;
    } catch {
        return false;
    }
}

// P0 Security: Check email security (SPF, DMARC) via DNS
async function checkEmailSecurity(domain: string): Promise<EmailSecurity> {
    // Strip www. prefix to check root domain DNS records
    const rootDomain = domain.replace(/^www\./i, '');
    const [spf, dmarc] = await Promise.all([
        checkDNSRecord(rootDomain, 'v=spf1'),
        checkDNSRecord(`_dmarc.${rootDomain}`, 'v=dmarc1'),
    ]);
    return { spf, dmarc, domain: rootDomain };
}

// Email Exposure: Extract email addresses from HTML
function extractExposedEmails(html: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailRegex) || [];

    // Filter out common false positives and duplicates
    const filtered = [...new Set(matches)]
        .filter(email => {
            const lower = email.toLowerCase();
            // Skip common non-personal/placeholder emails
            if (lower.includes('example.com') || lower.includes('test.com')) return false;
            if (lower.includes('placeholder') || lower.includes('email@')) return false;
            if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.gif')) return false;
            // Skip very short local parts (likely false positives)
            if (email.split('@')[0].length < 3) return false;
            return true;
        })
        .slice(0, 20); // Limit to 20 emails max

    return filtered;
}

// Known providers for external resources
const KNOWN_PROVIDERS: Record<string, string> = {
    'google': 'Google',
    'googleapis': 'Google',
    'gstatic': 'Google',
    'googletagmanager': 'Google Tag Manager',
    'google-analytics': 'Google Analytics',
    'facebook': 'Facebook',
    'fbcdn': 'Facebook',
    'twitter': 'Twitter/X',
    'twimg': 'Twitter/X',
    'linkedin': 'LinkedIn',
    'cloudflare': 'Cloudflare',
    'cdnjs': 'CDNJS',
    'jsdelivr': 'jsDelivr',
    'unpkg': 'unpkg',
    'jquery': 'jQuery',
    'bootstrap': 'Bootstrap',
    'fontawesome': 'Font Awesome',
    'hotjar': 'Hotjar',
    'hubspot': 'HubSpot',
    'intercom': 'Intercom',
    'crisp': 'Crisp',
    'zendesk': 'Zendesk',
    'stripe': 'Stripe',
    'paypal': 'PayPal',
    'youtube': 'YouTube',
    'vimeo': 'Vimeo',
    'typekit': 'Adobe Fonts',
    'fonts.adobe': 'Adobe Fonts',
    'tiktok': 'TikTok',
    'snapchat': 'Snapchat',
    'pinterest': 'Pinterest',
    'amazon': 'Amazon',
    'cloudfront': 'AWS CloudFront',
    'akamai': 'Akamai',
};

function getProvider(url: string): string {
    const lower = url.toLowerCase();
    for (const [key, provider] of Object.entries(KNOWN_PROVIDERS)) {
        if (lower.includes(key)) return provider;
    }
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '').split('.').slice(-2).join('.');
    } catch {
        return 'Unknown';
    }
}

// Extract external resources (scripts, fonts, iframes)
function extractExternalResources(html: string, baseDomain: string): {
    scripts: { src: string; provider: string }[];
    fonts: { src: string; provider: string }[];
    iframes: { src: string; provider: string }[];
} {
    const scripts: { src: string; provider: string }[] = [];
    const fonts: { src: string; provider: string }[] = [];
    const iframes: { src: string; provider: string }[] = [];

    // Extract external scripts
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http') && !src.includes(baseDomain)) {
            const provider = getProvider(src);
            if (!scripts.find(s => s.src === src)) {
                scripts.push({ src, provider });
            }
        }
    }

    // Extract external fonts (link tags with fonts)
    const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const fullTag = match[0].toLowerCase();
        if (href.startsWith('http') && !href.includes(baseDomain)) {
            if (fullTag.includes('font') || href.includes('font') || href.includes('typekit')) {
                const provider = getProvider(href);
                if (!fonts.find(f => f.src === href)) {
                    fonts.push({ src: href, provider });
                }
            }
        }
    }

    // Extract iframes
    const iframeRegex = /<iframe[^>]+src=["']([^"']+)["']/gi;
    while ((match = iframeRegex.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http') && !src.includes(baseDomain)) {
            const provider = getProvider(src);
            if (!iframes.find(i => i.src === src)) {
                iframes.push({ src, provider });
            }
        }
    }

    return {
        scripts: scripts.slice(0, 30),
        fonts: fonts.slice(0, 10),
        iframes: iframes.slice(0, 10)
    };
}

// Extract internal links from HTML
function extractInternalLinks(html: string, baseUrl: URL): string[] {
    const links: string[] = [];
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;

    while ((match = hrefRegex.exec(html)) !== null) {
        const href = match[1];
        try {
            // Skip external links, anchors, mailto, tel, javascript
            if (href.startsWith('#') || href.startsWith('mailto:') ||
                href.startsWith('tel:') || href.startsWith('javascript:')) {
                continue;
            }

            let fullUrl: URL;
            if (href.startsWith('http')) {
                fullUrl = new URL(href);
                // Skip external domains
                if (fullUrl.hostname !== baseUrl.hostname) continue;
            } else {
                fullUrl = new URL(href, baseUrl);
            }

            // Only include HTML pages (skip images, PDFs, etc.)
            const path = fullUrl.pathname.toLowerCase();
            if (path.match(/\.(jpg|jpeg|png|gif|svg|pdf|doc|docx|xls|xlsx|zip|css|js)$/)) {
                continue;
            }

            const cleanUrl = `${fullUrl.origin}${fullUrl.pathname}`;
            if (!links.includes(cleanUrl) && cleanUrl !== baseUrl.toString()) {
                links.push(cleanUrl);
            }
        } catch {
            // Invalid URL, skip
        }
    }

    return links.slice(0, 10); // Limit to 10 additional pages
}

// Extract cookies from HTML and headers
function extractCookies(html: string, setCookieHeader: string | null): Cookie[] {
    const cookies: Cookie[] = [];
    const foundNames = new Set<string>();

    // From Set-Cookie header
    if (setCookieHeader) {
        const cookieParts = setCookieHeader.split(',');
        for (const part of cookieParts) {
            const name = part.trim().split('=')[0].split(';')[0];
            if (name && !foundNames.has(name)) {
                foundNames.add(name);
                const known = Object.entries(KNOWN_COOKIES).find(([key]) => name.startsWith(key));
                if (known) {
                    cookies.push({ ...known[1], name });
                } else {
                    cookies.push({
                        name,
                        category: 'unknown',
                        description: 'Third-party or custom cookie',
                        provider: 'Unknown',
                    });
                }
            }
        }
    }

    // From document.cookie patterns in scripts
    const cookiePatterns = html.match(/document\.cookie\s*=\s*["']([^"'=]+)=/g) || [];
    for (const pattern of cookiePatterns) {
        const match = pattern.match(/["']([^"'=]+)=/);
        if (match && match[1] && !foundNames.has(match[1])) {
            const name = match[1];
            foundNames.add(name);
            const known = Object.entries(KNOWN_COOKIES).find(([key]) => name.startsWith(key));
            if (known) {
                cookies.push({ ...known[1], name });
            } else {
                cookies.push({
                    name,
                    category: 'unknown',
                    description: 'Custom cookie set by JavaScript',
                    provider: 'Website',
                });
            }
        }
    }

    // Detect cookies from known tracker patterns
    for (const [cookieName, cookieInfo] of Object.entries(KNOWN_COOKIES)) {
        if (!foundNames.has(cookieName) && html.toLowerCase().includes(cookieName.toLowerCase())) {
            foundNames.add(cookieName);
            cookies.push(cookieInfo);
        }
    }

    return cookies;
}

// Detect trackers in HTML
function detectTrackers(html: string): string[] {
    const htmlLower = html.toLowerCase();
    const detected: string[] = [];

    for (const tracker of TRACKER_PATTERNS) {
        for (const pattern of tracker.patterns) {
            if (htmlLower.includes(pattern.toLowerCase())) {
                if (!detected.includes(tracker.name)) {
                    detected.push(tracker.name);
                }
                break;
            }
        }
    }

    return detected;
}

// Extract page title
function extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim().substring(0, 100) : 'Untitled';
}

// Main audit function
export async function POST(request: NextRequest) {
    try {
        const { url, tier = 'free' } = await request.json();

        // Tier-based helpers
        const isPro = tier === 'pro' || tier === 'pro_plus';
        const isProPlus = tier === 'pro_plus';

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        let baseUrl: URL;
        try {
            baseUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const domain = baseUrl.hostname;
        const isHttps = baseUrl.protocol === 'https:';
        const allCookies: Cookie[] = [];
        const allTrackers: string[] = [];
        const pages: PageScan[] = [];
        let combinedHtml = '';

        // Fetch main page
        const fetchPage = async (pageUrl: string): Promise<{ html: string; cookies: string | null; headers: Headers } | null> => {
            try {
                const response = await fetch(pageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 PrivacyCheck/1.0',
                    },
                    redirect: 'follow',
                });
                return {
                    html: await response.text(),
                    cookies: response.headers.get('set-cookie'),
                    headers: response.headers,
                };
            } catch {
                return null;
            }
        };

        // Scan main page
        const mainPage = await fetchPage(baseUrl.toString());
        if (!mainPage) {
            return NextResponse.json({ error: 'Could not fetch the website' }, { status: 500 });
        }

        combinedHtml = mainPage.html;
        const mainCookies = extractCookies(mainPage.html, mainPage.cookies);
        const mainTrackers = detectTrackers(mainPage.html);

        // P0 Security: Check security headers and email security
        const securityHeaders = checkSecurityHeaders(mainPage.headers);
        const emailSecurity = await checkEmailSecurity(domain);
        const sslInfo: SSLInfo = {
            valid: isHttps,
            hsts: securityHeaders.strictTransportSecurity,
            hstsMaxAge: parseHstsMaxAge(mainPage.headers.get('strict-transport-security')),
        };

        pages.push({
            url: baseUrl.toString(),
            title: extractTitle(mainPage.html),
            cookiesFound: mainCookies.length,
            trackersFound: mainTrackers,
        });

        // Add cookies and trackers
        for (const cookie of mainCookies) {
            if (!allCookies.find(c => c.name === cookie.name)) {
                allCookies.push(cookie);
            }
        }
        for (const tracker of mainTrackers) {
            if (!allTrackers.includes(tracker)) {
                allTrackers.push(tracker);
            }
        }

        // Get internal links - limit based on plan (Free: 5, Pro: 20, Pro+: 100)
        const maxExtraPages = isProPlus ? 99 : (isPro ? 19 : 4); // +1 for main page = 5, 20, or 100
        const allInternalLinks = extractInternalLinks(mainPage.html, baseUrl);

        // For deeper crawl, also get links from the first batch of pages
        const firstBatchLinks = allInternalLinks.slice(0, 5);
        const scannedUrls = new Set<string>([baseUrl.toString()]);

        // Parallel batch crawl function
        const crawlBatch = async (urls: string[]) => {
            const results = await Promise.all(
                urls.map(async (link) => {
                    if (scannedUrls.has(link)) return null;
                    scannedUrls.add(link);
                    return { link, result: await fetchPage(link) };
                })
            );
            return results.filter(r => r !== null && r.result !== null) as { link: string; result: NonNullable<Awaited<ReturnType<typeof fetchPage>>> }[];
        };

        // Process results helper
        const processPageResults = (results: { link: string; result: { html: string; cookies: string | null; headers: Headers } }[]) => {
            for (const { link, result: pageResult } of results) {
                combinedHtml += pageResult.html;
                const pageCookies = extractCookies(pageResult.html, pageResult.cookies);
                const pageTrackers = detectTrackers(pageResult.html);

                pages.push({
                    url: link,
                    title: extractTitle(pageResult.html),
                    cookiesFound: pageCookies.length,
                    trackersFound: pageTrackers,
                });

                for (const cookie of pageCookies) {
                    if (!allCookies.find(c => c.name === cookie.name)) {
                        allCookies.push(cookie);
                    }
                }
                for (const tracker of pageTrackers) {
                    if (!allTrackers.includes(tracker)) {
                        allTrackers.push(tracker);
                    }
                }

                // Collect more links from scanned pages
                const newLinks = extractInternalLinks(pageResult.html, baseUrl);
                for (const newLink of newLinks) {
                    if (!scannedUrls.has(newLink) && allInternalLinks.length < maxExtraPages * 2) {
                        allInternalLinks.push(newLink);
                    }
                }
            }
        };

        // Crawl in batches of 5 concurrent requests
        const batchSize = 5;
        let linksToProcess = allInternalLinks.slice(0, maxExtraPages);

        for (let i = 0; i < linksToProcess.length && pages.length < (isPro ? 100 : 20); i += batchSize) {
            const batch = linksToProcess.slice(i, i + batchSize);
            const results = await crawlBatch(batch);
            processPageResults(results);
        }

        const htmlLower = combinedHtml.toLowerCase();

        // Detect compliance elements
        const hasConsentBanner = CONSENT_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasPrivacyPolicy = PRIVACY_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasLegalMentions = LEGAL_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasDpoContact = DPO_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasDataDeleteLink = DELETE_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasSecureForms = htmlLower.includes('checkbox') && (htmlLower.includes('consent') || htmlLower.includes('agree'));
        const hasOptOutMechanism = OPT_OUT_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasAgeVerification = AGE_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));
        const hasCookiePolicy = COOKIE_POLICY_PATTERNS.some(p => htmlLower.includes(p.toLowerCase()));

        // Count undeclared cookies
        const undeclaredCookies = hasConsentBanner ?
            allCookies.filter(c => c.category === 'unknown').length :
            allCookies.length;

        // Determine regulations
        const regulations: string[] = ['GDPR'];
        if (domain.endsWith('.com') || domain.endsWith('.us')) regulations.push('CCPA');
        if (domain.endsWith('.br')) regulations.push('LGPD');
        if (domain.endsWith('.uk') || domain.endsWith('.co.uk')) regulations.push('UK GDPR');
        if (domain.endsWith('.ca')) regulations.push('PIPEDA');
        if (domain.endsWith('.de') || htmlLower.includes('datenschutz')) regulations.push('DSGVO');

        // Calculate score with breakdown
        let score = 100;
        const scoreBreakdown: { item: string; points: number; passed: boolean }[] = [];

        const deduct = (condition: boolean, item: string, points: number) => {
            scoreBreakdown.push({ item, points: condition ? 0 : -points, passed: condition });
            if (!condition) score -= points;
        };

        deduct(isHttps, 'HTTPS Enabled', 12);
        deduct(hasConsentBanner, 'Cookie Consent Banner', 15);
        deduct(hasPrivacyPolicy, 'Privacy Policy', 12);
        deduct(hasLegalMentions, 'Legal Mentions', 8);
        deduct(hasDpoContact, 'DPO Contact', 8);
        deduct(hasDataDeleteLink, 'Data Deletion Option', 8);
        deduct(hasSecureForms || !combinedHtml.includes('<form'), 'Secure Forms', 5);
        deduct(hasOptOutMechanism, 'Opt-out Mechanism', 8);
        deduct(hasCookiePolicy, 'Cookie Policy', 6);

        // Trackers penalty
        const trackerPenalty = Math.min(allTrackers.length * 2, 8);
        if (trackerPenalty > 0) {
            scoreBreakdown.push({ item: `Trackers (${allTrackers.length})`, points: -trackerPenalty, passed: false });
            score -= trackerPenalty;
        } else {
            scoreBreakdown.push({ item: 'No Trackers', points: 0, passed: true });
        }

        // Undeclared cookies penalty
        if (undeclaredCookies > 0) {
            const cookiePenalty = Math.min(undeclaredCookies, 5);
            scoreBreakdown.push({ item: `Undeclared Cookies (${undeclaredCookies})`, points: -cookiePenalty, passed: false });
            score -= cookiePenalty;
        }

        // P0 Security: Security headers score penalty (-10 max)
        const headersCount = Object.values(securityHeaders).filter(Boolean).length;
        const headersPenalty = Math.max(0, 10 - headersCount * 2);
        if (headersPenalty > 0) {
            scoreBreakdown.push({ item: `Security Headers (${headersCount}/6)`, points: -headersPenalty, passed: false });
            score -= headersPenalty;
        } else {
            scoreBreakdown.push({ item: 'Security Headers', points: 0, passed: true });
        }

        // P0 Security: Email security
        deduct(emailSecurity.spf, 'SPF Record', 3);
        deduct(emailSecurity.dmarc, 'DMARC Record', 3);

        // Email Exposure
        const exposedEmails = extractExposedEmails(combinedHtml);
        if (exposedEmails.length > 0) {
            const emailPenalty = Math.min(exposedEmails.length * 2, 10);
            scoreBreakdown.push({ item: `Exposed Emails (${exposedEmails.length})`, points: -emailPenalty, passed: false });
            score -= emailPenalty;
        }

        // External Resources
        const externalResources = extractExternalResources(combinedHtml, domain);

        // Vendor Risk Assessment
        const vendorRisksMap = new Map<string, ReturnType<typeof getVendorRisk>>();

        // Check all external scripts for vendor risks
        externalResources.scripts.forEach(script => {
            const risk = getVendorRisk(script.src);
            if (risk && !vendorRisksMap.has(risk.name)) {
                vendorRisksMap.set(risk.name, risk);
            }
        });

        // Check all trackers for vendor risks
        allTrackers.forEach(tracker => {
            const risk = getVendorRisk(tracker);
            if (risk && !vendorRisksMap.has(risk.name)) {
                vendorRisksMap.set(risk.name, risk);
            }
        });

        // Check iframes for vendor risks
        externalResources.iframes.forEach(iframe => {
            const risk = getVendorRisk(iframe.src);
            if (risk && !vendorRisksMap.has(risk.name)) {
                vendorRisksMap.set(risk.name, risk);
            }
        });

        // Check fonts for vendor risks
        externalResources.fonts.forEach(font => {
            const risk = getVendorRisk(font.src);
            if (risk && !vendorRisksMap.has(risk.name)) {
                vendorRisksMap.set(risk.name, risk);
            }
        });

        const vendorRisks = Array.from(vendorRisksMap.values())
            .filter((r): r is NonNullable<typeof r> => r !== null)
            .map(risk => ({
                name: risk.name,
                category: risk.category,
                riskScore: risk.riskScore,
                riskLevel: getRiskLabel(risk.riskScore),
                jurisdiction: risk.jurisdiction,
                dataTransfer: risk.dataTransfer,
                concerns: risk.concerns,
                gdprCompliant: risk.gdprCompliant,
            }))
            .sort((a, b) => b.riskScore - a.riskScore);

        // Vendor risk penalty (high-risk vendors)
        const highRiskVendors = vendorRisks.filter(v => v.riskScore >= 8);
        if (highRiskVendors.length > 0) {
            const vendorPenalty = Math.min(highRiskVendors.length * 3, 10);
            scoreBreakdown.push({ item: `High-Risk Vendors (${highRiskVendors.length})`, points: -vendorPenalty, passed: false });
            score -= vendorPenalty;
        }

        // Data Breaches check
        const dataBreaches = await checkDataBreaches(domain);
        if (dataBreaches.length > 0) {
            const breachPenalty = Math.min(dataBreaches.length * 5, 15);
            scoreBreakdown.push({ item: `Data Breaches (${dataBreaches.length})`, points: -breachPenalty, passed: false });
            score -= breachPenalty;
        }

        score = Math.max(0, Math.min(100, score));

        const result: AuditResult = {
            score,
            domain,
            pagesScanned: pages.length,
            pages,
            issues: {
                cookies: {
                    count: allCookies.length,
                    undeclared: undeclaredCookies,
                    list: allCookies,
                },
                consentBanner: hasConsentBanner,
                privacyPolicy: hasPrivacyPolicy,
                https: isHttps,
                trackers: allTrackers,
                legalMentions: hasLegalMentions,
                dpoContact: hasDpoContact,
                dataDeleteLink: hasDataDeleteLink,
                secureforms: hasSecureForms,
                optOutMechanism: hasOptOutMechanism,
                ageVerification: hasAgeVerification,
                cookiePolicy: hasCookiePolicy,
                // P0 Security modules
                ssl: sslInfo,
                securityHeaders,
                emailSecurity,
                // Email Exposure
                exposedEmails,
                // External Resources
                externalResources,
                // Social Trackers
                socialTrackers: detectSocialTrackers(combinedHtml),
                // Data Breaches
                dataBreaches,
                // Vendor Risk Assessment
                vendorRisks,
            },
            regulations,
            scoreBreakdown,
        };

        // Calculate Risk Prediction (GDPR Fine Estimation)
        const riskPrediction = calculateRiskPrediction({
            score: result.score,
            issues: {
                consentBanner: hasConsentBanner,
                privacyPolicy: hasPrivacyPolicy,
                https: isHttps,
                cookies: {
                    count: allCookies.length,
                    undeclared: undeclaredCookies,
                },
                trackers: allTrackers,
                legalMentions: hasLegalMentions,
                dpoContact: hasDpoContact,
                dataDeleteLink: hasDataDeleteLink,
                securityHeaders,
                vendorRisks: vendorRisks.map(v => ({ riskScore: v.riskScore, gdprCompliant: v.gdprCompliant })),
                dataBreaches: dataBreaches.map(b => ({ count: b.count })),
                exposedEmails,
            },
            companyIndicators: {
                hasEcommerce: combinedHtml.includes('cart') || combinedHtml.includes('checkout') || combinedHtml.includes('shop'),
                trafficEstimate: 'medium', // Default estimate
            },
        });

        result.riskPrediction = riskPrediction;

        return NextResponse.json(result);
    } catch (error) {
        console.error('Audit error:', error);
        return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
    }
}
