import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getVendorRisk, getRiskLabel, VendorRisk } from '@/lib/vendor-risk';
import { calculateRiskPrediction, RiskPrediction } from '@/lib/risk-predictor';
import { scanAttackSurface, AttackSurfaceResult } from '@/lib/attack-surface';
import { analyzeConsentBanner, ConsentBannerAnalysis } from '@/lib/consent-analysis';
import { analyzePrivacyPolicy, fetchAndAnalyzePolicy, PolicyAnalysisResult } from '@/lib/policy-analysis';
import { detectDarkPatterns, DarkPatternsResult } from '@/lib/dark-patterns';
import { analyzeOptInForms, OptInFormsResult } from '@/lib/optin-forms';
import { analyzeCookieLifespans, CookieLifespanResult } from '@/lib/cookie-lifespan';
import { detectFingerprinting, FingerprintingResult } from '@/lib/fingerprinting';
import { analyzeSecurityHeaders, SecurityHeadersResult } from '@/lib/security-headers';
import { analyzeStorageUsage, StorageAuditResult } from '@/lib/storage-audit';
import { detectMixedContent, MixedContentResult } from '@/lib/mixed-content';
import { analyzeFormSecurity, FormSecurityResult } from '@/lib/form-security';
import { analyzeAccessibility, AccessibilityResult } from '@/lib/accessibility-audit';
import { analyzeDomainRisk, DomainRiskResult } from '@/lib/domain-risk';
import { analyzeSupplyChain, SupplyChainResult } from '@/lib/supply-chain-audit';
import { analyzeHiddenCosts, HiddenCostsResult } from '@/lib/hidden-costs-audit';
import { analyzeEmailDeliverability, EmailDeliverabilityResult } from '@/lib/email-deliverability-audit';
import { analyzeAIUsage, AIUsageResult } from '@/lib/ai-usage-audit';
import { detectTechnologies, TechnologyResult } from '@/lib/technology-detection';

// ========== CONCURRENCY LIMITER ==========
// Prevents OOM crashes from too many parallel scans
const MAX_CONCURRENT_SCANS = 3;  // Max scans running at once
const MAX_QUEUE_SIZE = 10;       // Max scans waiting in queue
let activeScans = 0;
let queuedScans = 0;

async function acquireScanSlot(): Promise<boolean> {
    // If we have room, start immediately
    if (activeScans < MAX_CONCURRENT_SCANS) {
        activeScans++;
        console.log(`[QUEUE] Scan started. Active: ${activeScans}/${MAX_CONCURRENT_SCANS}, Queued: ${queuedScans}`);
        return true;
    }

    // If queue is full, reject
    if (queuedScans >= MAX_QUEUE_SIZE) {
        console.log(`[QUEUE] Rejected - queue full. Active: ${activeScans}, Queued: ${queuedScans}`);
        return false;
    }

    // Wait in queue
    queuedScans++;
    console.log(`[QUEUE] Scan queued. Active: ${activeScans}, Queued: ${queuedScans}`);

    // Poll every 2 seconds for up to 60 seconds
    const maxWait = 60000;
    const pollInterval = 2000;
    let waited = 0;

    while (waited < maxWait) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        waited += pollInterval;

        if (activeScans < MAX_CONCURRENT_SCANS) {
            queuedScans--;
            activeScans++;
            console.log(`[QUEUE] Scan started from queue. Active: ${activeScans}, Queued: ${queuedScans}`);
            return true;
        }
    }

    // Timeout - remove from queue
    queuedScans--;
    console.log(`[QUEUE] Timeout waiting in queue. Active: ${activeScans}, Queued: ${queuedScans}`);
    return false;
}

