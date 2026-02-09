'use client';

import { useState } from 'react';

interface ScoreBreakdownItem {
    item: string;
    passed: boolean;
    points: number;
}

interface PassedChecksProps {
    scoreBreakdown?: ScoreBreakdownItem[];
    isPro?: boolean;
}

// Tooltip descriptions for each check
const CHECK_TOOLTIPS: Record<string, string> = {
    'HTTPS Enabled': 'Your website uses a secure HTTPS connection, protecting data in transit.',
    'Cookie Consent Banner': 'A cookie consent mechanism is present, allowing users to accept or reject tracking.',
    'Privacy Policy': 'A privacy policy page is accessible on your website.',
    'Legal Mentions': 'Required legal information (imprint, company details) is present.',
    'DPO Contact': 'A Data Protection Officer contact is available for privacy inquiries.',
    'Data Deletion Option': 'Users can request deletion of their personal data.',
    'Secure Forms': 'Forms on your site use secure submission methods (HTTPS, proper attributes).',
    'Opt-out Mechanism': 'Users have a way to opt-out of data collection or marketing.',
    'Cookie Policy': 'A dedicated cookie policy explains your cookie usage practices.',
    'Consent Behavior': 'Consent is collected before tracking cookies are set.',
    'Privacy Policy Quality': 'Your privacy policy contains required GDPR elements.',
    'Opt-in Forms Compliant': 'Newsletter/marketing forms use proper opt-in (not pre-checked).',
    'Cookie Lifespans Compliant': 'Cookie expiration times comply with regulations (no excessive durations).',
    'No Fingerprinting': 'No browser fingerprinting techniques detected.',
    'Client Storage Compliant': 'LocalStorage/SessionStorage usage is compliant with privacy rules.',
    'No Mixed Content': 'All resources are loaded over HTTPS (no insecure HTTP content).',
    'Forms Secure': 'All forms have secure action URLs and proper CSRF protection.',
    'Domain Security': 'Domain has proper DNS security (SPF, DKIM, DMARC configured).',
    'Cost Efficiency': 'No unnecessary third-party services inflating costs.',
    'No Trackers': 'No known tracking scripts or pixels detected on your site.',
    'AI Detection': 'AI systems detected and analyzed for EU AI Act requirements.',
    'SSL Certificate': 'Valid SSL/TLS certificate is installed and not expiring soon.',
    'SPF Record': 'SPF email authentication is configured for your domain.',
    'DMARC Record': 'DMARC policy is set to protect against email spoofing.',
    'DKIM Record': 'DKIM email signing is configured for authentication.',
    'No Dark Patterns': 'No manipulative UI patterns detected (confirmshaming, hidden options, etc.).',
    'Accessibility': 'Website meets basic WCAG 2.1 accessibility standards.',
    'Security Headers': 'Proper security headers are configured (CSP, X-Frame-Options, etc.).',
    'Supply Chain': 'Third-party scripts come from trusted sources.',
    'Terms of Service': 'Terms of service page is accessible on your website.',
    'Contact Page': 'A contact page or contact information is available.',
    'Unsubscribe Link': 'Email communications include an unsubscribe option.',
};

function getTooltip(itemName: string): string {
    // Clean the item name for lookup
    const cleanName = itemName.replace(/\s*\([^)]*\)/g, '').trim();
    return CHECK_TOOLTIPS[cleanName] || `This check passed successfully.`;
}

const FREE_VISIBLE_COUNT = 3;

export function PassedChecks({ scoreBreakdown, isPro = false }: PassedChecksProps) {
    const passedItems = scoreBreakdown?.filter(b => b.passed) || [];
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

    if (passedItems.length === 0) return null;

    const visibleItems = isPro ? passedItems : passedItems.slice(0, FREE_VISIBLE_COUNT);
    const blurredItems = isPro ? [] : passedItems.slice(FREE_VISIBLE_COUNT);

    return (
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300">
            <p className="text-sm font-semibold text-slate-700 mb-3">Checks Passed ({passedItems.length})</p>
            <div className="flex flex-wrap gap-3">
                {/* Visible items (always clear) */}
                {visibleItems.map((item, index) => {
                    const cleanName = item.item.replace(/\s*\([^)]*\)/g, '');
                    const tooltip = getTooltip(item.item);

                    return (
                        <span
                            key={index}
                            className="relative flex items-center gap-2 text-xs text-slate-700 cursor-help group"
                            onMouseEnter={() => setActiveTooltip(index)}
                            onMouseLeave={() => setActiveTooltip(null)}
                        >
                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {cleanName}
                            {/* Info icon to indicate tooltip */}
                            <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>

                            {/* Tooltip */}
                            {activeTooltip === index && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg z-50 w-64 text-center whitespace-normal">
                                    {tooltip}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                                </div>
                            )}
                        </span>
                    );
                })}

                {/* Blurred items (free users only) */}
                {blurredItems.length > 0 && (
                    <div className="relative w-full">
                        <div className="flex flex-wrap gap-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                            {blurredItems.map((item, index) => {
                                const cleanName = item.item.replace(/\s*\([^)]*\)/g, '');
                                return (
                                    <span
                                        key={index + FREE_VISIBLE_COUNT}
                                        className="flex items-center gap-2 text-xs text-slate-700"
                                    >
                                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {cleanName}
                                        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                );
                            })}
                        </div>
                        {/* Upgrade overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <a
                                href="#pricing"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Upgrade to Pro
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
