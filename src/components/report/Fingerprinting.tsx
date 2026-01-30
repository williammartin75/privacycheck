'use client';

interface FingerprintingIssue {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    gdprImpact: string;
    recommendation: string;
}

interface FingerprintingData {
    detected: boolean;
    score: number;
    byType: Record<string, number>;
    issues: FingerprintingIssue[];
}

interface FingerprintingProps {
    fingerprinting: FingerprintingData;
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

export function Fingerprinting({
    fingerprinting,
    isOpen,
    onToggle,
    isPro
}: FingerprintingProps) {
    const badgeClass = fingerprinting.score >= 80 ? 'badge-passed' :
        fingerprinting.score >= 50 ? 'badge-warning' : 'badge-failed';

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Fingerprinting Detection</span>
                    <span className={badgeClass}>{fingerprinting.score}/100</span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    {fingerprinting.detected ? (
                        <>
                            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-800 text-sm">
                                    <strong>⚠️ Privacy Alert:</strong> Browser fingerprinting techniques detected. These track users without cookies and require explicit GDPR consent.
                                </p>
                            </div>

                            {/* Breakdown by type */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                                {Object.entries(fingerprinting.byType).map(([type, count]) => (
                                    <div key={type} className="p-2 rounded text-center bg-white">
                                        <p className={`text-lg font-bold ${count > 0 ? 'text-red-600' : 'text-blue-600'}`}>{count}</p>
                                        <p className="text-xs text-slate-500 capitalize">{type}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {fingerprinting.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getSeverityBorder(issue.severity)}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-slate-700 uppercase">{issue.type}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(issue.severity)}`}>{issue.severity}</span>
                                        </div>
                                        <p className="text-sm text-slate-700">{issue.description}</p>
                                        <p className="text-xs text-red-600 mt-1">{issue.gdprImpact}</p>
                                        {isPro ? (
                                            <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                        ) : (
                                            <p className="text-xs text-blue-600 mt-2 blur-sm select-none">💡 Upgrade to Pro to see recommendation...</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-blue-600 uppercase border border-blue-300 px-2 py-0.5 rounded">PASS</span>
                            <div>
                                <p className="font-semibold text-blue-800">No Fingerprinting Detected</p>
                                <p className="text-sm text-blue-600">
                                    No canvas, WebGL, audio, or device fingerprinting techniques found.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * Fingerprinting creates unique device identifiers that persist even when cookies are cleared.
                    </p>
                </div>
            )}
        </div>
    );
}
