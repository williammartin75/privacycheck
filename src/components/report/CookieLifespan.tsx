'use client';

interface CookieIssue {
    name: string;
    currentLifespan: number;
    recommendedLifespan: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
}

interface LongestCookie {
    name: string;
    days: number;
}

interface CookieLifespanData {
    compliant: boolean;
    issuesCount: number;
    compliantCount: number;
    score: number;
    totalCookiesAnalyzed: number;
    averageLifespan: number;
    longestCookie?: LongestCookie | null;
    issues: CookieIssue[];
}

interface CookieLifespanProps {
    cookieLifespan: CookieLifespanData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getSeverityBadge(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-white text-red-800';
        case 'high': return 'bg-white text-orange-800';
        default: return 'bg-white text-yellow-800';
    }
}

export function CookieLifespan({
    cookieLifespan,
    isOpen,
    onToggle,
    isPro
}: CookieLifespanProps) {
    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Cookie Lifespan Analysis</span>
                    {cookieLifespan.compliant ? (
                        <span className="badge-passed">0 issues</span>
                    ) : (
                        <span className="badge-warning">
                            {cookieLifespan.issuesCount} issue{cookieLifespan.issuesCount > 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 rounded-lg text-center bg-slate-50">
                            <p className="text-2xl font-bold text-slate-700">{cookieLifespan.totalCookiesAnalyzed}</p>
                            <p className="text-xs text-slate-500">Analyzed</p>
                        </div>
                        <div className="p-3 rounded-lg text-center bg-white">
                            <p className={`text-2xl font-bold ${cookieLifespan.issuesCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                                {cookieLifespan.issuesCount}
                            </p>
                            <p className="text-xs text-slate-500">Excessive</p>
                        </div>
                        <div className="p-3 rounded-lg text-center bg-white">
                            <p className="text-2xl font-bold text-blue-600">
                                {cookieLifespan.averageLifespan}d
                            </p>
                            <p className="text-xs text-slate-500">Avg lifespan</p>
                        </div>
                    </div>

                    {cookieLifespan.longestCookie && (
                        <div className="bg-white border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>Longest cookie:</strong> &quot;{cookieLifespan.longestCookie.name}&quot; - {cookieLifespan.longestCookie.days} days
                                {cookieLifespan.longestCookie.days > 390 && ' (exceeds 13 months)'}
                            </p>
                        </div>
                    )}

                    {cookieLifespan.issues.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {cookieLifespan.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                                <div key={i} className="p-3 bg-white rounded-lg border border-orange-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-slate-800">{issue.name}</p>
                                            <p className="text-xs text-orange-600">{issue.currentLifespan} days → {issue.recommendedLifespan} days max</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(issue.severity)}`}>{issue.severity}</span>
                                    </div>
                                    {isPro && (
                                        <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * CNIL recommends max 13 months for consent and analytics cookies.
                    </p>
                </div>
            )}
        </div>
    );
}
