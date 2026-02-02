'use client';

import React from 'react';

interface HiddenCostsAuditProps {
    hiddenCosts?: {
        score: number;
        estimatedMonthlyCost: number;
        currency: string;
        services: {
            name: string;
            category: 'analytics' | 'advertising' | 'chat' | 'crm' | 'payment' | 'monitoring' | 'cdn' | 'other';
            estimatedCost: number;
            pricingTier: 'free' | 'starter' | 'pro' | 'enterprise' | 'usage-based';
            isEssential: boolean;
            domain: string;
        }[];
        redundancies: {
            category: string;
            services: string[];
            wastedCost: number;
            recommendation: string;
        }[];
        performanceImpact: {
            totalScriptSize: number;
            estimatedLoadTime: number;
            blockingScripts: number;
            costPerSecond: number;
        };
        potentialSavings: number;
        recommendations: {
            type: 'remove' | 'consolidate' | 'downgrade' | 'optimize';
            description: string;
            savings: number;
            priority: 'high' | 'medium' | 'low';
        }[];
        breakdown: {
            analytics: number;
            advertising: number;
            chat: number;
            monitoring: number;
            other: number;
        };
    };
    isPro: boolean;
}

// SVG Icon Components
const CostsIcon = () => (
    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

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

const ChatIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CrmIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const PaymentIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const MonitoringIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CdnIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
);

const PackageIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const LightbulbIcon = ({ className = "w-5 h-5 text-blue-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const BoltIcon = () => (
    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export function HiddenCostsAudit({ hiddenCosts, isPro }: HiddenCostsAuditProps) {
    if (!hiddenCosts) {
        return (
            <div className="text-center py-8 text-slate-500">
                Cost analysis not available
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-white text-red-700 border border-red-200';
            case 'medium': return 'bg-white text-amber-700 border border-amber-200';
            case 'low': return 'bg-white text-blue-700 border border-blue-200';
            default: return 'bg-white text-slate-700 border border-slate-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'analytics': return <AnalyticsIcon />;
            case 'advertising': return <AdvertisingIcon />;
            case 'chat': return <ChatIcon />;
            case 'crm': return <CrmIcon />;
            case 'payment': return <PaymentIcon />;
            case 'monitoring': return <MonitoringIcon />;
            case 'cdn': return <CdnIcon />;
            default: return <PackageIcon />;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'free': return 'bg-white text-green-700 border border-green-200';
            case 'starter': return 'bg-white text-blue-700 border border-blue-200';
            case 'pro': return 'bg-white text-purple-700 border border-purple-200';
            case 'enterprise': return 'bg-white text-orange-700 border border-orange-200';
            case 'usage-based': return 'bg-white text-slate-700 border border-slate-200';
            default: return 'bg-white text-slate-700 border border-slate-200';
        }
    };

    const breakdownCategories = [
        { name: 'Analytics', value: hiddenCosts.breakdown.analytics, icon: <AnalyticsIcon /> },
        { name: 'Advertising', value: hiddenCosts.breakdown.advertising, icon: <AdvertisingIcon /> },
        { name: 'Chat', value: hiddenCosts.breakdown.chat, icon: <ChatIcon /> },
        { name: 'Monitoring', value: hiddenCosts.breakdown.monitoring, icon: <MonitoringIcon /> },
        { name: 'Other', value: hiddenCosts.breakdown.other, icon: <PackageIcon /> },
    ];

    return (
        <div className="space-y-6">
            {/* Main Cost Overview */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CostsIcon />
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Hidden Costs Analysis</h3>
                            <p className="text-sm text-slate-500">SaaS &amp; Script Cost Estimation</p>
                        </div>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(hiddenCosts.score)}`}>
                        {hiddenCosts.score}/100
                    </div>
                </div>

                {/* Cost Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">
                            {hiddenCosts.currency}{hiddenCosts.estimatedMonthlyCost}
                        </div>
                        <div className="text-xs text-slate-500">Est. Monthly Cost</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {hiddenCosts.currency}{hiddenCosts.potentialSavings}
                        </div>
                        <div className="text-xs text-slate-500">Potential Savings</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">
                            {hiddenCosts.services.length}
                        </div>
                        <div className="text-xs text-slate-500">SaaS Detected</div>
                    </div>
                </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Cost Breakdown</h4>
                <div className="grid grid-cols-5 gap-2">
                    {breakdownCategories.map((cat, idx) => (
                        <div key={idx} className="text-center p-2 bg-white border border-slate-200 rounded-lg">
                            <div className="flex justify-center text-slate-600">{cat.icon}</div>
                            <div className="text-sm font-semibold text-slate-800 mt-1">{hiddenCosts.currency}{cat.value}</div>
                            <div className="text-xs text-slate-500">{cat.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Redundancies Warning */}
            {hiddenCosts.redundancies.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <WarningIcon />
                        <h4 className="font-semibold text-amber-800">Redundant Services Detected</h4>
                    </div>
                    <div className="space-y-3">
                        {hiddenCosts.redundancies.map((r, idx) => (
                            <div key={idx} className="bg-white rounded p-3 border border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-amber-800">{r.category}</span>
                                    <span className="text-red-600 font-semibold">
                                        -{hiddenCosts.currency}{r.wastedCost}/month wasted
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600 mb-1">
                                    Services: {r.services.join(', ')}
                                </div>
                                <div className="text-sm text-amber-700 flex items-center gap-2">
                                    <LightbulbIcon className="w-4 h-4 text-amber-500" />
                                    <span>{r.recommendation}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Services List - Blurred for non-Pro */}
            {hiddenCosts.services.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">
                        Detected Services ({hiddenCosts.services.length})
                    </h4>

                    {isPro ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {hiddenCosts.services.map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-600">{getCategoryIcon(service.category)}</span>
                                        <div>
                                            <div className="font-medium text-sm text-slate-800">
                                                {service.name}
                                                {service.isEssential && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-white border border-green-200 text-green-700 text-xs rounded">
                                                        Essential
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{service.domain}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-800">
                                            {hiddenCosts.currency}{service.estimatedCost}/month
                                        </div>
                                        <span className={`px-1.5 py-0.5 text-xs rounded capitalize ${getTierColor(service.pricingTier)}`}>
                                            {service.pricingTier}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-2 blur-sm select-none">
                                {hiddenCosts.services.slice(0, 4).map((service, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                                        <span className="text-sm">{service.name}</span>
                                        <span className="text-sm">€{service.estimatedCost}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
                                    <LockIcon />
                                    Upgrade to Pro+ for full cost breakdown
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {hiddenCosts.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <LightbulbIcon />
                        <h4 className="font-semibold text-blue-800">Cost Reduction Recommendations</h4>
                    </div>
                    <div className="space-y-2">
                        {hiddenCosts.recommendations.map((rec, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${getPriorityColor(rec.priority)}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-xs font-medium uppercase rounded bg-white border border-current">
                                            {rec.type}
                                        </span>
                                        <span className="text-sm">{rec.description}</span>
                                    </div>
                                    {rec.savings > 0 && (
                                        <span className="text-green-600 font-semibold text-sm">
                                            Save {hiddenCosts.currency}{rec.savings}/month
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance Impact */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <BoltIcon />
                    <h4 className="font-semibold text-slate-800">Performance Impact</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                        <span className="text-slate-500">Script Size:</span>{' '}
                        <span className="font-medium">{Math.round(hiddenCosts.performanceImpact.totalScriptSize)}KB</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Est. Load Time:</span>{' '}
                        <span className="font-medium">{hiddenCosts.performanceImpact.estimatedLoadTime}s</span>
                    </div>
                    <div>
                        <span className="text-slate-500">Blocking Scripts:</span>{' '}
                        <span className="font-medium">{hiddenCosts.performanceImpact.blockingScripts}</span>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                <div className="flex gap-3">
                    <LightbulbIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-slate-700 space-y-2">
                        <p>
                            <strong>Why monitor SaaS costs?</strong> Many businesses pay for redundant tools without realizing it.
                            We analyze your external scripts to identify duplicate services, estimate monthly costs, and suggest optimizations
                            that can save you money every month.
                        </p>
                        <p className="text-slate-500 text-xs border-t border-slate-100 pt-2">
                            <strong>Calculation method:</strong> Performance savings are estimated using the formula:
                            <code className="bg-slate-100 px-1 rounded mx-1">(Load Time - 2s) × €50 × 12 months</code>
                            based on research showing ~7% conversion loss per second of delay beyond 2 seconds.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
