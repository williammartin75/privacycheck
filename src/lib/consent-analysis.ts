/**
 * Consent Behavior Analysis Module
 * Analyzes cookie consent banner implementation for GDPR compliance
 */

export interface ConsentBannerAnalysis {
    detected: boolean;
    hasRejectButton: boolean;
    hasAcceptButton: boolean;
    rejectButtonLabels: string[];
    acceptButtonLabels: string[];
    darkPatterns: DarkPattern[];
    preConsentCookies: PreConsentCookie[];
    consentProvider: string | null;
    score: number; // 0-100
    issues: string[];
}

export interface DarkPattern {
    type: 'hidden_reject' | 'color_manipulation' | 'confirm_shaming' | 'pre_checked' | 'cookie_wall' | 'forced_action';
    description: string;
    severity: 'low' | 'medium' | 'high';
}

export interface PreConsentCookie {
    name: string;
    category: 'analytics' | 'marketing' | 'necessary' | 'unknown';
    droppedBeforeConsent: boolean;
    violation: boolean;
}

// Known consent management platforms
const CONSENT_PROVIDERS: { name: string; patterns: string[] }[] = [
    { name: 'Cookiebot', patterns: ['cookiebot.com', 'Cookiebot', 'CookieConsent'] },
    { name: 'OneTrust', patterns: ['onetrust.com', 'OneTrust', 'optanon'] },
    { name: 'TrustArc', patterns: ['trustarc.com', 'TrustArc', 'consent.trustarc'] },
    { name: 'Quantcast', patterns: ['quantcast.com', 'quantcast_choice', '__cmpGdprApplies'] },
    { name: 'Didomi', patterns: ['didomi.io', 'Didomi', 'didomi_'] },
    { name: 'Usercentrics', patterns: ['usercentrics.eu', 'usercentrics', 'uc_'] },
    { name: 'CookieYes', patterns: ['cookieyes.com', 'cookieyes', 'cky-consent'] },
    { name: 'Termly', patterns: ['termly.io', 'termly_'] },
    { name: 'Axeptio', patterns: ['axeptio.eu', 'axeptio'] },
    { name: 'Osano', patterns: ['osano.com', 'osano'] },
    { name: 'Iubenda', patterns: ['iubenda.com', 'iubenda'] },
    { name: 'Complianz', patterns: ['complianz', 'cmplz'] },
    { name: 'GDPR Cookie Consent', patterns: ['gdpr-cookie-consent', 'moove_gdpr'] },
    { name: 'Cookie Notice', patterns: ['cookie-notice', 'cookie_notice'] },
    { name: 'Custom/Unknown', patterns: ['cookie-banner', 'cookie-consent', 'gdpr-banner', 'consent-banner'] },
];

// Reject button patterns (multilingual)
const REJECT_PATTERNS = [
    // English
    'reject all', 'reject', 'decline', 'deny', 'refuse', 'no thanks', 'no, thanks',
    'only necessary', 'necessary only', 'essential only', 'only essential',
    'manage preferences', 'manage cookies', 'customize', 'settings', 'options',
    // French
    'tout refuser', 'refuser', 'refuser tout', 'non merci', 'continuer sans accepter',
    'cookies essentiels', 'uniquement nécessaires', 'gérer les préférences',
    // German
    'alle ablehnen', 'ablehnen', 'nur notwendige', 'nur erforderliche',
    // Spanish
    'rechazar todo', 'rechazar', 'solo necesarias', 'solo esenciales',
    // Italian
    'rifiuta tutto', 'rifiuta', 'solo necessari',
    // Dutch
    'alles weigeren', 'weigeren', 'alleen noodzakelijke',
    // Portuguese
    'rejeitar tudo', 'rejeitar', 'apenas essenciais',
];

// Accept button patterns (multilingual)
const ACCEPT_PATTERNS = [
    // English
    'accept all', 'accept', 'agree', 'allow all', 'allow', 'got it', 'ok', 'i agree',
    'accept cookies', 'enable all', 'yes', 'continue', 'i understand',
    // French  
    'tout accepter', 'accepter', 'accepter tout', "j'accepte", 'autoriser',
    // German
    'alle akzeptieren', 'akzeptieren', 'zustimmen', 'einverstanden',
    // Spanish
    'aceptar todo', 'aceptar', 'acepto', 'permitir todo',
    // Italian
    'accetta tutto', 'accetta', 'accetto', 'consenti tutto',
    // Dutch
    'alles accepteren', 'accepteren', 'akkoord',
    // Portuguese
    'aceitar tudo', 'aceitar', 'permitir tudo',
];

