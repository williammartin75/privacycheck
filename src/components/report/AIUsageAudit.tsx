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
            case 'compliant': return '✓ Compliant';
            case 'action-needed': return '⚠ Action Needed';
            case 'high-risk': return '🔶 High Risk';
            case 'critical': return '🚨 Critical';
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
            case 'generative-ai': return '🧠';
            case 'chatbot': return '💬';
            case 'personalization': return '🎯';
            case 'analytics': return '📊';
            case 'recommendation': return '🔍';
            case 'content-generation': return '✍️';
            case 'voice-assistant': return '🎙️';
            case 'video-generation': return '🎬';
            case 'image-generation': return '🖼️';
            case 'translation': return '🌐';
            case 'ad-optimization': return '📢';
            case 'biometric': return '👁️';
            default: return '🤖';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'border-red-300 bg-red-50';
            case 'high': return 'border-orange-200 bg-orange-50';
            case 'medium': return 'border-amber-200 bg-amber-50';
            case 'low': return 'border-blue-200 bg-blue-50';
            default: return 'border-slate-200 bg-slate-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* EU AI Act Status Overview */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">🤖 AI Usage & EU AI Act Compliance</h3>
                        <p className="text-sm text-slate-500">{aiUsage.summary}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(aiUsage.euAiActStatus)}`}>
                            {getStatusLabel(aiUsage.euAiActStatus)}
                        </span>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{aiUsage.score}/100</div>
                            <div className="text-xs text-slate-500">AI Compliance Score</div>
                        </div>
                    </div>
                </div>

                {/* Risk Breakdown */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{aiUsage.aiSystemsDetected}</div>
                        <div className="text-xs text-slate-500">AI Systems</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${aiUsage.riskBreakdown.highRisk > 0 ? 'bg-orange-100 border-orange-300' : 'bg-white border-purple-200'} border`}>
                        <div className="text-2xl font-bold text-orange-600">{aiUsage.riskBreakdown.highRisk}</div>
                        <div className="text-xs text-slate-500">High Risk</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                        <div className="text-2xl font-bold text-amber-600">{aiUsage.riskBreakdown.limitedRisk}</div>
                        <div className="text-xs text-slate-500">Limited Risk</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border border-purple-200">
                        <div className="text-2xl font-bold text-green-600">{aiUsage.riskBreakdown.minimalRisk}</div>
                        <div className="text-xs text-slate-500">Minimal Risk</div>
                    </div>
                </div>
            </div>

            {/* Detected AI Systems */}
            {aiUsage.systems.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-800">🔍 Detected AI Systems</h4>
                    </div>

                    {isPro ? (
                        <div className="divide-y divide-slate-100">
                            {aiUsage.systems.map((system, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getCategoryIcon(system.category)}</span>
                                            <div>
                                                <div className="font-medium text-slate-800">{system.name}</div>
                                                <div className="text-xs text-slate-500">{system.purpose}</div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-xs text-slate-400">{system.euAiActCategory}</span>
                                                    {system.requiresDisclosure && (
                                                        <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                                                            Disclosure Required
                                                        </span>
                                                    )}
                                                    {system.requiresHumanOversight && (
                                                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
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
                                    <div key={idx} className="p-3 bg-slate-50 rounded mb-2">
                                        <span className="font-medium">{system.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro+ for full AI inventory
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Alerts */}
            {aiUsage.alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">🚨 EU AI Act Compliance Alerts</h4>
                    <div className="space-y-2">
                        {aiUsage.alerts.map((alert, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${alert.severity === 'critical' || alert.severity === 'high'
                                ? 'bg-red-100' : 'bg-amber-100'
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">💡 Compliance Recommendations</h4>

                    {isPro ? (
                        <div className="space-y-3">
                            {aiUsage.recommendations.map((rec, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-800">{rec.title}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded uppercase ${rec.priority === 'critical' ? 'bg-red-200 text-red-700' :
                                            rec.priority === 'high' ? 'bg-orange-200 text-orange-700' :
                                                rec.priority === 'medium' ? 'bg-amber-200 text-amber-700' :
                                                    'bg-blue-200 text-blue-700'
                                            }`}>{rec.priority}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">{rec.description}</p>
                                    <p className="text-xs text-purple-600">📜 {rec.regulation}</p>
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
                                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro+ for full recommendations
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 text-sm">
                <p className="text-slate-700">
                    <strong>🏛️ EU AI Act (2024):</strong> The European Union's Artificial Intelligence Act
                    establishes comprehensive regulations for AI systems. Requirements include transparency
                    obligations for chatbots, conformity assessments for high-risk systems, and prohibitions
                    on manipulative AI practices. Non-compliance can result in fines up to €35 million or 7% of global revenue.
                </p>
            </div>
        </div>
    );
}
