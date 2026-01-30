'use client';

interface IssuesFoundProps {
    issues: Array<{ item: string; points: number }>;
}

export function IssuesFound({ issues }: IssuesFoundProps) {
    const failedItems = issues.filter(b => b.points < 0);

    if (failedItems.length === 0) return null;

    return (
        <div className="mb-6 p-4 rounded-lg border border-slate-300">
            <h4 className="text-sm font-semibold text-red-600 mb-3">Issues Found</h4>
            <div className="flex flex-wrap gap-2">
                {failedItems.map((item, i) => (
                    <span key={i} className="px-2 py-1 text-xs text-red-600">
                        ✕ {item.item}
                    </span>
                ))}
            </div>
        </div>
    );
}
