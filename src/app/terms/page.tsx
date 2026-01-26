import Link from 'next/link';

export default function TermsPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2025</p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            By accessing and using PrivacyChecker (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                        <p className="text-gray-600 mb-4">
                            PrivacyChecker provides website compliance scanning services that analyze websites for privacy policy compliance, cookie usage, and GDPR/CCPA requirements. Our service includes:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Website privacy compliance audits</li>
                            <li>Cookie and tracker detection</li>
                            <li>Compliance score and recommendations</li>
                            <li>PDF compliance reports (Pro users)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                        <p className="text-gray-600 mb-4">
                            To access certain features, you must create an account. You are responsible for:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Payment</h2>
                        <p className="text-gray-600 mb-4">
                            Pro subscriptions are billed monthly at €19/month. By subscribing:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>You authorize us to charge your payment method on a recurring basis</li>
                            <li>You may cancel at any time; access continues until the end of the billing period</li>
                            <li>Refunds are provided at our discretion</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
                        <p className="text-gray-600 mb-4">You agree not to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Use the service for any unlawful purpose</li>
                            <li>Scan websites you do not own or have permission to scan</li>
                            <li>Attempt to overload or disrupt our infrastructure</li>
                            <li>Reverse engineer or copy our technology</li>
                            <li>Share your account with others</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disclaimer</h2>
                        <p className="text-gray-600 mb-4">
                            Our compliance reports are for informational purposes only and do not constitute legal advice. We are not liable for any actions taken based on our reports. For legal compliance questions, consult a qualified attorney.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-600 mb-4">
                            To the maximum extent permitted by law, PrivacyChecker shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
                        <p className="text-gray-600 mb-4">
                            For questions about these terms, contact us at:
                        </p>
                        <p className="text-gray-900 font-medium">
                            <a href="mailto:support@privacychecker.pro" className="text-blue-600 hover:underline">
                                support@privacychecker.pro
                            </a>
                        </p>
                    </section>
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
