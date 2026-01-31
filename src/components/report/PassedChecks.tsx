'use client';

interface ScoreBreakdownItem {
    item: string;
    passed: boolean;
    points: number;
}

interface PassedChecksProps {
    scoreBreakdown?: ScoreBreakdownItem[];
}

export function PassedChecks({ scoreBreakdown }: PassedChecksProps) {
    const passedItems = scoreBreakdown?.filter(b => b.passed) || [];

    if (passedItems.length === 0) return null;

    return (
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Checks Passed</h4>
            <div className="flex flex-wrap gap-3">
                {passedItems.map((item, index) => (
                    <span key={index} className="flex items-center gap-2 text-xs text-slate-700">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item.item.replace(/\s*\([^)]*\)/g, '')}
                    </span>
                ))}
            </div>
        </div>
    );
}
