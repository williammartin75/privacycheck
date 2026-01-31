'use client';

import { useState, ReactNode } from 'react';

interface ReportSectionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function ReportSection({ title, children, defaultOpen = false }: ReportSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-2 mb-2 border-b border-slate-200 hover:border-slate-300 transition"
            >
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {title}
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
