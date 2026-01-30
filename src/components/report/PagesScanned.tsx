'use client';

interface PageInfo {
    title: string;
    url: string;
    cookiesFound: number;
    trackersFound: string[];
}

interface PagesScannedProps {
    pages: PageInfo[];
    pagesScanned: number;
    isOpen: boolean;
    onToggle: () => void;
}

export function PagesScanned({
    pages,
    pagesScanned,
    isOpen,
    onToggle
}: PagesScannedProps) {
    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="flex items-center gap-2 text-gray-900 font-semibold mb-4 hover:text-blue-600 transition"
            >
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Pages Scanned ({pagesScanned})
            </button>

            {isOpen && (
                <div className="bg-white rounded-md p-4 space-y-3">
                    {pages.map((page, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="truncate flex-1 mr-4">
                                <p className="font-medium text-gray-900 truncate">{page.title}</p>
                                <p className="text-sm text-gray-500 truncate">{page.url}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <span className="px-2 py-1 bg-white text-blue-700 text-xs rounded-full">
                                    {page.cookiesFound} cookies
                                </span>
                                <span className="px-2 py-1 bg-white text-black text-xs rounded-full">
                                    {page.trackersFound.length} trackers
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
