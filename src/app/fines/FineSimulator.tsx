'use client';

import { useState, useMemo } from 'react';

/* ──────────────────────────────────────────────
   Regulation definitions for the simulator
   ────────────────────────────────────────────── */

interface RegulationDef {
    id: string;
    name: string;
    region: string;
    maxFixed: number;       // max fixed amount in EUR
    maxPctRevenue: number;  // max % of global annual turnover
    currency: string;
    currencySymbol: string;
    per: string;            // "per violation" or "total"
    note: string;
}

const regulations: RegulationDef[] = [
    { id: 'gdpr', name: 'GDPR (EU/EEA)', region: 'Europe', maxFixed: 20000000, maxPctRevenue: 4, currency: 'EUR', currencySymbol: '€', per: 'whichever is higher', note: '€20M or 4% of worldwide annual turnover for serious violations. €10M or 2% for lesser violations.' },
    { id: 'uk-gdpr', name: 'UK GDPR', region: 'United Kingdom', maxFixed: 17500000, maxPctRevenue: 4, currency: 'GBP', currencySymbol: '£', per: 'whichever is higher', note: '£17.5M or 4% of worldwide annual turnover. £8.7M or 2% for lesser violations.' },
    { id: 'ccpa', name: 'CCPA / CPRA (California)', region: 'Americas', maxFixed: 7988, maxPctRevenue: 0, currency: 'USD', currencySymbol: '$', per: 'per violation', note: '$2,663 per unintentional violation, $7,988 per intentional violation or involving minors.' },
    { id: 'lgpd', name: 'LGPD (Brazil)', region: 'Americas', maxFixed: 9000000, maxPctRevenue: 2, currency: 'BRL', currencySymbol: 'R$', per: 'per violation, capped at R$50M', note: '2% of revenue in Brazil, capped at R$50M (~€9M) per violation.' },
    { id: 'pipeda', name: 'PIPEDA (Canada)', region: 'Americas', maxFixed: 75000, maxPctRevenue: 0, currency: 'CAD', currencySymbol: 'C$', per: 'per violation', note: 'C$100K per violation. Proposed CPPA: C$25M or 5% of global revenue.' },
    { id: 'pdpa-sg', name: 'PDPA (Singapore)', region: 'Asia-Pacific', maxFixed: 740000, maxPctRevenue: 10, currency: 'SGD', currencySymbol: 'S$', per: 'whichever is higher', note: 'S$1M or 10% of annual turnover in Singapore (if turnover > S$10M).' },
    { id: 'pipa', name: 'PIPA (South Korea)', region: 'Asia-Pacific', maxFixed: 0, maxPctRevenue: 3, currency: 'KRW', currencySymbol: '₩', per: 'of total sales', note: 'Up to 3% of total sales. Being increased to 10% for severe violations.' },
    { id: 'privacy-act-au', name: 'Privacy Act (Australia)', region: 'Asia-Pacific', maxFixed: 30000000, maxPctRevenue: 30, currency: 'AUD', currencySymbol: 'A$', per: 'greatest of the three', note: 'A$50M, 3x the benefit obtained, or 30% of adjusted turnover — whichever is greatest.' },
    { id: 'dpdp', name: 'DPDP Act (India)', region: 'Asia-Pacific', maxFixed: 28000000, maxPctRevenue: 0, currency: 'INR', currencySymbol: '₹', per: 'per violation', note: '₹50 Crore to ₹250 Crore (~€28M) per violation. Enforcement starting 2027.' },
    { id: 'kvkk', name: 'KVKK (Turkey)', region: 'Middle East', maxFixed: 100000, maxPctRevenue: 0, currency: 'TRY', currencySymbol: '₺', per: 'per violation', note: 'Up to ₺1.9M (~€100K) per violation, updated annually.' },
];

