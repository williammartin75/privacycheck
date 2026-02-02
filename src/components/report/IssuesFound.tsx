'use client';

import { Tooltip } from '@/components/Tooltip';

interface IssuesFoundProps {
    issues: Array<{ item: string; points: number }>;
}

// Remove parentheses and their content for cleaner display
function stripParentheses(text: string): string {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
}

// Complete tooltip definitions for ALL possible issues
const issueTooltips: Record<string, string> = {
    // Core Privacy
    'HTTPS Enabled': 'Your site uses encrypted HTTPS connections to protect user data in transit.',
    'Cookie Consent Banner': 'A popup or banner asking users to accept or reject cookies. Required by GDPR before setting non-essential cookies.',
    'Privacy Policy': 'A legal document explaining how you collect, use, and protect user data. Required by GDPR, CCPA, and most privacy laws.',
    'Privacy Policy Quality': 'Assessment of how complete and clear your privacy policy is. Checks for required elements like data retention, user rights, and contact info.',
    'Legal Mentions': 'Company identification information required by law (company name, address, registration number, etc.).',
    'DPO Contact': 'Data Protection Officer - A designated person responsible for GDPR compliance. Required for organizations processing personal data at scale.',
    'Data Deletion Option': 'A visible option for users to request deletion of their personal data. Required under GDPR Article 17 (Right to be Forgotten).',
    'Secure Forms': 'Forms that include proper consent checkboxes and submit data over HTTPS connections.',
    'Opt-out Mechanism': 'A way for users to refuse or withdraw consent for data processing, especially for marketing purposes.',
    'Cookie Policy': 'A document explaining what cookies your site uses, their purposes, and how users can manage them.',

    // Consent & Behavior
    'Consent Behavior': 'How your cookie banner handles user choices. Good: respects "reject all". Bad: pre-checks boxes, ignores refusal, or sets cookies before consent.',

    // Dark Patterns
    'Dark Patterns': 'Deceptive UI design tricks that manipulate users into actions they didn\'t intend (hidden checkboxes, confusing buttons, etc.).',
    'No Dark Patterns': 'No deceptive UI patterns detected on your site.',

    // Opt-in Forms
    'Opt-in Issues': 'Problems with email subscription or marketing opt-in forms. Issues include pre-checked boxes, missing consent, or no double opt-in.',
    'Opt-in Forms Compliant': 'Your opt-in forms follow GDPR requirements: no pre-checked boxes, clear consent language.',

    // Cookie Lifespan
    'Cookie Lifespan Issues': 'Some cookies have excessive lifespans. GDPR recommends no more than 12 months for non-essential cookies.',
    'Cookie Lifespans Compliant': 'All cookies have reasonable lifespans within GDPR guidelines.',

    // Fingerprinting
    'Fingerprinting Detected': 'Your site uses fingerprinting techniques that can track users without cookies. This may violate ePrivacy Directive.',
    'No Fingerprinting': 'No fingerprinting techniques detected on your site.',

    // Security
    'Security Headers': 'HTTP response headers that protect against common web attacks (XSS, clickjacking, MIME sniffing). Includes CSP, HSTS, X-Frame-Options, etc.',
    'Storage Issues': 'Sensitive data stored in localStorage/sessionStorage without proper protection or expiry.',
    'Client Storage Compliant': 'Your client-side storage usage follows security best practices.',
    'Mixed Content': 'When an HTTPS page loads resources over insecure HTTP, weakening the security of the connection.',
    'No Mixed Content': 'All resources are loaded over secure HTTPS connections.',

    // Form Security
    'Form Security Issues': 'Security issues with forms on your site: missing HTTPS submission, no CSRF protection, or forms collecting data without consent.',
    'Forms Secure': 'Your forms use HTTPS and include proper security measures.',

    // Accessibility
    'Accessibility Issues': 'Problems that prevent users with disabilities from using your site. Required by EAA 2025 for EU businesses. Fines up to €30,000.',
    'Accessibility (EAA 2025)': 'Your site meets basic accessibility requirements under the European Accessibility Act.',

    // Domain
    'Domain Risk': 'Security issues with your domain: expired SSL, missing DNSSEC, typosquatting domains, or domain expiration warnings.',
    'Domain Security': 'Your domain configuration is secure with valid SSL and no expiry concerns.',

    // Supply Chain
    'Supply Chain Risk': 'Third-party scripts and dependencies that could introduce security vulnerabilities or privacy issues to your site.',
    'Supply Chain Security': 'Your external dependencies are from trusted sources with no known vulnerabilities.',

    // Hidden Costs
    'Cost Inefficiency': 'Redundant or expensive third-party tools detected. Potential savings from consolidating overlapping services.',
    'Cost Efficiency': 'Your site uses an efficient set of external tools without redundancy.',

    // Trackers
    'Trackers': 'External scripts that collect user data for advertising or analytics. Common examples: Google Analytics, Facebook Pixel.',
    'No Trackers': 'No third-party tracking scripts detected on your site.',

    // Cookies
    'Undeclared Cookies': 'Cookies set by your site that are not listed in your cookie policy. GDPR requires disclosure of all cookies before they are set.',

    // Email
    'Email Deliverability': 'Whether your emails reach inboxes or get marked as spam. Depends on SPF, DKIM, and DMARC configuration.',
    'Exposed Emails': 'Email addresses visible in your HTML source code. Spammers scrape these for phishing and spam campaigns.',

    // AI
    'AI Detection': 'Your AI systems have been analyzed for EU AI Act requirements.',

    // Technology
    'Technology Security': 'Assessment of your CMS/framework version security. Outdated versions may have known vulnerabilities.',
};

// Get tooltip for an issue
function getTooltip(item: string): string | null {
    const cleanItem = stripParentheses(item);

    // 1. Direct exact match
    if (issueTooltips[cleanItem]) {
        return issueTooltips[cleanItem];
    }

    // 2. Try partial matching (for items like "Security Headers (45/100)")
    for (const [key, value] of Object.entries(issueTooltips)) {
        if (cleanItem.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(cleanItem.toLowerCase())) {
            return value;
        }
    }

    // 3. No match - return generic tooltip
    return 'This issue may affect your privacy compliance or security posture. Click to see details in the full report.';
}

export function IssuesFound({ issues }: IssuesFoundProps) {
    const failedItems = issues.filter(b => b.points < 0);

    if (failedItems.length === 0) return null;

    return (
        <div className="mb-6 p-4 rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-red-600 mb-3">Issues Found</h4>
            <div className="flex flex-wrap gap-3">
                {failedItems.map((item, i) => {
                    const label = stripParentheses(item.item);
                    const tooltip = getTooltip(item.item);
                    return (
                        <span key={i} className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-600">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <Tooltip content={tooltip || ''}>{label}</Tooltip>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

