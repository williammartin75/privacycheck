import Link from 'next/link';

export const metadata = {
    title: 'Cookie Policy | PrivacyChecker',
    description: 'Cookie Policy for PrivacyChecker - Information about cookies and tracking technologies used on our website.',
    openGraph: {
        title: 'Cookie Policy | PrivacyChecker',
        description: 'Information about cookies and tracking technologies used on privacychecker.pro.',
        url: 'https://privacychecker.pro/legal/cookies',
    },
    alternates: {
        canonical: 'https://privacychecker.pro/legal/cookies',
    },
};

export default function CookiePolicyPage() {
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2025</p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
                        <p className="text-gray-600 mb-4">
                            Cookies are small text files stored on your device when you visit a website.
                            They help websites remember your preferences and improve your browsing experience.
                            PrivacyChecker uses minimal cookies to provide our service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cookies We Use</h2>

                        <div className="mb-6">
                            <h3 className="text-xl font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Strictly Necessary Cookies
                            </h3>
                            <p className="text-gray-600 mb-3">
                                These cookies are essential for the website to function. You cannot opt out of these.
                            </p>
                            <div className="bg-gray-100 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Cookie</th>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Purpose</th>
                                            <th className="text-left py-2 px-4 font-semibold text-gray-700">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600">
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 font-mono text-xs">sb-*-auth-token</td>
                                            <td className="py-2 px-4">Supabase authentication session</td>
                                            <td className="py-2 px-4">Session</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="py-2 px-4 font-mono text-xs">__stripe_mid</td>
                                            <td className="py-2 px-4">Stripe fraud prevention</td>
                                            <td className="py-2 px-4">1 year</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 px-4 font-mono text-xs">googtrans</td>
                                            <td className="py-2 px-4">Language preference</td>
                                            <td className="py-2 px-4">Session</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                Analytics Cookies (Privacy-Friendly)
                            </h3>
                            <p className="text-gray-600 mb-3">
                                We use Plausible Analytics, a privacy-first analytics tool that does NOT use cookies.
                                Plausible is GDPR compliant by design and does not track individuals.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm">
                                    <strong>No consent required:</strong> Plausible Analytics is cookieless and does not
                                    collect personal data. Data is aggregated and cannot identify individual users.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
                        <p className="text-gray-600 mb-4">
                            Our website may contain embedded content from third-party services. These services may set their own cookies:
                        </p>
                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Service</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Purpose</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Privacy Policy</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Stripe</td>
                                        <td className="py-2 px-4">Payment processing</td>
                                        <td className="py-2 px-4">
                                            <a href="https://stripe.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                                stripe.com/privacy
                                            </a>
                                        </td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Google Translate</td>
                                        <td className="py-2 px-4">Website translation</td>
                                        <td className="py-2 px-4">
                                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                                policies.google.com/privacy
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4">Supabase</td>
                                        <td className="py-2 px-4">Authentication</td>
                                        <td className="py-2 px-4">
                                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                                supabase.com/privacy
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
                        <p className="text-gray-600 mb-4">
                            You can control and delete cookies through your browser settings:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>
                                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                    Chrome
                                </a>
                            </li>
                            <li>
                                <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                    Firefox
                                </a>
                            </li>
                            <li>
                                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                    Safari
                                </a>
                            </li>
                            <li>
                                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                                    Microsoft Edge
                                </a>
                            </li>
                        </ul>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>Note:</strong> Blocking essential cookies may prevent you from logging in
                                or using certain features of our service.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Updates to This Policy</h2>
                        <p className="text-gray-600 mb-4">
                            We may update this Cookie Policy from time to time. Changes will be posted on this page
                            with an updated &quot;Last updated&quot; date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            If you have questions about our use of cookies, please contact us:
                        </p>
                        <p className="text-gray-900 font-medium">
                            <a href="mailto:privacy@privacychecker.pro" className="text-blue-600 hover:underline">
                                privacy@privacychecker.pro
                            </a>
                        </p>
                    </section>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                        <Link href="/legal/dpa" className="hover:text-gray-900">DPA</Link>
                        <Link href="/legal/cookies" className="hover:text-gray-900 font-medium text-gray-900">Cookies</Link>
                        <Link href="/legal" className="hover:text-gray-900">Legal Hub</Link>
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        © 2025 PrivacyChecker. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