const violationTypes = [
    { id: 'insufficient-basis', label: 'Insufficient legal basis for processing', severityMultiplier: 1.0 },
    { id: 'data-transfer', label: 'Unlawful international data transfers', severityMultiplier: 0.9 },
    { id: 'security-breach', label: 'Inadequate security measures / data breach', severityMultiplier: 0.85 },
    { id: 'data-subject-rights', label: 'Failure to respect data subject rights', severityMultiplier: 0.6 },
    { id: 'cookie-consent', label: 'Cookie/consent violations', severityMultiplier: 0.5 },
    { id: 'transparency', label: 'Transparency / privacy notice failures', severityMultiplier: 0.4 },
    { id: 'dpo-record', label: 'DPO / record-keeping failures', severityMultiplier: 0.25 },
    { id: 'notification', label: 'Breach notification failure', severityMultiplier: 0.55 },
];

const companySizes = [
    { id: 'startup', label: 'Startup (< €1M revenue)', revenue: 500000 },
    { id: 'sme-small', label: 'Small business (€1M – €10M)', revenue: 5000000 },
    { id: 'sme-medium', label: 'Mid-size company (€10M – €100M)', revenue: 50000000 },
    { id: 'large', label: 'Large enterprise (€100M – €1B)', revenue: 500000000 },
    { id: 'big-tech', label: 'Big tech / Fortune 500 (> €1B)', revenue: 5000000000 },
    { id: 'custom', label: 'Custom revenue', revenue: 0 },
];

function formatCurrency(amount: number, symbol: string): string {
    if (amount >= 1_000_000_000) return `${symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(0)}K`;
    return `${symbol}${amount.toFixed(0)}`;
}

