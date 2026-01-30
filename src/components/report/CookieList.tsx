'use client';

interface CookieItem {
    name: string;
    category: string;
    provider: string;
    description: string;
}

interface CookieListProps {
    cookies: {
        count: number;
        list: CookieItem[];
    };
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
}

function getCategoryColor(category: string): string {
    switch (category?.toLowerCase()) {
        case 'necessary':
            return 'bg-white text-slate-700';
        case 'analytics':
            return 'bg-blue-600 text-white';
        case 'marketing':
            return 'bg-sky-200 text-sky-800';
        case 'preferences':
            return 'bg-amber-400 text-amber-900';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

export function CookieList({
    cookies,
    isOpen,
    onToggle,
    isPro
}: CookieListProps) {
    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="section-btn"
            >
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Cookies Detected</span>
                    <span className="badge-passed">{cookies.count} found</span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && cookies.list.length > 0 && (
                <div className={`bg-white rounded-md p-4 overflow-x-auto ${!isPro ? 'relative' : ''}`}>
                    {/* Category Legend */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Categories:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200">necessary</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">analytics</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-200 text-sky-800">marketing</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-400 text-amber-900">preferences</span>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-200">
                                <th className="pb-2 pr-4">Name</th>
                                <th className="pb-2 pr-4">Category</th>
                                <th className="pb-2 pr-4">Provider</th>
                                <th className="pb-2">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cookies.list.map((cookie, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0">
                                    <td className="py-2 pr-4 font-mono text-gray-900">
                                        <span className={!isPro ? 'blur-sm select-none' : ''}>{cookie.name}</span>
                                    </td>
                                    <td className="py-2 pr-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(cookie.category)}`}>
                                            {cookie.category}
                                        </span>
                                    </td>
                                    <td className="py-2 pr-4 text-gray-600">
                                        <span className={!isPro ? 'blur-sm select-none' : ''}>{cookie.provider}</span>
                                    </td>
                                    <td className="py-2 text-gray-600">
                                        <span className={!isPro ? 'blur-sm select-none' : ''}>{cookie.description}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
