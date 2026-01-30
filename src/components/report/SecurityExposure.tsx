'use client';

interface SecurityFinding {
    title: string;
    description: string;
    details?: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    remediation: string;
}

interface AttackSurfaceData {
    totalFindings: number;
    overallRisk: 'critical' | 'high' | 'medium' | 'low';
    findings: SecurityFinding[];
    recommendations: string[];
}

interface SecurityExposureProps {
    attackSurface: AttackSurfaceData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getBadgeClass(risk: string): string {
    if (risk === 'critical' || risk === 'high') return 'badge-failed';
    if (risk === 'medium') return 'badge-warning';
    return 'badge-passed';
}

function getRiskColor(risk: string): string {
    switch (risk) {
        case 'critical':
        case 'high':
            return 'text-red-600';
        case 'medium':
            return 'text-yellow-500';
        default:
            return 'text-blue-600';
    }
}

function getSeverityColor(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-red-600';
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-amber-500';
        default: return 'bg-slate-300';
    }
}

export function SecurityExposure({ attackSurface, isOpen, onToggle, isPro }: SecurityExposureProps) {
    if (attackSurface.totalFindings === 0) return null;

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Security Exposure Analysis</span>
                    <span className={getBadgeClass(attackSurface.overallRisk)}>
                        {attackSurface.totalFindings} finding{attackSurface.totalFindings > 1 ? 's' : ''}
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
                <div className="rounded-lg p-5 border border-slate-200 bg-white">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center">
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Security & Privacy Exposure Check</p>
                                <p className="text-sm text-slate-500">{attackSurface.totalFindings} finding(s) detected, checks for exposed config files, cloud storage, API endpoints, and security misconfigurations.</p>
                            </div>
                        </div>
                        <span className={`text-sm font-semibold ${getRiskColor(attackSurface.overallRisk)}`}>
                            {attackSurface.overallRisk.charAt(0).toUpperCase() + attackSurface.overallRisk.slice(1)} Risk
                        </span>
                    </div>

                    {/* Findings list */}
                    <div className="space-y-2">
                        {attackSurface.findings.slice(0, 6).map((finding, i) => (
                            <div key={i} className="bg-white rounded-lg px-4 py-3 border border-slate-200">
                                <div className="flex items-start justify-between gap-2">
                                    <div className={`flex items-start gap-3 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getSeverityColor(finding.severity)}`}></span>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{finding.title}</p>
                                            <p className="text-xs text-slate-500">{finding.description}</p>
                                            {finding.details && (
                                                <code className="text-xs bg-white px-2 py-1 rounded mt-1 block text-slate-600 break-all">
                                                    {finding.details}
                                                </code>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded flex-shrink-0 bg-white text-slate-600">
                                        {finding.type.toUpperCase()}
                                    </span>
                                </div>
                                <p className={`text-xs text-slate-600 mt-2 bg-white p-2 rounded ${!isPro ? 'blur-sm select-none' : ''}`}>
                                    <strong>Recommendation:</strong> {finding.remediation}
                                </p>
                            </div>
                        ))}
                    </div>

                    {attackSurface.recommendations.length > 0 && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Top Recommendations:</p>
                            <ul className={`text-sm text-slate-600 space-y-1 ${!isPro ? 'blur-sm select-none' : ''}`}>
                                {attackSurface.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-slate-400">•</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                </div>
            )}
        </div>
    );
}
