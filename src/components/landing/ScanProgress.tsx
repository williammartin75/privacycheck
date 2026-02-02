'use client';

interface ScanProgressProps {
    current: number;
    total: number;
    status: string;
    tier: 'free' | 'pro' | 'pro_plus';
}

export function ScanProgress({ current, total, status, tier }: ScanProgressProps) {
    const tierLabels = {
        free: 'Free scan: up to 20 pages',
        pro: 'Pro scan: up to 100 pages',
        pro_plus: 'Pro+ scan: up to 200 pages'
    };

    const progress = Math.min((current / total) * 100, 100);

    return (
        <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white border border-gray-200 rounded-md p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center animate-pulse">
                            <svg className="w-5 h-5 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Scanning in progress...</p>
                            <p className="text-sm text-gray-500">{status}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{current}</p>
                        <p className="text-xs text-gray-500">/ {total} pages</p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-gray-400 text-center">
                    {tierLabels[tier]}
                </p>
            </div>
        </div>
    );
}
