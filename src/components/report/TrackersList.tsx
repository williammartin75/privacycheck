'use client';

import { MaskedText } from '@/components/ProGate';
import { UpgradeCTA } from '@/components/UpgradeCTA';

interface TrackersListProps {
    trackers: string[];
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

export function TrackersList({
    trackers,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: TrackersListProps) {
    if (trackers.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-3 hover:text-slate-600 transition"
            >
                <span>Third-Party Trackers Detected</span>
                <svg className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                    <p className="text-slate-600 text-sm mb-3">
                        {trackers.length} tracker{trackers.length > 1 ? 's' : ''} collecting user data - explicit consent required under GDPR.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {trackers.slice(0, isPro ? undefined : 2).map((tracker, i) => (
                            <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium">
                                <MaskedText text={tracker} show={isPro} />
                            </span>
                        ))}
                        {!isPro && trackers.length > 2 && (
                            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                                +{trackers.length - 2} more
                            </span>
                        )}
                    </div>
                    {!isPro && (
                        <UpgradeCTA feature="tracker names" hiddenCount={trackers.length} onUpgrade={onUpgrade} />
                    )}
                    <p className="text-slate-500 text-xs mt-3">
                        Tip: Use our Cookie Banner to block these trackers until user consent is given.
                    </p>
                </div>
            )}
        </div>
    );
}
