'use client';

import React from 'react';

interface SupplyChainAuditProps {
    supplyChain?: {
        score: number;
        totalDependencies: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        scripts: {
            url: string;
            domain: string;
            category: 'analytics' | 'advertising' | 'social' | 'payment' | 'cdn' | 'utility' | 'unknown';
            risk: 'low' | 'medium' | 'high' | 'critical';
            isCritical: boolean;
            provider: string | null;
        }[];
        categories: { name: string; count: number; risk: 'low' | 'medium' | 'high' }[];
        criticalDependencies: string[];
        unknownOrigins: number;
        cdnUsage: { count: number; providers: string[] };
        recommendations: string[];
    };
    isPro: boolean;
}

// SVG Icon Components
const AnalyticsIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const AdvertisingIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

const SocialIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const PaymentIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const CdnIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
);

const UtilityIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UnknownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const LightbulbIcon = () => (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export function SupplyChainAudit({ supplyChain, isPro }: SupplyChainAuditProps) {
    if (!supplyChain) {
        return (
            <div className="text-center py-8 text-slate-500">
                Supply chain analysis not available
            </div>
        );
    }

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-white border border-green-200';
            case 'medium': return 'text-amber-600 bg-white border border-amber-200';
            case 'high': return 'text-orange-600 bg-white border border-orange-200';
            case 'critical': return 'text-red-600 bg-white border border-red-200';
            default: return 'text-slate-600 bg-white border border-slate-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'analytics': return <AnalyticsIcon />;
            case 'advertising': return <AdvertisingIcon />;
            case 'social': return <SocialIcon />;
            case 'payment': return <PaymentIcon />;
            case 'cdn': return <CdnIcon />;
            case 'utility': return <UtilityIcon />;
            default: return <UnknownIcon />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Supply Chain Security</h3>
                        <p className="text-sm text-slate-500">External Dependencies Analysis</p>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(supplyChain.score)}`}>
                        {supplyChain.score}/100
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                        <div className="text-2xl font-bold text-slate-800">{supplyChain.totalDependencies}</div>
                        <div className="text-xs text-slate-500">External Scripts</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                        <div className="text-2xl font-bold text-slate-800">{supplyChain.unknownOrigins}</div>
                        <div className="text-xs text-slate-500">Unknown Origins</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                        <div className={`text-2xl font-bold capitalize ${getRiskColor(supplyChain.riskLevel).split(' ')[0]}`}>
                            {supplyChain.riskLevel}
                        </div>
                        <div className="text-xs text-slate-500">Risk Level</div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            {supplyChain.categories.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Dependency Categories</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {supplyChain.categories.map((cat, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${getRiskColor(cat.risk)}`}>
                                <div className="flex items-center gap-2">
                                    {getCategoryIcon(cat.name)}
                                    <span className="font-medium capitalize">{cat.name}</span>
                                </div>
                                <div className="text-xs mt-1">{cat.count} script(s)</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Critical Dependencies */}
            {supplyChain.criticalDependencies.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <WarningIcon />
                        <h4 className="font-semibold text-amber-800">Critical Dependencies</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                        These scripts are critical to your site&apos;s functionality. Monitor them closely.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {supplyChain.criticalDependencies.map((dep, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white border border-amber-200 text-amber-800 rounded text-sm">
                                {dep}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* External Scripts List - Blurred for non-Pro */}
            {supplyChain.scripts.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">External Scripts ({supplyChain.scripts.length})</h4>

                    {isPro ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {supplyChain.scripts.map((script, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(script.category)}
                                            <span className="font-medium text-sm text-slate-800 truncate">
                                                {script.provider || script.domain}
                                            </span>
                                            {script.isCritical && (
                                                <span className="px-1.5 py-0.5 bg-white border border-amber-200 text-amber-700 text-xs rounded">
                                                    Critical
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate">{script.domain}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRiskColor(script.risk)}`}>
                                        {script.risk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-2 blur-sm select-none">
                                {supplyChain.scripts.slice(0, 4).map((script, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                                        <span className="text-sm">{script.domain}</span>
                                        <span className="text-xs">{script.risk}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
                                    <LockIcon />
                                    Upgrade to Pro+
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {supplyChain.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <LightbulbIcon />
                        <h4 className="font-semibold text-blue-800">Recommendations</h4>
                    </div>
                    <ul className="space-y-1">
                        {supplyChain.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                                <span>•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* CDN Usage */}
            {supplyChain.cdnUsage.count > 0 && (
                <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckIcon />
                        <h4 className="font-semibold text-green-800">Trusted CDN Usage</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Using {supplyChain.cdnUsage.count} scripts from established CDNs: {supplyChain.cdnUsage.providers.join(', ')}
                    </p>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-slate-700">
                        <strong>What is Supply Chain Risk?</strong> Third-party scripts can be hijacked to steal data or inject malware (e.g., Polyfill.io attack in 2024).
                        We monitor your external dependencies to detect risky or compromised scripts.
                    </p>
                </div>
            </div>
        </div>
    );
}
