'use client';

interface IssuesFoundProps {
    issues: Array<{ item: string; points: number }>;
}

// Remove parentheses and their content for cleaner display
function stripParentheses(text: string): string {
    return text.replace(/\s*\([^)]*\)/g, '').trim();
}

export function IssuesFound({ issues }: IssuesFoundProps) {
    const failedItems = issues.filter(b => b.points < 0);

    if (failedItems.length === 0) return null;

    return (
        <div className="mb-6 p-4 rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-red-600 mb-3">Issues Found</h4>
            <div className="flex flex-wrap gap-2">
                {failedItems.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {stripParentheses(item.item)}
                    </span>
                ))}
            </div>
        </div>
    );
}
