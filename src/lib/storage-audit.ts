/**
 * LocalStorage/SessionStorage Audit Module
 * 
 * Detects what data is being stored client-side and flags privacy concerns.
 * Many sites store tracking data, user identifiers, or PII in localStorage
 * which persists indefinitely and doesn't require consent like cookies.
 */

export interface StorageItem {
    key: string;
    type: 'localStorage' | 'sessionStorage';
    category: 'tracking' | 'analytics' | 'user-id' | 'pii-risk' | 'functional' | 'unknown';
    risk: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}

export interface StorageAuditResult {
    totalItems: number;
    localStorage: {
        count: number;
        riskItems: number;
    };
    sessionStorage: {
        count: number;
        riskItems: number;
    };
    issues: StorageItem[];
    score: number; // 0-100
    compliant: boolean;
    recommendations: string[];
}

// Patterns that indicate tracking/privacy concerns
const STORAGE_PATTERNS = {
    tracking: [
        /^_ga/i, /^_gid/i, /^_fbp/i, /^fbclid/i, /amplitude/i, /segment/i,
        /mixpanel/i, /heap/i, /intercom/i, /drift/i, /hubspot/i,
        /visitor_id/i, /tracking/i, /campaign/i, /utm_/i
    ],
    analytics: [
        /analytics/i, /pageview/i, /session_count/i, /visit/i, /metric/i,
        /event_/i, /ab_test/i, /experiment/i, /variant/i
    ],
    userId: [
        /user_id/i, /userid/i, /user_uuid/i, /customer_id/i, /client_id/i,
        /device_id/i, /fingerprint/i, /anonymous_id/i, /distinct_id/i
    ],
    piiRisk: [
        /email/i, /phone/i, /address/i, /name/i, /password/i, /credit/i,
        /card/i, /ssn/i, /dob/i, /birth/i, /passport/i, /license/i
    ]
};

/**
 * Analyze localStorage/sessionStorage usage from HTML
 */
