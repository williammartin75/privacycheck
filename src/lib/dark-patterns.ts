/**
 * Dark Patterns Detection Module
 * 
 * Comprehensive detection of manipulative design patterns (dark patterns)
 * across the entire website, not just consent banners.
 * 
 * Categories of dark patterns detected:
 * - Confirmshaming: Guilt-tripping users who decline
 * - Pre-selection: Default opt-ins for marketing/tracking
 * - Hidden Information: Important info hidden or de-emphasized
 * - Misdirection: Visual tricks to guide users to unwanted choices
 * - Roach Motel: Easy to subscribe, hard to unsubscribe
 * - Privacy Zuckering: Confusing privacy settings
 * - Forced Action: Requiring unnecessary actions
 * - Urgency/Scarcity: Fake countdown timers, limited availability
 * - Social Proof: Fake reviews or manipulated testimonials
 * - Obstruction: Making desired actions difficult
 */

export interface DarkPattern {
    type: DarkPatternType;
    category: DarkPatternCategory;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    element?: string; // HTML snippet where found
    gdprRelevance: boolean;
    recommendation: string;
}

export type DarkPatternCategory =
    | 'consent'
    | 'subscription'
    | 'privacy'
    | 'ecommerce'
    | 'account'
    | 'communication';

export type DarkPatternType =
    | 'confirmshaming'
    | 'pre-selection'
    | 'hidden-information'
    | 'misdirection'
    | 'roach-motel'
    | 'privacy-zuckering'
    | 'forced-action'
    | 'urgency-scarcity'
    | 'social-proof-manipulation'
    | 'obstruction'
    | 'trick-questions'
    | 'bait-and-switch'
    | 'nagging'
    | 'comparison-prevention';

export interface DarkPatternsResult {
    detected: boolean;
    totalCount: number;
    score: number; // 0-100, higher is better (less dark patterns)
    bySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    byCategory: Record<DarkPatternCategory, number>;
    patterns: DarkPattern[];
    gdprViolations: DarkPattern[];
    recommendations: string[];
}

