'use client';

interface DriftChange {
    field: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    type: 'improvement' | 'regression' | 'neutral';
    category: string;
}

interface DriftReportData {
    hasChanges: boolean;
    overallTrend: 'improving' | 'declining' | 'stable';
    scoreDelta: number;
    changes: DriftChange[];
}

interface ComplianceDriftProps {
    driftReport: DriftReportData;
    isOpen: boolean;
    onToggle: () => void;
}

export function ComplianceDrift({ driftReport, isOpen, onToggle }: ComplianceDriftProps) {
    if (!driftReport.hasChanges) return null;

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Compliance Drift Detection</span>
                    <span className={driftReport.overallTrend === 'declining' ? 'badge-warning' : 'badge-passed'}>
                        {driftReport.changes.length} change{driftReport.changes.length > 1 ? 's' : ''}
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
                    {/* Header with trend */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
                                <svg
                                    className={`w-5 h-5 ${driftReport.overallTrend === 'improving' ? 'text-blue-600' : 'text-slate-600'}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={
                                            driftReport.overallTrend === 'improving'
                                                ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                                                : driftReport.overallTrend === 'declining'
                                                    ? 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                                                    : 'M5 12h14'
                                        }
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">
                                    {driftReport.overallTrend === 'improving' ? 'Privacy Improving' :
                                        driftReport.overallTrend === 'declining' ? 'Privacy Declining' : 'No Significant Change'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {driftReport.changes.length} change(s) detected since last scan
                                </p>
                            </div>
                        </div>
                        {driftReport.scoreDelta !== 0 && (
                            <div className={`px-3 py-1.5 rounded ${driftReport.scoreDelta > 0
                                    ? 'bg-white text-blue-700 border border-blue-200'
                                    : 'bg-white text-slate-700 border border-slate-200'
                                }`}>
                                <span className="text-lg font-bold">
                                    {driftReport.scoreDelta > 0 ? '+' : ''}{driftReport.scoreDelta}
                                </span>
                                <span className="text-xs ml-1">points</span>
                            </div>
                        )}
                    </div>

                    {/* Changes list */}
                    <div className="space-y-2">
                        {driftReport.changes.slice(0, 6).map((change, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border-l-4 ${change.impact === 'negative' ? 'border-red-500' :
                                        change.impact === 'positive' ? 'border-blue-500' : 'border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${change.impact === 'positive' ? 'text-blue-600' :
                                            change.impact === 'negative' ? 'text-red-600' : 'text-gray-500'
                                        }`}>
                                        {change.impact === 'positive' ? '↑' : change.impact === 'negative' ? '↓' : '–'}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-800">{change.field}</p>
                                        <p className="text-sm text-gray-500">{change.description}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${change.type === 'improvement' ? 'bg-white text-blue-700' :
                                        change.type === 'regression' ? 'bg-white text-red-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {change.category}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                        * Changes compared to your previous scan of this domain. Scan history is stored locally in your browser.
                    </p>
                </div>
            )}
        </div>
    );
}
