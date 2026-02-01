'use client';

import React from 'react';

interface TechnologyStackProps {
    technologyStack?: {
        score: number;
        cms: {
            name: string;
            version: string | null;
            confidence: 'high' | 'medium' | 'low';
            isOutdated: boolean;
            latestVersion: string | null;
            securityRisk: 'low' | 'medium' | 'high' | 'critical';
        } | null;
        framework: {
            name: string;
            version: string | null;
            type: 'frontend' | 'backend' | 'fullstack';
        } | null;
        server: {
            software: string | null;
            version: string | null;
        } | null;
        technologies: {
            name: string;
            category: string;
            version: string | null;
            confidence: 'high' | 'medium' | 'low';
        }[];
        outdatedComponents: {
            name: string;
            currentVersion: string;
            latestVersion: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            recommendation: string;
        }[];
        alerts: {
            severity: 'critical' | 'high' | 'medium' | 'low';
            title: string;
            description: string;
        }[];
        recommendations: string[];
        summary: string;
    };
    isPro: boolean;
}

export function TechnologyStack({ technologyStack, isPro }: TechnologyStackProps) {
    if (!technologyStack) {
        return (
            <div className="text-center py-8 text-slate-500">
                Technology detection not available
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 border-green-300';
        if (score >= 60) return 'bg-amber-100 border-amber-300';
        return 'bg-red-100 border-red-300';
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-white0 text-white';
            case 'medium': return 'bg-white0 text-white';
            case 'low': return 'bg-white0 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'cms': return '📦';
            case 'framework': return '⚙️';
            case 'library': return '📚';
            case 'analytics': return '📊';
            case 'cdn': return '🌐';
            case 'hosting': return '🖥️';
            case 'security': return '🔒';
            case 'ecommerce': return '🛒';
            default: return '🔧';
        }
    };

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className={`rounded-xl p-6 border ${getScoreBg(technologyStack.score)}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">🛡️ Technology Security Scan</h3>
                        <p className="text-sm text-slate-500">{technologyStack.summary}</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(technologyStack.score)}`}>
                            {technologyStack.score}/100
                        </div>
                        <div className="text-xs text-slate-500">Security Score</div>
                    </div>
                </div>

                {/* CMS Detection */}
                {technologyStack.cms && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200 mb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📦</span>
                                <div>
                                    <div className="font-semibold text-slate-800">
                                        {technologyStack.cms.name}
                                        {technologyStack.cms.version && (
                                            <span className="text-slate-500 font-normal ml-2">v{technologyStack.cms.version}</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Content Management System
                                        {technologyStack.cms.confidence && (
                                            <span className="ml-2 text-slate-400">({technologyStack.cms.confidence} confidence)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {technologyStack.cms.isOutdated ? (
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(technologyStack.cms.securityRisk)}`}>
                                        ⚠️ Outdated
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                                        ✓ Current
                                    </span>
                                )}
                            </div>
                        </div>
                        {technologyStack.cms.isOutdated && technologyStack.cms.latestVersion && (
                            <div className="mt-2 text-xs text-orange-600 bg-white px-3 py-1.5 rounded">
                                Latest version: {technologyStack.cms.latestVersion}
                            </div>
                        )}
                    </div>
                )}

                {/* Framework Detection */}
                {technologyStack.framework && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200 mb-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚙️</span>
                            <div>
                                <div className="font-semibold text-slate-800">
                                    {technologyStack.framework.name}
                                    {technologyStack.framework.version && (
                                        <span className="text-slate-500 font-normal ml-2">v{technologyStack.framework.version}</span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 capitalize">
                                    {technologyStack.framework.type} Framework
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Server Detection */}
                {technologyStack.server?.software && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🖥️</span>
                            <div>
                                <div className="font-semibold text-slate-800">
                                    {technologyStack.server.software}
                                    {technologyStack.server.version && (
                                        <span className="text-slate-500 font-normal ml-2">v{technologyStack.server.version}</span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500">Web Server</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Outdated Components Alert */}
            {technologyStack.outdatedComponents.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ Outdated Components</h4>
                    <div className="space-y-2">
                        {technologyStack.outdatedComponents.map((component, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                                <div>
                                    <span className="font-medium text-slate-800">{component.name}</span>
                                    <span className="text-red-600 ml-2">v{component.currentVersion}</span>
                                    <span className="text-slate-400 mx-2">→</span>
                                    <span className="text-green-600">v{component.latestVersion}</span>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${getRiskColor(component.severity)}`}>
                                    {component.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Alerts */}
            {technologyStack.alerts.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 mb-3">🔍 Security Findings</h4>
                    <div className="space-y-2">
                        {technologyStack.alerts.map((alert, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${alert.severity === 'critical' || alert.severity === 'high'
                                    ? 'bg-red-100' : 'bg-amber-100'
                                }`}>
                                <div className="font-medium text-slate-800">{alert.title}</div>
                                <div className="text-sm text-slate-600">{alert.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technologies List */}
            {technologyStack.technologies.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-800">🔧 Detected Technologies ({technologyStack.technologies.length})</h4>
                    </div>

                    {isPro ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                            {technologyStack.technologies.map((tech, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                    <span>{getCategoryIcon(tech.category)}</span>
                                    <span className="text-sm font-medium text-slate-700 truncate">{tech.name}</span>
                                    {tech.version && (
                                        <span className="text-xs text-slate-400">v{tech.version}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative p-4">
                            <div className="grid grid-cols-2 gap-2 blur-sm select-none">
                                {technologyStack.technologies.slice(0, 4).map((tech, idx) => (
                                    <div key={idx} className="p-2 bg-slate-50 rounded-lg text-sm">
                                        {tech.name}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro for full inventory
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {isPro && technologyStack.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">💡 Recommendations</h4>
                    <ul className="space-y-2">
                        {technologyStack.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="text-blue-500">•</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm">
                <p className="text-slate-700">
                    <strong>🛡️ Security Note:</strong> Outdated CMS and frameworks are a leading cause
                    of website breaches. 60% of hacked websites run outdated software. Keep your
                    technology stack updated to protect against known vulnerabilities.
                </p>
            </div>
        </div>
    );
}
