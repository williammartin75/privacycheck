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
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-amber-600 bg-amber-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'critical': return 'text-red-600 bg-red-100';
            default: return 'text-slate-600 bg-slate-100';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'analytics': return '📊';
            case 'advertising': return '📢';
            case 'social': return '👥';
            case 'payment': return '💳';
            case 'cdn': return '🌐';
            case 'utility': return '🔧';
            default: return '❓';
        }
    };

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
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
                                    <span>{getCategoryIcon(cat.name)}</span>
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
                    <h4 className="font-semibold text-amber-800 mb-2">⚠️ Critical Dependencies</h4>
                    <p className="text-sm text-amber-700 mb-2">
                        These scripts are critical to your site's functionality. Monitor them closely.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {supplyChain.criticalDependencies.map((dep, idx) => (
                            <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">
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
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span>{getCategoryIcon(script.category)}</span>
                                            <span className="font-medium text-sm text-slate-800 truncate">
                                                {script.provider || script.domain}
                                            </span>
                                            {script.isCritical && (
                                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
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
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                        <span className="text-sm">{script.domain}</span>
                                        <span className="text-xs">{script.risk}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro+ to see all scripts
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {supplyChain.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
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
                    <h4 className="font-semibold text-green-800 mb-2">✓ Trusted CDN Usage</h4>
                    <p className="text-sm text-green-700">
                        Using {supplyChain.cdnUsage.count} scripts from established CDNs: {supplyChain.cdnUsage.providers.join(', ')}
                    </p>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm">
                <p className="text-slate-700">
                    <strong>💡 What is Supply Chain Risk?</strong> Third-party scripts can be hijacked to steal data or inject malware (e.g., Polyfill.io attack in 2024).
                    We monitor your external dependencies to detect risky or compromised scripts.
                </p>
            </div>
        </div>
    );
}
