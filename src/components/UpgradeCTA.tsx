'use client';

interface UpgradeCTAProps {
    feature: string;
    hiddenCount?: number;
    onUpgrade: () => void;
}

export const UpgradeCTA = ({ feature, hiddenCount, onUpgrade }: UpgradeCTAProps) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-dashed border-slate-300 rounded-md mt-3">
        <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-slate-600 text-sm">
                {hiddenCount ? `${hiddenCount} ${feature} hidden` : feature}
            </span>
        </div>
        <button
            onClick={onUpgrade}
            className="text-xs px-3 py-1.5 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition font-medium"
        >
            Unlock with Pro
        </button>
    </div>
);

export const InlineUpgrade = ({ onUpgrade }: { onUpgrade: () => void }) => (
    <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 ml-2"
    >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Unlock
    </button>
);
