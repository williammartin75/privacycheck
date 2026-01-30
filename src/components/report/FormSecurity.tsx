'use client';

interface FormSecurityIssue {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    field?: string;
    recommendation: string;
}

interface FormSecurityData {
    compliant: boolean;
    totalForms: number;
    secureCount: number;
    issuesCount: number;
    hasLoginForm: boolean;
    hasPaymentForm: boolean;
    issues: FormSecurityIssue[];
}

interface FormSecurityProps {
    formSecurity: FormSecurityData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
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
        default: return 'bg-white text-orange-800';
    }
}

export function FormSecurity({
    formSecurity,
    isOpen,
    onToggle,
    isPro
}: FormSecurityProps) {
    if (formSecurity.totalForms === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Form Security Analysis</span>
                    {formSecurity.compliant ? (
                        <span className="badge-passed">0 issues</span>
                    ) : (
                        <span className="badge-warning">
                            {formSecurity.issuesCount} issue{formSecurity.issuesCount > 1 ? 's' : ''}
                        </span>
                    )}
                    {formSecurity.hasLoginForm && (
                        <span className="badge-info">Login</span>
                    )}
                    {formSecurity.hasPaymentForm && (
                        <span className="badge-info">Payment</span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-slate-50 text-center">
                            <p className="text-2xl font-bold text-slate-700">{formSecurity.totalForms}</p>
                            <p className="text-xs text-slate-500">Forms</p>
                        </div>
                        <div className={`p-3 rounded-lg text-center bg-white`}>
                            <p className={`text-2xl font-bold ${formSecurity.secureCount === formSecurity.totalForms ? 'text-slate-700' : 'text-red-700'}`}>
                                {formSecurity.secureCount}/{formSecurity.totalForms}
                            </p>
                            <p className="text-xs text-slate-500">Secure</p>
                        </div>
                    </div>

                    {formSecurity.issues.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {formSecurity.issues.slice(0, isPro ? 8 : 2).map((issue, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${getSeverityBorder(issue.severity)}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-slate-700 uppercase">{issue.type.replace(/-/g, ' ')}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(issue.severity)}`}>{issue.severity}</span>
                                    </div>
                                    <p className="text-sm text-slate-700">{issue.description}</p>
                                    {issue.field && <p className="text-xs text-slate-500">Field: {issue.field}</p>}
                                    {isPro && (
                                        <p className="text-xs text-slate-600 mt-2">Tip: {issue.recommendation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-slate-700 uppercase">PASS</span>
                            <p className="font-semibold text-slate-800">All forms follow security best practices</p>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * Forms with passwords or payments require HTTPS and CSRF protection.
                    </p>
                </div>
            )}
        </div>
    );
}
