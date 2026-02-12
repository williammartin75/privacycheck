import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About PrivacyChecker | Privacy Compliance Platform — GDPR & CCPA',
    description: 'PrivacyChecker is an independent privacy compliance platform. 50+ automated checks for GDPR, CCPA, EAA 2025, and EU AI Act. Founded in Paris, data stored in the EU.',
    keywords: ['about PrivacyChecker', 'privacy compliance platform', 'GDPR scanner', 'CCPA compliance tool', 'website privacy audit'],
    openGraph: {
        title: 'About PrivacyChecker — Privacy Compliance Platform',
        description: 'Independent privacy compliance platform with 50+ automated checks. Founded in Paris, EU-hosted data.',
        url: 'https://privacychecker.pro/about',
        siteName: 'PrivacyChecker',
        type: 'website',
    },
    alternates: {
        canonical: 'https://privacychecker.pro/about',
    },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/" className="flex items-center gap-1">
                        <img src="/logo.png" alt="PrivacyChecker" className="w-12 h-12 scale-150" />
                        <span className="text-xl font-bold text-gray-900">PrivacyChecker</span>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">About PrivacyChecker</h1>

                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                    <p className="text-gray-600 mb-6">
                        PrivacyChecker is an independent privacy compliance platform designed to help businesses
                        of all sizes achieve and maintain compliance with global privacy regulations including
                        GDPR, CCPA, and the European Accessibility Act (EAA 2025).
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 mb-4">What We Do</h2>
                    <p className="text-gray-600 mb-6">
                        We provide automated privacy audits that scan websites for compliance issues across
                        50+ checkpoints, covering cookies, trackers, consent mechanisms, security headers,
                        accessibility, and more. Our platform delivers actionable reports with step-by-step
                        remediation guidance.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Company</h2>
                    <ul className="text-gray-600 space-y-2">
                        <li><strong>Founded:</strong> 2025</li>
                        <li><strong>Headquarters:</strong> 63 Boulevard Saint-Marcel, 75013 Paris, France</li>
                        <li><strong>Focus:</strong> Privacy Compliance & Website Security</li>
                    </ul>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
                    <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>50+ automated privacy and security checks</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>GDPR, CCPA, EAA 2025, and EU AI Act coverage</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Step-by-step remediation guidance</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Cookie consent banner widget</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Continuous compliance monitoring</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Start Free Audit
                    </Link>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    © 2026 PrivacyChecker. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
