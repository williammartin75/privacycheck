'use client';

import React from 'react';

interface EmailDeliverabilityAuditProps {
    emailDeliverability?: {
        score: number;
        grade: 'A' | 'B' | 'C' | 'D' | 'F';
        spf: {
            exists: boolean;
            record: string | null;
            policy: 'hardfail' | 'softfail' | 'neutral' | 'pass' | 'none';
            lookupCount: number;
            issues: string[];
            score: number;
        };
        dkim: {
            exists: boolean;
            selectorsFound: string[];
            keyLength: 'unknown' | 'weak' | 'standard' | 'strong';
            issues: string[];
            score: number;
        };
        dmarc: {
            exists: boolean;
            record: string | null;
            policy: 'none' | 'quarantine' | 'reject' | 'unknown';
            reportingEnabled: boolean;
            issues: string[];
            score: number;
        };
        mxRecords: {
            exists: boolean;
            provider: string | null;
            score: number;
        };
        alerts: {
            severity: 'critical' | 'warning' | 'info';
            provider: 'gmail' | 'outlook' | 'yahoo' | 'all';
            message: string;
        }[];
        recommendations: {
            priority: 'high' | 'medium' | 'low';
            category: 'spf' | 'dkim' | 'dmarc' | 'general';
            title: string;
            description: string;
            impact: string;
        }[];
        summary: string;
    };
    isPro: boolean;
}

