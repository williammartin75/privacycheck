'use client';

import React from 'react';

interface DomainRiskProps {
    domainRisk?: {
        domainExpiry: {
            expiresAt: string | null;
            daysUntilExpiry: number | null;
            registrar: string | null;
            status: 'ok' | 'warning' | 'critical' | 'unknown';
        };
        sslExpiry: {
            expiresAt: string | null;
            daysUntilExpiry: number | null;
            status: 'ok' | 'warning' | 'critical';
        };
        dnsSecurity: {
            dnssec: boolean;
            spf: boolean;
            dkim: boolean;
            dmarc: boolean;
            score: number;
        };
        typosquatting: {
            detected: number;
            domains: {
                domain: string;
                type: string;
                registered: boolean;
                risk: 'high' | 'medium' | 'low';
            }[];
        };
        phishingRisk: {
            score: number;
            alerts: string[];
        };
        overallRisk: 'low' | 'medium' | 'high' | 'critical';
        score: number;
    };
    isPro: boolean;
}

export function DomainRisk({ domainRisk, isPro }: DomainRiskProps) {
    if (!domainRisk) {
        return (
            <div className="text-center py-8 text-slate-500">
                Domain risk analysis not available
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ok': return 'text-green-600 bg-white border-green-200';
            case 'warning': return 'text-amber-600 bg-white border-amber-200';
            case 'critical': return 'text-red-600 bg-white border-red-200';
            default: return 'text-slate-600 bg-white border-slate-200';
        }
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-white';
            case 'medium': return 'text-amber-600 bg-white';
            case 'high': return 'text-orange-600 bg-white';
            case 'critical': return 'text-red-600 bg-white';
            default: return 'text-slate-600 bg-white';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Domain Security Score</h3>
                        <p className="text-sm text-slate-500">WHOIS, DNS, & Typosquatting Analysis</p>
                    </div>
                    <div className={`text-4xl font-bold ${getScoreColor(domainRisk.score)}`}>
                        {domainRisk.score}/100
                    </div>
                </div>

                {/* Overall Risk Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Overall Risk:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskColor(domainRisk.overallRisk)}`}>
                        {domainRisk.overallRisk}
                    </span>
                </div>
            </div>

            {/* Expiry Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Domain Expiry */}
                <div className={`p-4 rounded-lg border ${getStatusColor(domainRisk.domainExpiry.status)}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                        <h4 className="font-semibold">Domain Expiry</h4>
                    </div>
                    {domainRisk.domainExpiry.daysUntilExpiry !== null ? (
                        <>
                            <p className="text-2xl font-bold">{domainRisk.domainExpiry.daysUntilExpiry} days</p>
                            <p className="text-sm opacity-75">
                                Expires: {domainRisk.domainExpiry.expiresAt ? new Date(domainRisk.domainExpiry.expiresAt).toLocaleDateString() : 'Unknown'}
                            </p>
                            {domainRisk.domainExpiry.registrar && (
                                <p className="text-xs mt-1 opacity-60">Registrar: {domainRisk.domainExpiry.registrar}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm opacity-75">Unable to retrieve WHOIS data</p>
                    )}
                </div>

                {/* SSL Expiry */}
                <div className={`p-4 rounded-lg border ${getStatusColor(domainRisk.sslExpiry.status)}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h4 className="font-semibold">SSL Certificate</h4>
                    </div>
                    {domainRisk.sslExpiry.daysUntilExpiry !== null ? (
                        <>
                            <p className="text-2xl font-bold">{domainRisk.sslExpiry.daysUntilExpiry} days</p>
                            <p className="text-sm opacity-75">
                                Expires: {domainRisk.sslExpiry.expiresAt ? new Date(domainRisk.sslExpiry.expiresAt).toLocaleDateString() : 'Unknown'}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm opacity-75">SSL expiry data not available</p>
                    )}
                </div>
            </div>

            {/* DNS Security */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">DNS Security</h4>
                    <span className={`text-sm font-medium ${getScoreColor(domainRisk.dnsSecurity.score)}`}>
                        {domainRisk.dnsSecurity.score}/100
                    </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'SPF', value: domainRisk.dnsSecurity.spf },
                        { label: 'DKIM', value: domainRisk.dnsSecurity.dkim },
                        { label: 'DMARC', value: domainRisk.dnsSecurity.dmarc },
                        { label: 'DNSSEC', value: domainRisk.dnsSecurity.dnssec },
                    ].map(item => (
                        <div key={item.label} className={`text-center py-2 rounded ${item.value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <div className="text-lg">{item.value ? '✓' : '✗'}</div>
                            <div className="text-xs font-medium">{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Typosquatting - Blurred for non-Pro */}
            {domainRisk.typosquatting.detected > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-semibold text-slate-800">⚠️ Typosquatting Detected</h4>
                            <p className="text-sm text-slate-500">{domainRisk.typosquatting.detected} similar domain(s) found</p>
                        </div>
                    </div>

                    {isPro ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {domainRisk.typosquatting.domains.map((domain, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                    <div>
                                        <span className="font-mono text-sm text-slate-800">{domain.domain}</span>
                                        <span className="ml-2 text-xs text-slate-500">({domain.type})</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getRiskColor(domain.risk)}`}>
                                        {domain.risk}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="space-y-2 blur-sm select-none">
                                {domainRisk.typosquatting.domains.slice(0, 3).map((domain, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                        <span className="font-mono text-sm text-slate-800">{domain.domain}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium`}>
                                            {domain.risk}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                                    🔒 Upgrade to Pro+ to see all domains
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Phishing Alerts */}
            {domainRisk.phishingRisk.alerts.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Phishing Risk Alerts</h4>
                    <ul className="space-y-1">
                        {domainRisk.phishingRisk.alerts.map((alert, idx) => (
                            <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                                <span>•</span>
                                <span>{alert}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-white border border-amber-200 rounded-lg p-4 text-sm">
                <p className="text-amber-800">
                    <strong>💡 Why this matters:</strong> Domain expiration or hijacking can cause complete loss of your website, email, and business identity.
                    Typosquatting domains are often used for phishing attacks against your customers.
                </p>
            </div>
        </div>
    );
}
