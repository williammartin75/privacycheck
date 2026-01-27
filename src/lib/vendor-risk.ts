// Vendor Privacy Risk Database
// Score: 1 (low risk) to 10 (high risk)
// Based on: Data transfer jurisdiction, data retention, transparency, past incidents

export interface VendorRisk {
    name: string;
    category: 'analytics' | 'advertising' | 'social' | 'cdn' | 'payment' | 'other';
    riskScore: number; // 1-10
    jurisdiction: string;
    dataTransfer: 'EU' | 'US' | 'CN' | 'Other';
    concerns: string[];
    gdprCompliant: boolean;
    privacyPolicyUrl: string;
}

export const vendorRiskDatabase: Record<string, VendorRisk> = {
    // === ANALYTICS ===
    'google-analytics': {
        name: 'Google Analytics',
        category: 'analytics',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Third-party sharing', 'Long retention'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'google-tag-manager': {
        name: 'Google Tag Manager',
        category: 'analytics',
        riskScore: 4,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Indirect data collection'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'hotjar': {
        name: 'Hotjar',
        category: 'analytics',
        riskScore: 4,
        jurisdiction: 'Malta (EU)',
        dataTransfer: 'EU',
        concerns: ['Session recording', 'Behavior tracking'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.hotjar.com/privacy/',
    },
    'mixpanel': {
        name: 'Mixpanel',
        category: 'analytics',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'User profiling'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://mixpanel.com/legal/privacy-policy/',
    },
    'amplitude': {
        name: 'Amplitude',
        category: 'analytics',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Behavioral analytics'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://amplitude.com/privacy',
    },
    'segment': {
        name: 'Segment',
        category: 'analytics',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Data broker', 'Third-party sharing'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://segment.com/legal/privacy/',
    },
    'clarity': {
        name: 'Microsoft Clarity',
        category: 'analytics',
        riskScore: 4,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Session recording'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://privacy.microsoft.com/',
    },
    'heap': {
        name: 'Heap Analytics',
        category: 'analytics',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Auto-capture all events'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://heap.io/privacy',
    },
    'plausible': {
        name: 'Plausible Analytics',
        category: 'analytics',
        riskScore: 1,
        jurisdiction: 'Estonia (EU)',
        dataTransfer: 'EU',
        concerns: [],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://plausible.io/privacy',
    },
    'matomo': {
        name: 'Matomo',
        category: 'analytics',
        riskScore: 1,
        jurisdiction: 'Self-hosted / EU',
        dataTransfer: 'EU',
        concerns: [],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://matomo.org/privacy/',
    },
    'fathom': {
        name: 'Fathom Analytics',
        category: 'analytics',
        riskScore: 1,
        jurisdiction: 'Canada',
        dataTransfer: 'EU',
        concerns: [],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://usefathom.com/privacy',
    },

    // === ADVERTISING ===
    'google-ads': {
        name: 'Google Ads',
        category: 'advertising',
        riskScore: 7,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Cross-site tracking', 'Profiling', 'Third-party sharing'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'facebook-pixel': {
        name: 'Facebook/Meta Pixel',
        category: 'advertising',
        riskScore: 8,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Cross-site tracking', 'Shadow profiles', 'Past data breaches'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.facebook.com/privacy/policy/',
    },
    'tiktok-pixel': {
        name: 'TikTok Pixel',
        category: 'advertising',
        riskScore: 9,
        jurisdiction: 'China/Singapore',
        dataTransfer: 'CN',
        concerns: ['Chinese jurisdiction', 'Government access concerns', 'Opaque data practices', 'Cross-site tracking'],
        gdprCompliant: false,
        privacyPolicyUrl: 'https://www.tiktok.com/legal/privacy-policy',
    },
    'linkedin-insight': {
        name: 'LinkedIn Insight Tag',
        category: 'advertising',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Professional profiling', 'Microsoft ownership'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.linkedin.com/legal/privacy-policy',
    },
    'twitter-pixel': {
        name: 'Twitter/X Pixel',
        category: 'advertising',
        riskScore: 7,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Cross-site tracking', 'Uncertain data governance'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://twitter.com/en/privacy',
    },
    'pinterest-tag': {
        name: 'Pinterest Tag',
        category: 'advertising',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Interest profiling'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policy.pinterest.com/privacy-policy',
    },
    'snapchat-pixel': {
        name: 'Snapchat Pixel',
        category: 'advertising',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Audience targeting'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://snap.com/en-US/privacy/privacy-policy',
    },
    'criteo': {
        name: 'Criteo',
        category: 'advertising',
        riskScore: 7,
        jurisdiction: 'France (EU)',
        dataTransfer: 'EU',
        concerns: ['Retargeting', 'Cross-site tracking', 'Extensive profiling'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.criteo.com/privacy/',
    },
    'taboola': {
        name: 'Taboola',
        category: 'advertising',
        riskScore: 7,
        jurisdiction: 'Israel',
        dataTransfer: 'Other',
        concerns: ['Content recommendation profiling', 'Cross-site tracking'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.taboola.com/policies/privacy-policy',
    },
    'outbrain': {
        name: 'Outbrain',
        category: 'advertising',
        riskScore: 7,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Content recommendation profiling'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.outbrain.com/privacy/',
    },
    'hubspot': {
        name: 'HubSpot',
        category: 'advertising',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'CRM tracking', 'Email tracking'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://legal.hubspot.com/privacy-policy',
    },

    // === SOCIAL ===
    'facebook-sdk': {
        name: 'Facebook SDK',
        category: 'social',
        riskScore: 8,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Social graph access', 'Past data breaches'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.facebook.com/privacy/policy/',
    },
    'instagram-embed': {
        name: 'Instagram Embed',
        category: 'social',
        riskScore: 7,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Tracking via embeds'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.facebook.com/privacy/policy/',
    },
    'youtube-embed': {
        name: 'YouTube Embed',
        category: 'social',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Google ecosystem'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'twitter-embed': {
        name: 'Twitter/X Embed',
        category: 'social',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Tracking via embeds'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://twitter.com/en/privacy',
    },
    'tiktok-embed': {
        name: 'TikTok Embed',
        category: 'social',
        riskScore: 9,
        jurisdiction: 'China/Singapore',
        dataTransfer: 'CN',
        concerns: ['Chinese jurisdiction', 'Government access concerns', 'Tracking via embeds'],
        gdprCompliant: false,
        privacyPolicyUrl: 'https://www.tiktok.com/legal/privacy-policy',
    },

    // === CDN / INFRASTRUCTURE ===
    'cloudflare': {
        name: 'Cloudflare',
        category: 'cdn',
        riskScore: 2,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.cloudflare.com/privacypolicy/',
    },
    'google-fonts': {
        name: 'Google Fonts',
        category: 'cdn',
        riskScore: 4,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'IP logging', 'GDPR fine precedent in Germany'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'jsdelivr': {
        name: 'jsDelivr',
        category: 'cdn',
        riskScore: 2,
        jurisdiction: 'Poland (EU)',
        dataTransfer: 'EU',
        concerns: [],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.jsdelivr.com/terms/privacy-policy',
    },
    'unpkg': {
        name: 'unpkg',
        category: 'cdn',
        riskScore: 3,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.cloudflare.com/privacypolicy/',
    },

    // === PAYMENT ===
    'stripe': {
        name: 'Stripe',
        category: 'payment',
        riskScore: 2,
        jurisdiction: 'USA/Ireland',
        dataTransfer: 'EU',
        concerns: [],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://stripe.com/privacy',
    },
    'paypal': {
        name: 'PayPal',
        category: 'payment',
        riskScore: 3,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.paypal.com/privacy/full',
    },

    // === OTHER ===
    'intercom': {
        name: 'Intercom',
        category: 'other',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Chat history retention'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.intercom.com/legal/privacy',
    },
    'zendesk': {
        name: 'Zendesk',
        category: 'other',
        riskScore: 4,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.zendesk.com/company/agreements-and-terms/privacy-notice/',
    },
    'drift': {
        name: 'Drift',
        category: 'other',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Chatbot tracking'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.drift.com/privacy/',
    },
    'freshchat': {
        name: 'Freshchat',
        category: 'other',
        riskScore: 4,
        jurisdiction: 'USA/India',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.freshworks.com/privacy/',
    },
    'recaptcha': {
        name: 'Google reCAPTCHA',
        category: 'other',
        riskScore: 5,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Behavioral fingerprinting', 'Unclear data use'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://policies.google.com/privacy',
    },
    'hcaptcha': {
        name: 'hCaptcha',
        category: 'other',
        riskScore: 3,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.hcaptcha.com/privacy',
    },
    'sentry': {
        name: 'Sentry',
        category: 'other',
        riskScore: 3,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Error data may contain PII'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://sentry.io/privacy/',
    },
    'logrocket': {
        name: 'LogRocket',
        category: 'other',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Session replay', 'May capture sensitive data'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://logrocket.com/privacy/',
    },
    'fullstory': {
        name: 'FullStory',
        category: 'other',
        riskScore: 6,
        jurisdiction: 'USA',
        dataTransfer: 'US',
        concerns: ['US data transfer', 'Session replay', 'May capture sensitive data'],
        gdprCompliant: true,
        privacyPolicyUrl: 'https://www.fullstory.com/legal/privacy/',
    },
};

// Pattern matching for detecting vendors in scripts/URLs
export const vendorPatterns: { pattern: RegExp; vendor: string }[] = [
    // Analytics
    { pattern: /google-analytics\.com|googletagmanager\.com\/gtag/i, vendor: 'google-analytics' },
    { pattern: /googletagmanager\.com\/gtm/i, vendor: 'google-tag-manager' },
    { pattern: /hotjar\.com/i, vendor: 'hotjar' },
    { pattern: /mixpanel\.com/i, vendor: 'mixpanel' },
    { pattern: /amplitude\.com/i, vendor: 'amplitude' },
    { pattern: /segment\.com|segment\.io/i, vendor: 'segment' },
    { pattern: /clarity\.ms/i, vendor: 'clarity' },
    { pattern: /heap\.io|heapanalytics\.com/i, vendor: 'heap' },
    { pattern: /plausible\.io/i, vendor: 'plausible' },
    { pattern: /matomo\.|piwik\./i, vendor: 'matomo' },
    { pattern: /usefathom\.com/i, vendor: 'fathom' },

    // Advertising
    { pattern: /googleadservices\.com|googlesyndication\.com|doubleclick\.net/i, vendor: 'google-ads' },
    { pattern: /connect\.facebook\.net.*fbevents|facebook\.com\/tr/i, vendor: 'facebook-pixel' },
    { pattern: /analytics\.tiktok\.com|tiktok\.com\/i18n\/pixel/i, vendor: 'tiktok-pixel' },
    { pattern: /snap\.licdn\.com|linkedin\.com\/px/i, vendor: 'linkedin-insight' },
    { pattern: /static\.ads-twitter\.com|t\.co\/i\/adsct/i, vendor: 'twitter-pixel' },
    { pattern: /pintrk|assets\.pinterest\.com/i, vendor: 'pinterest-tag' },
    { pattern: /sc-static\.net|snapchat\.com.*scevent/i, vendor: 'snapchat-pixel' },
    { pattern: /static\.criteo\.net|criteo\.com/i, vendor: 'criteo' },
    { pattern: /cdn\.taboola\.com/i, vendor: 'taboola' },
    { pattern: /outbrain\.com/i, vendor: 'outbrain' },
    { pattern: /js\.hs-scripts\.com|hubspot\.com/i, vendor: 'hubspot' },

    // Social
    { pattern: /connect\.facebook\.net(?!.*fbevents)/i, vendor: 'facebook-sdk' },
    { pattern: /instagram\.com\/embed/i, vendor: 'instagram-embed' },
    { pattern: /youtube\.com\/embed|youtube-nocookie\.com/i, vendor: 'youtube-embed' },
    { pattern: /platform\.twitter\.com/i, vendor: 'twitter-embed' },
    { pattern: /tiktok\.com\/embed/i, vendor: 'tiktok-embed' },

    // CDN
    { pattern: /cdnjs\.cloudflare\.com|cloudflare\.com/i, vendor: 'cloudflare' },
    { pattern: /fonts\.googleapis\.com|fonts\.gstatic\.com/i, vendor: 'google-fonts' },
    { pattern: /cdn\.jsdelivr\.net/i, vendor: 'jsdelivr' },
    { pattern: /unpkg\.com/i, vendor: 'unpkg' },

    // Payment
    { pattern: /js\.stripe\.com/i, vendor: 'stripe' },
    { pattern: /paypal\.com\/sdk/i, vendor: 'paypal' },

    // Other
    { pattern: /widget\.intercom\.io|intercom\.com/i, vendor: 'intercom' },
    { pattern: /static\.zdassets\.com|zendesk\.com/i, vendor: 'zendesk' },
    { pattern: /js\.driftt\.com/i, vendor: 'drift' },
    { pattern: /wchat\.freshchat\.com/i, vendor: 'freshchat' },
    { pattern: /google\.com\/recaptcha/i, vendor: 'recaptcha' },
    { pattern: /hcaptcha\.com/i, vendor: 'hcaptcha' },
    { pattern: /browser\.sentry-cdn\.com|sentry\.io/i, vendor: 'sentry' },
    { pattern: /cdn\.logrocket\.io/i, vendor: 'logrocket' },
    { pattern: /fullstory\.com/i, vendor: 'fullstory' },
];

// Get risk assessment for a URL or script source
export function getVendorRisk(url: string): VendorRisk | null {
    for (const { pattern, vendor } of vendorPatterns) {
        if (pattern.test(url)) {
            return vendorRiskDatabase[vendor] || null;
        }
    }
    return null;
}

// Get risk level label
export function getRiskLabel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 2) return 'low';
    if (score <= 5) return 'medium';
    if (score <= 7) return 'high';
    return 'critical';
}

// Get risk color for UI
export function getRiskColor(score: number): string {
    if (score <= 2) return '#22c55e'; // green
    if (score <= 5) return '#eab308'; // yellow
    if (score <= 7) return '#f97316'; // orange
    return '#ef4444'; // red
}