// Cookies that should NOT be set before consent
const PRE_CONSENT_VIOLATIONS = [
    { pattern: '_ga', category: 'analytics' as const, name: 'Google Analytics' },
    { pattern: '_gid', category: 'analytics' as const, name: 'Google Analytics' },
    { pattern: '_fbp', category: 'marketing' as const, name: 'Facebook Pixel' },
    { pattern: '_fbc', category: 'marketing' as const, name: 'Facebook Pixel' },
    { pattern: '_gcl', category: 'marketing' as const, name: 'Google Ads' },
    { pattern: '_hjid', category: 'analytics' as const, name: 'Hotjar' },
    { pattern: 'hubspotutk', category: 'marketing' as const, name: 'HubSpot' },
    { pattern: '_clck', category: 'analytics' as const, name: 'Microsoft Clarity' },
    { pattern: 'intercom', category: 'marketing' as const, name: 'Intercom' },
    { pattern: 'li_gc', category: 'marketing' as const, name: 'LinkedIn' },
    { pattern: 'amplitude', category: 'analytics' as const, name: 'Amplitude' },
    { pattern: 'mp_', category: 'analytics' as const, name: 'Mixpanel' },
    { pattern: 'ajs_', category: 'analytics' as const, name: 'Segment' },
];

// Confirm shaming patterns
const CONFIRM_SHAMING_PATTERNS = [
    "i don't care about",
    "no, i prefer",
    "no thanks, i'll",
    "i don't want",
    "non merci, je préfère",
    "no, prefiero",
    "nein, ich möchte",
    "keep me in the dark",
    "i'll miss out",
];

/**
 * Detect which consent management platform is being used
 */
function detectConsentProvider(html: string): string | null {
    const htmlLower = html.toLowerCase();

    for (const provider of CONSENT_PROVIDERS) {
        for (const pattern of provider.patterns) {
            if (htmlLower.includes(pattern.toLowerCase())) {
                return provider.name;
            }
        }
    }

    return null;
}

/**
 * Extract button elements and their text from HTML
 */
