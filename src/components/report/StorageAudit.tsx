'use client';

interface StorageCount {
    count: number;
}

interface StorageIssue {
    key: string;
    type: string;
    category: string;
    risk: 'critical' | 'high' | 'medium' | 'low';
    recommendation: string;
}

interface StorageAuditData {
    compliant: boolean;
    localStorage: StorageCount;
    sessionStorage: StorageCount;
    issues: StorageIssue[];
}

interface StorageAuditProps {
    storageAudit: StorageAuditData;
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getRiskBorder(risk: string): string {
    switch (risk) {
        case 'critical': return 'bg-white border-red-200';
        case 'high': return 'bg-white border-orange-200';
        default: return 'bg-white border-yellow-200';
    }
}

function getRiskBadge(risk: string): string {
    switch (risk) {
        case 'critical': return 'bg-white text-red-800';
        default: return 'bg-white text-orange-800';
    }
}

export function StorageAudit({
    storageAudit,
    isOpen,
    onToggle,
    isPro
}: StorageAuditProps) {
    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Client Storage Audit</span>
                    {storageAudit.compliant ? (
                        <span className="badge-passed">0 issues</span>
                    ) : (
                        <span className="badge-warning">
                            {storageAudit.issues.length} risk{storageAudit.issues.length > 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-white text-center">
                            <p className="text-2xl font-bold text-slate-700">{storageAudit.localStorage.count}</p>
                            <p className="text-xs text-slate-500">localStorage</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white text-center">
                            <p className="text-2xl font-bold text-blue-700">{storageAudit.sessionStorage.count}</p>
                            <p className="text-xs text-slate-500">sessionStorage</p>
                        </div>
                    </div>

                    {storageAudit.issues.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {storageAudit.issues.slice(0, isPro ? 10 : 2).map((issue, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${getRiskBorder(issue.risk)}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono text-sm text-slate-800">{issue.key}</p>
                                            <p className="text-xs text-slate-500">{issue.type} · {issue.category}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${getRiskBadge(issue.risk)}`}>{issue.risk}</span>
                                    </div>
                                    {isPro && (
                                        <p className="text-xs text-blue-600 mt-2">💡 {issue.recommendation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-blue-600 uppercase border border-blue-300 px-2 py-0.5 rounded">PASS</span>
                            <p className="font-semibold text-blue-800">No risky storage detected</p>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * localStorage persists indefinitely and requires consent like cookies.
                    </p>
                </div>
            )}
        </div>
    );
}
