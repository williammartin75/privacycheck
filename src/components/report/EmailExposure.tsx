'use client';

import { MaskedEmail } from '@/components/ProGate';
import { UpgradeCTA } from '@/components/UpgradeCTA';

interface EmailExposureProps {
    exposedEmails: string[];
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

export function EmailExposure({
    exposedEmails,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: EmailExposureProps) {
    if (exposedEmails.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Email Exposure</span>
                    <span className="badge-warning">
                        {exposedEmails.length} found
                    </span>
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{exposedEmails.length} Email{exposedEmails.length > 1 ? 's' : ''} Exposed</h3>
                            <p className="text-slate-600 text-xs">Email addresses visible in page source may be harvested by spammers.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {exposedEmails.slice(0, isPro ? undefined : 2).map((email, i) => (
                            <span key={i} className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 text-xs font-mono">
                                <MaskedEmail email={email} show={isPro} />
                            </span>
                        ))}
                        {!isPro && exposedEmails.length > 2 && (
                            <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-500 text-xs">
                                +{exposedEmails.length - 2} more
                            </span>
                        )}
                    </div>
                    {!isPro && (
                        <UpgradeCTA feature="email addresses" hiddenCount={exposedEmails.length} onUpgrade={onUpgrade} />
                    )}
                    <p className="mt-3 text-slate-500 text-xs">
                        <strong>Recommendation:</strong> Use contact forms or obfuscate emails to prevent harvesting.
                    </p>
                </div>
            )}
        </div>
    );
}
