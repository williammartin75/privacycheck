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
    // Consent Behavior recommendations
    darkPatterns: {
        title: 'Remove Dark Patterns from Consent Banner',
        description: 'Your consent banner uses manipulative design patterns that violate GDPR Article 7 (conditions for consent).',
        steps: [
            'Make the "Reject" button as visible and prominent as the "Accept" button',
            'Use neutral language - avoid guilt-tripping ("I don\'t care about privacy")',
            'Do not pre-check any non-essential cookie categories',
            'Remove cookie walls that block content access',
            'Allow closing the banner without making a choice',
            'Use the same number of clicks to reject as to accept',
            'Test your banner on mobile devices for accessibility',
        ],
        priority: 'high',
    },
    preConsentCookies: {
        title: 'Fix Pre-Consent Cookie Loading',
        description: 'Your site loads tracking cookies/scripts before obtaining user consent, which violates GDPR.',
        steps: [
            'Audit all third-party scripts (analytics, marketing pixels, etc.)',
            'Configure your CMP to block scripts until consent is given',
            'Use Google Tag Manager Consent Mode or similar for Google services',
            'Move script tags below the consent initialization code',
            'Use conditional loading: only execute scripts after consent',
            'Test by clearing cookies and verifying no trackers fire before consent',
            'Consider server-side tracking for privacy-compliant analytics',
        ],
        priority: 'high',
    },
    missingRejectButton: {
        title: 'Add Clear Reject Button to Consent Banner',
        description: 'Your consent banner does not have a clearly visible option to reject non-essential cookies.',
        steps: [
            'Add a "Reject All" or "Only Essential" button to your banner',
            'Place it at the same level and prominence as "Accept All"',
            'Avoid hiding reject options behind "Manage Preferences"',
            'Use clear, unambiguous text (not "Maybe later" or "Customize")',
            'Ensure one click is enough to reject all non-essential cookies',
            'Test that clicking reject actually blocks non-essential cookies',
        ],
        priority: 'high',
    },
    confirmShaming: {
        title: 'Remove Confirm Shaming Language',
        description: 'Your consent banner uses guilt-inducing language to manipulate users into accepting cookies.',
        steps: [
            'Replace manipulative text with neutral options',
            'Good: "Reject" or "Only necessary cookies"',
            'Bad: "No, I don\'t care about my experience" or "I\'ll miss out"',
            'Avoid emotional or fear-based language',
            'Let the choice speak for itself without commentary',
            'Review EDPB guidelines on valid consent',
        ],
        priority: 'medium',
    },
    preCheckedBoxes: {
        title: 'Uncheck Non-Essential Cookie Categories',
        description: 'Your consent settings have non-essential cookies pre-checked, which creates invalid consent under GDPR.',
        steps: [
            'Set all non-essential categories (analytics, marketing, preferences) to OFF by default',
            'Only "Strictly Necessary" cookies can be pre-enabled',
            'Let users actively opt-in to each category',
            'Save unchecked state as the default preference',
            'Test the consent flow from a fresh browser session',
        ],
        priority: 'high',
    },
};

export const getRecommendation = (issueKey: string): Recommendation | null => {
    return recommendations[issueKey] || null;
};
