/**
 * Cookie Lifespan Analysis Module
 * 
 * Analyzes cookie expiration times and flags non-compliant cookies.
 * GDPR/ePrivacy requires cookies to have reasonable lifespans:
 * - CNIL recommends max 13 months for consent cookies
 * - Analytics cookies should not exceed 13 months
 * - Session cookies should expire on browser close
 */

export interface CookieLifespanIssue {
    name: string;
    currentLifespan: number; // in days
    recommendedLifespan: number; // in days
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'excessive' | 'consent-expired' | 'tracking-long-lived' | 'session-persistent';
    recommendation: string;
}

export interface CookieLifespanResult {
    totalCookiesAnalyzed: number;
    compliantCount: number;
    issuesCount: number;
    score: number; // 0-100
    issues: CookieLifespanIssue[];
    longestCookie: {
        name: string;
        days: number;
    } | null;
    averageLifespan: number; // in days
    compliant: boolean;
    recommendations: string[];
}

// CNIL recommended maximums (in days)
const LIFESPAN_LIMITS = {
    consent: 13 * 30, // 13 months
    analytics: 13 * 30, // 13 months
    marketing: 13 * 30, // 13 months
    session: 1, // Should expire with session
    authentication: 30, // 1 month reasonable
    preference: 12 * 30, // 12 months
};

// Cookie name patterns by category
const COOKIE_CATEGORIES: Record<string, RegExp[]> = {
    analytics: [
        /_ga/i, /_gid/i, /_gat/i, /__utm/i, /^_pk_/i, /matomo/i, /plausible/i,
        /gtm_/i, /analytics/i, /segment/i, /amplitude/i, /mixpanel/i
    ],
    marketing: [
        /fbp$/i, /_fbp/i, /fr$/i, /_gcl_/i, /NID/i, /IDE$/i, /test_cookie/i,
        /ad_id/i, /adroll/i, /_twitter/i, /li_/i, /tiktok/i, /pinterest/i
    ],
    consent: [
        /consent/i, /cookie_consent/i, /gdpr/i, /ccpa/i, /privacy/i,
        /CookieConsent/i, /euconsent/i, /OptanonConsent/i, /klaro/i
    ],
    session: [
        /sess/i, /PHPSESSID/i, /JSESSIONID/i, /ASP\.NET/i, /connect\.sid/i
    ],
    authentication: [
        /auth/i, /token/i, /jwt/i, /login/i, /user_id/i, /remember/i
    ]
};

/**
 * Parse cookie expiration from Set-Cookie header
 */
function parseCookieExpiration(cookie: string): number | null {
    // Check for Max-Age (in seconds)
    const maxAgeMatch = cookie.match(/max-age\s*=\s*(\d+)/i);
    if (maxAgeMatch) {
        const seconds = parseInt(maxAgeMatch[1], 10);
        return Math.round(seconds / 86400); // Convert to days
    }

    // Check for Expires
    const expiresMatch = cookie.match(/expires\s*=\s*([^;]+)/i);
    if (expiresMatch) {
        const expiresDate = new Date(expiresMatch[1].trim());
        if (!isNaN(expiresDate.getTime())) {
            const now = new Date();
            const diffMs = expiresDate.getTime() - now.getTime();
            return Math.round(diffMs / (1000 * 60 * 60 * 24)); // Convert to days
        }
    }

    return null; // Session cookie or unable to parse
}

/**
 * Get cookie category based on name
 */
function getCookieCategory(name: string): keyof typeof LIFESPAN_LIMITS {
    for (const [category, patterns] of Object.entries(COOKIE_CATEGORIES)) {
        if (patterns.some(pattern => pattern.test(name))) {
            return category as keyof typeof LIFESPAN_LIMITS;
        }
    }
    return 'preference'; // Default category
}

/**
 * Analyze cookie lifespans
 */
