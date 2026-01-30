'use client';

interface OptInIssue {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
    gdprArticle?: string;
}

interface OptInFormsData {
    compliant: boolean;
    totalIssues: number;
    preCheckedCount: number;
    hiddenConsentCount: number;
    bundledConsentCount: number;
    issues: OptInIssue[];
}

interface OptInFormsProps {
    optInForms: OptInFormsData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

function getSeverityBorder(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-white border-red-200';
        case 'high': return 'bg-white border-orange-200';
        default: return 'bg-white border-yellow-200';
    }
}

function getSeverityBadge(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-white text-red-800';
        case 'high': return 'bg-white text-orange-800';
        default: return 'bg-white text-yellow-800';
    }
}

export function OptInForms({
    optInForms,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: OptInFormsProps) {
    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Opt-in Forms Analysis</span>
                    {optInForms.compliant ? (
                        <span className="badge-passed">0 issues</span>
                    ) : (
                        <span className="badge-failed">
                            {optInForms.totalIssues} issue{optInForms.totalIssues > 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg text-center bg-white">
                            <p className={`text-2xl font-bold ${optInForms.preCheckedCount > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {optInForms.preCheckedCount}
                            </p>
                            <p className="text-xs text-slate-600">Pre-checked</p>
                        </div>
                        <div className="p-3 rounded-lg text-center bg-white">
                            <p className={`text-2xl font-bold ${optInForms.hiddenConsentCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                                {optInForms.hiddenConsentCount}
                            </p>
                            <p className="text-xs text-slate-600">Hidden consent</p>
                        </div>
                        <div className="p-3 rounded-lg text-center bg-white">
                            <p className={`text-2xl font-bold ${optInForms.bundledConsentCount > 0 ? 'text-yellow-600' : 'text-blue-600'}`}>
                                {optInForms.bundledConsentCount}
                            </p>
                            <p className="text-xs text-slate-600">Bundled consent</p>
                        </div>
                    </div>

                    {optInForms.compliant ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-blue-600 uppercase border border-blue-300 px-2 py-0.5 rounded">PASS</span>
                            <div>
                                <p className="font-semibold text-blue-800">All Forms Are Compliant</p>
                                <p className="text-sm text-blue-600">
                                    No pre-checked consent boxes or hidden consent inputs found.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-800 text-sm">
                                    <strong>GDPR Article 7:</strong> Consent must be freely given. Pre-checked boxes do not constitute valid consent.
                                </p>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {optInForms.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getSeverityBorder(issue.severity)}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(issue.severity)}`}>
                                                {issue.severity.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-slate-500">{issue.type.replace(/-/g, ' ')}</span>
                                            {issue.gdprArticle && (
                                                <span className="text-xs bg-white text-slate-700 px-1.5 py-0.5 rounded">
                                                    {issue.gdprArticle.split(' - ')[0]}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-700">{issue.description}</p>
                                        {isPro ? (
                                            <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                        ) : (
                                            <p className="text-xs text-blue-600 mt-2 blur-sm select-none">💡 Upgrade to Pro to see recommendation...</p>
                                        )}
                                    </div>
                                ))}
                                {!isPro && optInForms.issues.length > 2 && (
                                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-slate-600 text-sm mb-2">
                                            +{optInForms.issues.length - 2} more issues (Pro)
                                        </p>
                                        <button
                                            onClick={onUpgrade}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
                                        >
                                            Upgrade to Pro
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * Scans form checkboxes for pre-selection, hidden consent fields, and bundled consent.
                    </p>
                </div>
            )}
        </div>
    );
}
