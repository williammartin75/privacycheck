/**
 * Supply Chain Security Audit - External Dependency Analysis
 * Scans for third-party scripts, CDNs, and supply-chain risks
 * For PrivacyChecker Pro/Pro+ users
 */

// ============ INTERFACES ============

export interface SupplyChainResult {
    score: number;
    totalDependencies: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    scripts: ExternalScript[];
    categories: DependencyCategory[];
    criticalDependencies: string[];
    unknownOrigins: number;
    cdnUsage: {
        count: number;
        providers: string[];
    };
    recommendations: string[];
}

export interface ExternalScript {
    url: string;
    domain: string;
    category: 'analytics' | 'advertising' | 'social' | 'payment' | 'cdn' | 'utility' | 'unknown';
    risk: 'low' | 'medium' | 'high' | 'critical';
    isCritical: boolean;
    provider: string | null;
}

export interface DependencyCategory {
    name: string;
    count: number;
    risk: 'low' | 'medium' | 'high';
}

// ============ KNOWN PROVIDERS DATABASE ============

const KNOWN_PROVIDERS: Record<string, { name: string; category: ExternalScript['category']; risk: ExternalScript['risk']; critical: boolean }> = {
    // Analytics
    'google-analytics.com': { name: 'Google Analytics', category: 'analytics', risk: 'low', critical: true },
    'googletagmanager.com': { name: 'Google Tag Manager', category: 'analytics', risk: 'low', critical: true },
    'analytics.google.com': { name: 'Google Analytics', category: 'analytics', risk: 'low', critical: true },
    'plausible.io': { name: 'Plausible', category: 'analytics', risk: 'low', critical: false },
    'cdn.segment.com': { name: 'Segment', category: 'analytics', risk: 'low', critical: true },
    'cdn.mxpnl.com': { name: 'Mixpanel', category: 'analytics', risk: 'low', critical: false },
    'static.hotjar.com': { name: 'Hotjar', category: 'analytics', risk: 'medium', critical: false },
    'clarity.ms': { name: 'Microsoft Clarity', category: 'analytics', risk: 'low', critical: false },
    'bat.bing.com': { name: 'Bing Ads', category: 'analytics', risk: 'low', critical: false },
    'matomo': { name: 'Matomo', category: 'analytics', risk: 'low', critical: false },

    // Advertising
    'googlesyndication.com': { name: 'Google Ads', category: 'advertising', risk: 'medium', critical: false },
    'doubleclick.net': { name: 'DoubleClick', category: 'advertising', risk: 'medium', critical: false },
    'googleadservices.com': { name: 'Google Ads', category: 'advertising', risk: 'medium', critical: false },
    'facebook.net': { name: 'Facebook Pixel', category: 'advertising', risk: 'medium', critical: false },
    'connect.facebook.net': { name: 'Facebook SDK', category: 'social', risk: 'medium', critical: false },
    'ads.linkedin.com': { name: 'LinkedIn Ads', category: 'advertising', risk: 'medium', critical: false },
    'snap.licdn.com': { name: 'LinkedIn Insight', category: 'advertising', risk: 'medium', critical: false },
    'ads.twitter.com': { name: 'Twitter Ads', category: 'advertising', risk: 'medium', critical: false },
    'static.ads-twitter.com': { name: 'Twitter Ads', category: 'advertising', risk: 'medium', critical: false },
    'tiktok.com': { name: 'TikTok Pixel', category: 'advertising', risk: 'high', critical: false },

    // Social
    'platform.twitter.com': { name: 'Twitter Widget', category: 'social', risk: 'low', critical: false },
    'platform.linkedin.com': { name: 'LinkedIn Widget', category: 'social', risk: 'low', critical: false },
    'apis.google.com': { name: 'Google APIs', category: 'social', risk: 'low', critical: false },

    // Payment (Critical!)
    'js.stripe.com': { name: 'Stripe', category: 'payment', risk: 'low', critical: true },
    'www.paypal.com': { name: 'PayPal', category: 'payment', risk: 'low', critical: true },
    'www.paypalobjects.com': { name: 'PayPal', category: 'payment', risk: 'low', critical: true },
    'js.braintreegateway.com': { name: 'Braintree', category: 'payment', risk: 'low', critical: true },
    'checkout.stripe.com': { name: 'Stripe Checkout', category: 'payment', risk: 'low', critical: true },
    'pay.google.com': { name: 'Google Pay', category: 'payment', risk: 'low', critical: true },
    'applepay.cdn-apple.com': { name: 'Apple Pay', category: 'payment', risk: 'low', critical: true },

    // CDNs (Trusted)
    'cdnjs.cloudflare.com': { name: 'cdnjs', category: 'cdn', risk: 'low', critical: false },
    'cdn.jsdelivr.net': { name: 'jsDelivr', category: 'cdn', risk: 'low', critical: false },
    'unpkg.com': { name: 'unpkg', category: 'cdn', risk: 'low', critical: false },
    'ajax.googleapis.com': { name: 'Google CDN', category: 'cdn', risk: 'low', critical: false },
    'code.jquery.com': { name: 'jQuery CDN', category: 'cdn', risk: 'low', critical: false },
    'stackpath.bootstrapcdn.com': { name: 'Bootstrap CDN', category: 'cdn', risk: 'low', critical: false },
    'cdn.tailwindcss.com': { name: 'Tailwind CDN', category: 'cdn', risk: 'low', critical: false },
    'fonts.googleapis.com': { name: 'Google Fonts', category: 'cdn', risk: 'low', critical: false },
    'fonts.gstatic.com': { name: 'Google Fonts', category: 'cdn', risk: 'low', critical: false },
    'translate.googleapis.com': { name: 'Google Translate', category: 'utility', risk: 'low', critical: false },
    'translate.google.com': { name: 'Google Translate', category: 'utility', risk: 'low', critical: false },
    'www.gstatic.com': { name: 'Google Static', category: 'cdn', risk: 'low', critical: false },
    'ssl.gstatic.com': { name: 'Google Static', category: 'cdn', risk: 'low', critical: false },

    // Utility / Chat / Support
    'widget.intercom.io': { name: 'Intercom', category: 'utility', risk: 'low', critical: false },
    'js.intercomcdn.com': { name: 'Intercom', category: 'utility', risk: 'low', critical: false },
    'embed.tawk.to': { name: 'Tawk.to', category: 'utility', risk: 'low', critical: false },
    'cdn.crisp.chat': { name: 'Crisp', category: 'utility', risk: 'low', critical: false },
    'js.hs-scripts.com': { name: 'HubSpot', category: 'utility', risk: 'low', critical: false },
    'js.hsforms.net': { name: 'HubSpot Forms', category: 'utility', risk: 'low', critical: false },
    'www.recaptcha.net': { name: 'reCAPTCHA', category: 'utility', risk: 'low', critical: true },
    'www.google.com/recaptcha': { name: 'reCAPTCHA', category: 'utility', risk: 'low', critical: true },
    'challenges.cloudflare.com': { name: 'Cloudflare Turnstile', category: 'utility', risk: 'low', critical: true },
    'hcaptcha.com': { name: 'hCaptcha', category: 'utility', risk: 'low', critical: true },
    'sentry.io': { name: 'Sentry', category: 'utility', risk: 'low', critical: false },
    'browser.sentry-cdn.com': { name: 'Sentry', category: 'utility', risk: 'low', critical: false },
};

