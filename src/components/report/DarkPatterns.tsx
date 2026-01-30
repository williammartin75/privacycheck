'use client';

interface DarkPattern {
    type: string;
    severity: string;
    description: string;
    element?: string;
    gdprRelevance?: boolean;
}

interface SeverityBreakdown {
    critical: number;
    high: number;
    medium: number;
    low: number;
}

interface GdprViolation {
    type: string;
    category: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    gdprRelevance: boolean;
    recommendation: string;
}

interface DarkPatternsData {
    detected: boolean;
    score: number;
    totalCount: number;
    patterns: DarkPattern[];
    bySeverity: SeverityBreakdown;
    byCategory: Record<string, number>;
    gdprViolations: GdprViolation[];
    recommendations: string[];
}

interface DarkPatternsProps {
    darkPatterns: DarkPatternsData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function getSeverityColor(severity: string, count: number): string {
    if (count === 0) return 'text-gray-400';
    switch (severity) {
        case 'critical': return 'text-red-700';
        case 'high': return 'text-orange-700';
        case 'medium': return 'text-yellow-700';
        case 'low': return 'text-blue-700';
        default: return 'text-gray-400';
    }
}

function getSeverityBorder(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-white border-red-200';
        case 'high': return 'bg-white border-orange-200';
        case 'medium': return 'bg-white border-yellow-200';
        case 'low': return 'bg-white border-blue-200';
        default: return 'bg-white border-slate-200';
    }
}

function getSeverityBadge(severity: string): string {
    switch (severity) {
        case 'critical': return 'bg-white text-red-800';
        case 'high': return 'bg-white text-orange-800';
        case 'medium': return 'bg-white text-yellow-800';
        case 'low': return 'bg-white text-blue-800';
        default: return 'bg-white text-slate-800';
    }
}

export function DarkPatterns({
    darkPatterns,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: DarkPatternsProps) {
    const hasCritical = darkPatterns.bySeverity.critical > 0;
    const hasHigh = darkPatterns.bySeverity.high > 0;

    const sortedPatterns = [...darkPatterns.patterns]
        .sort((a, b) => {
            const orderA = SEVERITY_ORDER[a.severity as keyof typeof SEVERITY_ORDER] ?? 4;
            const orderB = SEVERITY_ORDER[b.severity as keyof typeof SEVERITY_ORDER] ?? 4;
            return orderA - orderB;
        });

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Dark Patterns Detection</span>
                    {darkPatterns.detected ? (
                        <span className="badge-failed">
                            {darkPatterns.totalCount} found
                        </span>
                    ) : (
                        <span className="badge-passed">Clean</span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    {/* Overall Status */}
                    <div className="flex items-center gap-3 p-3 rounded-lg mb-4 bg-white">
                        <span className="text-sm font-bold uppercase tracking-wider">
                            {!darkPatterns.detected ? <span className="text-blue-600">OK</span> :
                                hasCritical ? <span className="text-red-600">CRITICAL</span> :
                                    hasHigh ? <span className="text-amber-600">ALERT</span> :
                                        <span className="text-slate-600">INFO</span>}
                        </span>
                        <div>
                            <p className="font-semibold text-slate-800">
                                {!darkPatterns.detected ? 'No Dark Patterns Detected!' :
                                    hasCritical ? 'Critical Dark Patterns Found' :
                                        hasHigh ? 'Dark Patterns Require Attention' :
                                            'Minor Dark Patterns Detected'}
                            </p>
                            <p className="text-sm text-slate-600">
                                Score: {darkPatterns.score}/100
                                {darkPatterns.gdprViolations.length > 0 &&
                                    ` • ${darkPatterns.gdprViolations.length} GDPR-relevant`}
                            </p>
                        </div>
                    </div>

                    {/* Severity Breakdown */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
                            const count = darkPatterns.bySeverity[severity];
                            return (
                                <div key={severity} className={`p-2 rounded text-center ${count > 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <p className={`text-lg font-bold ${getSeverityColor(severity, count)}`}>
                                        {count}
                                    </p>
                                    <p className="text-xs text-slate-600 capitalize">{severity}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detected Patterns List */}
                    {darkPatterns.patterns.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Detected Patterns:</p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sortedPatterns.slice(0, isPro ? 20 : 3).map((pattern, i) => (
                                    <div key={i} className={`p-3 rounded-lg border ${getSeverityBorder(pattern.severity)}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(pattern.severity)}`}>
                                                        {pattern.severity.toUpperCase()}
                                                    </span>
                                                    <span className="text-xs text-slate-500 capitalize">{pattern.type.replace(/-/g, ' ')}</span>
                                                    {pattern.gdprRelevance && (
                                                        <span className="text-xs bg-white text-slate-700 px-1.5 py-0.5 rounded">GDPR</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-700">{pattern.description}</p>
                                                {isPro && pattern.element && (
                                                    <p className="text-xs text-slate-500 mt-1 font-mono bg-white px-2 py-1 rounded truncate">
                                                        {pattern.element.slice(0, 100)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!isPro && darkPatterns.patterns.length > 3 && (
                                    <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-slate-600 text-sm mb-2">
                                            +{darkPatterns.patterns.length - 3} more patterns (Pro)
                                        </p>
                                        <button
                                            onClick={onUpgrade}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
                                        >
                                            Upgrade to Pro
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {darkPatterns.recommendations.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">
                                {isPro ? 'How to Fix:' : 'Recommendations (Pro):'}
                            </p>
                            {isPro ? (
                                <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                                        {darkPatterns.recommendations.map((rec, i) => (
                                            <li key={i}>{rec}</li>
                                        ))}
                                    </ol>
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                                    <p className="text-slate-600 text-sm mb-3">
                                        Upgrade to Pro to see detailed recommendations for removing dark patterns
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

                    <p className="text-xs text-gray-400 mt-3">
                        * Scans for manipulative UI patterns including confirmshaming, pre-checked boxes, hidden information, and more.
                    </p>
                </div>
            )}
        </div>
    );
}
