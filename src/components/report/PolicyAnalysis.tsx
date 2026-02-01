'use client';

interface GdprArticle {
    article: string;
    status: 'compliant' | 'partial' | 'missing';
}

interface PolicySection {
    found: boolean;
    status: string;
    score: number;
    details: string[];
    issues: string[];
}

interface PolicyAnalysisData {
    found: boolean;
    overallScore: number;
    overallStatus: 'compliant' | 'partial' | 'non-compliant' | 'not-found';
    lastUpdated?: string | null;
    gdprArticles: GdprArticle[];
    sections: Record<string, PolicySection>;
    missingElements: string[];
    recommendations: string[];
    policyUrl?: string | null;
}

interface PolicyAnalysisProps {
    policyAnalysis: PolicyAnalysisData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

const SECTION_NAMES: Record<string, string> = {
    legalBasis: 'Legal Basis',
    dataRetention: 'Data Retention',
    userRights: 'User Rights',
    thirdPartySharing: 'Third-Party Sharing',
    internationalTransfers: 'International Transfers',
    contactInfo: 'Contact Information',
    cookiePolicy: 'Cookie Policy',
    childrenPrivacy: 'Children Privacy',
};

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

function getStatusLabel(status: string): React.ReactNode {
    switch (status) {
        case 'compliant': return <span className="text-blue-600 border border-blue-300 px-2 py-0.5 rounded">PASS</span>;
        case 'partial': return <span className="text-amber-600 border border-amber-300 px-2 py-0.5 rounded">REVIEW</span>;
        case 'not-found': return <span className="text-slate-500 border border-slate-300 px-2 py-0.5 rounded">N/A</span>;
        default: return <span className="text-red-600 border border-red-300 px-2 py-0.5 rounded">FAIL</span>;
    }
}

function getStatusMessage(status: string): string {
    switch (status) {
        case 'compliant': return 'Privacy Policy Meets Key GDPR Requirements';
        case 'partial': return 'Privacy Policy Needs Improvement';
        case 'not-found': return 'No Privacy Policy Found';
        default: return 'Privacy Policy Has Issues to Address';
    }
}

export function PolicyAnalysis({
    policyAnalysis,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: PolicyAnalysisProps) {
    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Privacy Policy Analysis</span>
                    <span className={getBadgeClass(policyAnalysis.overallScore)}>
                        {policyAnalysis.overallScore}/100
                    </span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    {/* Overall Status */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg mb-4 bg-white">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold uppercase tracking-wider">
                                {getStatusLabel(policyAnalysis.overallStatus)}
                            </span>
                            <div>
                                <p className="font-semibold text-slate-800">
                                    {getStatusMessage(policyAnalysis.overallStatus)}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Score: {policyAnalysis.overallScore}/100
                                    {policyAnalysis.lastUpdated && ` • Last Updated: ${policyAnalysis.lastUpdated}`}
                                </p>
                            </div>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(policyAnalysis.overallScore)}`}>
                            {policyAnalysis.overallScore}/100
                        </span>
                    </div>

                    {/* Policy Link & Description */}
                    <div className="mb-4 pb-3 border-b border-slate-200">
                        {policyAnalysis.policyUrl && (
                            <a
                                href={policyAnalysis.policyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
                            >
                                View Privacy Policy
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                        <p className="text-xs text-gray-400">
                            Analyzes privacy policy content for GDPR compliance including legal basis, user rights, data retention, and contact information.
                        </p>
                    </div>

                    {/* GDPR Articles Compliance */}
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-slate-700 mb-2">GDPR Article Compliance:</p>
                        <div className={`flex flex-wrap gap-2 ${!isPro ? 'blur-sm select-none' : ''}`}>
                            {policyAnalysis.gdprArticles.map((article, i) => (
                                <span
                                    key={i}
                                    className={`text-xs px-3 py-1.5 rounded-full border ${article.status === 'compliant' ? 'bg-white text-slate-700 border-slate-300' :
                                        article.status === 'partial' ? 'bg-white text-amber-700 border-amber-200' :
                                            'bg-white text-red-700 border-red-200'
                                        }`}
                                >
                                    {article.article}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Policy Sections Grid */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                        {Object.entries(policyAnalysis.sections).map(([key, section]) => (
                            <div
                                key={key}
                                className={`p-3 rounded-lg border ${section.status === 'compliant' ? 'bg-white border-slate-200' :
                                    section.status === 'partial' ? 'bg-white border-amber-200' :
                                        'bg-white border-red-200'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-700">{SECTION_NAMES[key] || key}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${section.status === 'compliant' ? 'bg-white text-slate-800' :
                                        section.status === 'partial' ? 'bg-white text-amber-800' :
                                            'bg-white text-red-800'
                                        }`}>
                                        {section.score}%
                                    </span>
                                </div>
                                {section.details.length > 0 && (
                                    <p className={`text-xs text-slate-600 truncate ${!isPro ? 'blur-sm select-none' : ''}`}>{section.details[0]}</p>
                                )}
                                {section.issues.length > 0 && (
                                    <p className={`text-xs text-red-700 truncate mt-1 ${!isPro ? 'blur-sm select-none' : ''}`}>Warning: {section.issues[0]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Missing Elements */}
                    {policyAnalysis.missingElements.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-red-700 mb-2">Missing Elements:</p>
                            <div className={`flex flex-wrap gap-2 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                {policyAnalysis.missingElements.map((element, i) => (
                                    <span key={i} className="text-xs bg-white text-red-700 px-2 py-1 rounded-full">
                                        {element}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {policyAnalysis.recommendations.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">
                                {isPro ? 'Recommendations:' : 'Recommendations (Pro):'}
                            </p>
                            {isPro ? (
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                        {policyAnalysis.recommendations.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ol>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                                    <p className="text-slate-600 text-sm mb-3">
                                        Upgrade to Pro to see detailed recommendations for improving your privacy policy
                                    </p>
                                    <button
                                        onClick={onUpgrade}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                    >
                                        Upgrade to Pro - €19/mo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
