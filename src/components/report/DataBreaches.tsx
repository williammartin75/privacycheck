'use client';

interface DataBreach {
    name: string;
    date: string;
    count: number;
}

interface DataBreachesProps {
    dataBreaches?: DataBreach[];
    domain: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function DataBreaches({
    dataBreaches,
    domain,
    isOpen,
    onToggle
}: DataBreachesProps) {
    const breachCount = dataBreaches?.length || 0;

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Data Breach Check</span>
                    {breachCount > 0 ? (
                        <span className="badge-failed">
                            {breachCount} breach{breachCount > 1 ? 'es' : ''}
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
                    {dataBreaches && dataBreaches.length > 0 ? (
                        <>
                            <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-700 text-sm">
                                    <strong>Warning:</strong> This domain has been involved in known data breaches. Users should be informed and passwords changed.
                                </p>
                            </div>
                            <div className="space-y-3">
                                {dataBreaches.map((breach, i) => (
                                    <div key={i} className="bg-white border border-red-100 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-red-800">{breach.name}</p>
                                            <p className="text-xs text-red-600">Breach date: {breach.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-700">{breach.count.toLocaleString()}</p>
                                            <p className="text-xs text-red-500">accounts affected</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <a
                                href={`https://haveibeenpwned.com/DomainSearch?domain=${domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-sm text-red-700 hover:text-red-900"
                            >
                                View full details on HaveIBeenPwned →
                            </a>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                            <span className="text-sm font-bold text-blue-600 uppercase border border-blue-300 px-2 py-0.5 rounded">PASS</span>
                            <div>
                                <p className="font-semibold text-blue-800">No Data Breaches Found</p>
                                <p className="text-sm text-blue-600">
                                    This domain has not been found in any known data breaches.
                                </p>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                        * Checked against HaveIBeenPwned database of known breaches.
                    </p>
                </div>
            )}
        </div>
    );
}
