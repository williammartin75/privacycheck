'use client';

interface RiskFactor {
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    gdprArticle?: string;
    fineContribution: number;
}

interface RiskPrediction {
    riskLevel: 'critical' | 'high' | 'medium' | 'low';
    minFine: number;
    maxFine: number;
    probability: number;
    factors: RiskFactor[];
    recommendation: string;
}

interface RiskAssessmentProps {
    riskPrediction: RiskPrediction;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

function formatFine(amount: number): string {
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'k';
    return amount.toString();
}

function getRiskColor(level: string): string {
    switch (level) {
        case 'critical': return 'text-red-700';
        case 'high': return 'text-orange-700';
        case 'medium': return 'text-yellow-700';
        default: return 'text-blue-700';
    }
}

function getBadgeClass(level: string): string {
    if (level === 'critical' || level === 'high') return 'badge-failed';
    if (level === 'medium') return 'badge-warning';
    return 'badge-passed';
}

export function RiskAssessment({
    riskPrediction,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: RiskAssessmentProps) {
    const fineRange = `€${formatFine(riskPrediction.minFine)} - €${formatFine(riskPrediction.maxFine)}`;

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Potential Regulatory Exposure</span>
                    <span className={getBadgeClass(riskPrediction.riskLevel)}>
                        {fineRange}
                    </span>
                </span>
                <svg
                    className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="rounded-lg p-6 border border-slate-200 bg-white">
                    {/* Fine Estimation Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Estimated Regulatory Exposure</p>
                            <p className={`text-3xl font-bold ${getRiskColor(riskPrediction.riskLevel)}`}>
                                {fineRange}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500 mb-1">Risk Level</p>
                            <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getRiskColor(riskPrediction.riskLevel)}`}>
                                {riskPrediction.riskLevel.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500 mb-1">Enforcement Probability</p>
                            <span
                                style={{
                                    color: riskPrediction.probability >= 70 ? '#b91c1c' :
                                        riskPrediction.probability >= 40 ? '#b45309' : '#15803d'
                                }}
                                className="inline-block px-4 py-2 rounded-full text-lg font-bold"
                            >
                                {riskPrediction.probability}%
                            </span>
                        </div>
                    </div>

                    {/* Risk Factors */}
                    {riskPrediction.factors.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-600 mb-2">Risk Factors Identified:</p>
                            <div className={`space-y-2 ${!isPro ? 'blur-sm pointer-events-none select-none' : ''}`}>
                                {riskPrediction.factors.slice(0, isPro ? 5 : 2).map((factor, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${factor.severity === 'critical' ? 'bg-red-600' :
                                                factor.severity === 'high' ? 'bg-red-500' :
                                                    factor.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                                                }`}></span>
                                            <div>
                                                <p className="font-medium text-gray-800">{factor.issue}</p>
                                                {factor.gdprArticle && (
                                                    <p className="text-xs text-gray-500">GDPR {factor.gdprArticle}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-red-700 font-semibold">
                                            +€{formatFine(factor.fineContribution)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {!isPro && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                    <p className="text-slate-600 text-sm mb-2">
                                        Unlock all {riskPrediction.factors.length} risk factors + remediation steps
                                    </p>
                                    <button
                                        onClick={onUpgrade}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                                    >
                                        Upgrade to Pro
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recommendation */}
                    <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200">
                        <p className="text-sm font-medium text-slate-700">
                            <strong>Recommendation:</strong>{' '}
                            <span className={!isPro ? 'blur-sm select-none' : ''}>{riskPrediction.recommendation}</span>
                        </p>
                    </div>

                    <p className="text-xs text-slate-400 mt-3">
                        * This is an indicative estimate only, not legal advice. Actual regulatory outcomes
                        depend on DPA discretion, company size, remediation efforts, and case specifics.
                        Consult a qualified legal professional for compliance assessment.
                    </p>
                </div>
            )}
        </div>
    );
}
