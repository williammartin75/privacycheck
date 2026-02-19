'use client';

import { useState, useMemo } from 'react';

/* ──────────────────────────────────────────────
   Regulation definitions for the simulator
   ────────────────────────────────────────────── */

interface RegulationDef {
    id: string;
    name: string;
    region: string;
    maxFixed: number;       // max fixed amount (in regulation currency, but normalised to EUR for display)
    maxPctRevenue: number;  // max % of global annual turnover
    lowerTierFixed: number; // lower-tier max (e.g. GDPR Art 83(4): €10M / 2%)
    lowerTierPct: number;
    currency: string;
    currencySymbol: string;
    per: string;
    note: string;
}

const regulations: RegulationDef[] = [
    { id: 'gdpr', name: 'GDPR (EU/EEA)', region: 'Europe', maxFixed: 20_000_000, maxPctRevenue: 4, lowerTierFixed: 10_000_000, lowerTierPct: 2, currency: 'EUR', currencySymbol: '€', per: 'whichever is higher', note: '€20M or 4% for serious violations (Art 83(5)). €10M or 2% for lesser violations (Art 83(4)).' },
    { id: 'uk-gdpr', name: 'UK GDPR', region: 'United Kingdom', maxFixed: 17_500_000, maxPctRevenue: 4, lowerTierFixed: 8_700_000, lowerTierPct: 2, currency: 'GBP', currencySymbol: '£', per: 'whichever is higher', note: '£17.5M or 4% for serious violations. £8.7M or 2% for lesser violations.' },
    { id: 'ccpa', name: 'CCPA / CPRA (California)', region: 'Americas', maxFixed: 7_988, maxPctRevenue: 0, lowerTierFixed: 2_663, lowerTierPct: 0, currency: 'USD', currencySymbol: '$', per: 'per violation', note: '$2,663 per unintentional, $7,988 per intentional violation or involving minors.' },
    { id: 'lgpd', name: 'LGPD (Brazil)', region: 'Americas', maxFixed: 9_000_000, maxPctRevenue: 2, lowerTierFixed: 9_000_000, lowerTierPct: 2, currency: 'BRL', currencySymbol: 'R$', per: 'per violation, capped at R$50M', note: '2% of revenue in Brazil, capped at R$50M (~€9M) per violation.' },
    { id: 'pipeda', name: 'PIPEDA (Canada)', region: 'Americas', maxFixed: 75_000, maxPctRevenue: 0, lowerTierFixed: 75_000, lowerTierPct: 0, currency: 'CAD', currencySymbol: 'C$', per: 'per violation', note: 'C$100K per violation. Proposed CPPA: C$25M or 5% of global revenue.' },
    { id: 'pdpa-sg', name: 'PDPA (Singapore)', region: 'Asia-Pacific', maxFixed: 740_000, maxPctRevenue: 10, lowerTierFixed: 740_000, lowerTierPct: 10, currency: 'SGD', currencySymbol: 'S$', per: 'whichever is higher', note: 'S$1M or 10% of annual turnover in Singapore (if turnover > S$10M).' },
    { id: 'pipa', name: 'PIPA (South Korea)', region: 'Asia-Pacific', maxFixed: 0, maxPctRevenue: 3, lowerTierFixed: 0, lowerTierPct: 3, currency: 'KRW', currencySymbol: '₩', per: 'of total sales', note: 'Up to 3% of total sales. Being increased to 10% for severe violations.' },
    { id: 'privacy-act-au', name: 'Privacy Act (Australia)', region: 'Asia-Pacific', maxFixed: 30_000_000, maxPctRevenue: 30, lowerTierFixed: 30_000_000, lowerTierPct: 30, currency: 'AUD', currencySymbol: 'A$', per: 'greatest of the three', note: 'A$50M, 3x benefit obtained, or 30% of adjusted turnover — whichever is greatest.' },
    { id: 'dpdp', name: 'DPDP Act (India)', region: 'Asia-Pacific', maxFixed: 28_000_000, maxPctRevenue: 0, lowerTierFixed: 5_600_000, lowerTierPct: 0, currency: 'INR', currencySymbol: '₹', per: 'per violation', note: '₹50 Crore to ₹250 Crore (~€28M) per violation. Enforcement starting 2027.' },
    { id: 'kvkk', name: 'KVKK (Turkey)', region: 'Middle East', maxFixed: 100_000, maxPctRevenue: 0, lowerTierFixed: 100_000, lowerTierPct: 0, currency: 'TRY', currencySymbol: '₺', per: 'per violation', note: 'Up to ₺1.9M (~€100K) per violation, updated annually.' },
];

