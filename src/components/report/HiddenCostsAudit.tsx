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
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'analytics': return '📊';
            case 'advertising': return '📢';
            case 'chat': return '💬';
            case 'crm': return '📋';
            case 'payment': return '💳';
            case 'monitoring': return '🔍';
            case 'cdn': return '🌐';
            default: return '📦';
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'free': return 'bg-green-100 text-green-700';
            case 'starter': return 'bg-blue-100 text-blue-700';
            case 'pro': return 'bg-purple-100 text-purple-700';
            case 'enterprise': return 'bg-orange-100 text-orange-700';
            case 'usage-based': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Cost Overview */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">💰 Hidden Costs Analysis</h3>
                        <p className="text-sm text-slate-500">SaaS & Script Cost Estimation</p>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(hiddenCosts.score)}`}>
                        {hiddenCosts.score}/100
                    </div>
                </div>

                {/* Cost Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">
                            {hiddenCosts.currency}{hiddenCosts.estimatedMonthlyCost}
                        </div>
                        <div className="text-xs text-slate-500">Est. Monthly Cost</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
                        <div className="text-2xl font-bold text-green-600">
                            {hiddenCosts.currency}{hiddenCosts.potentialSavings}
                        </div>
                        <div className="text-xs text-slate-500">Potential Savings</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-emerald-200 shadow-sm">
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
                    {[
                        { name: 'Analytics', value: hiddenCosts.breakdown.analytics, icon: '📊' },
                        { name: 'Advertising', value: hiddenCosts.breakdown.advertising, icon: '📢' },
                        { name: 'Chat', value: hiddenCosts.breakdown.chat, icon: '💬' },
                        { name: 'Monitoring', value: hiddenCosts.breakdown.monitoring, icon: '🔍' },
                        { name: 'Other', value: hiddenCosts.breakdown.other, icon: '📦' },
                    ].map((cat, idx) => (
                        <div key={idx} className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="text-lg">{cat.icon}</div>
                            <div className="text-sm font-semibold text-slate-800">{hiddenCosts.currency}{cat.value}</div>
                            <div className="text-xs text-slate-500">{cat.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Redundancies Warning */}
            {hiddenCosts.redundancies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-3">⚠️ Redundant Services Detected</h4>
                    <div className="space-y-3">
                        {hiddenCosts.redundancies.map((r, idx) => (
                            <div key={idx} className="bg-white rounded p-3 border border-amber-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-amber-800">{r.category}</span>
                                    <span className="text-red-600 font-semibold">
                                        -{hiddenCosts.currency}{r.wastedCost}/mo wasted
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600 mb-1">
                                    Services: {r.services.join(', ')}
                                </div>
                                <div className="text-sm text-amber-700">
                                    💡 {r.recommendation}
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
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{getCategoryIcon(service.category)}</span>
                                        <div>
                                            <div className="font-medium text-sm text-slate-800">
                                                {service.name}
                                                {service.isEssential && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                        Essential
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{service.domain}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-800">
                                            {hiddenCosts.currency}{service.estimatedCost}/mo
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
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                        <span className="text-sm">{service.name}</span>
                                        <span className="text-sm">€{service.estimatedCost}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro+ for full cost breakdown
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {hiddenCosts.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">💡 Cost Reduction Recommendations</h4>
                    <div className="space-y-2">
                        {hiddenCosts.recommendations.map((rec, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 text-xs font-medium uppercase rounded">
                                            {rec.type}
                                        </span>
                                        <span className="text-sm">{rec.description}</span>
                                    </div>
                                    {rec.savings > 0 && (
                                        <span className="text-green-600 font-semibold text-sm">
                                            Save {hiddenCosts.currency}{rec.savings}/mo
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Performance Impact */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">⚡ Performance Impact</h4>
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
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm">
                <p className="text-slate-700">
                    <strong>💡 Why monitor SaaS costs?</strong> Many businesses pay for redundant tools without realizing it.
                    We analyze your external scripts to identify duplicate services, estimate monthly costs, and suggest optimizations
                    that can save you money every month.
                </p>
            </div>
        </div>
    );
}
