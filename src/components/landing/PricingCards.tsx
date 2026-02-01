'use client';

interface PricingCardsProps {
    onCheckout: (tier?: 'pro' | 'pro_plus') => void;
}

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

export function PricingCards({ onCheckout }: PricingCardsProps) {
    return (
        <section id="pricing" className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Simple pricing</h2>
            <p className="text-gray-600 text-center mb-12">Free to scan. Upgrade to unlock recommendations.</p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Tier */}
                <div className="p-8 bg-white rounded-lg border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
                    <p className="text-4xl font-bold text-gray-900 mb-6">€0</p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            10 scans/month
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            20 pages scanned
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            Full compliance audit
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            Privacy score
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            Issues detected
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                            Cookies & trackers list
                        </li>
                        <li className="flex items-center gap-2 text-gray-400">
                            <LockIcon className="w-5 h-5" />
                            How to fix? Upgrade to Pro
                        </li>
                    </ul>
                    <a href="/signup" className="block w-full py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition font-semibold text-center mt-auto">
                        Start Free Audit
                    </a>
                </div>

                {/* Pro Tier */}
                <div className="p-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-lg border border-blue-400 relative shadow-xl flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-blue-200 rounded-full text-sm font-medium text-blue-700 shadow-sm">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">Pro</h3>
                    <p className="text-4xl font-bold text-white mb-6">€19<span className="text-lg text-blue-100">/month</span></p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Everything in Free
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            <strong>50 scans</strong>/month
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            <strong>200 pages</strong> scanned
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            PDF compliance report
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Email alerts if score drops
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Monthly auto-scan
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            WordPress Plugin
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Security Headers Analysis
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Email Security
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-blue-200" />
                            Exposed Emails Detection
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Step-by-step fix recommendations</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Cookie Banner Widget</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Google Consent Mode v2</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Accessibility Audit (EAA 2025)</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Domain Security Monitor</strong>
                        </li>
                    </ul>
                    <button onClick={() => onCheckout()} className="block w-full py-3 bg-white text-blue-600 font-semibold rounded-md hover:bg-white transition text-center mt-auto">
                        Get Pro Now
                    </button>
                </div>

                {/* Pro+ Tier */}
                <div className="p-8 bg-gradient-to-b from-cyan-500 to-teal-600 rounded-lg border border-cyan-400 relative shadow-xl flex flex-col">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white border border-teal-200 rounded-full text-sm font-medium text-teal-700 shadow-sm">
                        Best Value
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">Pro+</h3>
                    <p className="text-4xl font-bold text-white mb-6">€29<span className="text-lg text-cyan-100">/month</span></p>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            Everything in Pro
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            <strong>200 scans</strong>/month
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            <strong>1,000 pages</strong> scanned
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            <strong>Weekly</strong> auto-scan
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <CheckIcon className="w-5 h-5 text-cyan-200" />
                            Compliance Drift Detection
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Data Breach Detection</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>AI Risk Predictor</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Vendor Risk Score</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Attack Surface Scanner</strong>
                        </li>
                        <li className="flex items-center gap-2 text-white">
                            <BoltIcon className="w-5 h-5 text-yellow-300" />
                            <strong>Accessibility Audit (EAA 2025)</strong>
                        </li>
                    </ul>
                    <button onClick={() => onCheckout('pro_plus')} className="block w-full py-3 bg-white text-teal-600 font-semibold rounded-md hover:bg-teal-50 transition text-center mt-auto">
                        Get Pro+ Now
                    </button>
                </div>
            </div>
        </section>
    );
}