function extractButtons(html: string): { text: string; element: string }[] {
    const buttons: { text: string; element: string }[] = [];

    // Match button elements
    const buttonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
    let match;
    while ((match = buttonRegex.exec(html)) !== null) {
        const text = match[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (text.length > 0 && text.length < 100) {
            buttons.push({ text, element: match[0] });
        }
    }

    // Match input[type=button] and input[type=submit]
    const inputRegex = /<input[^>]*type=["'](button|submit)["'][^>]*>/gi;
    while ((match = inputRegex.exec(html)) !== null) {
        const valueMatch = match[0].match(/value=["']([^"']*)["']/i);
        if (valueMatch) {
            buttons.push({ text: valueMatch[1].toLowerCase(), element: match[0] });
        }
    }

    // Match anchor tags styled as buttons (common in consent banners)
    const anchorRegex = /<a[^>]*class=["'][^"']*btn[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = anchorRegex.exec(html)) !== null) {
        const text = match[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
        if (text.length > 0 && text.length < 100) {
            buttons.push({ text, element: match[0] });
        }
    }

    return buttons;
}

/**
 * Check for dark patterns in consent implementation
 */
function detectDarkPatterns(html: string, buttons: { text: string; element: string }[]): DarkPattern[] {
    const patterns: DarkPattern[] = [];
    const htmlLower = html.toLowerCase();

    // Check for confirm shaming
    for (const phrase of CONFIRM_SHAMING_PATTERNS) {
        if (htmlLower.includes(phrase.toLowerCase())) {
            patterns.push({
                type: 'confirm_shaming',
                description: `Manipulative language detected: "${phrase}"`,
                severity: 'medium'
            });
            break;
        }
    }

    // Check for pre-checked consent boxes
    if (/<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>/i.test(html)) {
        const checkboxContext = html.match(/<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>[\s\S]{0,200}/gi) || [];
        for (const ctx of checkboxContext) {
            const ctxLower = ctx.toLowerCase();
            if (ctxLower.includes('marketing') || ctxLower.includes('analytics') ||
                ctxLower.includes('third-party') || ctxLower.includes('advertising') ||
                ctxLower.includes('publicité') || ctxLower.includes('analytique')) {
                patterns.push({
                    type: 'pre_checked',
                    description: 'Non-essential cookie consent checkboxes are pre-checked',
                    severity: 'high'
                });
                break;
            }
        }
    }

    // Check if reject button is hidden/less prominent
    const hasReject = buttons.some(b => REJECT_PATTERNS.some(p => b.text.includes(p)));
    const hasAccept = buttons.some(b => ACCEPT_PATTERNS.some(p => b.text.includes(p)));

    if (hasAccept && !hasReject) {
        // Check for common "hidden" reject patterns
        const hasTextOnlyReject = htmlLower.includes('continue without') ||
            htmlLower.includes('manage preferences') ||
            htmlLower.includes('more options');

        if (!hasTextOnlyReject) {
            patterns.push({
                type: 'hidden_reject',
                description: 'No clear reject/decline button visible alongside accept button',
                severity: 'high'
            });
        }
    }

    // Check for forced action (cookie wall blocking content)
    if (htmlLower.includes('cookie-wall') ||
        htmlLower.includes('cookiewall') ||
        (htmlLower.includes('overlay') && htmlLower.includes('cookie'))) {
        patterns.push({
            type: 'cookie_wall',
            description: 'Possible cookie wall blocking access to content',
            severity: 'medium'
        });
    }

    return patterns;
}

/**
 * Detect cookies that may be set before consent
 */
function detectPreConsentCookies(html: string, setCookieHeader: string | null): PreConsentCookie[] {
    const cookies: PreConsentCookie[] = [];

    // Check Set-Cookie headers for tracking cookies
    if (setCookieHeader) {
        for (const violation of PRE_CONSENT_VIOLATIONS) {
            if (setCookieHeader.toLowerCase().includes(violation.pattern.toLowerCase())) {
                cookies.push({
                    name: violation.name,
                    category: violation.category,
                    droppedBeforeConsent: true,
                    violation: true
                });
            }
        }
    }

    // Check for inline script setting cookies
    const scriptCookiePattern = /document\.cookie\s*=\s*["']([^"']+)/gi;
    let match;
    while ((match = scriptCookiePattern.exec(html)) !== null) {
        const cookieString = match[1].toLowerCase();
        for (const violation of PRE_CONSENT_VIOLATIONS) {
            if (cookieString.includes(violation.pattern.toLowerCase())) {
                if (!cookies.find(c => c.name === violation.name)) {
                    cookies.push({
                        name: violation.name,
                        category: violation.category,
                        droppedBeforeConsent: true,
                        violation: true
                    });
                }
            }
        }
    }

    // Check for tracking scripts loaded without consent check
    const noConsentScripts = [
        { pattern: 'gtag(', name: 'Google Analytics', category: 'analytics' as const },
        { pattern: "ga('send", name: 'Google Analytics', category: 'analytics' as const },
        { pattern: "fbq('track", name: 'Facebook Pixel', category: 'marketing' as const },
        { pattern: '_hjSettings', name: 'Hotjar', category: 'analytics' as const },
    ];

    for (const script of noConsentScripts) {
        if (html.includes(script.pattern)) {
            // Check if there's any consent-gating
            const hasConsentGate = html.toLowerCase().includes('consent') &&
                (html.toLowerCase().includes('if ') || html.toLowerCase().includes('granted'));

            if (!hasConsentGate && !cookies.find(c => c.name === script.name)) {
                cookies.push({
                    name: script.name,
                    category: script.category,
                    droppedBeforeConsent: true,
                    violation: true
                });
            }
        }
    }

    return cookies;
}

/**
 * Main function to analyze consent banner behavior
 */
export function analyzeConsentBanner(html: string, setCookieHeader: string | null): ConsentBannerAnalysis {
    const htmlLower = html.toLowerCase();
    const issues: string[] = [];

    // Detect consent provider
    const consentProvider = detectConsentProvider(html);

    // Check if any consent banner is detected
    const consentPatterns = [
        'cookie-consent', 'cookie-banner', 'consent-banner', 'gdpr-banner',
        'cookieconsent', 'cookie_consent', 'privacy-consent', 'cookie-notice',
        'accept cookies', 'we use cookies', 'this site uses cookies',
        'nous utilisons des cookies', 'wir verwenden cookies',
        'utilizamos cookies', 'usiamo i cookie',
        'CookieConsent', 'OneTrust', 'Cookiebot', 'Didomi', 'Quantcast',
    ];

    const detected = consentPatterns.some(p => htmlLower.includes(p.toLowerCase()));

    // Extract buttons
    const buttons = extractButtons(html);

    // Find reject and accept buttons
    const rejectButtonLabels = buttons
        .filter(b => REJECT_PATTERNS.some(p => b.text.includes(p)))
        .map(b => b.text);

    const acceptButtonLabels = buttons
        .filter(b => ACCEPT_PATTERNS.some(p => b.text.includes(p)))
        .map(b => b.text);

    const hasRejectButton = rejectButtonLabels.length > 0;
    const hasAcceptButton = acceptButtonLabels.length > 0;

    // Detect dark patterns
    const darkPatterns = detectDarkPatterns(html, buttons);

    // Detect pre-consent cookies
    const preConsentCookies = detectPreConsentCookies(html, setCookieHeader);

    // Calculate score and issues
    let score = 100;

    if (!detected) {
        issues.push('No cookie consent banner detected');
        score -= 30;
    }

    if (detected && hasAcceptButton && !hasRejectButton) {
        issues.push('No clear reject button found');
        score -= 20;
    }

    for (const pattern of darkPatterns) {
        score -= pattern.severity === 'high' ? 15 : pattern.severity === 'medium' ? 10 : 5;
        issues.push(pattern.description);
    }

    for (const cookie of preConsentCookies) {
        if (cookie.violation) {
            score -= 10;
            issues.push(`${cookie.name} loaded before consent`);
        }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    return {
        detected,
        hasRejectButton,
        hasAcceptButton,
        rejectButtonLabels,
        acceptButtonLabels,
        darkPatterns,
        preConsentCookies,
        consentProvider,
        score,
        issues,
    };
}

/**
 * Get a summary label for consent behavior
 */
export function getConsentBehaviorLabel(analysis: ConsentBannerAnalysis): {
    status: 'passed' | 'warning' | 'failed';
    label: string;
} {
    if (analysis.score >= 80) {
        return { status: 'passed', label: 'Good consent implementation' };
    } else if (analysis.score >= 50) {
        return { status: 'warning', label: 'Consent issues detected' };
    } else {
        return { status: 'failed', label: 'Critical consent violations' };
    }
}
