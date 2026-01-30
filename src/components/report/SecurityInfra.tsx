'use client';

interface HeaderInfo {
    present: boolean;
    value?: string;
}

interface SecurityIssue {
    header: string;
    recommendation: string;
    privacyImpact: string;
}

interface SecurityHeadersData {
    score: number;
    presentCount: number;
    totalHeaders: number;
    headers: Record<string, HeaderInfo>;
    issues: SecurityIssue[];
}

interface SSLData {
    valid: boolean;
    hsts: boolean;
}

interface EmailSecurityData {
    spf: boolean;
    dmarc: boolean;
}

interface SecurityInfraProps {
    securityHeaders: SecurityHeadersData;
    ssl?: SSLData;
    emailSecurity?: EmailSecurityData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

export function SecurityInfra({
    securityHeaders,
    ssl,
    emailSecurity,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: SecurityInfraProps) {
    const badgeClass = securityHeaders.score >= 80 ? 'badge-passed' :
        securityHeaders.score >= 50 ? 'badge-warning' : 'badge-failed';

    const scoreColor = securityHeaders.score >= 80 ? 'bg-white text-slate-700' :
        securityHeaders.score >= 50 ? 'bg-white text-amber-700' : 'bg-white text-red-700';

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Security &amp; Infrastructure</span>
                    <span className={badgeClass}>{securityHeaders.score}/100</span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {/* Grade Summary */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`text-4xl font-bold px-4 py-2 rounded-lg ${scoreColor}`}>
                            {securityHeaders.score}/100
                        </div>
                        <div>
                            <p className="text-slate-700">
                                <strong>{securityHeaders.presentCount}</strong> of {securityHeaders.totalHeaders} headers present
                            </p>
                            <p className="text-sm text-slate-500">
                                Score: {securityHeaders.score}/100
                            </p>
                        </div>
                    </div>

                    {/* SSL/TLS & Email Security - Combined Grid */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {/* SSL/TLS */}
                        {ssl && (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <h4 className="font-medium text-slate-700 text-sm mb-2">SSL/TLS</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">HTTPS</span>
                                        <span className={ssl.valid ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                            {ssl.valid ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">HSTS</span>
                                        <span className={ssl.hsts ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                            {ssl.hsts ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Security */}
                        {emailSecurity && (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <h4 className="font-medium text-slate-700 text-sm mb-2">Email Security</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">SPF Record</span>
                                        <span className={emailSecurity.spf ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                            {emailSecurity.spf ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">DMARC</span>
                                        <span className={emailSecurity.dmarc ? 'text-slate-700 font-medium' : 'text-red-700 font-medium'}>
                                            {emailSecurity.dmarc ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Security Headers list */}
                    <h4 className="font-medium text-slate-700 text-sm mb-2">Security Headers</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {Object.entries(securityHeaders.headers).slice(0, isPro ? 10 : 6).map(([header, info]) => (
                            <div key={header} className={`p-2 rounded-lg text-xs ${info.present ? 'bg-white border border-slate-200' : 'bg-white border border-red-200'}`}>
                                <div className="flex items-center gap-2">
                                    {info.present ? (
                                        <span className="text-slate-700">Yes</span>
                                    ) : (
                                        <span className="text-red-700">X</span>
                                    )}
                                    <span className={`font-medium ${info.present ? 'text-slate-800' : 'text-red-800'}`}>
                                        {header.replace('Cross-Origin-', 'CO-')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pro recommendations */}
                    {isPro && securityHeaders.issues.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-4">
                            <p className="text-sm text-slate-800 font-medium mb-2">Recommendations:</p>
                            <div className="space-y-2">
                                {securityHeaders.issues.slice(0, 3).map((issue, i) => (
                                    <div key={i} className="text-xs text-slate-700">
                                        <p><strong>{issue.header}:</strong> {issue.recommendation}</p>
                                        <p className="text-slate-500 mt-0.5">- {issue.privacyImpact}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isPro && securityHeaders.issues.length > 0 && (
                        <div className="mt-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 blur-sm pointer-events-none select-none">
                                <p className="text-sm text-slate-800 font-medium mb-2">Recommendations:</p>
                                <div className="space-y-2">
                                    <div className="text-xs text-slate-700">
                                        <p><strong>Strict-Transport-Security:</strong> Add header to enforce HTTPS...</p>
                                        <p className="text-slate-500 mt-0.5">- Prevents man-in-the-middle attacks</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                <p className="text-slate-600 text-sm mb-2">Unlock {securityHeaders.issues.length} security recommendations</p>
                                <button onClick={onUpgrade} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                    Upgrade to Pro
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * SSL/TLS ensures encrypted connections. Security headers protect against XSS, clickjacking, and data leakage.
                    </p>
                </div>
            )}
        </div>
    );
}