function releaseScanSlot(): void {
    activeScans = Math.max(0, activeScans - 1);
    console.log(`[QUEUE] Scan completed. Active: ${activeScans}, Queued: ${queuedScans}`);
}
// ========================================

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
        // Consent Behavior Analysis
        consentBehavior?: ConsentBannerAnalysis;
        // Privacy Policy AI Analysis
        policyAnalysis?: PolicyAnalysisResult;
        // Site-wide Dark Patterns Detection
        darkPatterns?: DarkPatternsResult;
        // Opt-in Forms Analysis
        optInForms?: OptInFormsResult;
        // Cookie Lifespan Analysis
        cookieLifespan?: CookieLifespanResult;
        // Fingerprinting Detection
        fingerprinting?: FingerprintingResult;
        // Security Headers (Extended)
        securityHeadersExtended?: SecurityHeadersResult;
        // Storage Audit (localStorage/sessionStorage)
        storageAudit?: StorageAuditResult;
        // Mixed Content Detection
        mixedContent?: MixedContentResult;
        // Form Security Scan
        formSecurity?: FormSecurityResult;
        // Accessibility Audit (EAA 2025)
        accessibility?: AccessibilityResult;
        // Domain Risk Monitor (Pro/Pro+)
        domainRisk?: DomainRiskResult;
        // Supply Chain Security (Pro/Pro+)
        supplyChain?: SupplyChainResult;
        // Hidden Costs Audit (Pro/Pro+)
        hiddenCosts?: HiddenCostsResult;
        // Email Deliverability Audit (Pro/Pro+)
        emailDeliverability?: EmailDeliverabilityResult;
        // AI Usage & Compliance Audit (Pro/Pro+)
        aiUsage?: AIUsageResult;
        // Technology Stack Detection (Security Light)
        technologyStack?: TechnologyResult;
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
    // Attack Surface Scanner results
    attackSurface?: AttackSurfaceResult;
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

