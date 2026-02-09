'use client';

import { useState } from 'react';

// Billing period type
type BillingPeriod = 'monthly' | 'yearly';
type PurchaseMode = 'one_time' | 'subscription';

interface PricingCardsProps {
    onCheckout: (tier?: 'pro' | 'pro_plus', billingPeriod?: BillingPeriod, purchaseMode?: PurchaseMode) => void;
}

// Pricing configuration
const PRICING = {
    pro: { monthly: 19, yearly: 15, one_time: 49 },
    pro_plus: { monthly: 29, yearly: 23, one_time: 99 },
};

// Check icon component
const CheckIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

// Bolt icon for premium features
const BoltIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

// Lock icon for gated features
const LockIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

// Shared feature lists so one-time and subscription always match
const PRO_FEATURES = [
    { icon: 'check', text: 'Everything in Free' },
    { icon: 'check', text: '<strong>50 scans</strong>/month', oneTimeText: 'Full compliance audit' },
    { icon: 'check', text: '<strong>100 pages</strong> scanned' },
    { icon: 'check', text: 'PDF compliance report' },
    { icon: 'check', text: 'Monthly auto-scan', oneTimeText: '<strong>Step-by-step fix guides</strong>' },
    { icon: 'check', text: 'Email alerts if score drops', oneTimeText: '<strong>Detailed issue breakdown</strong>' },
    { icon: 'check', text: 'Cookies &amp; Trackers Analysis' },
    { icon: 'check', text: 'Security Headers Analysis' },
    { icon: 'check', text: 'Vendor Risk Assessment' },
    { icon: 'check', text: 'Technology Stack Detection' },
    { icon: 'check', text: 'WordPress Plugin' },
];

const PRO_PLUS_FEATURES = [
    { icon: 'check', text: 'Everything in Pro' },
    { icon: 'check', text: '<strong>200 scans</strong>/month', oneTimeText: 'Everything in Pro Report' },
    { icon: 'check', text: '<strong>200 pages</strong> scanned' },
    { icon: 'check', text: '<strong>Weekly</strong> auto-scan', oneTimeText: '<strong>Compliance certificate PDF</strong>' },
    { icon: 'bolt', text: '<strong>Domain Security Monitor</strong>' },
    { icon: 'bolt', text: '<strong>Supply Chain Security</strong>' },
    { icon: 'bolt', text: '<strong>Hidden Costs Audit (ROI)</strong>' },
    { icon: 'bolt', text: '<strong>Email Deliverability</strong>' },
    { icon: 'bolt', text: '<strong>AI Detection (EU AI Act)</strong>' },
    { icon: 'bolt', text: '<strong>Accessibility (EAA 2025)</strong>' },
    { icon: 'bolt', text: '<strong>Step-by-step fix guides</strong>' },
];

