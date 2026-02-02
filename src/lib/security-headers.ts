/**
 * Security Headers Analysis Module (Extended)
 * 
 * Analyzes HTTP security headers beyond basic SSL/SPF/DMARC.
 * These headers protect user privacy and prevent various attacks.
 */

export interface SecurityHeaderIssue {
    header: string;
    status: 'missing' | 'weak' | 'misconfigured' | 'present';
    severity: 'low' | 'medium' | 'high' | 'critical';
    currentValue?: string;
    recommendation: string;
    privacyImpact: string;
}

export interface SecurityHeadersResult {
    score: number; // 0-100
    totalHeaders: number;
    presentCount: number;
    missingCount: number;
    issues: SecurityHeaderIssue[];
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    headers: Record<string, { present: boolean; value?: string }>;
    recommendations: string[];
}

// Headers to check with their importance
const SECURITY_HEADERS = {
    'Strict-Transport-Security': {
        severity: 'high' as const,
        description: 'HSTS - Forces HTTPS connection',
        privacyImpact: 'Prevents man-in-the-middle attacks that could expose user data',
        recommended: 'max-age=31536000; includeSubDomains; preload'
    },
    'Content-Security-Policy': {
        severity: 'high' as const,
        description: 'CSP - Prevents XSS and data injection',
        privacyImpact: 'Blocks malicious scripts that could steal user data',
        recommended: "default-src 'self'; script-src 'self'"
    },
    'X-Content-Type-Options': {
        severity: 'medium' as const,
        description: 'Prevents MIME sniffing',
        privacyImpact: 'Stops browsers from incorrectly executing files',
        recommended: 'nosniff'
    },
    'X-Frame-Options': {
        severity: 'medium' as const,
        description: 'Prevents clickjacking',
        privacyImpact: 'Stops your site from being embedded in malicious frames',
        recommended: 'DENY or SAMEORIGIN'
    },
    'X-XSS-Protection': {
        severity: 'low' as const,
        description: 'Legacy XSS filter (deprecated but still useful)',
        privacyImpact: 'Additional XSS protection for older browsers',
        recommended: '1; mode=block'
    },
    'Referrer-Policy': {
        severity: 'high' as const,
        description: 'Controls referrer information sent to other sites',
        privacyImpact: 'Prevents leaking user browsing activity to third parties',
        recommended: 'strict-origin-when-cross-origin or no-referrer'
    },
    'Permissions-Policy': {
        severity: 'high' as const,
        description: 'Controls browser features and APIs',
        privacyImpact: 'Restricts access to camera, microphone, geolocation, etc.',
        recommended: 'camera=(), microphone=(), geolocation=()'
    },
    'Cross-Origin-Opener-Policy': {
        severity: 'medium' as const,
        description: 'Isolates browsing context',
        privacyImpact: 'Prevents cross-origin attacks like Spectre',
        recommended: 'same-origin'
    },
    'Cross-Origin-Resource-Policy': {
        severity: 'medium' as const,
        description: 'Controls cross-origin resource loading',
        privacyImpact: 'Prevents unauthorized embedding of resources',
        recommended: 'same-origin'
    },
    'Cross-Origin-Embedder-Policy': {
        severity: 'low' as const,
        description: 'Requires CORS for cross-origin resources',
        privacyImpact: 'Ensures resources are loaded securely',
        recommended: 'require-corp'
    }
};

// Header validation patterns
const HEADER_VALIDATORS: Record<string, (value: string) => { valid: boolean; issue?: string }> = {
    'Strict-Transport-Security': (value) => {
        const maxAge = value.match(/max-age=(\d+)/i);
        if (!maxAge) return { valid: false, issue: 'Missing max-age directive' };
        const age = parseInt(maxAge[1], 10);
        if (age < 31536000) return { valid: false, issue: 'max-age should be at least 1 year (31536000)' };
        return { valid: true };
    },
    'Content-Security-Policy': (value) => {
        // Modern frameworks like Next.js/React often require 'unsafe-inline' and 'unsafe-eval'
        // Only flag if there are more serious issues like completely open policies
        if (value.includes("default-src *") || value.includes("script-src *")) {
            return { valid: false, issue: "CSP is too permissive with wildcard sources" };
        }
        // Having a CSP at all is good, even with unsafe-inline/eval for framework compatibility
        return { valid: true };
    },
    'Referrer-Policy': (value) => {
        const safeValues = ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin', 'same-origin'];
        if (!safeValues.some(v => value.toLowerCase().includes(v))) {
            return { valid: false, issue: 'Policy may leak referrer information' };
        }
        return { valid: true };
    },
    'Permissions-Policy': (value) => {
        const recommended = ['camera', 'microphone', 'geolocation'];
        const missing = recommended.filter(r => !value.toLowerCase().includes(r));
        if (missing.length > 0) {
            return { valid: false, issue: `Should restrict: ${missing.join(', ')}` };
        }
        return { valid: true };
    }
};

/**
 * Analyze security headers from response
 */
