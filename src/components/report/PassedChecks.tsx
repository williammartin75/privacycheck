'use client';

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
}

function CheckItem({ passed, label }: CheckItemProps) {
    if (!passed) return null;
    return (
        <span className="flex items-center gap-2 text-xs text-slate-700">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {label}
        </span>
    );
}

export function PassedChecks({ issues }: PassedChecksProps) {
    return (
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Checks Passed</h4>
            <div className="flex flex-wrap gap-2">
                <CheckItem passed={!!issues.https} label="HTTPS Enabled" />
                <CheckItem passed={!!issues.privacyPolicy} label="Privacy Policy" />
                <CheckItem passed={!!issues.cookiePolicy} label="Cookie Policy" />
                <CheckItem passed={!!issues.consentBanner} label="Cookie Consent" />
                <CheckItem passed={!!issues.legalMentions} label="Legal Mentions" />
                <CheckItem passed={!!issues.dpoContact} label="DPO Contact" />
                <CheckItem passed={!!issues.dataDeleteLink} label="Data Deletion" />
                <CheckItem passed={!!issues.optOutMechanism} label="Opt-out Option" />
                <CheckItem passed={!!issues.secureforms} label="Secure Forms" />
                <CheckItem passed={!!issues.ssl?.valid} label="SSL Certificate" />
                <CheckItem passed={!!issues.emailSecurity?.spf} label="SPF Record" />
                <CheckItem passed={!!issues.emailSecurity?.dmarc} label="DMARC Record" />
            </div>
        </div>
    );
}
