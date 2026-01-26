import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2025</p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="text-gray-600 mb-4">
                            PrivacyChecker (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website compliance scanning service at www.privacychecker.pro.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                        <p className="text-gray-600 mb-4">We collect the following types of information:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Account Information:</strong> Email address and password when you create an account</li>
                            <li><strong>Website URLs:</strong> The URLs you submit for compliance scanning</li>
                            <li><strong>Scan Results:</strong> The compliance audit results for your scanned websites</li>
                            <li><strong>Payment Information:</strong> Processed securely by Stripe; we do not store credit card details</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our service</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                        <p className="text-gray-600 mb-4">We use your information to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Provide and maintain our compliance scanning service</li>
                            <li>Process your subscription payments</li>
                            <li>Send you scan results and alerts</li>
                            <li>Improve our service and develop new features</li>
                            <li>Respond to your support requests</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                        <p className="text-gray-600 mb-4">
                            We do not sell your personal data. We may share data with:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Stripe:</strong> For payment processing</li>
                            <li><strong>Supabase:</strong> For data storage and authentication</li>
                            <li><strong>Law enforcement:</strong> When required by law</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                        <p className="text-gray-600 mb-4">Under GDPR and other privacy laws, you have the right to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Export your data (data portability)</li>
                            <li>Withdraw consent at any time</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                        <p className="text-gray-600 mb-4">
                            We retain your data for as long as your account is active. You can request deletion of your account and all associated data at any time by contacting us.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            For any privacy-related questions or requests, contact us at:
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