export function analyzeSecurityHeaders(
    headers: Record<string, string | undefined>
): SecurityHeadersResult {
    const issues: SecurityHeaderIssue[] = [];
    const headerStatus: Record<string, { present: boolean; value?: string }> = {};
    let presentCount = 0;

    // Normalize header names (case-insensitive)
    const normalizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (value) {
            normalizedHeaders[key.toLowerCase()] = value;
        }
    }

    // Check each security header
    for (const [header, config] of Object.entries(SECURITY_HEADERS)) {
        const headerLower = header.toLowerCase();
        const value = normalizedHeaders[headerLower];

        if (value) {
            presentCount++;
            headerStatus[header] = { present: true, value };

            // Validate header value
            const validator = HEADER_VALIDATORS[header];
            if (validator) {
                const result = validator(value);
                if (!result.valid) {
                    issues.push({
                        header,
                        status: 'weak',
                        severity: config.severity,
                        currentValue: value.substring(0, 100),
                        recommendation: result.issue || `Improve ${header} configuration`,
                        privacyImpact: config.privacyImpact
                    });
                }
            }
        } else {
            headerStatus[header] = { present: false };
            issues.push({
                header,
                status: 'missing',
                severity: config.severity,
                recommendation: `Add ${header}: ${config.recommended}`,
                privacyImpact: config.privacyImpact
            });
        }
    }

    // Calculate score
    const totalHeaders = Object.keys(SECURITY_HEADERS).length;
    let score = 100;

    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 15; break;
            case 'high': score -= 10; break;
            case 'medium': score -= 7; break;
            case 'low': score -= 3; break;
        }
    }
    score = Math.max(0, Math.min(100, score));

    // Calculate grade
    const grade: SecurityHeadersResult['grade'] =
        score >= 95 ? 'A+' :
            score >= 85 ? 'A' :
                score >= 70 ? 'B' :
                    score >= 55 ? 'C' :
                        score >= 40 ? 'D' : 'F';

    // Generate recommendations
    const recommendations: string[] = [];

    const missingHigh = issues.filter(i => i.status === 'missing' && i.severity === 'high');
    if (missingHigh.length > 0) {
        recommendations.push(`Add critical headers: ${missingHigh.map(i => i.header).join(', ')}`);
    }

    if (!headerStatus['Permissions-Policy']?.present) {
        recommendations.push('Add Permissions-Policy to restrict browser APIs like camera and microphone');
    }

    if (!headerStatus['Referrer-Policy']?.present) {
        recommendations.push('Add Referrer-Policy to prevent leaking user navigation data');
    }

    if (issues.length === 0) {
        recommendations.push('All security headers are properly configured');
    }

    return {
        score,
        totalHeaders,
        presentCount,
        missingCount: totalHeaders - presentCount,
        issues,
        grade,
        headers: headerStatus,
        recommendations
    };
}

/**
 * Get Pro/Pro+ step-by-step fix instructions for a header
 */
export function getSecurityHeaderFix(header: string): string[] {
    const steps: string[] = [];

    switch (header) {
        case 'Strict-Transport-Security':
            steps.push('1. Ensure your site fully supports HTTPS (no mixed content)');
            steps.push('2. Add header to your server configuration:');
            steps.push('   Nginx: add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";');
            steps.push('   Apache: Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"');
            steps.push('3. Consider submitting to HSTS preload list: https://hstspreload.org/');
            steps.push('4. Test with: curl -I https://yoursite.com | grep strict');
            break;

        case 'Content-Security-Policy':
            steps.push('1. Start with a report-only policy to avoid breaking your site');
            steps.push('2. Add header: Content-Security-Policy-Report-Only: default-src \'self\'');
            steps.push('3. Monitor CSP reports for violations');
            steps.push('4. Gradually tighten the policy based on legitimate resources');
            steps.push('5. Replace unsafe-inline with nonces or hashes');
            steps.push('6. Switch to enforcing mode once stable');
            break;

        case 'Referrer-Policy':
            steps.push('1. Add header to server:');
            steps.push('   Referrer-Policy: strict-origin-when-cross-origin');
            steps.push('2. This sends referrer to same-origin, only origin to cross-origin');
            steps.push('3. For maximum privacy, use: no-referrer');
            steps.push('4. Test by checking Network tab in DevTools for outgoing requests');
            break;

        case 'Permissions-Policy':
            steps.push('1. Add header to restrict browser features:');
            steps.push('   Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
            steps.push('2. If you need a feature, specify allowed origins:');
            steps.push('   Permissions-Policy: geolocation=(self "https://maps.example.com")');
            steps.push('3. Test by checking Console for permission errors');
            steps.push('4. Update as needed for legitimate functionality');
            break;

        case 'X-Frame-Options':
            steps.push('1. Add header to prevent clickjacking:');
            steps.push('   X-Frame-Options: DENY (disallow all framing)');
            steps.push('   X-Frame-Options: SAMEORIGIN (allow same-origin framing)');
            steps.push('2. Consider also using CSP frame-ancestors directive');
            steps.push('3. Test by trying to iframe your site');
            break;

        case 'X-Content-Type-Options':
            steps.push('1. Add header:');
            steps.push('   X-Content-Type-Options: nosniff');
            steps.push('2. This prevents browsers from MIME-sniffing');
            steps.push('3. Ensure all files have correct Content-Type headers');
            break;

        default:
            steps.push(`1. Search for ${header} implementation guidelines`);
            steps.push('2. Add the header to your server configuration');
            steps.push('3. Test with securityheaders.com');
    }

    return steps;
}

/**
 * Grade color styling
 */
export function getGradeInfo(grade: SecurityHeadersResult['grade']): { color: string; bgColor: string } {
    const info = {
        'A+': { color: 'text-green-800', bgColor: 'bg-green-100' },
        'A': { color: 'text-green-700', bgColor: 'bg-green-100' },
        'B': { color: 'text-blue-700', bgColor: 'bg-blue-100' },
        'C': { color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
        'D': { color: 'text-orange-700', bgColor: 'bg-orange-100' },
        'F': { color: 'text-red-700', bgColor: 'bg-red-100' }
    };
    return info[grade];
}
