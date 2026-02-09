'use client';

import React from 'react';

interface AIUsageAuditProps {
    aiUsage?: {
        score: number;
        aiSystemsDetected: number;
        systems: {
            name: string;
            provider: string;
            category: string;
            riskLevel: 'prohibited' | 'high' | 'limited' | 'minimal';
            detected: string;
            purpose: string;
            euAiActCategory: string;
            requiresDisclosure: boolean;
            requiresHumanOversight: boolean;
        }[];
        riskBreakdown: {
            prohibited: number;
            highRisk: number;
            limitedRisk: number;
            minimalRisk: number;
        };
        alerts: {
            severity: 'critical' | 'high' | 'medium' | 'low';
            system: string;
            message: string;
            regulation: string;
        }[];
        recommendations: {
            priority: 'critical' | 'high' | 'medium' | 'low';
            title: string;
            description: string;
            regulation: string;
        }[];
        euAiActStatus: 'compliant' | 'action-needed' | 'high-risk' | 'critical';
        summary: string;
    };
    isPro: boolean;
}

// SVG Icon Components
const RobotIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const SearchIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const BrainIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const TargetIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const PencilIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

const MicrophoneIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const VideoIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ImageIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const GlobeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
);

const SpeakerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const CpuIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const LightbulbIcon = ({ className = "w-5 h-5 text-blue-500" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const LockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const BuildingIcon = () => (
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export function AIUsageAudit({ aiUsage, isPro }: AIUsageAuditProps) {
    if (!aiUsage) {
        return (
            <div className="text-center py-8 text-slate-500">
                AI usage analysis not available
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'bg-green-500 text-white';
            case 'action-needed': return 'bg-amber-500 text-white';
            case 'high-risk': return 'bg-orange-500 text-white';
            case 'critical': return 'bg-red-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'compliant': return <span className="flex items-center gap-1"><CheckIcon /> Good</span>;
            case 'action-needed': return <span className="flex items-center gap-1"><WarningIcon /> Action Needed</span>;
            case 'high-risk': return <span className="flex items-center gap-1"><WarningIcon /> High Risk</span>;
            case 'critical': return <span className="flex items-center gap-1"><AlertIcon /> Critical</span>;
            default: return status;
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'prohibited': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'limited': return 'bg-amber-500 text-white';
            case 'minimal': return 'bg-green-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'generative-ai': return <BrainIcon />;
            case 'chatbot': return <ChatIcon />;
            case 'personalization': return <TargetIcon />;
            case 'analytics': return <ChartIcon />;
            case 'recommendation': return <SearchIcon />;
            case 'content-generation': return <PencilIcon />;
            case 'voice-assistant': return <MicrophoneIcon />;
            case 'video-generation': return <VideoIcon />;
            case 'image-generation': return <ImageIcon />;
            case 'translation': return <GlobeIcon />;
            case 'ad-optimization': return <SpeakerIcon />;
            case 'biometric': return <EyeIcon />;
            default: return <CpuIcon />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'border-red-300 bg-white';
            case 'high': return 'border-orange-200 bg-white';
            case 'medium': return 'border-amber-200 bg-white';
            case 'low': return 'border-blue-200 bg-white';
            default: return 'border-slate-200 bg-white';
        }
    };

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-white border border-red-200 text-red-700';
            case 'high': return 'bg-white border border-orange-200 text-orange-700';
            case 'medium': return 'bg-white border border-amber-200 text-amber-700';
            case 'low': return 'bg-white border border-blue-200 text-blue-700';
            default: return 'bg-white border border-slate-200 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* EU AI Act Status Overview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <RobotIcon />
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">AI Detection &amp; EU AI Act Overview</h3>
                            <p className="text-sm text-slate-500">{aiUsage.summary}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{aiUsage.score}/100</div>
                            <div className="text-xs text-slate-500">AI Detection Score</div>
                        </div>
                    </div>
                </div>

                {/* Risk Breakdown */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                        <div className="text-2xl font-bold text-slate-700">{aiUsage.aiSystemsDetected}</div>
                        <div className="text-xs text-slate-500">AI Systems</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center bg-white ${aiUsage.riskBreakdown.highRisk > 0 ? 'border-orange-300' : 'border-slate-200'} border`}>
                        <div className="text-2xl font-bold text-orange-600">{aiUsage.riskBreakdown.highRisk}</div>
                        <div className="text-xs text-slate-500">High Risk</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                        <div className="text-2xl font-bold text-amber-600">{aiUsage.riskBreakdown.limitedRisk}</div>
                        <div className="text-xs text-slate-500">Limited Risk</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-slate-200">
                        <div className="text-2xl font-bold text-green-600">{aiUsage.riskBreakdown.minimalRisk}</div>
                        <div className="text-xs text-slate-500">Minimal Risk</div>
                    </div>
                </div>
            </div>

            {/* Detected AI Systems */}
            {aiUsage.systems.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <SearchIcon />
                        <h4 className="font-semibold text-slate-800">Detected AI Systems</h4>
                    </div>

                    {isPro ? (
                        <div className="divide-y divide-slate-100">
                            {aiUsage.systems.map((system, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <span className="text-slate-600">{getCategoryIcon(system.category)}</span>
                                            <div>
                                                <div className="font-medium text-slate-800">{system.name}</div>
                                                <div className="text-xs text-slate-500">{system.purpose}</div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{system.euAiActCategory}</span>
                                                    {system.requiresDisclosure && (
                                                        <span className="px-1.5 py-0.5 text-xs bg-white border border-amber-200 text-amber-700 rounded">
                                                            Disclosure Required
                                                        </span>
                                                    )}
                                                    {system.requiresHumanOversight && (
                                                        <span className="px-1.5 py-0.5 text-xs bg-white border border-blue-200 text-blue-700 rounded">
                                                            Human Oversight
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getRiskColor(system.riskLevel)}`}>
                                            {system.riskLevel}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative p-4">
                            <div className="blur-sm select-none">
                                {aiUsage.systems.slice(0, 2).map((system, idx) => (
                                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded mb-2">
                                        <span className="font-medium">{system.name}</span>
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

            {/* Alerts */}
            {aiUsage.alerts.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertIcon />
                        <h4 className="font-semibold text-red-800">EU AI Act Alerts</h4>
                    </div>
                    <div className="space-y-2">
                        {aiUsage.alerts.map((alert, idx) => (
                            <div key={idx} className={`p-3 rounded-lg bg-white border ${alert.severity === 'critical' || alert.severity === 'high'
                                ? 'border-red-200' : 'border-amber-200'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <span className="text-sm text-slate-700">{alert.message}</span>
                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{alert.regulation}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations - Blurred for non-Pro */}
            {aiUsage.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <LightbulbIcon />
                        <h4 className="font-semibold text-blue-800">Recommendations</h4>
                    </div>

                    {isPro ? (
                        <div className="space-y-3">
                            {aiUsage.recommendations.map((rec, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-800">{rec.title}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded uppercase ${getPriorityBadgeColor(rec.priority)}`}>{rec.priority}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">{rec.description}</p>
                                    <p className="text-xs text-purple-600 flex items-center gap-1">
                                        <DocumentIcon /> {rec.regulation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-3 blur-sm select-none">
                                {aiUsage.recommendations.slice(0, 2).map((rec, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-blue-200 bg-white">
                                        <span className="font-medium">{rec.title}</span>
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

            {/* Info Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                <div className="flex gap-3">
                    <BuildingIcon />
                    <p className="text-slate-700">
                        <strong>EU AI Act (2024):</strong> The European Union&apos;s Artificial Intelligence Act
                        establishes comprehensive regulations for AI systems. Requirements include transparency
                        obligations for chatbots, conformity assessments for high-risk systems, and prohibitions
                        on manipulative AI practices. Non-compliance can result in fines up to €35 million or 7% of global revenue.
                    </p>
                </div>
            </div>
        </div>
    );
}
