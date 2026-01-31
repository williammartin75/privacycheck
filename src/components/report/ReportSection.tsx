'use client';

import { useState, ReactNode } from 'react';

interface ReportSectionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    score?: number; // 0-100 score for the category
}

function getScoreClasses(score: number): string {
    if (score >= 80) return 'text-green-600 border-green-500';
    if (score >= 50) return 'text-amber-600 border-amber-500';
    return 'text-red-600 border-red-500';
}

export function ReportSection({ title, children, defaultOpen = false, score }: ReportSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2 mb-2 border-b border-slate-200 hover:border-slate-300 transition"
            >
                <span className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {title}
                    </span>
                    {score !== undefined && (
                        <span className={`px-2 py-0.5 rounded text-xs font-extrabold bg-white border ${getScoreClasses(score)}`}>
                            {score}/100
                        </span>
                    )}
                </span>
                <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="pl-0 mt-3">
                    {children}
                </div>
            )}
        </div>
    );
}
