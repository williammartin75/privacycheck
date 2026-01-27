import Link from 'next/link';

export default function ConsentModeDocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <Link href="/" className="text-blue-600 hover:underline text-sm">
                        ← Back to PrivacyChecker.pro
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Google Consent Mode v2 Integration
                </h1>
                <p className="text-lg text-gray-600 mb-12">
                    Our Cookie Banner Widget is fully compatible with Google Consent Mode v2.
                    Follow this guide to ensure compliance with Google&apos;s requirements.
                </p>

                {/* What is GCM v2 */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Google Consent Mode v2?</h2>
                    <p className="text-gray-700 mb-4">
                        Google Consent Mode v2 is a framework that adjusts how Google tags behave based on user consent.
                        Since <strong>March 2024</strong>, it&apos;s mandatory for websites using Google Ads or Analytics in the EU/EEA.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="font-semibold text-blue-900 mb-2">✅ Our widget handles:</h3>
                        <ul className="text-blue-800 space-y-2">
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">ad_storage</code> - Advertising cookies</li>
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">ad_user_data</code> - User data for ads</li>
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">ad_personalization</code> - Ad personalization</li>
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">analytics_storage</code> - Analytics cookies</li>
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">functionality_storage</code> - Functional cookies</li>
                            <li>• <code className="bg-blue-100 px-2 py-1 rounded">personalization_storage</code> - Personalization</li>
                        </ul>
                    </div>
                </section>

                {/* Integration Steps */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Integration Steps</h2>

                    <div className="space-y-8">
                        {/* Step 1 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                <h3 className="text-lg font-semibold text-gray-900">Add the Widget Script FIRST</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                The widget script must load <strong>before</strong> any Google tags. Add it in your <code>&lt;head&gt;</code>:
                            </p>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {`<!-- PrivacyChecker Cookie Banner - MUST be first -->
<script src="https://privacychecker.pro/widget.js" 
        data-widget-id="YOUR_WIDGET_ID"></script>

<!-- Then your Google Tag -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>`}
                            </pre>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                <h3 className="text-lg font-semibold text-gray-900">For Google Tag Manager</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                If using GTM, enable &quot;Consent Overview&quot; in your container settings:
                            </p>
                            <ol className="text-gray-700 space-y-2 list-decimal list-inside">
                                <li>Go to GTM → Admin → Container Settings</li>
                                <li>Enable &quot;Enable consent overview&quot;</li>
                                <li>For each tag, set the required consent types</li>
                            </ol>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                <h3 className="text-lg font-semibold text-gray-900">Verify Integration</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Check that consent mode is working:
                            </p>
                            <ol className="text-gray-700 space-y-2 list-decimal list-inside">
                                <li>Open Chrome DevTools → Console</li>
                                <li>Type <code className="bg-gray-100 px-2 py-1 rounded">dataLayer</code> and press Enter</li>
                                <li>Look for <code className="bg-gray-100 px-2 py-1 rounded">consent</code> entries with &quot;default&quot; and &quot;update&quot;</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Category Mapping */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Mapping</h2>
                    <p className="text-gray-600 mb-4">
                        Our widget categories map to Google consent types:
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full bg-white rounded-xl shadow-sm border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Widget Category</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Google Consent Types</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-6 py-4 text-gray-700">Necessary</td>
                                    <td className="px-6 py-4 text-gray-700"><code>security_storage</code> (always granted)</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-700">Analytics</td>
                                    <td className="px-6 py-4 text-gray-700"><code>analytics_storage</code></td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-700">Marketing</td>
                                    <td className="px-6 py-4 text-gray-700"><code>ad_storage</code>, <code>ad_user_data</code>, <code>ad_personalization</code></td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-700">Functional</td>
                                    <td className="px-6 py-4 text-gray-700"><code>functionality_storage</code>, <code>personalization_storage</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Ready to get compliant?</h2>
                    <p className="mb-6 opacity-90">
                        Configure your Cookie Banner Widget in your dashboard.
                    </p>
                    <Link
                        href="/dashboard/widget"
                        className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
                    >
                        Configure Widget →
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-20 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
                    © 2025 PrivacyChecker.pro - GDPR Compliance Made Simple
                </div>
            </footer>
        </div>
    );
}