export function EmailDeliverabilityAudit({ emailDeliverability, isPro }: EmailDeliverabilityAuditProps) {
    if (!emailDeliverability) {
        return (
            <div className="text-center py-8 text-slate-500">
                Email deliverability analysis not available
            </div>
        );
    }

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'bg-green-500 text-white';
            case 'B': return 'bg-green-400 text-white';
            case 'C': return 'bg-amber-500 text-white';
            case 'D': return 'bg-orange-500 text-white';
            case 'F': return 'bg-red-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📌';
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'gmail': return '📧';
            case 'outlook': return '📬';
            case 'yahoo': return '📨';
            case 'all': return '🌐';
            default: return '📩';
        }
    };

    const getStatusBadge = (exists: boolean, label: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${exists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {exists ? '✓' : '✗'} {label}
        </span>
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50';
            case 'medium': return 'border-amber-200 bg-amber-50';
            case 'low': return 'border-blue-200 bg-blue-50';
            default: return 'border-slate-200 bg-slate-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Grade Overview */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">📧 Email Deliverability</h3>
                        <p className="text-sm text-slate-500">{emailDeliverability.summary}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold ${getGradeColor(emailDeliverability.grade)}`}>
                            {emailDeliverability.grade}
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-slate-800">{emailDeliverability.score}/100</div>
                            <div className="text-xs text-slate-500">Deliverability Score</div>
                        </div>
                    </div>
                </div>

                {/* Provider Info */}
                {emailDeliverability.mxRecords.provider && (
                    <div className="mt-3 px-3 py-2 bg-white rounded-lg border border-indigo-200 text-sm">
                        <span className="text-slate-500">Email Provider:</span>{' '}
                        <span className="font-medium text-slate-800">{emailDeliverability.mxRecords.provider}</span>
                    </div>
                )}
            </div>

            {/* SPF/DKIM/DMARC Status Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* SPF Card */}
                <div className={`p-4 rounded-lg border ${emailDeliverability.spf.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800">SPF</h4>
                        {getStatusBadge(emailDeliverability.spf.exists, emailDeliverability.spf.exists ? 'Found' : 'Missing')}
                    </div>
                    {emailDeliverability.spf.exists && (
                        <>
                            <div className="text-sm text-slate-600 mb-1">
                                Policy: <span className={`font-medium ${emailDeliverability.spf.policy === 'hardfail' ? 'text-green-700' :
                                        emailDeliverability.spf.policy === 'softfail' ? 'text-amber-700' : 'text-red-700'
                                    }`}>{emailDeliverability.spf.policy}</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                Lookups: {emailDeliverability.spf.lookupCount}/10
                            </div>
                        </>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                        Score: {emailDeliverability.spf.score}/25
                    </div>
                </div>

                {/* DKIM Card */}
                <div className={`p-4 rounded-lg border ${emailDeliverability.dkim.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800">DKIM</h4>
                        {getStatusBadge(emailDeliverability.dkim.exists, emailDeliverability.dkim.exists ? 'Found' : 'Missing')}
                    </div>
                    {emailDeliverability.dkim.exists && (
                        <>
                            <div className="text-sm text-slate-600 mb-1">
                                Selectors: <span className="font-medium">{emailDeliverability.dkim.selectorsFound.join(', ')}</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                Key: <span className={`capitalize ${emailDeliverability.dkim.keyLength === 'strong' ? 'text-green-600' :
                                        emailDeliverability.dkim.keyLength === 'weak' ? 'text-red-600' : 'text-slate-600'
                                    }`}>{emailDeliverability.dkim.keyLength}</span>
                            </div>
                        </>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                        Score: {emailDeliverability.dkim.score}/25
                    </div>
                </div>

                {/* DMARC Card */}
                <div className={`p-4 rounded-lg border ${emailDeliverability.dmarc.exists ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-800">DMARC</h4>
                        {getStatusBadge(emailDeliverability.dmarc.exists, emailDeliverability.dmarc.exists ? 'Found' : 'Missing')}
                    </div>
                    {emailDeliverability.dmarc.exists && (
                        <>
                            <div className="text-sm text-slate-600 mb-1">
                                Policy: <span className={`font-medium ${emailDeliverability.dmarc.policy === 'reject' ? 'text-green-700' :
                                        emailDeliverability.dmarc.policy === 'quarantine' ? 'text-amber-700' : 'text-red-700'
                                    }`}>p={emailDeliverability.dmarc.policy}</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                Reporting: {emailDeliverability.dmarc.reportingEnabled ? '✓ Enabled' : '✗ Disabled'}
                            </div>
                        </>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                        Score: {emailDeliverability.dmarc.score}/25
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {emailDeliverability.alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">🚨 Deliverability Alerts</h4>
                    <div className="space-y-2">
                        {emailDeliverability.alerts.map((alert, idx) => (
                            <div key={idx} className={`flex items-start gap-2 p-2 rounded ${alert.severity === 'critical' ? 'bg-red-100' :
                                    alert.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                                }`}>
                                <span>{getSeverityIcon(alert.severity)}</span>
                                <span>{getProviderIcon(alert.provider)}</span>
                                <span className="text-sm text-slate-700">{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations - Blurred for non-Pro */}
            {emailDeliverability.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">💡 Recommendations</h4>

                    {isPro ? (
                        <div className="space-y-3">
                            {emailDeliverability.recommendations.map((rec, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-800">{rec.title}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded uppercase ${rec.priority === 'high' ? 'bg-red-200 text-red-700' :
                                                rec.priority === 'medium' ? 'bg-amber-200 text-amber-700' :
                                                    'bg-blue-200 text-blue-700'
                                            }`}>{rec.priority}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">{rec.description}</p>
                                    <p className="text-xs text-green-600">💚 {rec.impact}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-3 blur-sm select-none">
                                {emailDeliverability.recommendations.slice(0, 2).map((rec, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-blue-200 bg-white">
                                        <span className="font-medium">{rec.title}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro for full recommendations
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-sm">
                <p className="text-slate-700">
                    <strong>💡 Why email deliverability matters:</strong> Gmail, Outlook, and Yahoo now require
                    SPF, DKIM, and DMARC for bulk senders. Without proper configuration, your emails will
                    be rejected or marked as spam, directly impacting your business communications and revenue.
                </p>
            </div>
        </div>
    );
}