// ===== CONFIRMSHAMING PATTERNS =====
// Guilt-tripping language to manipulate users
const CONFIRMSHAMING_PATTERNS = [
    // "No thanks, I don't want X" with negative framing
    { pattern: /no,?\s*(thanks|thank you),?\s*i\s*(don'?t|do not)\s*(want|need|like|care)/gi, severity: 'high' as const },
    { pattern: /i('?m|\s+am)\s+(not interested|happy|fine)\s+(in|with)\s+(saving|getting|having)/gi, severity: 'medium' as const },
    { pattern: /i\s*(prefer|want)\s+to\s*(miss out|pay more|stay uninformed)/gi, severity: 'high' as const },
    { pattern: /no,?\s*i\s*(hate|don'?t care about|don'?t like)\s*(money|saving|deals|myself)/gi, severity: 'critical' as const },
    { pattern: /i'?d\s+rather\s+(pay full|not save|miss)/gi, severity: 'high' as const },
    { pattern: /i\s+don'?t\s+care\s+about\s+my\s+(privacy|experience|data|security)/gi, severity: 'critical' as const },
    { pattern: /i('?ll|'m going to)\s+(pass|skip|ignore)\s+(this|the)\s+(opportunity|offer|deal)/gi, severity: 'medium' as const },
    { pattern: /no,?\s*maybe\s+later/gi, severity: 'low' as const },
    // Emojis with shaming - must have emoji BEFORE the shaming word
    // Note: "reject" alone is NOT confirmshaming - it's a valid cookie consent button text
    { pattern: /(😢|😞|😔|💔)\s*(no thanks|decline|i don't want)/gi, severity: 'medium' as const },
];

// ===== PRE-SELECTION PATTERNS =====
// Pre-checked boxes, default opt-ins
const PRESELECTION_PATTERNS = [
    // Checked checkboxes with marketing/newsletter text
    { pattern: /<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>[\s\S]{0,200}(newsletter|marketing|promotion|offer|email|subscribe|notify|update)/gi, severity: 'high' as const, gdpr: true },
    { pattern: /(newsletter|marketing|promotion|subscribe)[\s\S]{0,200}<input[^>]*type=["']checkbox["'][^>]*checked/gi, severity: 'high' as const, gdpr: true },
    // Pre-selected radio buttons for sharing data
    { pattern: /<input[^>]*type=["']radio["'][^>]*checked[^>]*>[\s\S]{0,100}(share|partner|third.?party)/gi, severity: 'critical' as const, gdpr: true },
    // Default "on" toggles
    { pattern: /toggle[^>]*on[^>]*[\s\S]{0,100}(marketing|newsletter|share|analytics)/gi, severity: 'high' as const, gdpr: true },
];

// ===== HIDDEN INFORMATION PATTERNS =====
// Important info made hard to see or find
const HIDDEN_INFO_PATTERNS = [
    // Tiny font sizes
    { pattern: /font-size:\s*(0\.\d+|[0-7])px/gi, severity: 'medium' as const },
    { pattern: /font-size:\s*xx-small/gi, severity: 'medium' as const },
    // Low contrast text (light gray on white)
    { pattern: /color:\s*#([cdef][cdef][cdef]|[89ab][89ab][89ab])[^;]*;[\s\S]{0,50}(terms|privacy|unsubscribe|opt.?out|cancel)/gi, severity: 'high' as const },
    // Hidden or display:none with important content
    { pattern: /display:\s*none[\s\S]{0,200}(unsubscribe|cancel|opt.?out|delete|remove)/gi, severity: 'critical' as const },
    // Scroll containers hiding terms
    { pattern: /overflow:\s*scroll[\s\S]{0,100}height:\s*(50|60|70|80)px[\s\S]{0,200}(terms|conditions|privacy)/gi, severity: 'medium' as const },
];

// ===== MISDIRECTION PATTERNS =====
// Visual design tricks - only flag when there's clear asymmetry
const MISDIRECTION_PATTERNS = [
    // Only flag misdirection when decline is explicitly hidden or very de-emphasized
    // Primary button for accept is normal UX, only flag if decline is actively hidden
    { pattern: /(decline|reject|refuse)[\s\S]{0,50}(hidden|invisible|display:\s*none|opacity:\s*0(?:.|\;))/gi, severity: 'high' as const },
    // Colored accept, gray/invisible decline - only clear cases
    { pattern: /(decline|reject|refuse)[\s\S]{0,30}(text-gray-400|text-gray-300|opacity-25|opacity-10)/gi, severity: 'medium' as const },
];

// ===== ROACH MOTEL PATTERNS =====
// Easy to sign up, hard to leave
const ROACH_MOTEL_PATTERNS = [
    // Hide unsubscribe/cancel options
    { pattern: /unsubscribe|cancel\s+subscription|delete\s*(my\s*)?(account|profile)/gi, weight: 1 },
    // Contact us to cancel (instead of self-service)
    { pattern: /(contact|call|email)\s+(us|support|customer service)\s+to\s+(cancel|unsubscribe|delete)/gi, severity: 'high' as const },
    // Written request required
    { pattern: /(written|letter|mail)\s+(request|notice)\s+(required|needed|necessary)\s+to\s+cancel/gi, severity: 'critical' as const },
    // Phone only cancellation
    { pattern: /call\s+[\d\-\+\(\)\s]+\s+to\s+(cancel|unsubscribe)/gi, severity: 'high' as const },
    // Multi-step cancellation warnings
    { pattern: /are\s+you\s+sure[\s\S]{0,50}(lose|miss|forfeit|delete)/gi, severity: 'medium' as const },
    { pattern: /(before\s+you\s+(go|leave|cancel))[\s\S]{0,100}(consider|think|wait|offer)/gi, severity: 'low' as const },
];

// ===== PRIVACY ZUCKERING PATTERNS =====
// Confusing privacy settings
const PRIVACY_ZUCKERING_PATTERNS = [
    // Double negatives
    { pattern: /do\s+not\s+(disable|deactivate|turn\s+off)\s+(\w+\s+){0,3}(tracking|sharing|analytics)/gi, severity: 'high' as const, gdpr: true },
    { pattern: /uncheck\s+to\s+(not\s+)?(opt.?out|disable)/gi, severity: 'high' as const, gdpr: true },
    // Confusing toggle labels
    { pattern: /(enable|turn\s+on)\s+privacy[\s\S]{0,30}(off|disabled|no)/gi, severity: 'medium' as const, gdpr: true },
    // Privacy settings behind multiple clicks
    { pattern: /manage\s+preferences[\s\S]{0,200}manage\s+preferences/gi, severity: 'medium' as const },
];

// ===== FORCED ACTION PATTERNS =====
// Requiring unnecessary actions
const FORCED_ACTION_PATTERNS = [
    // Account required to view content
    { pattern: /(sign\s+up|create\s+account|register)\s+(to|before)\s+(view|see|read|access|continue)/gi, severity: 'medium' as const },
    // Newsletter popup blocking content
    { pattern: /subscribe[\s\S]{0,50}(modal|popup|overlay|dialog)[\s\S]{0,50}(close|dismiss|skip)/gi, severity: 'medium' as const },
    // App download walls
    { pattern: /(download|install)\s+(our\s+)?(app|application)\s+to\s+(continue|access|view)/gi, severity: 'high' as const },
    // Social login required
    { pattern: /(log\s*in|sign\s*in)\s+with\s+(facebook|google|twitter|apple)\s+to\s+continue/gi, severity: 'medium' as const },
];

// ===== URGENCY/SCARCITY PATTERNS =====
// Fake urgency or limited availability
const URGENCY_SCARCITY_PATTERNS = [
    // Countdown timers
    { pattern: /(offer|deal|sale)\s+(ends|expires)\s+in\s*:?\s*(\d+:\d+|\d+\s*(hours?|minutes?|seconds?|days?))/gi, severity: 'medium' as const },
    { pattern: /countdown|timer[\s\S]{0,50}(hurry|limited|expir|ends)/gi, severity: 'medium' as const },
    // Limited stock warnings
    { pattern: /only\s+\d+\s+(left|remaining|in\s+stock|available)/gi, severity: 'low' as const },
    { pattern: /\d+\s+(people|users|visitors)\s+(are\s+)?(viewing|looking|watching)\s+this/gi, severity: 'medium' as const },
    // Last chance messaging
    { pattern: /(last\s+chance|final\s+offer|limited\s+time|act\s+(now|fast)|don'?t\s+miss)/gi, severity: 'low' as const },
    // Fake scarcity
    { pattern: /(selling\s+fast|almost\s+gone|running\s+out|high\s+demand)/gi, severity: 'low' as const },
];

// ===== SOCIAL PROOF MANIPULATION =====
// Fake or manipulated testimonials
const SOCIAL_PROOF_PATTERNS = [
    // Generic stock photo names
    { pattern: /(john\s+smith|jane\s+doe|verified\s+buyer|happy\s+customer)[\s\S]{0,100}(review|said|testimonial)/gi, severity: 'low' as const },
    // Suspiciously round numbers
    { pattern: /(10,?000|100,?000|1,?000,?000)\+?\s+(happy\s+)?(customers|users|subscribers)/gi, severity: 'low' as const },
    // All 5-star reviews
    { pattern: /★{5}[\s\S]{0,20}★{5}[\s\S]{0,20}★{5}/gi, severity: 'low' as const },
    // Fake recent activity
    { pattern: /(\w+\s+from\s+\w+)\s+(just\s+)?(purchased|signed\s+up|subscribed)\s+\d+\s+(seconds?|minutes?)\s+ago/gi, severity: 'medium' as const },
];

// ===== OBSTRUCTION PATTERNS =====
// Making desired actions difficult
const OBSTRUCTION_PATTERNS = [
    // Excessive confirmation steps
    { pattern: /(confirm|verify|are\s+you\s+sure)[\s\S]{0,200}(confirm|verify|are\s+you\s+sure)/gi, severity: 'medium' as const },
    // CAPTCHA on unsubscribe
    { pattern: /captcha[\s\S]{0,100}(unsubscribe|cancel|delete)/gi, severity: 'high' as const },
    // Survey before cancel
    { pattern: /(survey|feedback|reason)[\s\S]{0,100}(before|to)\s+(cancel|unsubscribe)/gi, severity: 'medium' as const },
    // Waiting period
    { pattern: /(wait|processing)\s+\d+\s+(days?|hours?|business\s+days?)\s+(to|before)\s+(cancel|delete)/gi, severity: 'high' as const },
];

// ===== NAGGING PATTERNS =====
// Persistent, repeated requests
const NAGGING_PATTERNS = [
    // Multiple popups/modals
    { pattern: /modal[\s\S]{0,500}modal[\s\S]{0,500}modal/gi, severity: 'medium' as const },
    // Push notification prompts
    { pattern: /(enable|allow)\s+(notifications|alerts)[\s\S]{0,100}(want|like|stay)/gi, severity: 'low' as const },
    // App install banners
    { pattern: /(smart\s*banner|app\s*banner|download\s*banner)[\s\S]{0,50}(install|download)/gi, severity: 'low' as const },
    // Reminder after dismiss
    { pattern: /remind\s+(me\s+)?later|ask\s+(me\s+)?(again|later)/gi, severity: 'low' as const },
];

// ===== TRICK QUESTIONS =====
// Confusing wording
const TRICK_QUESTION_PATTERNS = [
    // Double negatives in choices
    { pattern: /do\s+not\s+(not|un)|don'?t\s+not/gi, severity: 'high' as const },
    // Inverted meaning checkboxes
    { pattern: /(uncheck|deselect)\s+(to\s+)?(receive|get|subscribe|opt)/gi, severity: 'high' as const },
    { pattern: /(check|select)\s+(to\s+)?(not|stop|prevent|opt.?out)/gi, severity: 'high' as const },
    // Confusing yes/no options
    { pattern: /yes,\s+(don'?t|do\s+not|stop)|no,\s+(continue|keep|enable)/gi, severity: 'high' as const },
];

// ===== COMPARISON PREVENTION =====
// Making it hard to compare options
const COMPARISON_PREVENTION_PATTERNS = [
    // Custom unit pricing
    { pattern: /\$[\d.]+\s*\/\s*(unit|credit|token|item)/gi, severity: 'low' as const },
    // Hiding monthly equivalents
    { pattern: /\$[\d.]+\s*\/\s*year[\s\S]{0,50}(save|discount)/gi, severity: 'low' as const },
    // Feature table confusion
    { pattern: /compare[\s\S]{0,200}(limited|some|varies|contact\s+us)/gi, severity: 'low' as const },
];

/**
 * Analyze HTML for dark patterns
 */
export function detectDarkPatterns(html: string): DarkPatternsResult {
    const patterns: DarkPattern[] = [];
    const htmlLower = html.toLowerCase();

    // Helper to add pattern
    const addPattern = (
        type: DarkPatternType,
        category: DarkPatternCategory,
        description: string,
        severity: 'low' | 'medium' | 'high' | 'critical',
        gdprRelevance: boolean,
        element?: string
    ) => {
        patterns.push({
            type,
            category,
            description,
            severity,
            element: element?.slice(0, 200),
            gdprRelevance,
            recommendation: getRecommendation(type),
        });
    };

    // Check Confirmshaming
    for (const { pattern, severity } of CONFIRMSHAMING_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            for (const match of matches.slice(0, 3)) {
                addPattern(
                    'confirmshaming',
                    'consent',
                    `Guilt-tripping language detected: "${match}"`,
                    severity,
                    true,
                    match
                );
            }
        }
    }

    // Check Pre-selection
    for (const { pattern, severity, gdpr } of PRESELECTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            for (const match of matches.slice(0, 3)) {
                addPattern(
                    'pre-selection',
                    'consent',
                    'Pre-checked checkbox for marketing/data sharing',
                    severity,
                    gdpr || false,
                    match
                );
            }
        }
    }

    // Check Hidden Information
    for (const { pattern, severity } of HIDDEN_INFO_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            for (const match of matches.slice(0, 2)) {
                addPattern(
                    'hidden-information',
                    'privacy',
                    'Important information hidden or hard to read',
                    severity,
                    true,
                    match
                );
            }
        }
    }

    // Check Misdirection
    for (const { pattern, severity } of MISDIRECTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'misdirection',
                'consent',
                'Visual design favors one choice over another',
                severity,
                true,
                matches[0]
            );
        }
    }

    // Check Roach Motel
    const hasUnsubscribe = ROACH_MOTEL_PATTERNS[0].pattern.test(htmlLower);
    if (!hasUnsubscribe && htmlLower.includes('subscribe')) {
        addPattern(
            'roach-motel',
            'subscription',
            'No visible unsubscribe or account deletion option',
            'high',
            true
        );
    }
    for (const item of ROACH_MOTEL_PATTERNS.slice(1)) {
        if ('pattern' in item && 'severity' in item && item.severity) {
            const matches = html.match(item.pattern);
            if (matches) {
                addPattern(
                    'roach-motel',
                    'subscription',
                    'Difficult cancellation process detected',
                    item.severity as 'low' | 'medium' | 'high' | 'critical',
                    true,
                    matches[0]
                );
            }
        }
    }

    // Check Privacy Zuckering
    for (const { pattern, severity, gdpr } of PRIVACY_ZUCKERING_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'privacy-zuckering',
                'privacy',
                'Confusing privacy settings or double negatives',
                severity,
                gdpr || false,
                matches[0]
            );
        }
    }

    // Check Forced Action
    for (const { pattern, severity } of FORCED_ACTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'forced-action',
                'account',
                'Required action to access content',
                severity,
                false,
                matches[0]
            );
        }
    }

    // Check Urgency/Scarcity
    for (const { pattern, severity } of URGENCY_SCARCITY_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'urgency-scarcity',
                'ecommerce',
                'Urgency or scarcity tactics detected',
                severity,
                false,
                matches[0]
            );
        }
    }

    // Check Social Proof Manipulation
    for (const { pattern, severity } of SOCIAL_PROOF_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'social-proof-manipulation',
                'ecommerce',
                'Potentially manipulated social proof',
                severity,
                false,
                matches[0]
            );
        }
    }

    // Check Obstruction
    for (const { pattern, severity } of OBSTRUCTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'obstruction',
                'account',
                'Obstacles to user desired actions',
                severity,
                true,
                matches[0]
            );
        }
    }

    // Check Nagging
    for (const { pattern, severity } of NAGGING_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'nagging',
                'communication',
                'Persistent or repeated requests detected',
                severity,
                false,
                matches[0]
            );
        }
    }

    // Check Trick Questions
    for (const { pattern, severity } of TRICK_QUESTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'trick-questions',
                'consent',
                'Confusing wording or double negatives',
                severity,
                true,
                matches[0]
            );
        }
    }

    // Check Comparison Prevention
    for (const { pattern, severity } of COMPARISON_PREVENTION_PATTERNS) {
        const matches = html.match(pattern);
        if (matches) {
            addPattern(
                'comparison-prevention',
                'ecommerce',
                'Difficult to compare pricing or options',
                severity,
                false,
                matches[0]
            );
        }
    }

    // Calculate severity counts
    const bySeverity = {
        critical: patterns.filter(p => p.severity === 'critical').length,
        high: patterns.filter(p => p.severity === 'high').length,
        medium: patterns.filter(p => p.severity === 'medium').length,
        low: patterns.filter(p => p.severity === 'low').length,
    };

    // Calculate category counts
    const byCategory: Record<DarkPatternCategory, number> = {
        consent: patterns.filter(p => p.category === 'consent').length,
        subscription: patterns.filter(p => p.category === 'subscription').length,
        privacy: patterns.filter(p => p.category === 'privacy').length,
        ecommerce: patterns.filter(p => p.category === 'ecommerce').length,
        account: patterns.filter(p => p.category === 'account').length,
        communication: patterns.filter(p => p.category === 'communication').length,
    };

    // Calculate score (higher is better)
    // Deduct points based on severity
    let score = 100;
    score -= bySeverity.critical * 20;
    score -= bySeverity.high * 10;
    score -= bySeverity.medium * 5;
    score -= bySeverity.low * 2;
    score = Math.max(0, score);

    // GDPR-relevant violations
    const gdprViolations = patterns.filter(p => p.gdprRelevance);

    // Generate recommendations
    const recommendations: string[] = [];
    const typesFound = new Set(patterns.map(p => p.type));

    if (typesFound.has('confirmshaming')) {
        recommendations.push('Replace guilt-tripping language with neutral options (e.g., "No thanks" instead of "No, I don\'t want to save money")');
    }
    if (typesFound.has('pre-selection')) {
        recommendations.push('Ensure all marketing and data sharing checkboxes are unchecked by default (GDPR requirement)');
    }
    if (typesFound.has('hidden-information')) {
        recommendations.push('Make unsubscribe links and privacy-related information clearly visible with adequate contrast');
    }
    if (typesFound.has('misdirection')) {
        recommendations.push('Make accept and reject buttons equally prominent in size, color, and placement');
    }
    if (typesFound.has('roach-motel')) {
        recommendations.push('Provide easy self-service account deletion and unsubscribe options');
    }
    if (typesFound.has('privacy-zuckering')) {
        recommendations.push('Simplify privacy settings with clear, unambiguous language (avoid double negatives)');
    }
    if (typesFound.has('trick-questions')) {
        recommendations.push('Rewrite confusing questions to be clear and straightforward');
    }

    return {
        detected: patterns.length > 0,
        totalCount: patterns.length,
        score,
        bySeverity,
        byCategory,
        patterns,
        gdprViolations,
        recommendations,
    };
}

