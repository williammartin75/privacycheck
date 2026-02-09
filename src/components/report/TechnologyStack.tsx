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

// SVG Icon Components
const ShieldIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const PackageIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const CogIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const LibraryIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const GlobeIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
);

const ServerIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const CartIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const WrenchIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const LightbulbIcon = () => (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const LockSmallIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

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
        if (score >= 80) return 'bg-white border-green-300';
        if (score >= 60) return 'bg-white border-amber-300';
        return 'bg-white border-red-300';
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'cms': return <PackageIcon />;
            case 'framework': return <CogIcon />;
            case 'library': return <LibraryIcon />;
            case 'analytics': return <ChartIcon />;
            case 'cdn': return <GlobeIcon />;
            case 'hosting': return <ServerIcon />;
            case 'security': return <LockIcon />;
            case 'ecommerce': return <CartIcon />;
            default: return <WrenchIcon />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className={`rounded-xl p-6 border ${getScoreBg(technologyStack.score)}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <ShieldIcon />
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Technology Security Scan</h3>
                            <p className="text-sm text-slate-500">{technologyStack.summary}</p>
                        </div>
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
                                <PackageIcon />
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
                                    <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${getRiskColor(technologyStack.cms.securityRisk)}`}>
                                        <WarningIcon /> Outdated
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-medium rounded flex items-center gap-1 bg-white border border-green-200 text-green-700">
                                        <CheckIcon /> Current
                                    </span>
                                )}
                            </div>
                        </div>
                        {technologyStack.cms.isOutdated && technologyStack.cms.latestVersion && (
                            <div className="mt-2 text-xs text-orange-600 bg-white px-3 py-1.5 rounded border border-orange-200">
                                Latest version: {technologyStack.cms.latestVersion}
                            </div>
                        )}
                    </div>
                )}

                {/* Framework Detection */}
                {technologyStack.framework && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200 mb-3">
                        <div className="flex items-center gap-3">
                            <CogIcon />
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
                            <ServerIcon />
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
                    <div className="flex items-center gap-2 mb-3">
                        <WarningIcon />
                        <h4 className="font-semibold text-red-800">Outdated Components</h4>
                    </div>
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
                    <div className="flex items-center gap-2 mb-3">
                        <SearchIcon />
                        <h4 className="font-semibold text-amber-800">Security Findings</h4>
                    </div>
                    <div className="space-y-2">
                        {technologyStack.alerts.map((alert, idx) => (
                            <div key={idx} className={`p-3 rounded-lg bg-white border ${alert.severity === 'critical' || alert.severity === 'high'
                                ? 'border-red-200' : 'border-amber-200'
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
                    <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <WrenchIcon />
                        <h4 className="font-semibold text-slate-800">Detected Technologies ({technologyStack.technologies.length})</h4>
                    </div>

                    {isPro ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                            {technologyStack.technologies.map((tech, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                                    {getCategoryIcon(tech.category)}
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
                                    <div key={idx} className="p-2 bg-white border border-slate-200 rounded-lg text-sm">
                                        {tech.name}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
                                    <LockSmallIcon />
                                    Upgrade to Pro+
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations */}
            {isPro && technologyStack.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <LightbulbIcon />
                        <h4 className="font-semibold text-blue-800">Recommendations</h4>
                    </div>
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
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                <div className="flex gap-3">
                    <ShieldIcon />
                    <p className="text-slate-700">
                        <strong>Security Note:</strong> Outdated CMS and frameworks are a leading cause
                        of website breaches. 60% of hacked websites run outdated software. Keep your
                        technology stack updated to protect against known vulnerabilities.
                    </p>
                </div>
            </div>
        </div>
    );
}