export default function FineSimulator() {
    const [selectedRegulation, setSelectedRegulation] = useState('gdpr');
    const [selectedViolation, setSelectedViolation] = useState('insufficient-basis');
    const [selectedSize, setSelectedSize] = useState('sme-medium');
    const [customRevenue, setCustomRevenue] = useState('');
    const [isIntentional, setIsIntentional] = useState(false);
    const [affectedUsers, setAffectedUsers] = useState('10000');
    const [isRepeat, setIsRepeat] = useState(false);

    const regulation = regulations.find(r => r.id === selectedRegulation)!;
    const violation = violationTypes.find(v => v.id === selectedViolation)!;
    const companySize = companySizes.find(c => c.id === selectedSize)!;

    const revenue = selectedSize === 'custom'
        ? parseFloat(customRevenue) || 0
        : companySize.revenue;

    const result = useMemo(() => {
        const reg = regulation;
        const viol = violation;

        // Base calculation
        let fixedPenalty = reg.maxFixed;
        let revenuePenalty = (reg.maxPctRevenue / 100) * revenue;

        // For per-violation regulations like CCPA
        const numUsers = parseInt(affectedUsers) || 1;
        let perViolationTotal = 0;
        if (reg.id === 'ccpa') {
            const perViolation = isIntentional ? 7988 : 2663;
            perViolationTotal = perViolation * numUsers;
            fixedPenalty = perViolationTotal;
            revenuePenalty = 0;
        }

        // Choose the higher amount (GDPR-style)
        let maxPotential = Math.max(fixedPenalty, revenuePenalty);

        // Apply severity multiplier based on violation type
        let estimatedFine = maxPotential * viol.severityMultiplier;

        // Aggravating factors
        if (isIntentional) estimatedFine *= 1.5;
        if (isRepeat) estimatedFine *= 1.3;

        // Cap at maximum
        estimatedFine = Math.min(estimatedFine, maxPotential);

        // Calculate ranges
        const lowEstimate = estimatedFine * 0.3;
        const midEstimate = estimatedFine * 0.65;
        const highEstimate = estimatedFine;

        return {
            maxPotential,
            lowEstimate,
            midEstimate,
            highEstimate,
            revenuePenalty,
            fixedPenalty,
            perViolationTotal,
            symbol: reg.currencySymbol,
        };
    }, [regulation, violation, revenue, isIntentional, isRepeat, affectedUsers]);

    return (
        <section className="mb-16" id="simulator">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 text-white">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Fine Simulator
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-lg">
                        Estimate the potential penalty your organization could face based on jurisdiction, violation type, and company size.
                    </p>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-8">
                    {/* ── Left: Inputs ── */}
                    <div className="space-y-5">
                        {/* Regulation picker */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Regulation / Jurisdiction</label>
                            <select
                                value={selectedRegulation}
                                onChange={e => setSelectedRegulation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {regulations.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} — {r.region}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">{regulation.note}</p>
                        </div>

                        {/* Violation type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Violation</label>
                            <select
                                value={selectedViolation}
                                onChange={e => setSelectedViolation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {violationTypes.map(v => (
                                    <option key={v.id} value={v.id}>{v.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Company size */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Size (Annual Revenue)</label>
                            <select
                                value={selectedSize}
                                onChange={e => setSelectedSize(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {companySizes.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                            {selectedSize === 'custom' && (
                                <div className="mt-2">
                                    <input
                                        type="number"
                                        placeholder="Enter annual revenue in EUR"
                                        value={customRevenue}
                                        onChange={e => setCustomRevenue(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* CCPA: affected users */}
                        {regulation.id === 'ccpa' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Affected Users</label>
                                <input
                                    type="number"
                                    value={affectedUsers}
                                    onChange={e => setAffectedUsers(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    min="1"
                                />
                                <p className="text-xs text-gray-400 mt-1">CCPA fines are calculated per affected consumer.</p>
                            </div>
                        )}

                        {/* Aggravating factors */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Aggravating Factors</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isIntentional}
                                        onChange={e => setIsIntentional(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Intentional or negligent violation
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isRepeat}
                                        onChange={e => setIsRepeat(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Repeat offender (previous violations)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Results ── */}
                    <div className="flex flex-col">
                        {/* Estimated fine */}
                        <div className="bg-gray-50 rounded-xl p-6 flex-1">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Estimated Fine Range</h3>

                            {/* Main figure */}
                            <div className="text-center mb-6">
                                <p className="text-4xl sm:text-5xl font-bold text-gray-900">
                                    {formatCurrency(result.midEstimate, result.symbol)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">Most likely estimate</p>
                            </div>

                            {/* Range bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Low</span>
                                    <span>Mid</span>
                                    <span>High</span>
                                </div>
                                <div className="h-3 rounded-full bg-gray-200 overflow-hidden flex">
                                    <div className="bg-green-400 h-full" style={{ width: '30%' }} />
                                    <div className="bg-yellow-400 h-full" style={{ width: '35%' }} />
                                    <div className="bg-red-400 h-full" style={{ width: '35%' }} />
                                </div>
                                <div className="flex justify-between text-xs font-medium text-gray-700 mt-1">
                                    <span>{formatCurrency(result.lowEstimate, result.symbol)}</span>
                                    <span>{formatCurrency(result.midEstimate, result.symbol)}</span>
                                    <span>{formatCurrency(result.highEstimate, result.symbol)}</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Max statutory penalty</span>
                                    <span className="font-medium">{formatCurrency(result.maxPotential, result.symbol)}</span>
                                </div>
                                {regulation.maxPctRevenue > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>{regulation.maxPctRevenue}% of revenue</span>
                                        <span className="font-medium">{formatCurrency(result.revenuePenalty, result.symbol)}</span>
                                    </div>
                                )}
                                {regulation.maxFixed > 0 && regulation.id !== 'ccpa' && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Fixed maximum</span>
                                        <span className="font-medium">{formatCurrency(result.fixedPenalty, result.symbol)}</span>
                                    </div>
                                )}
                                {regulation.id === 'ccpa' && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>{isIntentional ? '$7,988' : '$2,663'} × {parseInt(affectedUsers).toLocaleString()} users</span>
                                        <span className="font-medium">{formatCurrency(result.perViolationTotal, result.symbol)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700">
                                <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <strong>Disclaimer:</strong> This simulator provides rough estimates based on publicly available penalty frameworks. Actual fines depend on many DPA-specific factors including cooperation, remediation efforts, and precedent. This is not legal advice.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
