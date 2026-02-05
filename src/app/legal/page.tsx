import Link from 'next/link';

export const metadata = {
    title: 'Legal | PrivacyChecker',
    description: 'Legal documents for PrivacyChecker - Terms of Service, Privacy Policy, Data Processing Agreement, and more.',
};

export default function LegalHubPage() {
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

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Legal Center</h1>
                <p className="text-gray-600 mb-12">
                    All legal documents governing the use of PrivacyChecker services.
                    We are committed to transparency and GDPR compliance.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Terms of Service */}
                    <Link href="/terms" className="block">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h2>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Terms governing the use of PrivacyChecker, including subscription plans, acceptable use, and liability.
                                    </p>
                                    <span className="text-blue-600 text-sm font-medium">Read Terms →</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Privacy Policy */}
                    <Link href="/privacy" className="block">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h2>
                                    <p className="text-gray-600 text-sm mb-3">
                                        How we collect, use, and protect your personal information. Your privacy rights under GDPR.
                                    </p>
                                    <span className="text-blue-600 text-sm font-medium">Read Policy →</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* DPA */}
                    <Link href="/legal/dpa" className="block">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-xl font-semibold text-gray-900">Data Processing Agreement</h2>
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">B2B</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">
                                        GDPR Article 28 compliant DPA for business customers. Sub-processors, security measures, and data handling.
                                    </p>
                                    <span className="text-blue-600 text-sm font-medium">Read DPA →</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Cookie Policy */}
                    <Link href="/legal/cookies" className="block">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Cookie Policy</h2>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Information about cookies and tracking technologies used on our website.
                                    </p>
                                    <span className="text-blue-600 text-sm font-medium">Read Policy →</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Compliance Commitment</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">GDPR Compliant</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">SSL Encrypted</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Data in EU</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">SOC 2 Type II*</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">*Via our infrastructure partners (Supabase, Render)</p>
                </div>

                {/* Legal Information / Mentions Légales */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentions Légales</h2>
                    <ul className="text-gray-600 space-y-2">
                        <li><strong>Raison sociale:</strong> PrivacyChecker</li>
                        <li><strong>Siège social:</strong> 63 Boulevard Saint-Marcel, 75013 Paris, France</li>
                        <li><strong>SIRET:</strong> 81259957900024</li>
                        <li><strong>Contact:</strong> legal@privacychecker.pro</li>
                        <li><strong>Hébergeur:</strong> Render Services, Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94107, USA - <a href="https://render.com" className="text-blue-600 hover:underline">render.com</a></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="mt-12 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions?</h2>
                    <p className="text-gray-600 mb-4">
                        For legal inquiries or custom enterprise agreements, contact our team.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:legal@privacychecker.pro"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            legal@privacychecker.pro
                        </a>
                        <a
                            href="mailto:dpo@privacychecker.pro"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Data Protection Officer
                        </a>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    © 2025 PrivacyChecker. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