// Email Exposure: Extract email addresses from HTML (excludes same-domain emails)
function extractExposedEmails(html: string, scannedDomain?: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailRegex) || [];

    // Normalize domain for comparison
    const domainBase = scannedDomain?.replace(/^www\./, '').toLowerCase();

    // Filter out common false positives and duplicates
    const filtered = [...new Set(matches)]
        .filter(email => {
            const lower = email.toLowerCase();
            // Skip same-domain emails (legitimate contact emails)
            if (domainBase && lower.endsWith(`@${domainBase}`)) return false;
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

    // Return all found links - the tier-based limit is applied in the crawl loop
    return links;
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

    // Detect cookies from known tracker patterns - only for names >= 4 chars to avoid false positives
    // Short names like 'fr' would match too many false positives in HTML
    for (const [cookieName, cookieInfo] of Object.entries(KNOWN_COOKIES)) {
        // Skip short cookie names - they cause false positives (e.g., 'fr' matches 'from', 'french', etc.)
        if (cookieName.length < 4) continue;

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
    // Try to get a scan slot (may wait in queue)
    const gotSlot = await acquireScanSlot();
    if (!gotSlot) {
        return NextResponse.json(
            { error: 'Server is busy. Please try again in a few moments.' },
            { status: 503 }
        );
    }

    try {
        // Authentication check - require logged-in user
        const { createClient } = await import('@/lib/supabase-server');
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required. Please log in to scan websites.' },
                { status: 401 }
            );
        }

        // Server-side scan rate limiting (single source of truth)
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const userTier = subscription?.tier || 'free';
        const scanLimits: Record<string, number> = { free: 10, pro: 50, pro_plus: 200 };
        const scanLimit = scanLimits[userTier] || 10;

        // Count scans this month from scan_history
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthlyScans, error: countError } = await supabase
            .from('scan_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString());

        if (!countError && (monthlyScans || 0) >= scanLimit) {
            const upgradeMsg = userTier === 'free'
                ? 'Upgrade to Pro for 50 scans/month!'
                : userTier === 'pro'
                    ? 'Upgrade to Pro+ for 200 scans/month!'
                    : 'Contact us for enterprise plans.';
            return NextResponse.json(
                { error: `You have reached your ${scanLimit} scans this month. ${upgradeMsg}` },
                { status: 429 }
            );
        }


        const { url, tier = 'free' } = await request.json();

        // Debug: Log tier information
        console.log(`[AUDIT] User: ${user.email}, Tier received: ${tier}, DB tier: ${userTier}`);

        // Tier-based helpers
        const isPro = tier === 'pro' || tier === 'pro_plus';
        const isProPlus = tier === 'pro_plus';

        console.log(`[AUDIT] isPro: ${isPro}, isProPlus: ${isProPlus}`);

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
        const MAX_COMBINED_HTML_SIZE = 5 * 1024 * 1024; // 5MB cap to prevent CPU saturation

        // Fetch page with 10 second timeout to prevent hanging on slow pages
        const fetchPage = async (pageUrl: string): Promise<{ html: string; cookies: string | null; headers: Headers } | null> => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

                const response = await fetch(pageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 PrivacyCheck/1.0',
                    },
                    redirect: 'follow',
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

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

        // Get internal links - limit based on plan (Free: 20, Pro: 100, Pro+: 200)
        const maxExtraPages = isProPlus ? 199 : (isPro ? 99 : 19); // +1 for main page = 20, 100, or 200
        const allInternalLinks = extractInternalLinks(mainPage.html, baseUrl);

        // For free users, truncate links immediately — no need to discover 174 links when only 19 will be crawled
        if (!isPro) {
            allInternalLinks.length = Math.min(allInternalLinks.length, maxExtraPages);
        }

        // Debug: Log link extraction results
        console.log(`[AUDIT] maxExtraPages: ${maxExtraPages}, internalLinksFound: ${allInternalLinks.length}`);

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
                // Only add to combinedHtml if under size cap (prevents 40MB+ regex operations)
                if (combinedHtml.length < MAX_COMBINED_HTML_SIZE) {
                    const remaining = MAX_COMBINED_HTML_SIZE - combinedHtml.length;
                    combinedHtml += pageResult.html.substring(0, remaining);
                }
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

                // Only discover deeper links for Pro/Pro+ users
                if (isPro) {
                    const newLinks = extractInternalLinks(pageResult.html, baseUrl);
                    for (const newLink of newLinks) {
                        if (!scannedUrls.has(newLink) && allInternalLinks.length < maxExtraPages * 2) {
                            allInternalLinks.push(newLink);
                        }
                    }
                }
            }
        };

        // Parallel crawl - fetch pages in batches
        // Limits match tier pricing: Free=20, Pro=100, Pro+=200
        const maxPages = isProPlus ? 200 : (isPro ? 100 : 20);
        const batchSize = isPro || isProPlus ? 10 : 20; // Free: all at once, Pro/Pro+: batches of 10
        let linkIndex = 0;

        // Process links as they are discovered (allInternalLinks grows during crawl for Pro/Pro+)
        while (linkIndex < allInternalLinks.length && pages.length < maxPages) {
            const remainingSlots = maxPages - pages.length;
            const batch = allInternalLinks.slice(linkIndex, linkIndex + Math.min(batchSize, remainingSlots));
            linkIndex += batch.length;

            if (batch.length === 0) break;

            const results = await crawlBatch(batch);
            processPageResults(results);

            // Yield the event loop between batches to prevent blocking other requests
            await new Promise(resolve => setTimeout(resolve, 10));
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

        // Count undeclared cookies (exclude 'necessary' cookies which are GDPR-exempt)
        const nonEssentialCookies = allCookies.filter(c => c.category !== 'necessary');
        const undeclaredCookies = hasConsentBanner ?
            nonEssentialCookies.filter(c => c.category === 'unknown').length :
            nonEssentialCookies.length;

        // Determine regulations
        const regulations: string[] = ['GDPR'];
        if (domain.endsWith('.com') || domain.endsWith('.us')) regulations.push('CCPA');
        if (domain.endsWith('.br')) regulations.push('LGPD');
        if (domain.endsWith('.uk') || domain.endsWith('.co.uk')) regulations.push('UK GDPR');
        if (domain.endsWith('.ca')) regulations.push('PIPEDA');
        if (domain.endsWith('.de') || htmlLower.includes('datenschutz')) regulations.push('DSGVO');

        // Consent Behavior Analysis
        const consentBehavior = analyzeConsentBanner(combinedHtml, mainPage.cookies);

        // Privacy Policy AI Analysis
        const policyBaseUrl = new URL(url);
        const policyAnalysis = analyzePrivacyPolicy(combinedHtml, null, policyBaseUrl);

        // Site-wide Dark Patterns Detection
        const darkPatterns = detectDarkPatterns(combinedHtml);

        // Opt-in Forms Analysis
        const optInForms = analyzeOptInForms(combinedHtml);

        // Cookie Lifespan Analysis
        const cookieLifespan = analyzeCookieLifespans(allCookies);

        // Fingerprinting Detection
        const fingerprinting = detectFingerprinting(combinedHtml);

        // Security Headers Extended Analysis - convert Headers to Record
        const responseHeaders: Record<string, string | undefined> = {};
        if (mainPage && mainPage.headers) {
            mainPage.headers.forEach((value, key) => {
                responseHeaders[key.toLowerCase()] = value;
            });
        }
        const securityHeadersExtended = analyzeSecurityHeaders(responseHeaders);

        // Storage Audit (localStorage/sessionStorage)
        const storageAudit = analyzeStorageUsage(combinedHtml);

        // Mixed Content Detection
        const mixedContent = detectMixedContent(combinedHtml, url);

        // Form Security Scan
        const formSecurity = analyzeFormSecurity(combinedHtml, url);

        // Accessibility Audit (EAA 2025 / WCAG 2.1 AA)
        const accessibility = analyzeAccessibility(combinedHtml);

        // Domain Risk Monitor (Pro/Pro+) - WHOIS, DNS, Typosquatting
        const domainRisk = await analyzeDomainRisk(domain);

        // Supply Chain Security (Pro/Pro+) - External Dependencies
        const supplyChain = analyzeSupplyChain(combinedHtml, url);

        // Hidden Costs Audit (Pro/Pro+) - SaaS Cost Estimation
        const hiddenCosts = analyzeHiddenCosts(supplyChain.scripts, allTrackers);

        // Email Deliverability Audit (Pro/Pro+) - SPF/DKIM/DMARC
        const emailDeliverability = await analyzeEmailDeliverability(domain);

        // AI Usage & Compliance Audit (Pro/Pro+) - EU AI Act
        const aiUsage = analyzeAIUsage(supplyChain.scripts, allTrackers);

        // Technology Stack Detection (Security Light) - CMS/Framework versions
        const technologyStack = detectTechnologies(combinedHtml, responseHeaders);

        // Calculate score with breakdown
        // Weights adjusted to sum to 100 with new consent behavior test
        let score = 100;
        const scoreBreakdown: { item: string; points: number; passed: boolean }[] = [];

        const deduct = (condition: boolean, item: string, points: number) => {
            scoreBreakdown.push({ item, points: condition ? 0 : -points, passed: condition });
            if (!condition) score -= points;
        };

        deduct(isHttps, 'HTTPS Enabled', 5);
        deduct(hasConsentBanner, 'Cookie Consent Banner', 4);
        deduct(hasPrivacyPolicy, 'Privacy Policy', 5);
        deduct(hasLegalMentions, 'Legal Mentions', 3);
        deduct(hasDpoContact, 'DPO Contact', 3);
        deduct(hasDataDeleteLink, 'Data Deletion Option', 3);
        deduct(hasSecureForms || !combinedHtml.includes('<form'), 'Secure Forms', 2);
        deduct(hasOptOutMechanism, 'Opt-out Mechanism', 3);
        deduct(hasCookiePolicy, 'Cookie Policy', 2);

        // Consent Behavior Test (new) - 7 points max (reduced from 10)
        const consentBehaviorPassed = consentBehavior.score >= 80;
        const consentBehaviorPenalty = consentBehaviorPassed ? 0 : Math.min(Math.floor((100 - consentBehavior.score) / 15), 7);
        if (consentBehaviorPenalty > 0) {
            scoreBreakdown.push({
                item: `Consent Behavior (${consentBehavior.issues.length} issues)`,
                points: -consentBehaviorPenalty,
                passed: false
            });
            score -= consentBehaviorPenalty;
        } else {
            scoreBreakdown.push({ item: 'Consent Behavior', points: 0, passed: true });
        }

        // Privacy Policy Analysis (new) - up to 5 points penalty (reduced from 8)
        const policyAnalysisPassed = policyAnalysis.overallScore >= 70;
        const policyAnalysisPenalty = policyAnalysisPassed ? 0 : Math.min(Math.floor((70 - policyAnalysis.overallScore) / 15), 5);
        if (policyAnalysisPenalty > 0) {
            scoreBreakdown.push({
                item: `Privacy Policy Quality (${policyAnalysis.missingElements.length} missing)`,
                points: -policyAnalysisPenalty,
                passed: false
            });
            score -= policyAnalysisPenalty;
        } else {
            scoreBreakdown.push({ item: 'Privacy Policy Quality', points: 0, passed: true });
        }

        // Dark Patterns Detection - reduced penalties, only flag clear violations
        // Minor patterns are often false positives from legitimate UI patterns
        const rawDarkPatternsPenalty = darkPatterns.detected
            ? Math.min(
                darkPatterns.bySeverity.critical * 4 +  // Reduced from 5
                darkPatterns.bySeverity.high * 2 +      // Reduced from 3
                darkPatterns.bySeverity.medium * 1 +    // Reduced from 2
                darkPatterns.bySeverity.low * 0,        // Low patterns don't count (often false positives)
                7  // Max penalty reduced from 10
            )
            : 0;
        // Only apply penalty if score is significant (>=3), ignore minor detections
        const darkPatternsPenalty = rawDarkPatternsPenalty >= 3 ? rawDarkPatternsPenalty : 0;
        if (darkPatternsPenalty > 0) {
            scoreBreakdown.push({
                item: `Dark Patterns (${darkPatterns.totalCount} detected)`,
                points: -darkPatternsPenalty,
                passed: false
            });
            score -= darkPatternsPenalty;
        } else {
            scoreBreakdown.push({ item: 'No Dark Patterns', points: 0, passed: true });
        }

        // Opt-in Forms penalty (new) - up to 10 points
        const optInPenalty = optInForms.totalIssues > 0
            ? Math.min(optInForms.preCheckedCount * 3 + optInForms.hiddenConsentCount * 2 + optInForms.bundledConsentCount * 1, 7)
            : 0;
        if (optInPenalty > 0) {
            scoreBreakdown.push({
                item: `Opt-in Issues (${optInForms.totalIssues} found)`,
                points: -optInPenalty,
                passed: false
            });
            score -= optInPenalty;
        } else {
            scoreBreakdown.push({ item: 'Opt-in Forms Compliant', points: 0, passed: true });
        }

        // Cookie Lifespan penalty - up to 8 points
        const cookieLifespanPenalty = Math.min(cookieLifespan.issuesCount * 2, 5);
        if (cookieLifespanPenalty > 0) {
            scoreBreakdown.push({
                item: `Cookie Lifespan Issues (${cookieLifespan.issuesCount})`,
                points: -cookieLifespanPenalty,
                passed: false
            });
            score -= cookieLifespanPenalty;
        } else {
            scoreBreakdown.push({ item: 'Cookie Lifespans Compliant', points: 0, passed: true });
        }

        // Fingerprinting penalty - up to 12 points (very serious)
        const fingerprintPenalty = fingerprinting.detected
            ? Math.min(fingerprinting.issues.filter(i => i.severity === 'critical').length * 5 +
                fingerprinting.issues.filter(i => i.severity === 'high').length * 3 +
                fingerprinting.issues.filter(i => i.severity === 'medium').length * 2, 12)
            : 0;
        if (fingerprintPenalty > 0) {
            scoreBreakdown.push({
                item: `Fingerprinting Detected (${fingerprinting.riskLevel} risk)`,
                points: -fingerprintPenalty,
                passed: false
            });
            score -= fingerprintPenalty;
        } else {
            scoreBreakdown.push({ item: 'No Fingerprinting', points: 0, passed: true });
        }

        // Security Headers Extended penalty - up to 7 points (reduced from 10)
        const secHeadersPenalty = Math.max(0, Math.min((100 - securityHeadersExtended.score) / 15, 7));
        if (secHeadersPenalty > 2) {
            scoreBreakdown.push({
                item: `Security Headers (${securityHeadersExtended.score}/100)`,
                points: -Math.round(secHeadersPenalty),
                passed: false
            });
            score -= Math.round(secHeadersPenalty);
        } else {
            scoreBreakdown.push({ item: `Security Headers (${securityHeadersExtended.score}/100)`, points: 0, passed: true });
        }

        // Storage Audit penalty - up to 4 points (reduced from 6)
        const storagePenalty = Math.min(storageAudit.issues.filter(i => i.risk === 'critical' || i.risk === 'high').length * 2, 4);
        if (storagePenalty > 0) {
            scoreBreakdown.push({
                item: `Storage Issues (${storageAudit.issues.length})`,
                points: -storagePenalty,
                passed: false
            });
            score -= storagePenalty;
        } else {
            scoreBreakdown.push({ item: 'Client Storage Compliant', points: 0, passed: true });
        }

        // Mixed Content penalty - up to 10 points (reduced from 15)
        const mixedContentPenalty = Math.min(mixedContent.blockedCount * 3 + mixedContent.warningCount * 1, 10);
        if (mixedContentPenalty > 0) {
            scoreBreakdown.push({
                item: `Mixed Content (${mixedContent.totalIssues} issues)`,
                points: -mixedContentPenalty,
                passed: false
            });
            score -= mixedContentPenalty;
        } else {
            scoreBreakdown.push({ item: 'No Mixed Content', points: 0, passed: true });
        }

        // Form Security penalty - up to 7 points (reduced from 10)
        const formPenalty = formSecurity.compliant ? 0 :
            Math.min(formSecurity.issues.filter(i => i.severity === 'critical').length * 3 +
                formSecurity.issues.filter(i => i.severity === 'high').length * 2, 7);
        if (formPenalty > 0) {
            scoreBreakdown.push({
                item: `Form Security Issues (${formSecurity.issuesCount})`,
                points: -formPenalty,
                passed: false
            });
            score -= formPenalty;
        } else {
            scoreBreakdown.push({ item: 'Forms Secure', points: 0, passed: true });
        }

        // Accessibility (EAA 2025) penalty - reduced for modern frameworks
        // Modern React/Next.js apps often trigger technical violations that don't affect real accessibility
        const accessibilityPenalty = Math.min(
            accessibility.criticalCount * 3 +   // Reduced from 5
            accessibility.seriousCount * 2 +    // Reduced from 3
            accessibility.moderateCount * 0.3,  // Reduced further
            7  // Max penalty reduced from 10
        );
        if (accessibilityPenalty > 0) {
            scoreBreakdown.push({
                item: `Accessibility Issues (${accessibility.totalIssues})`,
                points: -accessibilityPenalty,
                passed: false
            });
            score -= accessibilityPenalty;
        } else {
            scoreBreakdown.push({ item: 'Accessibility (EAA 2025)', points: 0, passed: true });
        }

        // Domain Risk penalty - up to 14 points (reduced from 20)
        let domainRiskPenalty = 0;
        // Expiry penalties
        if (domainRisk.domainExpiry.daysUntilExpiry !== null) {
            if (domainRisk.domainExpiry.daysUntilExpiry < 30) domainRiskPenalty += 7;
            else if (domainRisk.domainExpiry.daysUntilExpiry < 90) domainRiskPenalty += 3;
        }
        // Typosquatting penalties
        const highRiskTypos = domainRisk.typosquatting.domains.filter(d => d.risk === 'high').length;
        domainRiskPenalty += Math.min(highRiskTypos * 2, 7);
        domainRiskPenalty = Math.min(domainRiskPenalty, 14);

        if (domainRiskPenalty > 0) {
            scoreBreakdown.push({
                item: `Domain Risk (${domainRisk.overallRisk})`,
                points: -domainRiskPenalty,
                passed: false
            });
            score -= domainRiskPenalty;
        } else {
            scoreBreakdown.push({ item: 'Domain Security', points: 0, passed: true });
        }

        // Supply Chain penalty - up to 10 points (reduced from 15)
        let supplyChainPenalty = 0;
        // Critical dependencies get big penalties
        const criticalScripts = supplyChain.scripts.filter(s => s.risk === 'critical').length;
        const highRiskScripts = supplyChain.scripts.filter(s => s.risk === 'high').length;
        supplyChainPenalty += criticalScripts * 5;  // Critical like polyfill.io
        supplyChainPenalty += highRiskScripts * 2;
        supplyChainPenalty += supplyChain.unknownOrigins * 1;  // Unknown origins
        supplyChainPenalty = Math.min(supplyChainPenalty, 10);

        if (supplyChainPenalty > 0) {
            scoreBreakdown.push({
                item: `Supply Chain Risk (${supplyChain.riskLevel})`,
                points: -supplyChainPenalty,
                passed: false
            });
            score -= supplyChainPenalty;
        } else {
            scoreBreakdown.push({ item: 'Supply Chain Security', points: 0, passed: true });
        }

        // Hidden Costs penalty - up to 7 points (reduced from 10)
        let hiddenCostsPenalty = 0;
        hiddenCostsPenalty += hiddenCosts.redundancies.length * 2;  // Redundancy penalty
        if (hiddenCosts.potentialSavings > 100) hiddenCostsPenalty += 2;  // High savings opportunity
        if (hiddenCosts.performanceImpact.totalScriptSize > 500) hiddenCostsPenalty += 1; // Too many scripts
        hiddenCostsPenalty = Math.min(hiddenCostsPenalty, 7);

        if (hiddenCostsPenalty > 0) {
            scoreBreakdown.push({
                item: `Cost Inefficiency (€${hiddenCosts.potentialSavings}/mo savings)`,
                points: -hiddenCostsPenalty,
                passed: false
            });
            score -= hiddenCostsPenalty;
        } else {
            scoreBreakdown.push({ item: 'Cost Efficiency', points: 0, passed: true });
        }

        // Trackers penalty - reduced by 30%
        const trackerPenalty = Math.min(allTrackers.length * 1, 4);
        if (trackerPenalty > 0) {
            scoreBreakdown.push({ item: `Trackers (${allTrackers.length})`, points: -trackerPenalty, passed: false });
            score -= trackerPenalty;
        } else {
            scoreBreakdown.push({ item: 'No Trackers', points: 0, passed: true });
        }

        // Undeclared cookies penalty - up to 3 (reduced from 5)
        if (undeclaredCookies > 0) {
            const cookiePenalty = Math.min(undeclaredCookies, 3);
            scoreBreakdown.push({ item: `Undeclared Cookies (${undeclaredCookies})`, points: -cookiePenalty, passed: false });
            score -= cookiePenalty;
        }

        // Note: Security headers already handled above via securityHeadersExtended

        // Email Deliverability penalty - up to 7 points (reduced from 10)
        let emailPenalty = 0;
        if (!emailDeliverability.spf.exists) emailPenalty += 2;
        if (!emailDeliverability.dkim.exists) emailPenalty += 2;
        if (!emailDeliverability.dmarc.exists) emailPenalty += 2;
        else if (emailDeliverability.dmarc.policy === 'none') emailPenalty += 1;
        if (emailDeliverability.alerts.some(a => a.severity === 'critical')) emailPenalty += 1;
        emailPenalty = Math.min(emailPenalty, 7);

        if (emailPenalty > 0) {
            scoreBreakdown.push({
                item: `Email Deliverability (Grade ${emailDeliverability.grade})`,
                points: -emailPenalty,
                passed: false
            });
            score -= emailPenalty;
        } else {
            scoreBreakdown.push({ item: 'Email Deliverability', points: 0, passed: true });
        }

        // AI Usage & Compliance penalty - up to 7 points (reduced from 10)
        let aiPenalty = 0;
        if (aiUsage.riskBreakdown.highRisk > 0) aiPenalty += 3;
        if (aiUsage.alerts.some(a => a.severity === 'high')) aiPenalty += 2;
        if (aiUsage.systems.some(s => s.requiresDisclosure)) aiPenalty += 1;
        aiPenalty = Math.min(aiPenalty, 7);

        if (aiPenalty > 0) {
            scoreBreakdown.push({
                item: `AI Detection (${aiUsage.euAiActStatus})`,
                points: -aiPenalty,
                passed: false
            });
            score -= aiPenalty;
        } else if (aiUsage.aiSystemsDetected > 0) {
            scoreBreakdown.push({ item: 'AI Detection', points: 0, passed: true });
        }

        // Technology Stack Security penalty - up to 5 points (reduced from 8)
        let techPenalty = 0;
        if (technologyStack.cms?.isOutdated) {
            if (technologyStack.cms.securityRisk === 'critical') techPenalty += 3;
            else if (technologyStack.cms.securityRisk === 'high') techPenalty += 2;
            else techPenalty += 1;
        }
        if (technologyStack.alerts.some(a => a.severity === 'critical')) techPenalty += 2;
        techPenalty = Math.min(techPenalty, 5);

        if (techPenalty > 0) {
            scoreBreakdown.push({
                item: `Technology Security (${technologyStack.score}/100)`,
                points: -techPenalty,
                passed: false
            });
            score -= techPenalty;
        } else if (technologyStack.cms) {
            scoreBreakdown.push({ item: `Technology (${technologyStack.cms.name})`, points: 0, passed: true });
        }

        // Email Exposure (excludes same-domain contact emails)
        const exposedEmails = extractExposedEmails(combinedHtml, domain);
        if (exposedEmails.length > 0) {
            const emailPenalty = Math.min(exposedEmails.length * 1, 7);
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
                // Consent Behavior Analysis
                consentBehavior,
                // Privacy Policy AI Analysis
                policyAnalysis,
                // Site-wide Dark Patterns
                darkPatterns,
                // Opt-in Forms Analysis
                optInForms,
                // Cookie Lifespan Analysis
                cookieLifespan,
                // Fingerprinting Detection
                fingerprinting,
                // Security Headers Extended
                securityHeadersExtended,
                // Storage Audit
                storageAudit,
                // Mixed Content
                mixedContent,
                // Form Security
                formSecurity,
                // Accessibility Audit (EAA 2025)
                accessibility,
                // Domain Risk Monitor (Pro/Pro+)
                domainRisk,
                // Supply Chain Security (Pro/Pro+)
                supplyChain,
                // Hidden Costs Audit (Pro/Pro+)
                hiddenCosts,
                // Email Deliverability Audit (Pro/Pro+)
                emailDeliverability,
                // AI Usage & Compliance Audit (Pro/Pro+)
                aiUsage,
                // Technology Stack Detection (Security Light)
                technologyStack,
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

        // Run Attack Surface Scanner
        try {
            const attackSurface = await scanAttackSurface(url, combinedHtml);
            result.attackSurface = attackSurface;
        } catch (attackError) {
            console.error('Attack surface scan error:', attackError);
        }

        // Add debug info to response (temporary)
        (result as unknown as Record<string, unknown>)._debug = {
            receivedTier: tier,
            isPro,
            isProPlus,
            maxExtraPages: isProPlus ? 999 : (isPro ? 199 : 19),
            pagesScanned: pages.length,
            internalLinksFound: allInternalLinks?.length || 0
        };

        // Log scan to scan_history for rate limiting and analytics
        // Use service client to bypass RLS policies
        try {
            const serviceClient = createServiceClient();
            const { error: insertError } = await serviceClient.from('scan_history').insert({
                user_id: user.id,
                user_email: user.email,
                url: url,
                tier: tier,
                scan_type: 'manual',
                pages_scanned: pages.length,
                score: Math.round(result.score),
            });
            if (insertError) {
                console.error('[AUDIT] scan_history insert failed:', insertError.message, insertError.details);
            } else {
                console.log('[AUDIT] scan_history logged successfully for', user.email);
            }
        } catch (logError) {
            console.error('[AUDIT] scan_history insert threw:', logError instanceof Error ? logError.message : logError);
        }

        const jsonResult = JSON.stringify(result);
        console.log(`[AUDIT] Response size: ${jsonResult.length} bytes for ${url}`);
        return new NextResponse(jsonResult, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Audit error:', errorMessage);
        console.error('Stack trace:', errorStack);
        return NextResponse.json({
            error: 'Audit failed',
            details: errorMessage,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    } finally {
        // Always release the scan slot
        releaseScanSlot();
    }
}
