'use client';

import { FormEvent } from 'react';

interface ScanFormProps {
    url: string;
    onUrlChange: (url: string) => void;
    onSubmit: (e: FormEvent) => void;
    loading: boolean;
    onCancel?: () => void;
    atLimit?: boolean;
    scansRemaining?: number;
    onUpgrade?: () => void;
}

export function ScanForm({ url, onUrlChange, onSubmit, loading, onCancel, atLimit, scansRemaining, onUpgrade }: ScanFormProps) {
    const handleClick = (e: FormEvent) => {
        if (atLimit && onUpgrade) {
            e.preventDefault();
            onUpgrade();
        } else {
            onSubmit(e);
        }
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        if (loading && onCancel) {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
        }
    };

    return (
        <form onSubmit={handleClick} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
                <label htmlFor="scan-url-input" className="sr-only">Website URL</label>
                <input
                    id="scan-url-input"
                    type="text"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="Enter your website URL (e.g., https://example.com)"
                    aria-label="Website URL to scan"
                    className="flex-1 px-6 py-4 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    required
                    disabled={atLimit || loading}
                />
                <button
                    type={loading ? "button" : "submit"}
                    onClick={loading ? handleButtonClick : undefined}
                    className={`px-8 py-4 font-semibold rounded-md transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${loading
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25'
                        : atLimit
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                        }`}
                >
                    {loading ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Stop Scan
                        </>
                    ) : atLimit ? (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Upgrade to Pro
                        </>
                    ) : (
                        <>Check Now</>
                    )}
                </button>
            </div>
            {typeof scansRemaining === 'number' && !atLimit && (
                <p className="text-center text-sm text-gray-500 mt-3">
                    {scansRemaining} free scan{scansRemaining !== 1 ? 's' : ''} remaining this month
                </p>
            )}
            {atLimit && (
                <p className="text-center text-sm text-amber-600 mt-3">
                    You've reached your monthly scan limit. Upgrade to Pro for unlimited scans.
                </p>
            )}
        </form>
    );
}

