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

// SVG Icon Components
const EmailIcon = () => (
    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const GlobeIcon = () => (
    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const HeartIcon = () => (
    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);

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
            case 'critical': return <AlertIcon />;
            case 'warning': return <WarningIcon />;
            case 'info': return <InfoIcon />;
            default: return <InfoIcon />;
        }
    };

    const getProviderIcon = () => <GlobeIcon />;

    const getStatusBadge = (exists: boolean, label: string) => (
        <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${exists ? 'bg-white border border-green-200 text-green-700' : 'bg-white border border-red-200 text-red-700'
            }`}>
            {exists ? <CheckIcon /> : <XIcon />} {label}
        </span>
    );

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-white';
            case 'medium': return 'border-amber-200 bg-white';
            case 'low': return 'border-blue-200 bg-white';
            default: return 'border-slate-200 bg-white';
        }
    };

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-white border border-red-200 text-red-700';
            case 'medium': return 'bg-white border border-amber-200 text-amber-700';
            case 'low': return 'bg-white border border-blue-200 text-blue-700';
            default: return 'bg-white border border-slate-200 text-slate-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Grade Overview */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <EmailIcon />
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800">Email Deliverability</h3>
                            <p className="text-sm text-slate-500">{emailDeliverability.summary}</p>
                        </div>
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
                    <div className="mt-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
                        <span className="text-slate-500">Email Provider:</span>{' '}
                        <span className="font-medium text-slate-800">{emailDeliverability.mxRecords.provider}</span>
                    </div>
                )}
            </div>

            {/* SPF/DKIM/DMARC Status Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* SPF Card */}
                <div className={`p-4 rounded-lg border ${emailDeliverability.spf.exists ? 'border-green-200 bg-white' : 'border-red-200 bg-white'}`}>
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
                <div className={`p-4 rounded-lg border ${emailDeliverability.dkim.exists ? 'border-green-200 bg-white' : 'border-red-200 bg-white'}`}>
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
                <div className={`p-4 rounded-lg border ${emailDeliverability.dmarc.exists ? 'border-green-200 bg-white' : 'border-red-200 bg-white'}`}>
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
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                Reporting: {emailDeliverability.dmarc.reportingEnabled ? (
                                    <span className="flex items-center gap-1 text-green-600"><CheckIcon /> Enabled</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600"><XIcon /> Disabled</span>
                                )}
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
                <div className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertIcon />
                        <h4 className="font-semibold text-red-800">Deliverability Alerts</h4>
                    </div>
                    <div className="space-y-2">
                        {emailDeliverability.alerts.map((alert, idx) => (
                            <div key={idx} className={`flex items-start gap-2 p-2 rounded bg-white border ${alert.severity === 'critical' ? 'border-red-200' :
                                alert.severity === 'warning' ? 'border-amber-200' : 'border-blue-200'
                                }`}>
                                {getSeverityIcon(alert.severity)}
                                {getProviderIcon()}
                                <span className="text-sm text-slate-700">{alert.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations - Blurred for non-Pro */}
            {emailDeliverability.recommendations.length > 0 && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <LightbulbIcon />
                        <h4 className="font-semibold text-blue-800">Recommendations</h4>
                    </div>

                    {isPro ? (
                        <div className="space-y-3">
                            {emailDeliverability.recommendations.map((rec, idx) => (
                                <div key={idx} className={`p-3 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-slate-800">{rec.title}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded uppercase ${getPriorityBadgeColor(rec.priority)}`}>{rec.priority}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-1">{rec.description}</p>
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <HeartIcon /> {rec.impact}
                                    </p>
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
                                <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
                                    <LockIcon />
                                    Upgrade to Pro+ for full recommendations
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                <div className="flex gap-3">
                    <LightbulbIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700">
                        <strong>Why email deliverability matters:</strong> Gmail, Outlook, and Yahoo now require
                        SPF, DKIM, and DMARC for bulk senders. Without proper configuration, your emails will
                        be rejected or marked as spam, directly impacting your business communications and revenue.
                    </p>
                </div>
            </div>
        </div>
    );
}
