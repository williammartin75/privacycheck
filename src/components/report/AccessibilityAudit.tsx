'use client';

interface AccessibilityViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    helpUrl: string;
    nodes: number;
    wcagCriteria: string;
    category: string;
}

interface AccessibilityResult {
    score: number;
    totalIssues: number;
    criticalCount: number;
    seriousCount: number;
    moderateCount: number;
    minorCount: number;
    violations: AccessibilityViolation[];
    passes: string[];
}

interface AccessibilityAuditProps {
    accessibility?: AccessibilityResult;
    isPro: boolean;
}

// SVG Icon Components 
const AccessibilityIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const CheckSmallIcon = () => (
    <svg className="w-3 h-3 text-green-600 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-3 h-3 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

function getImpactColor(impact: string): string {
    switch (impact) {
        case 'critical': return 'text-red-600 bg-white border-red-200';
        case 'serious': return 'text-orange-600 bg-white border-orange-200';
        case 'moderate': return 'text-amber-600 bg-white border-amber-200';
        case 'minor': return 'text-blue-600 bg-white border-blue-200';
        default: return 'text-slate-600 bg-white border-slate-200';
    }
}

function getImpactLabel(impact: string): string {
    switch (impact) {
        case 'critical': return 'CRITICAL';
        case 'serious': return 'SERIOUS';
        case 'moderate': return 'MODERATE';
        case 'minor': return 'MINOR';
        default: return impact.toUpperCase();
    }
}

export function AccessibilityAudit({ accessibility, isPro }: AccessibilityAuditProps) {
    if (!accessibility) {
        return (
            <div className="text-sm text-slate-500 italic">
                No accessibility data available
            </div>
        );
    }

    const scoreColor = accessibility.score >= 80 ? 'text-green-600' :
        accessibility.score >= 50 ? 'text-amber-600' : 'text-red-600';

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <AccessibilityIcon />
                        <div>
                            <h4 className="text-lg font-semibold text-slate-800">WCAG 2.1 AA Compliance</h4>
                            <p className="text-sm text-slate-500">European Accessibility Act (EAA 2025)</p>
                        </div>
                    </div>
                    <div className={`text-4xl font-bold ${scoreColor}`}>
                        {accessibility.score}/100
                    </div>
                </div>

                {/* Issues by Severity */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 text-center border border-red-200">
                        <div className="text-2xl font-bold text-red-600">{accessibility.criticalCount}</div>
                        <div className="text-xs text-red-600 font-medium">Critical</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">{accessibility.seriousCount}</div>
                        <div className="text-xs text-orange-600 font-medium">Serious</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-amber-200">
                        <div className="text-2xl font-bold text-amber-600">{accessibility.moderateCount}</div>
                        <div className="text-xs text-amber-600 font-medium">Moderate</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{accessibility.minorCount}</div>
                        <div className="text-xs text-blue-600 font-medium">Minor</div>
                    </div>
                </div>
            </div>

            {/* Violations */}
            {accessibility.violations.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <WarningIcon />
                        Issues Found ({accessibility.violations.length})
                    </h4>
                    <div className="space-y-3">
                        {accessibility.violations.map((violation, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${getImpactColor(violation.impact)}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getImpactColor(violation.impact)}`}>
                                                {getImpactLabel(violation.impact)}
                                            </span>
                                            <span className="text-xs text-slate-500">WCAG {violation.wcagCriteria}</span>
                                            <span className="text-xs text-slate-400">• {violation.category}</span>
                                        </div>
                                        {isPro ? (
                                            <>
                                                <p className="text-sm font-medium text-slate-800">{violation.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {violation.nodes} element{violation.nodes > 1 ? 's' : ''} affected
                                                </p>
                                                <a
                                                    href={violation.helpUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                                                >
                                                    Learn how to fix →
                                                </a>
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <p className="text-sm font-medium text-slate-800 blur-sm select-none">
                                                    {violation.description}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 blur-sm select-none">
                                                    {violation.nodes} element{violation.nodes > 1 ? 's' : ''} affected
                                                </p>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded font-medium flex items-center">
                                                        <LockIcon />
                                                        Upgrade to Pro+ to see details
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Passed Checks - same style as main PassedChecks component */}
            {accessibility.passes.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                        Checks Passed ({accessibility.passes.length})
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {/* First 3 visible for everyone */}
                        {(isPro ? accessibility.passes : accessibility.passes.slice(0, 3)).map((pass, index) => (
                            <span key={index} className="flex items-center gap-2 text-xs text-slate-700">
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {pass}
                            </span>
                        ))}

                        {/* Blurred items for free users */}
                        {!isPro && accessibility.passes.length > 3 && (
                            <div className="relative w-full">
                                <div className="flex flex-wrap gap-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                                    {accessibility.passes.slice(3).map((pass, index) => (
                                        <span key={index + 3} className="flex items-center gap-2 text-xs text-slate-700">
                                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {pass}
                                        </span>
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <a
                                        href="#pricing"
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                    >
                                        <svg className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Unlock all {accessibility.passes.length} checks — Upgrade to Pro
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* EAA 2025 Warning */}
            <div className="bg-white border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <InfoIcon />
                    <div>
                        <p className="text-sm font-medium text-amber-800">European Accessibility Act (EAA)</p>
                        <p className="text-xs text-amber-700 mt-1">
                            Since June 28, 2025, websites selling products or services in the EU must comply with WCAG 2.1 AA accessibility standards.
                            Non-compliance can result in fines up to €30,000.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