/* ──────────────────────────────────────────────
   Violation types — expanded with tier info
   ────────────────────────────────────────────── */
interface ViolationType {
    id: string;
    label: string;
    category: string;
    severityMultiplier: number;
    isUpperTier: boolean; // true = Art 83(5) level, false = Art 83(4) level
    description: string;
}

const violationTypes: ViolationType[] = [
    // Upper tier (Art 83(5) / most serious)
    { id: 'insufficient-basis', label: 'Processing without lawful basis', category: 'Core Principles', severityMultiplier: 1.0, isUpperTier: true, description: 'Processing personal data without valid legal basis (GDPR Art 6). The most common and most heavily fined violation.' },
    { id: 'consent-invalid', label: 'Invalid or missing consent', category: 'Core Principles', severityMultiplier: 0.9, isUpperTier: true, description: 'Consent not freely given, specific, informed, or unambiguous. Includes pre-ticked boxes and bundled consent.' },
    { id: 'data-transfer', label: 'Unlawful international data transfers', category: 'Core Principles', severityMultiplier: 0.85, isUpperTier: true, description: 'Transferring data to third countries without adequate safeguards (SCCs, BCRs, adequacy decision).' },
    { id: 'data-subject-rights', label: 'Failure to respect data subject rights', category: 'Core Principles', severityMultiplier: 0.7, isUpperTier: true, description: 'Not honoring access, erasure, portability, or objection requests within deadlines.' },
    { id: 'children-data', label: 'Children\'s data processing violations', category: 'Core Principles', severityMultiplier: 0.95, isUpperTier: true, description: 'Processing children\'s data without parental consent or adequate age verification. Attracts highest scrutiny.' },
    { id: 'profiling-auto', label: 'Unlawful automated decision-making / profiling', category: 'Core Principles', severityMultiplier: 0.8, isUpperTier: true, description: 'Automated decisions with legal effects without proper safeguards or human review (Art 22).' },
    { id: 'special-category', label: 'Unlawful processing of sensitive / special data', category: 'Core Principles', severityMultiplier: 0.9, isUpperTier: true, description: 'Processing health, biometric, genetic, political, religious, or sexual orientation data without Art 9 exemption.' },
    { id: 'dpa-non-compliance', label: 'Non-compliance with DPA orders', category: 'Core Principles', severityMultiplier: 1.0, isUpperTier: true, description: 'Failure to comply with a supervisory authority\'s corrective measures or orders. Treated as maximum severity.' },

    // Lower tier (Art 83(4))
    { id: 'security-breach', label: 'Inadequate security measures / data breach', category: 'Technical & Organizational', severityMultiplier: 0.75, isUpperTier: false, description: 'Insufficient technical and organizational measures leading to unauthorized access, loss, or disclosure.' },
    { id: 'notification-failure', label: 'Breach notification failure (72h)', category: 'Technical & Organizational', severityMultiplier: 0.55, isUpperTier: false, description: 'Failing to notify the supervisory authority within 72 hours of becoming aware of a data breach.' },
    { id: 'cookie-consent', label: 'Cookie / tracking consent violations', category: 'Technical & Organizational', severityMultiplier: 0.45, isUpperTier: false, description: 'Setting non-essential cookies without prior consent, misleading cookie banners, or cookie walls.' },
    { id: 'transparency', label: 'Transparency / privacy notice failures', category: 'Technical & Organizational', severityMultiplier: 0.4, isUpperTier: false, description: 'Incomplete, inaccessible, or misleading privacy notices. Missing required Art 13/14 disclosures.' },
    { id: 'dpo-failure', label: 'DPO / record-keeping failures', category: 'Technical & Organizational', severityMultiplier: 0.25, isUpperTier: false, description: 'No DPO appointed when required, DPO not independent, or inadequate records of processing activities.' },
    { id: 'dpia-missing', label: 'Missing or inadequate DPIA', category: 'Technical & Organizational', severityMultiplier: 0.35, isUpperTier: false, description: 'Failing to conduct a Data Protection Impact Assessment for high-risk processing activities.' },
    { id: 'data-retention', label: 'Excessive data retention', category: 'Technical & Organizational', severityMultiplier: 0.5, isUpperTier: false, description: 'Keeping personal data longer than necessary without defined retention periods or deletion procedures.' },
    { id: 'employee-monitoring', label: 'Unlawful employee surveillance / monitoring', category: 'Technical & Organizational', severityMultiplier: 0.65, isUpperTier: false, description: 'Monitoring employees via CCTV, email, location, or screen capture without proper legal basis or notice.' },
    { id: 'marketing-spam', label: 'Direct marketing without consent (spam)', category: 'Technical & Organizational', severityMultiplier: 0.5, isUpperTier: false, description: 'Sending unsolicited marketing emails, SMS, or calls without opt-in consent or ignoring opt-outs.' },
    { id: 'data-minimization', label: 'Data minimization violations', category: 'Technical & Organizational', severityMultiplier: 0.4, isUpperTier: false, description: 'Collecting more personal data than necessary for the stated purpose. Violates the purpose limitation principle.' },
];

