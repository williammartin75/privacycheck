/**
 * Form Security Scan Module
 * 
 * Analyzes forms for security and privacy best practices:
 * - Password field security
 * - Autocomplete settings
 * - HTTPS submission
 * - Hidden fields with sensitive data
 * - CSRF protection
 */

export interface FormSecurityIssue {
    formId?: string;
    type: 'password-autocomplete' | 'no-https' | 'sensitive-hidden' | 'no-csrf' | 'autocomplete-pii' | 'password-visible';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    field?: string;
    recommendation: string;
}

export interface FormSecurityResult {
    totalForms: number;
    secureCount: number;
    issuesCount: number;
    issues: FormSecurityIssue[];
    score: number; // 0-100
    hasLoginForm: boolean;
    hasPaymentForm: boolean;
    compliant: boolean;
    recommendations: string[];
}

/**
 * Analyze form security in HTML
 */
export function analyzeFormSecurity(html: string, pageUrl?: string): FormSecurityResult {
    const issues: FormSecurityIssue[] = [];
    let formCount = 0;
    let hasLoginForm = false;
    let hasPaymentForm = false;

    // Find all forms
    const formPattern = /<form[^>]*>([\s\S]*?)<\/form>/gi;
    let formMatch;

    while ((formMatch = formPattern.exec(html)) !== null) {
        formCount++;
        const formTag = formMatch[0];
        const formContent = formMatch[1];
        const formId = formTag.match(/id\s*=\s*["']([^"']+)/i)?.[1];

        // Check form action - should be HTTPS on HTTPS pages
        const actionMatch = formTag.match(/action\s*=\s*["']?([^"'\s>]+)/i);
        if (actionMatch && actionMatch[1].startsWith('http://')) {
            issues.push({
                formId,
                type: 'no-https',
                severity: 'critical',
                description: 'Form submits data over unencrypted HTTP',
                recommendation: 'Change form action to HTTPS URL'
            });
        }

        // Check for password fields
        if (/type\s*=\s*["']?password/i.test(formContent)) {
            hasLoginForm = true;

            // Check autocomplete on password fields
            const passwordPattern = /<input[^>]+type\s*=\s*["']?password[^>]*/gi;
            let pwMatch;
            while ((pwMatch = passwordPattern.exec(formContent)) !== null) {
                const pwField = pwMatch[0];

                // Check if autocomplete is properly set
                if (!/autocomplete\s*=\s*["']?(off|new-password|current-password)/i.test(pwField)) {
                    // It's okay to have autocomplete for login forms
                    // But new password fields should have autocomplete="new-password"
                    if (/name\s*=\s*["']?(new|confirm|repeat)/i.test(pwField)) {
                        issues.push({
                            formId,
                            type: 'password-autocomplete',
                            severity: 'low',
                            description: 'New password field should have autocomplete="new-password"',
                            field: pwField.match(/name\s*=\s*["']?([^"'\s>]+)/i)?.[1],
                            recommendation: 'Add autocomplete="new-password" for password managers'
                        });
                    }
                }
            }
        }

        // Check for payment/credit card fields
        if (/credit|card|cvv|cvc|expir/i.test(formContent)) {
            hasPaymentForm = true;

            // Payment forms should be on HTTPS
            if (pageUrl && pageUrl.startsWith('http://')) {
                issues.push({
                    formId,
                    type: 'no-https',
                    severity: 'critical',
                    description: 'Payment form on non-HTTPS page',
                    recommendation: 'Payment forms MUST be served over HTTPS'
                });
            }
        }

        // Check for sensitive hidden fields
        const hiddenPattern = /<input[^>]+type\s*=\s*["']?hidden[^>]*/gi;
        let hiddenMatch;
        while ((hiddenMatch = hiddenPattern.exec(formContent)) !== null) {
            const hiddenField = hiddenMatch[0];
            const fieldName = hiddenField.match(/name\s*=\s*["']?([^"'\s>]+)/i)?.[1] || '';
            const fieldValue = hiddenField.match(/value\s*=\s*["']([^"']+)/i)?.[1] || '';

            // Check if hidden field contains sensitive-looking data
            if (/password|secret|key|token|credit|card/i.test(fieldName)) {
                issues.push({
                    formId,
                    type: 'sensitive-hidden',
                    severity: 'high',
                    description: `Hidden field "${fieldName}" may contain sensitive data`,
                    field: fieldName,
                    recommendation: 'Never store secrets in hidden form fields'
                });
            }

            // Check if value looks like an email or other PII
            if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(fieldValue)) {
                issues.push({
                    formId,
                    type: 'sensitive-hidden',
                    severity: 'medium',
                    description: 'Hidden field contains email address',
                    field: fieldName,
                    recommendation: 'Avoid storing user data in hidden fields'
                });
            }
        }

        // Check for CSRF token in POST forms
        const isPostForm = /method\s*=\s*["']?post/i.test(formTag);
        if (isPostForm) {
            const hasCsrf = /csrf|_token|authenticity_token|__RequestVerificationToken/i.test(formContent);
            if (!hasCsrf && (hasLoginForm || hasPaymentForm)) {
                issues.push({
                    formId,
                    type: 'no-csrf',
                    severity: 'high',
                    description: 'POST form may lack CSRF protection',
                    recommendation: 'Add CSRF token to prevent cross-site request forgery'
                });
            }
        }

        // Check PII fields autocomplete
        const piiFields = [
            { pattern: /name\s*=\s*["']?(email|e-mail)/i, autocomplete: 'email' },
            { pattern: /name\s*=\s*["']?(phone|tel)/i, autocomplete: 'tel' },
            { pattern: /name\s*=\s*["']?(address|street)/i, autocomplete: 'address-line1' },
            { pattern: /name\s*=\s*["']?(zip|postal)/i, autocomplete: 'postal-code' },
        ];

        for (const { pattern, autocomplete } of piiFields) {
            if (pattern.test(formContent)) {
                const inputPattern = new RegExp(`<input[^>]+${pattern.source}[^>]*`, 'gi');
                let inputMatch;
                while ((inputMatch = inputPattern.exec(formContent)) !== null) {
                    const input = inputMatch[0];
                    if (!/autocomplete\s*=/i.test(input)) {
                        issues.push({
                            formId,
                            type: 'autocomplete-pii',
                            severity: 'low',
                            description: `PII field missing autocomplete attribute`,
                            field: input.match(/name\s*=\s*["']?([^"'\s>]+)/i)?.[1],
                            recommendation: `Add autocomplete="${autocomplete}" for better UX and password manager support`
                        });
                    }
                }
            }
        }
    }

    // Calculate score
    let score = 100;
    for (const issue of issues) {
        switch (issue.severity) {
            case 'critical': score -= 25; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 8; break;
            case 'low': score -= 3; break;
        }
    }
    score = Math.max(0, score);

    // Generate recommendations
    const recommendations: string[] = [];
    if (issues.some(i => i.type === 'no-https')) {
        recommendations.push('CRITICAL: Ensure all form submissions use HTTPS');
    }
    if (issues.some(i => i.type === 'no-csrf')) {
        recommendations.push('Add CSRF tokens to all POST forms');
    }
    if (issues.some(i => i.type === 'sensitive-hidden')) {
        recommendations.push('Review hidden fields for sensitive data exposure');
    }
    if (hasPaymentForm) {
        recommendations.push('Ensure PCI DSS compliance for payment forms');
    }
    if (issues.length === 0) {
        recommendations.push('Forms follow security best practices');
    }

    const secureCount = formCount - new Set(issues.map(i => i.formId || 'unknown')).size;

    return {
        totalForms: formCount,
        secureCount: Math.max(0, secureCount),
        issuesCount: issues.length,
        issues,
        score,
        hasLoginForm,
        hasPaymentForm,
        compliant: !issues.some(i => i.severity === 'critical' || i.severity === 'high'),
        recommendations
    };
}

/**
 * Get step-by-step fix (Pro)
 */
export function getFormSecurityFix(issue: FormSecurityIssue): string[] {
    const steps: string[] = [];

    switch (issue.type) {
        case 'no-https':
            steps.push('1. Change form action from http:// to https://');
            steps.push('2. Ensure your server supports HTTPS');
            steps.push('3. Add HSTS header to force HTTPS');
            steps.push('4. Test form submission works with HTTPS');
            break;
        case 'no-csrf':
            steps.push('1. Generate a unique CSRF token server-side');
            steps.push('2. Include token in a hidden form field');
            steps.push('3. Validate token on form submission');
            steps.push('4. Use framework CSRF protection if available');
            break;
        case 'sensitive-hidden':
            steps.push('1. Remove sensitive data from hidden fields');
            steps.push('2. Store on server-side session instead');
            steps.push('3. Use encrypted tokens if field data is needed');
            break;
        case 'password-autocomplete':
            steps.push('1. Add autocomplete="new-password" to new password fields');
            steps.push('2. Add autocomplete="current-password" to login fields');
            steps.push('3. This helps password managers work correctly');
            break;
        case 'autocomplete-pii':
            steps.push('1. Add appropriate autocomplete attribute');
            steps.push('2. Email: autocomplete="email"');
            steps.push('3. Phone: autocomplete="tel"');
            steps.push('4. Address: autocomplete="address-line1"');
            break;
        default:
            steps.push('Review form for security best practices');
    }

    return steps;
}
