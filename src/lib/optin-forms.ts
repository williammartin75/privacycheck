/**
 * Opt-in Forms Analysis Module
 * 
 * Detects pre-checked checkboxes and other consent issues in forms.
 * GDPR requires that consent checkboxes are NOT pre-checked.
 * 
 * Checks for:
 * - Pre-checked marketing consent checkboxes
 * - Pre-checked newsletter subscriptions
 * - Pre-checked data sharing agreements
 * - Hidden consent inputs
 * - Bundled consent (all-or-nothing)
 */

export interface OptInIssue {
    type: 'pre-checked' | 'hidden-consent' | 'bundled-consent' | 'unclear-label' | 'forced-consent';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    element?: string;
    recommendation: string;
    gdprArticle?: string;
}

export interface OptInFormsResult {
    formsAnalyzed: number;
    totalIssues: number;
    score: number; // 0-100, higher is better
    issues: OptInIssue[];
    preCheckedCount: number;
    hiddenConsentCount: number;
    bundledConsentCount: number;
    compliant: boolean;
    recommendations: string[];
}

// Keywords that indicate marketing/consent checkboxes
const CONSENT_KEYWORDS = [
    'newsletter', 'marketing', 'promotional', 'offers', 'updates',
    'subscribe', 'subscription', 'notify', 'notifications',
    'email me', 'send me', 'receive', 'opt-in', 'opt in',
    'third party', 'third-party', 'partners', 'share', 'sharing',
    'agree to', 'accept', 'consent', 'terms', 'conditions',
    'privacy policy', 'data processing', 'contact me',
    'special offers', 'promotions', 'deals', 'discount'
];

// Keywords that indicate required/legitimate checkboxes (should not be flagged)
const LEGITIMATE_KEYWORDS = [
    'i have read', 'i agree to the terms', 'age verification',
    'i am over', 'i am 18', 'remember me', 'stay logged in',
    'keep me signed in', 'save my', 'required field'
];

/**
 * Analyze HTML for opt-in form issues
 */
