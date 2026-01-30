'use client';

interface ScoreBreakdownItem {
    item: string;
    points: number;
    passed: boolean;
}

interface ScoreBreakdownProps {
    breakdown: ScoreBreakdownItem[];
    finalScore: number;
}

// Remove parentheses and their content for cleaner display
function stripParentheses(text: string): string {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
}

export function ScoreBreakdown({ breakdown, finalScore }: ScoreBreakdownProps) {
    if (!breakdown || breakdown.length === 0) return null;

    const filteredItems = breakdown.filter(b => b.points !== 0 || !b.passed);

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Score Breakdown</h3>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {filteredItems.map((item, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between px-3 py-2 rounded border ${item.passed ? 'bg-white border-slate-200' : 'bg-white border-slate-300'
                                }`}
                        >
                            <span className={`text-sm ${item.passed ? 'text-slate-700' : 'text-slate-600'}`}>
                                {stripParentheses(item.item)}
                            </span>
                            <span className={`text-sm font-semibold ${item.passed ? 'text-slate-700' : 'text-red-500'}`}>
                                {item.points > 0 ? '+' : ''}{item.points}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-800 font-bold text-sm">Final Score</span>
                    <span className="text-xl font-bold text-slate-800">{finalScore}/100</span>
                </div>
            </div>
        </div>
    );
}
