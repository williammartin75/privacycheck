'use client';

interface MixedContentIssue {
    type: string;
    url: string;
    blocked: boolean;
    recommendation: string;
}

interface MixedContentData {
    detected: boolean;
    totalIssues: number;
    blockedCount: number;
    byType: Record<string, number>;
    issues: MixedContentIssue[];
}

interface MixedContentProps {
    mixedContent: MixedContentData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

export function MixedContent({
    mixedContent,
    isOpen,
    onToggle,
    isPro
}: MixedContentProps) {
    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Mixed Content Security</span>
                    {mixedContent.detected ? (
                        <span className="badge-failed">
                            {mixedContent.totalIssues} issue{mixedContent.totalIssues > 1 ? 's' : ''}
                        </span>
                    ) : (
                        <span className="badge-passed">0 issues</span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {mixedContent.detected ? (
                        <>
                            <div className="bg-white border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-red-800 text-sm">
                                    <strong>⚠️ Security Risk:</strong> HTTP resources on HTTPS page.
                                    {mixedContent.blockedCount > 0 && ` ${mixedContent.blockedCount} blocked by browser.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                                {Object.entries(mixedContent.byType).filter(([, v]) => v > 0).map(([type, count]) => (
                                    <div key={type} className="p-2 rounded bg-white text-center">
                                        <p className="font-bold text-red-600">{count}</p>
                                        <p className="text-slate-500">{type}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {mixedContent.issues.slice(0, isPro ? 8 : 2).map((issue, i) => (
                                    <div key={i} className="p-2 bg-white rounded-lg border border-red-100 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-700 uppercase">{issue.type}</span>
                                            {issue.blocked && <span className="px-1 bg-white text-red-800 rounded">BLOCKED</span>}
                                        </div>
                                        <p className="text-slate-600 truncate">{issue.url}</p>
                                        {isPro ? (
                                            <p className="text-blue-600 mt-1">→ {issue.recommendation}</p>
                                        ) : (
                                            <p className="text-blue-600 mt-1 blur-sm select-none">→ Upgrade to Pro to see fix...</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-blue-600 uppercase border border-blue-300 px-2 py-0.5 rounded">PASS</span>
                            <div>
                                <p className="font-semibold text-blue-800">All Secure</p>
                                <p className="text-sm text-blue-600">No HTTP resources on HTTPS page.</p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * Mixed content exposes data to man-in-the-middle attacks.
                    </p>
                </div>
            )}
        </div>
    );
}
