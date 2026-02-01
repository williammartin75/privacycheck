/**
 * Hidden Costs Audit - SaaS & Script Cost Estimation
 * Analyzes external services to estimate monthly costs and identify savings
 * For PrivacyChecker Pro/Pro+ users
 */

// ============ INTERFACES ============

export interface HiddenCostsResult {
    score: number;
    estimatedMonthlyCost: number;
    currency: string;
    services: DetectedService[];
    redundancies: Redundancy[];
    performanceImpact: PerformanceImpact;
    potentialSavings: number;
    recommendations: CostRecommendation[];
    breakdown: CostBreakdown;
}

export interface DetectedService {
    name: string;
    category: 'analytics' | 'advertising' | 'chat' | 'crm' | 'payment' | 'monitoring' | 'cdn' | 'other';
    estimatedCost: number;
    pricingTier: 'free' | 'starter' | 'pro' | 'enterprise' | 'usage-based';
    isEssential: boolean;
    domain: string;
}

export interface Redundancy {
    category: string;
    services: string[];
    wastedCost: number;
    recommendation: string;
}

export interface PerformanceImpact {
    totalScriptSize: number; // in KB
    estimatedLoadTime: number; // in seconds
    blockingScripts: number;
    costPerSecond: number; // SEO/conversion cost
}

export interface CostRecommendation {
    type: 'remove' | 'consolidate' | 'downgrade' | 'optimize';
    description: string;
    savings: number;
    priority: 'high' | 'medium' | 'low';
}

export interface CostBreakdown {
    analytics: number;
    advertising: number;
    chat: number;
    monitoring: number;
    other: number;
}

// ============ SAAS PRICING DATABASE ============
// Prices are estimated monthly costs for typical usage

