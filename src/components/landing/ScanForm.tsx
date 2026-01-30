'use client';

import { FormEvent } from 'react';

interface ScanFormProps {
    url: string;
    onUrlChange: (url: string) => void;
    onSubmit: (e: FormEvent) => void;
    loading: boolean;
}

export function ScanForm({ url, onUrlChange, onSubmit, loading }: ScanFormProps) {
    return (
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => onUrlChange(e.target.value)}
                    placeholder="Enter your website URL (e.g., https://example.com)"
                    className="flex-1 px-6 py-4 rounded-md bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Scanning...
                        </>
                    ) : (
                        <>Check Now</>
                    )}
                </button>
            </div>
        </form>
    );
}
