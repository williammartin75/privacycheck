export interface Recommendation {
    title: string;
    description: string;
    steps: string[];
    priority: 'high' | 'medium' | 'low';
}

export const recommendations: Record<string, Recommendation> = {
    https: {
        title: 'Enable HTTPS',
        description: 'Your site is not using HTTPS, which is required for GDPR compliance and protects user data in transit.',
        steps: [
            'Get an SSL certificate (free with Let\'s Encrypt or your hosting provider)',
            'Install the certificate on your web server',
            'Configure automatic redirects from HTTP to HTTPS',
            'Update all internal links to use HTTPS',
            'Test your site to ensure all resources load over HTTPS',
        ],
        priority: 'high',
    },
    consentBanner: {
        title: 'Add Cookie Consent Banner',
        description: 'Your site needs a cookie consent banner to comply with GDPR and ePrivacy regulations.',
        steps: [
            'Choose a consent management platform (CMP) like Cookiebot, OneTrust, or open-source alternatives',
            'Configure the banner to block non-essential cookies until consent is given',
            'Categorize your cookies (necessary, analytics, marketing, preferences)',
            'Add clear accept/reject buttons - avoid dark patterns',
            'Store user preferences and respect their choices',
            'Test that cookies are actually blocked before consent',
        ],
        priority: 'high',
    },
    privacyPolicy: {
        title: 'Create a Privacy Policy',
        description: 'A privacy policy is legally required and must explain how you collect, use, and protect user data.',
        steps: [
            'List all data you collect (personal info, cookies, analytics, etc.)',
            'Explain why you collect each type of data (legal basis)',
            'Describe how long you retain the data',
            'List third parties with whom you share data',
            'Explain user rights (access, deletion, portability)',
            'Include contact information for data protection inquiries',
            'Keep the policy updated when your practices change',
        ],
        priority: 'high',
    },
    legalMentions: {
        title: 'Add Legal Mentions Page',
        description: 'Legal mentions (or imprint) identify who operates the website and are required by law in many countries.',
        steps: [
            'Create a "Legal Notice" or "Imprint" page',
            'Include company name and legal form',
            'Add registered address and contact information',
            'Include registration numbers (company registry, VAT)',
            'Name the person responsible for content',
            'Link to this page from your footer',
        ],
        priority: 'medium',
    },
    dpoContact: {
        title: 'Add DPO Contact Information',
        description: 'Users must be able to contact your Data Protection Officer or privacy team easily.',
        steps: [
            'Designate a DPO or privacy contact person',
            'Add their contact email in your privacy policy',
            'Create a dedicated privacy contact form or email (e.g., privacy@yoursite.com)',
            'Ensure someone monitors and responds to privacy inquiries within 30 days',
        ],
        priority: 'medium',
    },
    dataDeleteLink: {
        title: 'Add Data Deletion Option',
        description: 'GDPR requires you to allow users to request deletion of their personal data.',
        steps: [
            'Add a "Delete My Data" link or form accessible to users',
            'Create a process to verify user identity before deletion',
            'Implement the actual data deletion in your systems',
            'Keep a log of deletion requests for compliance',
            'Respond to deletion requests within 30 days',
            'Inform third parties to also delete the data',
        ],
        priority: 'high',
    },
    optOutMechanism: {
        title: 'Implement Opt-Out Mechanism',
        description: 'Users must be able to opt out of marketing communications and non-essential data processing.',
        steps: [
            'Add unsubscribe links to all marketing emails',
            'Create a preferences page where users can manage consent',
            'Honor opt-out requests immediately',
            'Keep a suppression list to prevent re-adding opted-out users',
            'Provide opt-out for analytics if using personal data',
        ],
        priority: 'medium',
    },
    secureforms: {
        title: 'Secure Your Forms',
        description: 'Forms collecting personal data must be transmitted securely and validated properly.',
        steps: [
            'Ensure all forms submit over HTTPS',
            'Add CSRF protection tokens to forms',
            'Validate and sanitize all input server-side',
            'Only collect necessary data (data minimization)',
            'Add privacy notices near form submit buttons',
            'Encrypt sensitive data at rest in your database',
        ],
        priority: 'medium',
    },
    cookiePolicy: {
        title: 'Create Cookie Policy',
        description: 'A dedicated cookie policy explains what cookies you use and why.',
        steps: [
            'Create a dedicated cookie policy page',
            'List all cookies used on your site',
            'Categorize cookies (necessary, analytics, marketing, etc.)',
            'Explain the purpose of each cookie',
            'Include cookie duration and provider',
            'Explain how users can manage cookie preferences',
            'Link to the cookie policy from your consent banner',
        ],
        priority: 'medium',
    },
    ageVerification: {
        title: 'Consider Age Verification',
        description: 'If your service targets users under 16, you may need parental consent mechanisms.',
        steps: [
            'Determine if your service appeals to minors',
            'If so, implement age verification at registration',
            'For users under 16, require parental consent',
            'Consider using age-appropriate privacy notices',
            'Review COPPA requirements if operating in the US',
        ],
        priority: 'low',
    },
};

export const getRecommendation = (issueKey: string): Recommendation | null => {
    return recommendations[issueKey] || null;
};