const SAAS_PRICING: Record<string, {
    name: string;
    category: DetectedService['category'];
    price: number;
    tier: DetectedService['pricingTier'];
    essential: boolean;
}> = {
    // Analytics
    'google-analytics.com': { name: 'Google Analytics', category: 'analytics', price: 0, tier: 'free', essential: true },
    'analytics.google.com': { name: 'Google Analytics', category: 'analytics', price: 0, tier: 'free', essential: true },
    'googletagmanager.com': { name: 'Google Tag Manager', category: 'analytics', price: 0, tier: 'free', essential: true },
    'plausible.io': { name: 'Plausible Analytics', category: 'analytics', price: 9, tier: 'starter', essential: false },
    'static.hotjar.com': { name: 'Hotjar', category: 'analytics', price: 31, tier: 'starter', essential: false },
    'clarity.ms': { name: 'Microsoft Clarity', category: 'analytics', price: 0, tier: 'free', essential: false },
    'cdn.mxpnl.com': { name: 'Mixpanel', category: 'analytics', price: 25, tier: 'starter', essential: false },
    'cdn.segment.com': { name: 'Segment', category: 'analytics', price: 120, tier: 'pro', essential: false },
    'cdn.amplitude.com': { name: 'Amplitude', category: 'analytics', price: 49, tier: 'starter', essential: false },
    'js.heap-analytics.com': { name: 'Heap', category: 'analytics', price: 0, tier: 'free', essential: false },
    'cdn.usefathom.com': { name: 'Fathom Analytics', category: 'analytics', price: 14, tier: 'starter', essential: false },
    'script.crazyegg.com': { name: 'Crazy Egg', category: 'analytics', price: 24, tier: 'starter', essential: false },
    'js.hs-analytics.net': { name: 'HubSpot Analytics', category: 'analytics', price: 0, tier: 'free', essential: false },

    // Advertising / Marketing
    'connect.facebook.net': { name: 'Facebook Pixel', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'snap.licdn.com': { name: 'LinkedIn Insight', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'static.ads-twitter.com': { name: 'Twitter Pixel', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'analytics.tiktok.com': { name: 'TikTok Pixel', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'googleadservices.com': { name: 'Google Ads', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'googlesyndication.com': { name: 'Google AdSense', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'doubleclick.net': { name: 'DoubleClick', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'bat.bing.com': { name: 'Microsoft Ads', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'ct.pinterest.com': { name: 'Pinterest Tag', category: 'advertising', price: 0, tier: 'usage-based', essential: false },
    'js.hubspot.com': { name: 'HubSpot Marketing', category: 'advertising', price: 45, tier: 'starter', essential: false },
    'munchkin.marketo.net': { name: 'Marketo', category: 'advertising', price: 895, tier: 'enterprise', essential: false },
    'js.leadin.com': { name: 'HubSpot Lead Flows', category: 'advertising', price: 0, tier: 'free', essential: false },

    // Chat / Support
    'widget.intercom.io': { name: 'Intercom', category: 'chat', price: 74, tier: 'starter', essential: false },
    'js.intercomcdn.com': { name: 'Intercom', category: 'chat', price: 74, tier: 'starter', essential: false },
    'embed.tawk.to': { name: 'Tawk.to', category: 'chat', price: 0, tier: 'free', essential: false },
    'cdn.crisp.chat': { name: 'Crisp', category: 'chat', price: 25, tier: 'starter', essential: false },
    'widget.drift.com': { name: 'Drift', category: 'chat', price: 50, tier: 'starter', essential: false },
    'js.driftt.com': { name: 'Drift', category: 'chat', price: 50, tier: 'starter', essential: false },
    'static.zdassets.com': { name: 'Zendesk Chat', category: 'chat', price: 19, tier: 'starter', essential: false },
    'wchat.freshchat.com': { name: 'Freshchat', category: 'chat', price: 15, tier: 'starter', essential: false },
    'js.hs-scripts.com': { name: 'HubSpot Chat', category: 'chat', price: 0, tier: 'free', essential: false },
    'cdn.livechatinc.com': { name: 'LiveChat', category: 'chat', price: 20, tier: 'starter', essential: false },

    // CRM / Forms
    'js.hsforms.net': { name: 'HubSpot Forms', category: 'crm', price: 0, tier: 'free', essential: false },
    'static.mailchimp.com': { name: 'Mailchimp', category: 'crm', price: 13, tier: 'starter', essential: false },
    'js.convertflow.co': { name: 'ConvertFlow', category: 'crm', price: 29, tier: 'starter', essential: false },
    'static.klaviyo.com': { name: 'Klaviyo', category: 'crm', price: 20, tier: 'starter', essential: false },
    'cdn.mouseflow.com': { name: 'Mouseflow', category: 'analytics', price: 31, tier: 'starter', essential: false },

    // Payment (Essential)
    'js.stripe.com': { name: 'Stripe', category: 'payment', price: 0, tier: 'usage-based', essential: true },
    'www.paypalobjects.com': { name: 'PayPal', category: 'payment', price: 0, tier: 'usage-based', essential: true },
    'pay.google.com': { name: 'Google Pay', category: 'payment', price: 0, tier: 'usage-based', essential: true },

    // Monitoring / Error Tracking
    'browser.sentry-cdn.com': { name: 'Sentry', category: 'monitoring', price: 26, tier: 'starter', essential: false },
    'js.sentry-cdn.com': { name: 'Sentry', category: 'monitoring', price: 26, tier: 'starter', essential: false },
    'd37gvrvc0wt4s1.cloudfront.net': { name: 'LogRocket', category: 'monitoring', price: 99, tier: 'starter', essential: false },
    'cdn.logrocket.io': { name: 'LogRocket', category: 'monitoring', price: 99, tier: 'starter', essential: false },
    'cdn.bugsnag.com': { name: 'Bugsnag', category: 'monitoring', price: 47, tier: 'starter', essential: false },
    'rum.browser-intake-datadoghq.com': { name: 'Datadog RUM', category: 'monitoring', price: 35, tier: 'starter', essential: false },
    'js.nr-data.net': { name: 'New Relic', category: 'monitoring', price: 49, tier: 'starter', essential: false },
    'cdn.rollbar.com': { name: 'Rollbar', category: 'monitoring', price: 25, tier: 'starter', essential: false },
    'cdn.trackjs.com': { name: 'TrackJS', category: 'monitoring', price: 29, tier: 'starter', essential: false },

    // CDN (Usually free or included)
    'cdnjs.cloudflare.com': { name: 'cdnjs', category: 'cdn', price: 0, tier: 'free', essential: true },
    'cdn.jsdelivr.net': { name: 'jsDelivr', category: 'cdn', price: 0, tier: 'free', essential: true },
    'unpkg.com': { name: 'unpkg', category: 'cdn', price: 0, tier: 'free', essential: true },
    'ajax.googleapis.com': { name: 'Google CDN', category: 'cdn', price: 0, tier: 'free', essential: true },

    // Other SaaS
    'www.recaptcha.net': { name: 'reCAPTCHA', category: 'other', price: 0, tier: 'free', essential: true },
    'challenges.cloudflare.com': { name: 'Cloudflare Turnstile', category: 'other', price: 0, tier: 'free', essential: true },
    'js.hcaptcha.com': { name: 'hCaptcha', category: 'other', price: 0, tier: 'free', essential: true },
    'cdn.cookielaw.org': { name: 'OneTrust', category: 'other', price: 299, tier: 'pro', essential: false },
    'cdn.iubenda.com': { name: 'Iubenda', category: 'other', price: 27, tier: 'starter', essential: false },
    'cdn.cookiebot.com': { name: 'Cookiebot', category: 'other', price: 12, tier: 'starter', essential: false },
    'consent.cookiefirst.com': { name: 'CookieFirst', category: 'other', price: 49, tier: 'starter', essential: false },
    'cdn.onesignal.com': { name: 'OneSignal', category: 'other', price: 9, tier: 'starter', essential: false },
    'cdn.pushengage.com': { name: 'PushEngage', category: 'other', price: 9, tier: 'starter', essential: false },
};

// ============ HELPER FUNCTIONS ============

function extractDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        const match = url.match(/(?:https?:\/\/)?([^\/]+)/);
        return match ? match[1] : url;
    }
}

function findServiceByDomain(domain: string): typeof SAAS_PRICING[string] | null {
    // Exact match
    if (SAAS_PRICING[domain]) {
        return SAAS_PRICING[domain];
    }

    // Partial match
    for (const [key, value] of Object.entries(SAAS_PRICING)) {
        if (domain.includes(key) || key.includes(domain.replace('www.', ''))) {
            return value;
        }
    }

    return null;
}

function estimateScriptSize(url: string): number {
    // Rough estimates based on common scripts (in KB)
    const sizeEstimates: Record<string, number> = {
        'gtm': 80,
        'analytics': 50,
        'facebook': 60,
        'intercom': 200,
        'hotjar': 100,
        'crisp': 150,
        'stripe': 40,
        'sentry': 70,
        'segment': 90,
    };

    for (const [key, size] of Object.entries(sizeEstimates)) {
        if (url.toLowerCase().includes(key)) {
            return size;
        }
    }

    return 30; // Default estimate
}

// ============ MAIN ANALYSIS FUNCTION ============

export function analyzeHiddenCosts(
    scripts: { url: string; domain: string; category: string; provider: string | null }[],
    trackers: string[]
): HiddenCostsResult {
    const services: DetectedService[] = [];
    const seenServices = new Set<string>();

    // Analyze external scripts
    for (const script of scripts) {
        const service = findServiceByDomain(script.domain);

        if (service && !seenServices.has(service.name)) {
            seenServices.add(service.name);
            services.push({
                name: service.name,
                category: service.category,
                estimatedCost: service.price,
                pricingTier: service.tier,
                isEssential: service.essential,
                domain: script.domain,
            });
        }
    }

    // Calculate total estimated cost
    const estimatedMonthlyCost = services.reduce((sum, s) => sum + s.estimatedCost, 0);

    // Detect redundancies
    const redundancies: Redundancy[] = [];
    const categoryGroups: Record<string, DetectedService[]> = {};

    for (const service of services) {
        if (!categoryGroups[service.category]) {
            categoryGroups[service.category] = [];
        }
        categoryGroups[service.category].push(service);
    }

    // Check for analytics redundancy
    const analyticsServices = categoryGroups['analytics'] || [];
    if (analyticsServices.length > 1) {
        const wastedCost = analyticsServices
            .slice(1)
            .reduce((sum, s) => sum + s.estimatedCost, 0);
        redundancies.push({
            category: 'Analytics',
            services: analyticsServices.map(s => s.name),
            wastedCost,
            recommendation: `Keep only 1 analytics tool. Consider: ${analyticsServices[0].name}`,
        });
    }

    // Check for chat redundancy
    const chatServices = categoryGroups['chat'] || [];
    if (chatServices.length > 1) {
        const wastedCost = chatServices
            .slice(1)
            .reduce((sum, s) => sum + s.estimatedCost, 0);
        redundancies.push({
            category: 'Chat/Support',
            services: chatServices.map(s => s.name),
            wastedCost,
            recommendation: `Multiple chat widgets detected. Keep only 1.`,
        });
    }

    // Check for monitoring redundancy
    const monitoringServices = categoryGroups['monitoring'] || [];
    if (monitoringServices.length > 1) {
        const wastedCost = monitoringServices
            .slice(1)
            .reduce((sum, s) => sum + s.estimatedCost, 0);
        redundancies.push({
            category: 'Error Monitoring',
            services: monitoringServices.map(s => s.name),
            wastedCost,
            recommendation: `Consolidate error tracking into 1 tool.`,
        });
    }

    // Calculate performance impact
    let totalScriptSize = 0;
    for (const script of scripts) {
        totalScriptSize += estimateScriptSize(script.url);
    }

    const estimatedLoadTime = Math.round((totalScriptSize / 100) * 10) / 10; // Rough: 1s per 100KB
    const blockingScripts = scripts.filter(s =>
        s.domain.includes('facebook') ||
        s.domain.includes('tiktok') ||
        s.domain.includes('linkedin')
    ).length;

    // SEO impact: ~7% conversion loss per second of delay
    const costPerSecond = estimatedLoadTime > 2 ? Math.round((estimatedLoadTime - 2) * 50) : 0;

    const performanceImpact: PerformanceImpact = {
        totalScriptSize,
        estimatedLoadTime,
        blockingScripts,
        costPerSecond,
    };

    // Calculate potential savings
    const redundancySavings = redundancies.reduce((sum, r) => sum + r.wastedCost, 0);
    const nonEssentialSavings = services
        .filter(s => !s.isEssential && s.estimatedCost > 20)
        .reduce((sum, s) => Math.round(sum + s.estimatedCost * 0.3), 0); // 30% potential savings

    const potentialSavings = redundancySavings + nonEssentialSavings;

    // Generate recommendations
    const recommendations: CostRecommendation[] = [];

    if (redundancies.length > 0) {
        for (const r of redundancies) {
            recommendations.push({
                type: 'consolidate',
                description: r.recommendation,
                savings: r.wastedCost,
                priority: r.wastedCost > 50 ? 'high' : 'medium',
            });
        }
    }

    // Suggest removing expensive non-essential services
    for (const service of services) {
        if (!service.isEssential && service.estimatedCost >= 50) {
            recommendations.push({
                type: 'remove',
                description: `Consider if ${service.name} (€${service.estimatedCost}/mo) is necessary`,
                savings: service.estimatedCost,
                priority: service.estimatedCost >= 100 ? 'high' : 'medium',
            });
        }
    }

    // Performance recommendations
    if (performanceImpact.totalScriptSize > 500) {
        recommendations.push({
            type: 'optimize',
            description: `Too many scripts (${Math.round(performanceImpact.totalScriptSize)}KB). Page load time affected.`,
            savings: performanceImpact.costPerSecond * 12, // Annualized SEO impact
            priority: 'high',
        });
    }

    if (blockingScripts > 2) {
        recommendations.push({
            type: 'optimize',
            description: `${blockingScripts} blocking ad scripts detected. Consider lazy loading.`,
            savings: 0,
            priority: 'medium',
        });
    }

    // Calculate breakdown
    const breakdown: CostBreakdown = {
        analytics: (categoryGroups['analytics'] || []).reduce((s, svc) => s + svc.estimatedCost, 0),
        advertising: (categoryGroups['advertising'] || []).reduce((s, svc) => s + svc.estimatedCost, 0),
        chat: (categoryGroups['chat'] || []).reduce((s, svc) => s + svc.estimatedCost, 0),
        monitoring: (categoryGroups['monitoring'] || []).reduce((s, svc) => s + svc.estimatedCost, 0),
        other: services
            .filter(s => !['analytics', 'advertising', 'chat', 'monitoring'].includes(s.category))
            .reduce((s, svc) => s + svc.estimatedCost, 0),
    };

    // Calculate score (100 = no waste, 0 = extremely wasteful)
    let score = 100;

    // Penalties
    score -= redundancies.length * 15; // Redundancy penalty
    score -= Math.min(services.filter(s => !s.isEssential && s.estimatedCost > 30).length * 5, 20); // Expensive tools
    score -= Math.min(Math.floor(performanceImpact.totalScriptSize / 200) * 5, 15); // Performance penalty

    // Bonus for using free tools
    const freeToolRatio = services.filter(s => s.pricingTier === 'free').length / Math.max(services.length, 1);
    score += Math.round(freeToolRatio * 10);

    score = Math.max(0, Math.min(100, score));

    return {
        score,
        estimatedMonthlyCost,
        currency: '€',
        services,
        redundancies,
        performanceImpact,
        potentialSavings,
        recommendations: recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }).slice(0, 5), // Top 5 recommendations
        breakdown,
    };
}
