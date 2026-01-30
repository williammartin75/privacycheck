'use client';

import { MaskedText } from '@/components/ProGate';
import { UpgradeCTA } from '@/components/UpgradeCTA';

interface SocialTracker {
    name: string;
    risk: 'high' | 'medium' | 'low';
}

interface ExternalResource {
    src: string;
    provider: string;
}

interface ExternalResources {
    scripts: ExternalResource[];
    fonts: ExternalResource[];
    iframes: ExternalResource[];
}

interface ThirdPartyScriptsProps {
    externalResources?: ExternalResources;
    socialTrackers?: SocialTracker[];
    isOpen: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

export function ThirdPartyScripts({
    externalResources,
    socialTrackers,
    isOpen,
    onToggle,
    isPro,
    onUpgrade
}: ThirdPartyScriptsProps) {
    const hasContent = (externalResources && (
        externalResources.scripts.length > 0 ||
        externalResources.fonts.length > 0 ||
        externalResources.iframes.length > 0
    )) || (socialTrackers && socialTrackers.length > 0);

    if (!hasContent) {
        return null;
    }

    return (
        <div className="mb-4">
            <button onClick={onToggle} className="section-btn">
                <span className="flex items-center gap-2">
                    <span className="section-btn-title">Third-Party Scripts &amp; Tracking</span>
                    {socialTrackers && socialTrackers.length > 0 && (
                        <span className="badge-warning">
                            {socialTrackers.length} tracker{socialTrackers.length > 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-600 text-xs mb-4">
                        Third-party resources may track visitors and require explicit consent under GDPR.
                    </p>

                    {/* Social & Ad Trackers */}
                    {socialTrackers && socialTrackers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-white border border-slate-300 text-slate-700 rounded text-xs">{socialTrackers.length}</span>
                                Social &amp; Ad Trackers
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {socialTrackers.map((tracker, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 rounded text-xs font-medium ${tracker.risk === 'high'
                                            ? 'bg-white text-red-700 border border-red-200'
                                            : tracker.risk === 'medium'
                                                ? 'bg-white text-amber-700 border border-amber-200'
                                                : 'bg-white text-slate-700 border border-slate-200'
                                            }`}
                                    >
                                        <MaskedText text={tracker.name} show={isPro} /> ({tracker.risk})
                                    </span>
                                ))}
                            </div>
                            {!isPro && (
                                <UpgradeCTA feature="tracker details" hiddenCount={socialTrackers.length} onUpgrade={onUpgrade} />
                            )}
                        </div>
                    )}

                    {/* External Scripts */}
                    {externalResources && externalResources.scripts.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-white rounded text-xs">{externalResources.scripts.length}</span>
                                External Scripts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[...new Set(externalResources.scripts.map(s => s.provider))].slice(0, isPro ? undefined : 3).map((provider, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                        <MaskedText text={provider} show={isPro} />
                                    </span>
                                ))}
                                {!isPro && [...new Set(externalResources.scripts.map(s => s.provider))].length > 3 && (
                                    <span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-slate-500 text-sm">
                                        +{[...new Set(externalResources.scripts.map(s => s.provider))].length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* External Fonts */}
                    {externalResources && externalResources.fonts.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-white rounded text-xs">{externalResources.fonts.length}</span>
                                External Fonts
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[...new Set(externalResources.fonts.map(f => f.provider))].map((provider, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                        {provider}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Embedded Iframes */}
                    {externalResources && externalResources.iframes.length > 0 && (
                        <div>
                            <h4 className="font-medium text-slate-700 text-sm mb-2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-white rounded text-xs">{externalResources.iframes.length}</span>
                                Embedded Iframes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {[...new Set(externalResources.iframes.map(f => f.provider))].map((provider, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 text-sm">
                                        {provider}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                        * All external resources may track visitors and impact page load performance.
                    </p>
                </div>
            )}
        </div>
    );
}