const companySizes = [
    { id: 'startup', label: 'Startup (< €1M revenue)', revenue: 500_000 },
    { id: 'sme-small', label: 'Small business (€1M – €10M)', revenue: 5_000_000 },
    { id: 'sme-medium', label: 'Mid-size company (€10M – €100M)', revenue: 50_000_000 },
    { id: 'large', label: 'Large enterprise (€100M – €1B)', revenue: 500_000_000 },
    { id: 'big-tech', label: 'Big tech / Fortune 500 (> €1B)', revenue: 5_000_000_000 },
    { id: 'mega', label: 'Mega-cap tech (> €10B)', revenue: 50_000_000_000 },
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
    const [didCooperate, setDidCooperate] = useState(true);
    const [durationMonths, setDurationMonths] = useState('6');
    const [dataSensitivity, setDataSensitivity] = useState('standard');

    const regulation = regulations.find(r => r.id === selectedRegulation)!;
    const violation = violationTypes.find(v => v.id === selectedViolation)!;
    const companySize = companySizes.find(c => c.id === selectedSize)!;

    const revenue = selectedSize === 'custom'
        ? parseFloat(customRevenue) || 0
        : companySize.revenue;

    // Group violation types by category for the select
    const violationCategories = violationTypes.reduce((acc, v) => {
        if (!acc[v.category]) acc[v.category] = [];
        acc[v.category].push(v);
        return acc;
    }, {} as Record<string, ViolationType[]>);

    const result = useMemo(() => {
        const reg = regulation;
        const viol = violation;

        // 1. Determine the penalty ceiling (upper or lower tier)
        let fixedCeiling: number;
        let pctCeiling: number;

        if (viol.isUpperTier) {
            fixedCeiling = reg.maxFixed;
            pctCeiling = reg.maxPctRevenue;
        } else {
            fixedCeiling = reg.lowerTierFixed;
            pctCeiling = reg.lowerTierPct;
        }

        // 2. For per-violation regulations like CCPA
        const numUsers = parseInt(affectedUsers) || 1;
        let perViolationTotal = 0;
        let revenuePenalty = (pctCeiling / 100) * revenue;
        let fixedPenalty = fixedCeiling;

        if (reg.id === 'ccpa') {
            const perViolation = isIntentional ? 7_988 : 2_663;
            perViolationTotal = perViolation * numUsers;
            fixedPenalty = perViolationTotal;
            revenuePenalty = 0;
        }

        // 3. Choose the higher amount (GDPR-style: max of fixed vs pct-of-revenue)
        let maxPotential = Math.max(fixedPenalty, revenuePenalty);

        // 4. Revenue-proportional dampening
        // Real DPAs scale fines to what a company can actually pay.
        // A €500K-revenue company will never get a €20M fine.
        // We use the revenue-based percentage as the realistic ceiling for small companies.
        let realisticCeiling = maxPotential;
        if (revenue > 0 && reg.id !== 'ccpa') {
            const revenueBasedMax = (pctCeiling / 100) * revenue;
            // If revenue-based max is much lower than fixed ceiling, use revenue-based
            // Apply a blend: use whichever is lower between fixed cap and revenue-proportional
            if (revenueBasedMax < fixedCeiling) {
                realisticCeiling = Math.max(revenueBasedMax, revenue * 0.02); // at least 2% of revenue
            }
        }

        // 5. Apply violation severity multiplier
        let estimatedFine = realisticCeiling * viol.severityMultiplier;

        // 6. Aggravating factors (additive multipliers, capped)
        let aggravatingMultiplier = 1.0;
        const factors: { label: string; effect: string }[] = [];

        if (isIntentional) {
            aggravatingMultiplier += 0.5;
            factors.push({ label: 'Intentional / negligent', effect: '+50%' });
        }
        if (isRepeat) {
            aggravatingMultiplier += 0.3;
            factors.push({ label: 'Repeat offender', effect: '+30%' });
        }
        if (!didCooperate) {
            aggravatingMultiplier += 0.2;
            factors.push({ label: 'No cooperation with DPA', effect: '+20%' });
        }

        // Duration: longer violations = higher penalty
        const months = parseInt(durationMonths) || 6;
        if (months > 24) {
            aggravatingMultiplier += 0.3;
            factors.push({ label: 'Duration > 24 months', effect: '+30%' });
        } else if (months > 12) {
            aggravatingMultiplier += 0.15;
            factors.push({ label: 'Duration > 12 months', effect: '+15%' });
        }

        // Data sensitivity
        if (dataSensitivity === 'sensitive') {
            aggravatingMultiplier += 0.25;
            factors.push({ label: 'Sensitive data involved', effect: '+25%' });
        } else if (dataSensitivity === 'children') {
            aggravatingMultiplier += 0.4;
            factors.push({ label: 'Children\'s data involved', effect: '+40%' });
        }

        // Mitigating: cooperation
        if (didCooperate) {
            aggravatingMultiplier -= 0.1;
            factors.push({ label: 'Cooperated with DPA', effect: '-10%' });
        }

        estimatedFine *= aggravatingMultiplier;

        // 7. Cap at maximum statutory potential
        estimatedFine = Math.min(estimatedFine, maxPotential);

        // 8. Calculate ranges (based on real DPA behavior)
        // Most real fines land between 5-30% of what the DPA *could* impose
        const lowEstimate = estimatedFine * 0.3;
        const midEstimate = estimatedFine * 0.6;
        const highEstimate = estimatedFine;

        // 8. Determine severity label
        let severityLabel = 'Low Risk';
        let severityColor = 'text-green-600';
        if (midEstimate > 10_000_000) { severityLabel = 'Critical'; severityColor = 'text-red-600'; }
        else if (midEstimate > 1_000_000) { severityLabel = 'High Risk'; severityColor = 'text-orange-600'; }
        else if (midEstimate > 100_000) { severityLabel = 'Moderate'; severityColor = 'text-yellow-600'; }

        return {
            maxPotential,
            lowEstimate,
            midEstimate,
            highEstimate,
            revenuePenalty,
            fixedPenalty,
            perViolationTotal,
            symbol: reg.currencySymbol,
            violationTier: viol.isUpperTier ? 'Upper tier (most severe)' : 'Lower tier',
            factors,
            severityLabel,
            severityColor,
            aggravatingMultiplier,
        };
    }, [regulation, violation, revenue, isIntentional, isRepeat, affectedUsers, didCooperate, durationMonths, dataSensitivity]);

    return (
        <section className="mb-16" id="simulator">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 text-white">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        GDPR Fine Simulator — Estimate Your Penalty Risk
                    </h2>
                    <p className="text-blue-100 text-sm mt-1 max-w-lg">
                        Estimate the potential fine your organization could face based on regulation, violation type, company size, and aggravating factors. Based on real DPA enforcement patterns.
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

                        {/* Violation type — grouped */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type of Violation</label>
                            <select
                                value={selectedViolation}
                                onChange={e => setSelectedViolation(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                {Object.entries(violationCategories).map(([category, violations]) => (
                                    <optgroup key={category} label={category}>
                                        {violations.map(v => (
                                            <option key={v.id} value={v.id}>{v.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">{violation.description}</p>
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

                        {/* Data sensitivity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Data Sensitivity</label>
                            <select
                                value={dataSensitivity}
                                onChange={e => setDataSensitivity(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="standard">Standard personal data (name, email, IP)</option>
                                <option value="sensitive">Sensitive data (health, biometric, financial)</option>
                                <option value="children">Children&apos;s data (under 16)</option>
                            </select>
                        </div>

                        {/* Violation duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Violation Duration (months)</label>
                            <input
                                type="number"
                                value={durationMonths}
                                onChange={e => setDurationMonths(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                min="1"
                                max="120"
                            />
                            <p className="text-xs text-gray-400 mt-1">Longer violations attract higher penalties.</p>
                        </div>

                        {/* Aggravating / mitigating factors */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Aggravating &amp; Mitigating Factors</label>
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
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={didCooperate}
                                        onChange={e => setDidCooperate(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Cooperated with supervisory authority
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Results ── */}
                    <div className="flex flex-col">
                        {/* Estimated fine */}
                        <div className="bg-gray-50 rounded-xl p-6 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Estimated Fine Range</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${result.severityColor} bg-opacity-10`} style={{ backgroundColor: result.severityColor === 'text-red-600' ? '#fef2f2' : result.severityColor === 'text-orange-600' ? '#fff7ed' : result.severityColor === 'text-yellow-600' ? '#fefce8' : '#f0fdf4' }}>
                                    {result.severityLabel}
                                </span>
                            </div>

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
                                    <div className="bg-green-400 h-full" style={{ width: '25%' }} />
                                    <div className="bg-yellow-400 h-full" style={{ width: '30%' }} />
                                    <div className="bg-orange-400 h-full" style={{ width: '20%' }} />
                                    <div className="bg-red-400 h-full" style={{ width: '25%' }} />
                                </div>
                                <div className="flex justify-between text-xs font-medium text-gray-700 mt-1">
                                    <span>{formatCurrency(result.lowEstimate, result.symbol)}</span>
                                    <span>{formatCurrency(result.midEstimate, result.symbol)}</span>
                                    <span>{formatCurrency(result.highEstimate, result.symbol)}</span>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Violation tier</span>
                                    <span className={`font-medium ${violation.isUpperTier ? 'text-red-600' : 'text-yellow-600'}`}>{result.violationTier}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Max statutory penalty</span>
                                    <span className="font-medium">{formatCurrency(result.maxPotential, result.symbol)}</span>
                                </div>
                                {regulation.maxPctRevenue > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>{violation.isUpperTier ? regulation.maxPctRevenue : regulation.lowerTierPct}% of revenue</span>
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

                            {/* Factors applied */}
                            {result.factors.length > 0 && (
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Factors Applied</p>
                                    <div className="space-y-1">
                                        {result.factors.map((f, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-600">{f.label}</span>
                                                <span className={`font-medium ${f.effect.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{f.effect}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-700">
                                <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <strong>Disclaimer:</strong> This simulator provides rough estimates based on publicly available penalty frameworks and real DPA enforcement patterns. Actual fines depend on many factors including DPA discretion, remediation efforts, company cooperation, and precedent. This is not legal advice. <a href="/blog/biggest-gdpr-fines-2025-2026" className="underline font-medium">See real fine examples →</a>
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <p className="text-sm text-blue-800 font-medium">Don&apos;t risk a fine — scan your website now</p>
                            <a href="/" className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                                Free Privacy Scan →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