export function analyzeCookieLifespans(
    cookies: Array<{ name: string; value?: string; expiry?: string | number }>,
    setCookieHeaders?: string[]
): CookieLifespanResult {
    const issues: CookieLifespanIssue[] = [];
    const lifespans: number[] = [];
    let longestCookie: { name: string; days: number } | null = null;

    // Analyze Set-Cookie headers
    if (setCookieHeaders) {
        for (const header of setCookieHeaders) {
            const nameMatch = header.match(/^([^=]+)=/);
            if (!nameMatch) continue;

            const name = nameMatch[1].trim();
            const days = parseCookieExpiration(header);

            if (days !== null && days > 0) {
                lifespans.push(days);

                if (!longestCookie || days > longestCookie.days) {
                    longestCookie = { name, days };
                }

                const category = getCookieCategory(name);
                const limit = LIFESPAN_LIMITS[category];

                if (days > limit) {
                    const severity: 'low' | 'medium' | 'high' | 'critical' =
                        days > limit * 3 ? 'critical' :
                            days > limit * 2 ? 'high' :
                                days > limit * 1.5 ? 'medium' : 'low';

                    issues.push({
                        name,
                        currentLifespan: days,
                        recommendedLifespan: limit,
                        severity,
                        category: 'excessive',
                        recommendation: `Reduce cookie lifespan from ${days} days to ${limit} days max.`
                    });
                }
            }
        }
    }

    // Analyze cookies passed directly
    for (const cookie of cookies) {
        let days: number | null = null;

        if (typeof cookie.expiry === 'number') {
            // Unix timestamp
            const expiryDate = new Date(cookie.expiry * 1000);
            const now = new Date();
            days = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        } else if (typeof cookie.expiry === 'string') {
            const expiryDate = new Date(cookie.expiry);
            if (!isNaN(expiryDate.getTime())) {
                const now = new Date();
                days = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            }
        }

        if (days !== null && days > 0) {
            lifespans.push(days);

            if (!longestCookie || days > longestCookie.days) {
                longestCookie = { name: cookie.name, days };
            }

            const category = getCookieCategory(cookie.name);
            const limit = LIFESPAN_LIMITS[category];

            if (days > limit) {
                // Avoid duplicates
                if (!issues.some(i => i.name === cookie.name)) {
                    const severity: 'low' | 'medium' | 'high' | 'critical' =
                        days > limit * 3 ? 'critical' :
                            days > limit * 2 ? 'high' :
                                days > limit * 1.5 ? 'medium' : 'low';

                    issues.push({
                        name: cookie.name,
                        currentLifespan: days,
                        recommendedLifespan: limit,
                        severity,
                        category: 'excessive',
                        recommendation: `Reduce cookie lifespan from ${days} days to ${limit} days max.`
                    });
                }
            }
        }
    }

    // Calculate score
    const totalAnalyzed = lifespans.length;
    const compliantCount = totalAnalyzed - issues.length;
    let score = 100;

    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 20; break;
            case 'high': score -= 10; break;
            case 'medium': score -= 5; break;
            case 'low': score -= 2; break;
        }
    }
    score = Math.max(0, score);

    // Generate recommendations
    const recommendations: string[] = [];
    if (issues.some(i => i.severity === 'critical')) {
        recommendations.push('Urgently reduce cookie lifespans exceeding CNIL limits (13 months max)');
    }
    if (issues.filter(i => i.name.match(/_ga|_gid|analytics/i)).length > 0) {
        recommendations.push('Configure Google Analytics cookies to comply with 13-month limit');
    }
    if (longestCookie && longestCookie.days > 365 * 2) {
        recommendations.push(`Review "${longestCookie.name}" cookie - ${longestCookie.days} days is excessive`);
    }
    if (issues.length === 0 && totalAnalyzed > 0) {
        recommendations.push('All cookies have compliant lifespans');
    }

    return {
        totalCookiesAnalyzed: totalAnalyzed,
        compliantCount,
        issuesCount: issues.length,
        score,
        issues,
        longestCookie,
        averageLifespan: lifespans.length > 0
            ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length)
            : 0,
        compliant: issues.length === 0,
        recommendations
    };
}

/**
 * Get Pro step-by-step fix instructions
 */
export function getCookieLifespanFix(issue: CookieLifespanIssue): string[] {
    const steps: string[] = [];

    steps.push(`1. Locate where "${issue.name}" cookie is set in your code or CMP configuration`);
    steps.push(`2. Change the Max-Age or Expires value to ${issue.recommendedLifespan} days maximum`);

    if (issue.name.match(/_ga|_gid/i)) {
        steps.push('3. In Google Analytics, go to Admin > Data Streams > Configure tag settings');
        steps.push('4. Set cookie expiration to 13 months or less');
    } else if (issue.name.match(/fbp|_fb/i)) {
        steps.push('3. In Facebook Pixel settings, configure cookie retention policy');
        steps.push('4. Consider server-side tracking for better control');
    } else {
        steps.push('3. If using a CMP, check cookie configuration settings');
        steps.push('4. For custom cookies, update server-side Set-Cookie headers');
    }

    steps.push(`5. Test by clearing cookies and revisiting the site`);
    steps.push(`6. Verify new expiration date in browser DevTools > Application > Cookies`);

    return steps;
}