// Known risky or deprecated services
const HIGH_RISK_PATTERNS = [
    'polyfill.io',  // Known supply chain attack
    'cdn.polyfill.io',
    'polyfill.min.js',
    'bootcss.com',  // Suspicious CDN
    'bootcdn.cn',
];

// ============ HELPER FUNCTIONS ============

function extractDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        // Handle relative URLs or malformed URLs
        const match = url.match(/(?:https?:\/\/)?([^\/]+)/);
        return match ? match[1] : url;
    }
}

function identifyProvider(domain: string): { name: string; category: ExternalScript['category']; risk: ExternalScript['risk']; critical: boolean } | null {
    // Check exact match
    if (KNOWN_PROVIDERS[domain]) {
        return KNOWN_PROVIDERS[domain];
    }

    // Check partial match
    for (const [key, value] of Object.entries(KNOWN_PROVIDERS)) {
        if (domain.includes(key) || key.includes(domain)) {
            return value;
        }
    }

    return null;
}

function isHighRisk(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return HIGH_RISK_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

// ============ MAIN ANALYSIS FUNCTION ============

export function analyzeSupplyChain(html: string, baseUrl: string): SupplyChainResult {
    const scripts: ExternalScript[] = [];
    const baseDomain = extractDomain(baseUrl);

    // Extract all script sources
    const scriptPattern = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;

    while ((match = scriptPattern.exec(html)) !== null) {
        const src = match[1];

        // Skip inline data URIs and relative paths without domain
        if (src.startsWith('data:') || src.startsWith('javascript:')) {
            continue;
        }

        // Resolve relative URLs
        let fullUrl = src;
        if (!src.startsWith('http')) {
            if (src.startsWith('//')) {
                fullUrl = 'https:' + src;
            } else if (src.startsWith('/')) {
                fullUrl = `https://${baseDomain}${src}`;
            } else {
                fullUrl = `https://${baseDomain}/${src}`;
            }
        }

        const domain = extractDomain(fullUrl);

        // Skip first-party scripts
        if (domain === baseDomain || domain.endsWith('.' + baseDomain)) {
            continue;
        }

        // Identify provider and risk
        const provider = identifyProvider(domain);
        const highRisk = isHighRisk(fullUrl);

        scripts.push({
            url: fullUrl,
            domain,
            category: provider?.category || 'unknown',
            risk: highRisk ? 'critical' : (provider?.risk || 'medium'),
            isCritical: provider?.critical || false,
            provider: provider?.name || null,
        });
    }

    // Also check for inline script imports (ES modules, dynamic imports)
    const importPattern = /import\s+.*?from\s+["']([^"']+)["']/g;
    while ((match = importPattern.exec(html)) !== null) {
        const src = match[1];
        if (src.startsWith('http')) {
            const domain = extractDomain(src);
            if (domain !== baseDomain) {
                const provider = identifyProvider(domain);
                scripts.push({
                    url: src,
                    domain,
                    category: provider?.category || 'unknown',
                    risk: provider?.risk || 'medium',
                    isCritical: provider?.critical || false,
                    provider: provider?.name || null,
                });
            }
        }
    }

    // Remove duplicates
    const uniqueScripts = scripts.filter((script, index, self) =>
        index === self.findIndex(s => s.url === script.url)
    );

    // Calculate category breakdown
    const categoryMap = new Map<string, { count: number; risk: 'low' | 'medium' | 'high' }>();
    for (const script of uniqueScripts) {
        const existing = categoryMap.get(script.category) || { count: 0, risk: 'low' };
        existing.count++;
        if (script.risk === 'high' || script.risk === 'critical') {
            existing.risk = 'high';
        } else if (script.risk === 'medium' && existing.risk === 'low') {
            existing.risk = 'medium';
        }
        categoryMap.set(script.category, existing);
    }

    const categories: DependencyCategory[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
        name,
        count: data.count,
        risk: data.risk,
    }));

    // Identify critical dependencies
    const criticalDependencies = uniqueScripts
        .filter(s => s.isCritical)
        .map(s => s.provider || s.domain);

    // Count unknown origins
    const unknownOrigins = uniqueScripts.filter(s => s.category === 'unknown').length;

    // CDN usage
    const cdnScripts = uniqueScripts.filter(s => s.category === 'cdn');
    const cdnProviders = [...new Set(cdnScripts.map(s => s.provider || s.domain))];

    // Calculate score
    let score = 100;

    // Penalties
    const criticalRiskScripts = uniqueScripts.filter(s => s.risk === 'critical').length;
    const highRiskScripts = uniqueScripts.filter(s => s.risk === 'high').length;
    const mediumRiskScripts = uniqueScripts.filter(s => s.risk === 'medium').length;

    score -= criticalRiskScripts * 20;  // Critical = major penalty
    score -= highRiskScripts * 8;
    score -= mediumRiskScripts * 2;
    score -= unknownOrigins * 5;  // Unknown origins are risky

    // Bonus for using trusted CDNs
    if (cdnScripts.length > 0 && unknownOrigins === 0) {
        score = Math.min(100, score + 5);
    }

    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalRiskScripts > 0) {
        riskLevel = 'critical';
    } else if (highRiskScripts > 0 || unknownOrigins >= 3) {
        riskLevel = 'high';
    } else if (mediumRiskScripts > 2 || unknownOrigins > 0) {
        riskLevel = 'medium';
    }

    // Generate recommendations
    const recommendations: string[] = [];

    if (criticalRiskScripts > 0) {
        recommendations.push('⚠️ CRITICAL: Remove compromised scripts immediately (e.g., polyfill.io)');
    }
    if (unknownOrigins > 0) {
        recommendations.push(`Review ${unknownOrigins} script(s) from unknown origins`);
    }
    if (highRiskScripts > 0) {
        recommendations.push('Consider replacing high-risk advertising scripts with privacy-friendly alternatives');
    }
    if (uniqueScripts.length > 15) {
        recommendations.push('Consider reducing the number of external dependencies to improve security and performance');
    }
    if (cdnScripts.length === 0 && uniqueScripts.length > 5) {
        recommendations.push('Consider using established CDNs for common libraries');
    }
    if (categories.find(c => c.name === 'payment')) {
        recommendations.push('Ensure payment scripts are loaded with Subresource Integrity (SRI)');
    }

    return {
        score,
        totalDependencies: uniqueScripts.length,
        riskLevel,
        scripts: uniqueScripts.sort((a, b) => {
            const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return riskOrder[a.risk] - riskOrder[b.risk];
        }),
        categories,
        criticalDependencies: [...new Set(criticalDependencies)],
        unknownOrigins,
        cdnUsage: {
            count: cdnScripts.length,
            providers: cdnProviders.filter((p): p is string => p !== null),
        },
        recommendations,
    };
}
