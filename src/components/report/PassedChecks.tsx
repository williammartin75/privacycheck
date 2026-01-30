'use client';

import { Tooltip, termDefinitions } from '@/components/Tooltip';

interface PassedChecksProps {
    issues: {
        https?: boolean;
        privacyPolicy?: boolean;
        cookiePolicy?: boolean;
        consentBanner?: boolean;
        legalMentions?: boolean;
        dpoContact?: boolean;
        dataDeleteLink?: boolean;
        optOutMechanism?: boolean;
        secureforms?: boolean;
        ssl?: { valid?: boolean };
        emailSecurity?: { spf?: boolean; dmarc?: boolean };
    };
}

interface CheckItemProps {
    passed: boolean;
    label: string;
    tooltipKey?: string;
}

function CheckItem({ passed, label, tooltipKey }: CheckItemProps) {
    if (!passed) return null;
    const tooltip = tooltipKey ? termDefinitions[tooltipKey] : null;

    return (
        <span className="flex items-center gap-2 text-xs text-slate-700">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {tooltip ? (
                <Tooltip content={tooltip}>{label}</Tooltip>
            ) : (
                label
            )}
        </span>
    );
}

export function PassedChecks({ issues }: PassedChecksProps) {
    return (
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Checks Passed</h4>
            <div className="flex flex-wrap gap-3">
                <CheckItem passed={!!issues.https} label="HTTPS Enabled" />
                <CheckItem passed={!!issues.privacyPolicy} label="Privacy Policy" tooltipKey="Privacy Policy" />
                <CheckItem passed={!!issues.cookiePolicy} label="Cookie Policy" tooltipKey="Cookie Policy" />
                <CheckItem passed={!!issues.consentBanner} label="Cookie Consent" tooltipKey="Cookie Consent" />
                <CheckItem passed={!!issues.legalMentions} label="Legal Mentions" tooltipKey="Legal Mentions" />
                <CheckItem passed={!!issues.dpoContact} label="DPO Contact" tooltipKey="DPO Contact" />
                <CheckItem passed={!!issues.dataDeleteLink} label="Data Deletion" tooltipKey="Data Deletion" />
                <CheckItem passed={!!issues.optOutMechanism} label="Opt-out Option" tooltipKey="Opt-out Mechanism" />
                <CheckItem passed={!!issues.secureforms} label="Secure Forms" tooltipKey="Secure Forms" />
                <CheckItem passed={!!issues.ssl?.valid} label="SSL Certificate" tooltipKey="SSL Certificate" />
                <CheckItem passed={!!issues.emailSecurity?.spf} label="SPF Record" tooltipKey="SPF Record" />
                <CheckItem passed={!!issues.emailSecurity?.dmarc} label="DMARC Record" tooltipKey="DMARC Record" />
            </div>
        </div>
    );
}