export function PricingCards({ onCheckout }: PricingCardsProps) {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
    const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>('subscription');

    const isYearly = billingPeriod === 'yearly';
    const isOneTime = purchaseMode === 'one_time';
    const proPrice = isYearly ? PRICING.pro.yearly : PRICING.pro.monthly;
    const proPlusPrice = isYearly ? PRICING.pro_plus.yearly : PRICING.pro_plus.monthly;

    return (
        <section id="pricing" className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
            <p className="text-gray-600 text-center mb-8">Free to scan. Upgrade to unlock recommendations.</p>

            {/* Purchase Mode Toggle (slider style, matching billing toggle) */}
            <div className="flex justify-center items-center gap-4 mb-6">
                <span className={`text-sm font-medium ${isOneTime ? 'text-gray-900' : 'text-gray-500'}`}>
                    One-time Report
                </span>
                <button
                    onClick={() => setPurchaseMode(isOneTime ? 'subscription' : 'one_time')}
                    className="relative w-14 h-7 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full p-1 transition-all duration-300"
                    aria-label={`Switch to ${isOneTime ? 'subscription' : 'one-time'} pricing`}
                >
                    <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${!isOneTime ? 'translate-x-7' : 'translate-x-0'
                            }`}
                    />
                </button>
                <span className={`text-sm font-medium ${!isOneTime ? 'text-gray-900' : 'text-gray-500'}`}>
                    Subscription
                </span>
            </div>

            {/* Billing Toggle (only for subscription mode) */}
            {!isOneTime && (
                <div className="flex justify-center items-center gap-4 mb-12">
                    <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setBillingPeriod(isYearly ? 'monthly' : 'yearly')}
                        className="relative w-14 h-7 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full p-1 transition-all duration-300"
                        aria-label={`Switch to ${isYearly ? 'monthly' : 'yearly'} billing`}
                    >
                        <div
                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                        Yearly
                    </span>
                    {isYearly && (
                        <span className="ml-2 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-full shadow-sm">
                            Save 20%
                        </span>
                    )}
                </div>
            )}

            {/* One-time subtitle */}
            {isOneTime && (
                <p className="text-center text-sm text-gray-500 mb-12">
                    Pay once, get your full compliance report instantly. No subscription required.
                </p>
            )}

            {/* ============ PRICING CARDS ============ */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Tier */}
                <div className="p-8 bg-white rounded-lg border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
                    <p className="text-4xl font-bold text-gray-900 mb-6">&euro;0</p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            {isOneTime ? '1 scan' : '10 scans/month'}
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            {isOneTime ? 'Privacy score' : '20 pages scanned'}
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            {isOneTime ? 'Issues detected (summary)' : 'Full compliance audit'}
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            {isOneTime ? 'Cookies & trackers count' : 'Privacy score'}
                        </li>
                        {!isOneTime && (
                            <>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <CheckIcon className="w-5 h-5 text-blue-600" />
                                    Issues detected
                                </li>
                                <li className="flex items-center gap-2 text-gray-700">
                                    <CheckIcon className="w-5 h-5 text-blue-600" />
                                    Cookies &amp; trackers count
                                </li>
                            </>
                        )}
                        <li className="flex items-center gap-2 text-gray-400">
                            <LockIcon className="w-5 h-5" />
                            {isOneTime ? 'How to fix? Get the report' : 'How to fix? Upgrade to Pro'}
                        </li>
                    </ul>
                    <a href="/signup" className="block w-full py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition font-semibold text-center mt-auto">
                        {isOneTime ? 'Start Free Scan' : 'Start Free Audit'}
                    </a>
                </div>

                {/* Pro / Pro Report */}
                <div className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-lg border border-blue-400 relative shadow-xl flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-blue-200 rounded-full text-sm font-medium text-blue-700 shadow-sm">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{isOneTime ? 'Pro Report' : 'Pro'}</h3>
                    <div className="mb-6">
                        {isOneTime ? (
                            <>
                                <p className="text-4xl font-bold text-white">
                                    &euro;{PRICING.pro.one_time}
                                    <span className="text-lg text-blue-200 ml-1">one-time</span>
                                </p>
                                <p className="text-sm text-blue-200 mt-1">
                                    vs &euro;{PRICING.pro.monthly}/mo subscription
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-4xl font-bold text-white">
                                    &euro;{proPrice}
                                    <span className="text-lg text-blue-100">/month</span>
                                </p>
                                {isYearly && (
                                    <p className="text-sm text-blue-200 mt-1">
                                        <span className="line-through">&euro;{PRICING.pro.monthly}/mo</span>
                                        <span className="ml-2">Billed &euro;{proPrice * 12}/year</span>
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Everything in Free
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            {isOneTime ? 'Full compliance audit' : <><strong>50 scans</strong>/month</>}
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            <strong>100 pages</strong> scanned
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            <strong>Detailed issue breakdown</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            <strong>Step-by-step fix guides</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            PDF compliance report
                        </li>
                        {!isOneTime && (
                            <li className="flex items-center gap-2 text-white">
                                <CheckIcon className="w-5 h-5 text-blue-200" />
                                Monthly auto-scan
                            </li>
                        )}
                        {!isOneTime && (
                            <li className="flex items-center gap-2 text-white">
                                <CheckIcon className="w-5 h-5 text-blue-200" />
                                Email alerts if score drops
                            </li>
                        )}
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Cookies &amp; Trackers Analysis
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Security Headers Analysis
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Vendor Risk Assessment
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Technology Stack Detection
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            WordPress Plugin
                        </li>
                    </ul>
                    <button onClick={() => onCheckout('pro', billingPeriod, isOneTime ? 'one_time' : undefined)} className="block w-full py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition text-center mt-auto">
                        {isOneTime ? `Get Pro Report \u2014 \u20AC${PRICING.pro.one_time}` : 'Get Pro Now'}
                    </button>
                </div>

                {/* Pro+ / Pro+ Report */}
                <div className="p-8 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-lg border border-cyan-400 relative shadow-xl flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-teal-200 rounded-full text-sm font-medium text-teal-700 shadow-sm">
                        Best Value
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{isOneTime ? 'Pro+ Report' : 'Pro+'}</h3>
                    <div className="mb-6">
                        {isOneTime ? (
                            <>
                                <p className="text-4xl font-bold text-white">
                                    &euro;{PRICING.pro_plus.one_time}
                                    <span className="text-lg text-cyan-200 ml-1">one-time</span>
                                </p>
                                <p className="text-sm text-cyan-200 mt-1">
                                    vs &euro;{PRICING.pro_plus.monthly}/mo subscription
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-4xl font-bold text-white">
                                    &euro;{proPlusPrice}
                                    <span className="text-lg text-cyan-100">/month</span>
                                </p>
                                {isYearly && (
                                    <p className="text-sm text-cyan-200 mt-1">
                                        <span className="line-through">&euro;{PRICING.pro_plus.monthly}/mo</span>
                                        <span className="ml-2">Billed &euro;{proPlusPrice * 12}/year</span>
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            {isOneTime ? 'Everything in Pro Report' : 'Everything in Pro'}
                        </li>
                        {!isOneTime && (
                            <li className="flex items-center gap-2 text-white">
                                <CheckIcon className="w-5 h-5 text-cyan-200" />
                                <strong>200 scans</strong>/month
                            </li>
                        )}
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            <strong>200 pages</strong> scanned
                        </li>
                        {!isOneTime && (
                            <li className="flex items-center gap-2 text-white">
                                <CheckIcon className="w-5 h-5 text-cyan-200" />
                                <strong>Weekly</strong> auto-scan
                            </li>
                        )}
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Domain Security Monitor</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Supply Chain Security</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Hidden Costs Audit (ROI)</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Email Deliverability</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>AI Detection (EU AI Act)</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Accessibility (EAA 2025)</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Step-by-step fix guides</strong>
                        </li>
                    </ul>
                    <button onClick={() => onCheckout('pro_plus', billingPeriod, isOneTime ? 'one_time' : undefined)} className="block w-full py-3 bg-white text-teal-600 font-semibold rounded-md hover:bg-teal-50 transition text-center mt-auto">
                        {isOneTime ? `Get Pro+ Report \u2014 \u20AC${PRICING.pro_plus.one_time}` : 'Get Pro+ Now'}
                    </button>
                </div>
            </div>
        </section>
    );
}
