'use client';

interface DarkPattern {
    description: string;
    severity: 'high' | 'medium' | 'low';
}

interface PreConsentCookie {
    name: string;
    category: string;
    violation: boolean;
}

interface ConsentBehaviorData {
    score: number;
    detected: boolean;
    consentProvider?: string | null;
    hasRejectButton: boolean;
    darkPatterns: DarkPattern[];
    preConsentCookies: PreConsentCookie[];
    issues: string[];
}

interface Recommendation {
    title?: string;
    description?: string;
    steps: string[];
}

interface Recommendations {
    darkPatterns?: Recommendation;
    preConsentCookies?: Recommendation;
    missingRejectButton?: Recommendation;
}

interface ConsentBehaviorProps {
    consentBehavior: ConsentBehaviorData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    expandedRec: string | null;
    setExpandedRec: (rec: string | null) => void;
    recommendations: Recommendations;
    onUpgrade: () => void;
}

function getBadgeClass(score: number): string {
    if (score >= 80) return 'badge-passed';
    if (score >= 50) return 'badge-warning';
    return 'badge-failed';
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
}

export function ConsentBehavior({
    consentBehavior,
    isOpen,
    onToggle,
    isPro,
    expandedRec,
    setExpandedRec,
    recommendations,
    onUpgrade
}: ConsentBehaviorProps) {
    const violatingCookies = consentBehavior.preConsentCookies.filter(c => c.violation);

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Consent Behavior Test</span>
                    <span className={getBadgeClass(consentBehavior.score)}>
                        {consentBehavior.score}/100
                    </span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="rounded-lg p-5 border border-slate-200 bg-white">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white border ${consentBehavior.score >= 80 ? 'border-blue-300' : consentBehavior.score >= 50 ? 'border-yellow-300' : 'border-red-300'}`}>
                                <svg className={`w-5 h-5 ${getScoreColor(consentBehavior.score)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={consentBehavior.score >= 80 ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'} />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Consent Implementation Quality</p>
                                <p className="text-sm text-slate-500">
                                    {consentBehavior.consentProvider ? `Using ${consentBehavior.consentProvider}` : 'Consent banner detected'}
                                </p>
                            </div>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(consentBehavior.score)}`}>
                            {consentBehavior.score}/100
                        </span>
                    </div>

                    {/* Quick checks */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                        <CheckIndicator passed={consentBehavior.detected} label="Banner Present" isPro={isPro} />
                        <CheckIndicator passed={consentBehavior.hasRejectButton} label="Reject Button" isPro={isPro} />
                        <CheckIndicator passed={consentBehavior.darkPatterns.length === 0} label="No Dark Patterns" isPro={isPro} />
                        <CheckIndicator passed={violatingCookies.length === 0} label="Consent-Gated" isPro={isPro} />
                    </div>

                    {/* Issues found */}
                    {consentBehavior.issues.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Issues Detected:</p>
                            <div className={`space-y-2 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                {consentBehavior.issues.slice(0, 5).map((issue, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        <span className="text-sm text-red-700">{issue}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dark patterns */}
                    {consentBehavior.darkPatterns.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Dark Patterns Found:</p>
                            <div className="space-y-2">
                                {consentBehavior.darkPatterns.map((pattern, i) => (
                                    <ExpandableItem
                                        key={i}
                                        id={`darkPattern-${i}`}
                                        text={pattern.description}
                                        severity={pattern.severity}
                                        isPro={isPro}
                                        expandedRec={expandedRec}
                                        setExpandedRec={setExpandedRec}
                                        recommendation={recommendations.darkPatterns}
                                        borderColor="orange"
                                    />
                                ))}
                            </div>
                            {!isPro && <UpgradePrompt onUpgrade={onUpgrade} />}
                        </div>
                    )}

                    {/* Pre-consent cookies */}
                    {violatingCookies.length > 0 && (
                        <div className="mb-4">
                            <div
                                className={isPro ? 'cursor-pointer' : ''}
                                onClick={() => isPro && setExpandedRec(expandedRec === 'preConsentCookies' ? null : 'preConsentCookies')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-slate-700">Cookies Loaded Before Consent:</p>
                                    {isPro && (
                                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedRec === 'preConsentCookies' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {violatingCookies.map((cookie, i) => (
                                        <span key={i} className={!isPro ? 'blur-sm select-none' : ''}>{cookie.name} ({cookie.category})</span>
                                    ))}
                                </div>
                            </div>
                            {expandedRec === 'preConsentCookies' && isPro && recommendations.preConsentCookies && (
                                <RecommendationBox recommendation={recommendations.preConsentCookies} borderColor="red" />
                            )}
                            {!isPro && <UpgradePrompt onUpgrade={onUpgrade} />}
                        </div>
                    )}

                    {/* Missing reject button */}
                    {!consentBehavior.hasRejectButton && consentBehavior.detected && (
                        <div className="mb-4">
                            <ExpandableItem
                                id="missingRejectButton"
                                text="Missing clear reject button"
                                isPro={isPro}
                                expandedRec={expandedRec}
                                setExpandedRec={setExpandedRec}
                                recommendation={recommendations.missingRejectButton}
                                borderColor="red"
                            />
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * Checks consent banner implementation, presence of dark patterns, and whether tracking scripts await user consent.
                    </p>
                </div>
            )}
        </div>
    );
}

// Helper components
function CheckIndicator({ passed, label, isPro }: { passed: boolean; label: string; isPro: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${passed ? 'bg-white text-blue-700' : 'bg-white text-red-700'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passed ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
            </svg>
            <span className={`text-xs font-medium ${!isPro ? 'blur-sm select-none' : ''}`}>{label}</span>
        </div>
    );
}

function ExpandableItem({
    id, text, severity, isPro, expandedRec, setExpandedRec, recommendation, borderColor
}: {
    id: string;
    text: string;
    severity?: string;
    isPro: boolean;
    expandedRec: string | null;
    setExpandedRec: (rec: string | null) => void;
    recommendation?: Recommendation;
    borderColor: 'orange' | 'red';
}) {
    const borderClass = borderColor === 'orange' ? 'border-orange-200' : 'border-red-200';
    const textClass = borderColor === 'orange' ? 'text-orange-800' : 'text-red-800';
    const iconClass = borderColor === 'orange' ? 'text-orange-400' : 'text-red-400';

    return (
        <div
            className={`bg-white rounded-lg border ${borderClass} overflow-hidden ${isPro ? 'cursor-pointer hover:bg-white' : ''}`}
            onClick={() => isPro && setExpandedRec(expandedRec === id ? null : id)}
        >
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 ${borderColor === 'orange' ? 'text-orange-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className={`text-sm ${textClass}`}>{text}</span>
                </div>
                <div className="flex items-center gap-2">
                    {severity && (
                        <span className={`text-xs px-2 py-0.5 rounded ${severity === 'high' ? 'bg-white text-red-700' : severity === 'medium' ? 'bg-white text-orange-700' : 'bg-white text-yellow-700'}`}>
                            {severity.toUpperCase()}
                        </span>
                    )}
                    {isPro && (
                        <svg className={`w-4 h-4 ${iconClass} transition-transform ${expandedRec === id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>
            </div>
            {expandedRec === id && isPro && recommendation && (
                <div className="px-3 pb-3">
                    <RecommendationBox recommendation={recommendation} borderColor={borderColor} />
                </div>
            )}
        </div>
    );
}

function RecommendationBox({ recommendation, borderColor }: { recommendation: Recommendation; borderColor: 'orange' | 'red' }) {
    const borderClass = borderColor === 'orange' ? 'border-orange-200' : 'border-red-100';

    return (
        <div className={`mt-3 bg-white rounded-lg p-4 border ${borderClass}`}>
            <h4 className="font-semibold text-gray-900 mb-2">{recommendation.title || 'How to Fix'}</h4>
            {recommendation.description && <p className="text-gray-600 text-sm mb-3">{recommendation.description}</p>}
            <h5 className="font-medium text-gray-900 mb-2 text-sm">How to fix:</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                {recommendation.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                ))}
            </ol>
        </div>
    );
}

function UpgradePrompt({ onUpgrade }: { onUpgrade: () => void }) {
    return (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-slate-600 text-xs mb-2">Upgrade to Pro for step-by-step fix instructions</p>
            <button onClick={onUpgrade} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition">
                Upgrade - €19/mo
            </button>
        </div>
    );
}