/**
 * Get recommendation for a dark pattern type
 */
function getRecommendation(type: DarkPatternType): string {
    const recommendations: Record<DarkPatternType, string> = {
        'confirmshaming': 'Use neutral language for decline options, avoiding emotional manipulation.',
        'pre-selection': 'Uncheck all non-essential options by default to ensure genuine consent.',
        'hidden-information': 'Display important privacy information clearly with adequate size and contrast.',
        'misdirection': 'Design choice interfaces with equal visual weight for all options.',
        'roach-motel': 'Make it as easy to unsubscribe as to subscribe, with self-service options.',
        'privacy-zuckering': 'Simplify privacy controls with clear, positive language.',
        'forced-action': 'Allow content access without requiring unnecessary account creation.',
        'urgency-scarcity': 'Only use countdown timers and scarcity messaging when genuinely applicable.',
        'social-proof-manipulation': 'Ensure all testimonials and statistics are genuine and verifiable.',
        'obstruction': 'Remove unnecessary friction from user-requested actions like cancellation.',
        'trick-questions': 'Write questions clearly without double negatives or confusing phrasing.',
        'bait-and-switch': 'Ensure advertised offers match the actual terms presented.',
        'nagging': 'Limit popup frequency and respect user dismissal choices.',
        'comparison-prevention': 'Present pricing clearly with easy-to-compare formats.',
    };
    return recommendations[type] || 'Review and redesign this interaction to respect user autonomy.';
}

/**
 * Get severity label with color
 */
export function getSeverityInfo(severity: 'low' | 'medium' | 'high' | 'critical'): { label: string; color: string; bgColor: string } {
    const info = {
        critical: { label: 'Critical', color: 'text-red-800', bgColor: 'bg-red-100' },
        high: { label: 'High', color: 'text-orange-800', bgColor: 'bg-orange-100' },
        medium: { label: 'Medium', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
        low: { label: 'Low', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    };
    return info[severity];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: DarkPatternCategory): string {
    const names: Record<DarkPatternCategory, string> = {
        consent: 'Consent Manipulation',
        subscription: 'Subscription Traps',
        privacy: 'Privacy Confusion',
        ecommerce: 'E-Commerce Tricks',
        account: 'Account Obstruction',
        communication: 'Nagging & Spam',
    };
    return names[category];
}
