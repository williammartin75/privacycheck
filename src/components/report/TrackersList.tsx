'use client';

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
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Third-Party Trackers</span>
                    <span className={trackers.length > 0 ? 'badge-warning' : 'badge-passed'}>
                        {trackers.length} found
                    </span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <span className={!isPro ? 'blur-sm select-none' : ''}>{tracker}</span>
                            </span>
                        ))}
                        {!isPro && trackers.length > 2 && (
                            <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                                +{trackers.length - 2} more
                            </span>
                        )}
                    </div>
                    {!isPro && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                            <p className="text-slate-600 text-sm mb-2">{trackers.length} tracker names hidden</p>
                            <button onClick={onUpgrade} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                Upgrade to Pro
                            </button>
                        </div>
                    )}
                    <p className="text-slate-500 text-xs mt-3">
                        Tip: Use our Cookie Banner to block these trackers until user consent is given.
                    </p>
                </div>
            )}
        </div>
    );
}
