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

interface ConsentModeV2Data {
    detected: boolean;
    hasDefaultConsent: boolean;
    hasConsentUpdate: boolean;
    defaultStates: {
        ad_storage: 'granted' | 'denied' | 'missing';
        ad_user_data: 'granted' | 'denied' | 'missing';
        ad_personalization: 'granted' | 'denied' | 'missing';
        analytics_storage: 'granted' | 'denied' | 'missing';
    };
    requiredParamsPresent: boolean;
    missingParams: string[];
    waitForUpdate: boolean;
    googleTagsPresent: boolean;
    googleTagTypes: string[];
    issues: string[];
    score: number;
}

interface ConsentBehaviorData {
    score: number;
    detected: boolean;
    consentProvider?: string | null;
    hasRejectButton: boolean;
    darkPatterns: DarkPattern[];
    preConsentCookies: PreConsentCookie[];
    issues: string[];
    consentModeV2?: ConsentModeV2Data;
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
    if (score >= 50) return 'text-orange-600';
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
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white border ${consentBehavior.score >= 80 ? 'border-blue-300' : consentBehavior.score >= 50 ? 'border-orange-300' : 'border-red-300'}`}>
                                <svg className={`w-5 h-5 ${getScoreColor(consentBehavior.score)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={consentBehavior.score >= 80 ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'} />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Consent Implementation Quality</p>
                                <p className="text-sm text-slate-500">
                                    Consent banner detected
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

                    {/* Google Consent Mode V2 */}
                    {consentBehavior.consentModeV2 && (
                        <div className="mt-5 pt-5 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <p className="font-semibold text-slate-800">Google Consent Mode V2</p>
                                {consentBehavior.consentModeV2.googleTagsPresent && (
                                    <span className={getBadgeClass(consentBehavior.consentModeV2.score)}>
                                        {consentBehavior.consentModeV2.score}/100
                                    </span>
                                )}
                            </div>

                            {!consentBehavior.consentModeV2.googleTagsPresent ? (
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 rounded-lg">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-slate-500">Not applicable — no Google tags detected</span>
                                </div>
                            ) : (
                                <>
                                    {/* Google Tags Detected */}
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-500 mb-1">Google Tags Found:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {consentBehavior.consentModeV2.googleTagTypes.map((tag, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* V2 Quick Checks */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                        <CheckIndicator passed={consentBehavior.consentModeV2.hasDefaultConsent} label="Default Consent" isPro={isPro} />
                                        <CheckIndicator passed={consentBehavior.consentModeV2.requiredParamsPresent} label="4 Required Params" isPro={isPro} />
                                        <CheckIndicator
                                            passed={
                                                consentBehavior.consentModeV2.defaultStates.ad_storage === 'denied' &&
                                                consentBehavior.consentModeV2.defaultStates.ad_user_data === 'denied' &&
                                                consentBehavior.consentModeV2.defaultStates.ad_personalization === 'denied' &&
                                                consentBehavior.consentModeV2.defaultStates.analytics_storage === 'denied'
                                            }
                                            label="Denied by Default"
                                            isPro={isPro}
                                        />
                                        <CheckIndicator passed={consentBehavior.consentModeV2.hasConsentUpdate} label="Consent Update" isPro={isPro} />
                                        <CheckIndicator passed={consentBehavior.consentModeV2.waitForUpdate} label="Wait for Update" isPro={isPro} />
                                    </div>

                                    {/* Parameter Status Table */}
                                    <div className={`mb-4 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                        <p className="text-xs font-semibold text-slate-600 mb-2">Parameter Defaults:</p>
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Parameter</th>
                                                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Default</th>
                                                        <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'] as const).map((param) => {
                                                        const state = consentBehavior.consentModeV2!.defaultStates[param];
                                                        const isOk = state === 'denied';
                                                        const isMissing = state === 'missing';
                                                        return (
                                                            <tr key={param} className="border-t border-slate-100">
                                                                <td className="px-3 py-2 font-mono text-xs text-slate-700">{param}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className={`text-xs px-2 py-0.5 rounded ${isOk ? 'bg-green-50 text-green-700' :
                                                                            isMissing ? 'bg-gray-100 text-gray-500' :
                                                                                'bg-red-50 text-red-700'
                                                                        }`}>
                                                                        {state}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    <svg className={`w-4 h-4 ${isOk ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOk ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                                                                    </svg>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* V2 Issues */}
                                    {consentBehavior.consentModeV2.issues.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs font-semibold text-slate-600 mb-2">Consent Mode V2 Issues:</p>
                                            <div className={`space-y-1 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                                {consentBehavior.consentModeV2.issues.map((issue, i) => (
                                                    <div key={i} className="flex items-start gap-2 bg-white px-3 py-2 rounded-lg border border-red-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                                                        <span className="text-xs text-red-700">{issue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {!isPro && <UpgradePrompt onUpgrade={onUpgrade} />}
                                        </div>
                                    )}
                                </>
                            )}

                            <p className="text-[10px] text-slate-400 mt-2">
                                Mandatory since March 2024 for Google Ads/GA4 in the EEA/UK. Without Consent Mode V2, ad conversions are not measured.
                            </p>
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
            <p className="text-slate-600 text-xs mb-2">Unlock step-by-step fix instructions</p>
            <button onClick={onUpgrade} className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded text-xs font-medium hover:from-cyan-600 hover:to-teal-700 transition">
                Upgrade to Pro+
            </button>
        </div>
    );
}