export function analyzeOptInForms(html: string): OptInFormsResult {
    const issues: OptInIssue[] = [];
    const htmlLower = html.toLowerCase();

    // Count forms
    const formMatches = html.match(/<form[^>]*>/gi) || [];
    const formsAnalyzed = formMatches.length;

    let preCheckedCount = 0;
    let hiddenConsentCount = 0;
    let bundledConsentCount = 0;

    // 1. Detect pre-checked checkboxes with consent keywords
    const preCheckedPattern = /<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>[\s\S]{0,300}/gi;
    const preCheckedMatches = html.match(preCheckedPattern) || [];

    for (const match of preCheckedMatches) {
        const matchLower = match.toLowerCase();

        // Skip if it's a legitimate checkbox (terms agreement, remember me, etc.)
        const isLegitimate = LEGITIMATE_KEYWORDS.some(keyword => matchLower.includes(keyword));
        if (isLegitimate) continue;

        // Check if it relates to marketing/consent
        const isConsentRelated = CONSENT_KEYWORDS.some(keyword => matchLower.includes(keyword));

        if (isConsentRelated) {
            preCheckedCount++;
            issues.push({
                type: 'pre-checked',
                description: 'Pre-checked consent checkbox found. GDPR requires explicit opt-in.',
                severity: 'critical',
                element: match.slice(0, 200),
                recommendation: 'Remove the "checked" attribute from this checkbox.',
                gdprArticle: 'Article 7(2) - Conditions for consent'
            });
        }
    }

    // 2. Detect hidden consent inputs
    const hiddenConsentPattern = /<input[^>]*type=["']hidden["'][^>]*(?:consent|marketing|newsletter|subscribe|opt)[^>]*>/gi;
    const hiddenMatches = html.match(hiddenConsentPattern) || [];

    for (const match of hiddenMatches) {
        hiddenConsentCount++;
        issues.push({
            type: 'hidden-consent',
            description: 'Hidden input field related to consent detected.',
            severity: 'high',
            element: match.slice(0, 200),
            recommendation: 'Make consent choices visible and transparent to users.',
            gdprArticle: 'Article 7(1) - Demonstrable consent'
        });
    }

    // 3. Detect bundled consent (single checkbox for multiple purposes)
    const bundledPattern = /(?:marketing|newsletter).{0,50}(?:and|&|,).{0,50}(?:third.?party|partner|share|marketing|newsletter)/gi;
    const bundledMatches = html.match(bundledPattern) || [];

    for (const match of bundledMatches) {
        // Only flag if near a checkbox
        const context = html.substring(
            Math.max(0, html.indexOf(match) - 200),
            Math.min(html.length, html.indexOf(match) + match.length + 200)
        );

        if (context.toLowerCase().includes('checkbox') || context.includes('<input')) {
            bundledConsentCount++;
            issues.push({
                type: 'bundled-consent',
                description: 'Multiple consent purposes bundled into one checkbox.',
                severity: 'high',
                element: match.slice(0, 200),
                recommendation: 'Separate each consent purpose into its own checkbox.',
                gdprArticle: 'Article 7(2) - Specific consent'
            });
        }
    }

    // 4. Detect unclear labels
    const unclearPatterns = [
        /<input[^>]*type=["']checkbox["'][^>]*>\s*<\/?(div|span|td)[^>]*>\s*$/gi,
        /<input[^>]*type=["']checkbox["'][^>]*>\s*$/gi
    ];

    for (const pattern of unclearPatterns) {
        const unclearMatches = html.match(pattern) || [];
        for (const match of unclearMatches.slice(0, 2)) {
            issues.push({
                type: 'unclear-label',
                description: 'Checkbox without clear label text nearby.',
                severity: 'medium',
                element: match.slice(0, 200),
                recommendation: 'Add clear, descriptive labels to all consent checkboxes.',
                gdprArticle: 'Article 7(2) - Clear and plain language'
            });
        }
    }

    // 5. Detect forced consent (consent bundled with form submission)
    const forcedPatterns = [
        /by\s+(clicking|submitting|pressing)[^.]*(?:agree|consent|accept)/gi,
        /submitting\s+this\s+form[^.]*(?:consent|agree|accept)/gi
    ];

    for (const pattern of forcedPatterns) {
        const forcedMatches = html.match(pattern) || [];
        for (const match of forcedMatches.slice(0, 2)) {
            issues.push({
                type: 'forced-consent',
                description: 'Form submission implies consent without explicit checkbox.',
                severity: 'high',
                element: match.slice(0, 200),
                recommendation: 'Use explicit checkboxes for consent, separate from form submission.',
                gdprArticle: 'Article 7(4) - Freely given consent'
            });
        }
    }

    // Calculate score
    let score = 100;
    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 10; break;
            case 'low': score -= 5; break;
        }
    }
    score = Math.max(0, score);

    // Generate recommendations
    const recommendations: string[] = [];
    if (preCheckedCount > 0) {
        recommendations.push('Remove all "checked" attributes from marketing and data sharing checkboxes');
    }
    if (hiddenConsentCount > 0) {
        recommendations.push('Make all consent inputs visible and ensure transparency');
    }
    if (bundledConsentCount > 0) {
        recommendations.push('Separate bundled consent into individual checkboxes for each purpose');
    }
    if (issues.some(i => i.type === 'forced-consent')) {
        recommendations.push('Do not bundle consent with form submission - use explicit checkboxes');
    }
    if (issues.some(i => i.type === 'unclear-label')) {
        recommendations.push('Add clear, descriptive labels to all consent checkboxes');
    }

    return {
        formsAnalyzed,
        totalIssues: issues.length,
        score,
        issues,
        preCheckedCount,
        hiddenConsentCount,
        bundledConsentCount,
        compliant: issues.length === 0,
        recommendations
    };
}

/**
 * Get issue type display name
 */
export function getIssueTypeDisplayName(type: OptInIssue['type']): string {
    const names: Record<OptInIssue['type'], string> = {
        'pre-checked': 'Pre-checked Checkbox',
        'hidden-consent': 'Hidden Consent',
        'bundled-consent': 'Bundled Consent',
        'unclear-label': 'Unclear Label',
        'forced-consent': 'Forced Consent'
    };
    return names[type];
}

/**
 * Get severity styling info
 */
export function getSeverityInfo(severity: OptInIssue['severity']): { label: string; color: string; bgColor: string } {
    const info = {
        critical: { label: 'Critical', color: 'text-red-800', bgColor: 'bg-red-100' },
        high: { label: 'High', color: 'text-orange-800', bgColor: 'bg-orange-100' },
        medium: { label: 'Medium', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
        low: { label: 'Low', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    };
    return info[severity];
}
