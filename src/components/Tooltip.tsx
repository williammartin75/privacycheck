'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<'top' | 'bottom'>('top');
    const triggerRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // If tooltip would go above viewport, show below
            if (rect.top < 60) {
                setPosition('bottom');
            } else {
                setPosition('top');
            }
        }
    }, [isVisible]);

    return (
        <span
            ref={triggerRef}
            className="relative inline-flex items-center cursor-help"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <svg className="w-3.5 h-3.5 ml-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg w-64 left-1/2 -translate-x-1/2 ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}
                >
                    {content}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${position === 'top'
                                ? 'top-full border-t-slate-800'
                                : 'bottom-full border-b-slate-800'
                            }`}
                    />
                </div>
            )}
        </span>
    );
}

// Dictionary of technical terms and their explanations
export const termDefinitions: Record<string, string> = {
    'DPO Contact': 'Data Protection Officer - A designated person responsible for GDPR compliance. Required for organizations processing personal data at scale.',
    'DMARC Record': 'Domain-based Message Authentication - An email security protocol that prevents email spoofing and phishing attacks.',
    'SPF Record': 'Sender Policy Framework - An email authentication method that specifies which servers can send emails for your domain.',
    'CSP': 'Content Security Policy - A security header that prevents cross-site scripting (XSS) attacks by controlling which resources can be loaded.',
    'HSTS': 'HTTP Strict Transport Security - Forces browsers to only use HTTPS connections, preventing downgrade attacks.',
    'X-Frame-Options': 'A security header that prevents your site from being embedded in iframes, protecting against clickjacking attacks.',
    'X-Content-Type-Options': 'Prevents browsers from MIME-sniffing, reducing exposure to drive-by download attacks.',
    'Referrer-Policy': 'Controls how much referrer information is shared when navigating from your site to others.',
    'Permissions-Policy': 'Controls which browser features and APIs can be used on your site (camera, microphone, location, etc.).',
    'SSL Certificate': 'Secure Sockets Layer - Encrypts data between the user\'s browser and your server, showing the padlock icon.',
    'Cookie Consent': 'A mechanism to obtain user permission before storing cookies, required by GDPR and ePrivacy Directive.',
    'Privacy Policy': 'A legal document explaining how you collect, use, and protect user data. Required by GDPR, CCPA, and most privacy laws.',
    'Cookie Policy': 'A document explaining what cookies your site uses, their purposes, and how users can manage them.',
    'Legal Mentions': 'Company identification information required by law (company name, address, registration number, etc.).',
    'Data Deletion': 'The right for users to request deletion of their personal data, also known as "Right to be Forgotten" under GDPR.',
    'Opt-out Mechanism': 'A way for users to refuse or withdraw consent for data processing, especially for marketing purposes.',
    'Dark Patterns': 'Deceptive UI design tricks that manipulate users into actions they didn\'t intend (hidden checkboxes, confusing buttons, etc.).',
    'Fingerprinting': 'A tracking technique that identifies users by collecting browser/device characteristics without cookies.',
    'Third-Party Trackers': 'External scripts that collect user data for advertising, analytics, or other purposes (Google Analytics, Facebook Pixel, etc.).',
    'Mixed Content': 'When an HTTPS page loads resources over insecure HTTP, weakening the security of the connection.',
    'Secure Forms': 'Forms that include proper consent checkboxes and submit data over HTTPS connections.',
};