export function analyzeStorageUsage(html: string): StorageAuditResult {
    const issues: StorageItem[] = [];
    let localStorageCount = 0;
    let sessionStorageCount = 0;
    let localStorageRisk = 0;
    let sessionStorageRisk = 0;

    // Find localStorage.setItem calls
    const localStorageSetPatterns = [
        /localStorage\.setItem\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /localStorage\[['"`]([^'"`]+)['"`]\]\s*=/gi,
    ];

    for (const pattern of localStorageSetPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const key = match[1];
            localStorageCount++;

            const item = categorizeStorageKey(key, 'localStorage');
            if (item.risk !== 'low') {
                issues.push(item);
                localStorageRisk++;
            }
        }
    }

    // Find sessionStorage.setItem calls
    const sessionStorageSetPatterns = [
        /sessionStorage\.setItem\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /sessionStorage\[['"`]([^'"`]+)['"`]\]\s*=/gi,
    ];

    for (const pattern of sessionStorageSetPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
            const key = match[1];
            sessionStorageCount++;

            const item = categorizeStorageKey(key, 'sessionStorage');
            if (item.risk !== 'low') {
                issues.push(item);
                sessionStorageRisk++;
            }
        }
    }

    // Also detect generic patterns that might indicate storage usage
    const genericPatterns = [
        { pattern: /fingerprint/gi, key: 'fingerprint' },
        { pattern: /device_fingerprint/gi, key: 'device_fingerprint' },
        { pattern: /tracking_consent/gi, key: 'tracking_consent' },
        { pattern: /user_preferences/gi, key: 'user_preferences' },
    ];

    for (const { pattern, key } of genericPatterns) {
        if (pattern.test(html) && !issues.some(i => i.key === key)) {
            const storageMatch = html.match(new RegExp(`(local|session)Storage.*${key}`, 'i'));
            if (storageMatch) {
                const type = storageMatch[1].toLowerCase() === 'local' ? 'localStorage' : 'sessionStorage';
                const item = categorizeStorageKey(key, type as 'localStorage' | 'sessionStorage');
                if (item.risk !== 'low') {
                    issues.push(item);
                    if (type === 'localStorage') {
                        localStorageRisk++;
                    } else {
                        sessionStorageRisk++;
                    }
                }
            }
        }
    }

    // Calculate score
    let score = 100;
    for (const issue of issues) {
        switch (issue.risk) {
            case 'critical': score -= 20; break;
            case 'high': score -= 10; break;
            case 'medium': score -= 5; break;
        }
    }
    score = Math.max(0, score);

    // Generate recommendations
    const recommendations: string[] = [];
    if (issues.some(i => i.category === 'tracking')) {
        recommendations.push('Move tracking data to session storage or add to consent management');
    }
    if (issues.some(i => i.category === 'user-id')) {
        recommendations.push('User identifiers in localStorage require consent under GDPR');
    }
    if (issues.some(i => i.category === 'pii-risk')) {
        recommendations.push('Never store PII in client-side storage without encryption');
    }
    if (issues.length === 0) {
        recommendations.push('No concerning storage usage detected');
    }

    return {
        totalItems: localStorageCount + sessionStorageCount,
        localStorage: {
            count: localStorageCount,
            riskItems: localStorageRisk
        },
        sessionStorage: {
            count: sessionStorageCount,
            riskItems: sessionStorageRisk
        },
        issues,
        score,
        compliant: issues.filter(i => i.risk === 'critical' || i.risk === 'high').length === 0,
        recommendations
    };
}

/**
 * Categorize a storage key by its privacy risk
 */
function categorizeStorageKey(key: string, type: 'localStorage' | 'sessionStorage'): StorageItem {
    // Check tracking patterns
    for (const pattern of STORAGE_PATTERNS.tracking) {
        if (pattern.test(key)) {
            return {
                key,
                type,
                category: 'tracking',
                risk: type === 'localStorage' ? 'high' : 'medium',
                description: 'Tracking identifier stored client-side',
                recommendation: 'Add to consent management or use sessionStorage'
            };
        }
    }

    // Check user ID patterns
    for (const pattern of STORAGE_PATTERNS.userId) {
        if (pattern.test(key)) {
            return {
                key,
                type,
                category: 'user-id',
                risk: 'high',
                description: 'User identifier stored without expiration',
                recommendation: 'User IDs require explicit consent under GDPR'
            };
        }
    }

    // Check PII risk patterns
    for (const pattern of STORAGE_PATTERNS.piiRisk) {
        if (pattern.test(key)) {
            return {
                key,
                type,
                category: 'pii-risk',
                risk: 'critical',
                description: 'Potentially sensitive data in client-side storage',
                recommendation: 'Never store PII in localStorage - use secure server-side storage'
            };
        }
    }

    // Check analytics patterns
    for (const pattern of STORAGE_PATTERNS.analytics) {
        if (pattern.test(key)) {
            return {
                key,
                type,
                category: 'analytics',
                risk: 'medium',
                description: 'Analytics data stored client-side',
                recommendation: 'Consider if this data is necessary to store'
            };
        }
    }

    // Default - functional or unknown
    return {
        key,
        type,
        category: 'functional',
        risk: 'low',
        description: 'Functional storage item',
        recommendation: 'No action needed'
    };
}

/**
 * Get step-by-step fix for storage issues (Pro)
 */
export function getStorageFix(item: StorageItem): string[] {
    const steps: string[] = [];

    switch (item.category) {
        case 'tracking':
            steps.push(`1. Search your code for localStorage.setItem("${item.key}")`);
            steps.push('2. Move this to your consent management platform');
            steps.push('3. Only store after user consents to tracking');
            steps.push('4. Consider using sessionStorage instead (expires on close)');
            break;
        case 'user-id':
            steps.push(`1. Locate where "${item.key}" is set`);
            steps.push('2. Add this identifier to your privacy policy');
            steps.push('3. Gate storage behind consent for non-essential IDs');
            steps.push('4. Implement a clear button for users to delete');
            break;
        case 'pii-risk':
            steps.push('1. URGENT: Remove any PII from client-side storage');
            steps.push('2. Store sensitive data server-side with encryption');
            steps.push('3. Use httpOnly cookies for session tokens');
            steps.push('4. Audit for any other PII leakage');
            break;
        default:
            steps.push('1. Review if this storage is necessary');
            steps.push('2. Document purpose in privacy policy if user-facing');
    }

    return steps;
}
