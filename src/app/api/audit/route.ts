import { NextRequest, NextResponse } from 'next/server';

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
    };
    regulations: string[];
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
        const { url } = await request.json();

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
        const fetchPage = async (pageUrl: string): Promise<{ html: string; cookies: string | null } | null> => {
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

        // Get internal links and scan additional pages (max 4 more)
        const internalLinks = extractInternalLinks(mainPage.html, baseUrl).slice(0, 4);

        for (const link of internalLinks) {
            const pageResult = await fetchPage(link);
            if (pageResult) {
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
            }
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

        // Calculate score
        let score = 100;
        if (!isHttps) score -= 12;
        if (!hasConsentBanner) score -= 15;
        if (!hasPrivacyPolicy) score -= 12;
        if (!hasLegalMentions) score -= 8;
        if (!hasDpoContact) score -= 8;
        if (!hasDataDeleteLink) score -= 8;
        if (!hasSecureForms && combinedHtml.includes('<form')) score -= 5;
        if (!hasOptOutMechanism) score -= 8;
        if (!hasCookiePolicy) score -= 6;
        score -= Math.min(allTrackers.length * 2, 8);
        score -= Math.min(undeclaredCookies, 5);
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
            },
            regulations,
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error('Audit error:', error);
        return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
    }
}
