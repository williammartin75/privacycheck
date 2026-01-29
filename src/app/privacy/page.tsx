import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | PrivacyChecker',
    description: 'Privacy Policy for PrivacyChecker - How we collect, use, and protect your data. GDPR compliant.',
};

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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2025 | Version 2.0</p>

                {/* Quick Summary Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-blue-900 mb-3">🔒 Privacy at a Glance</h2>
                    <ul className="text-blue-800 text-sm space-y-2">
                        <li>✓ We collect minimal data necessary to provide our service</li>
                        <li>✓ We never sell your personal data to third parties</li>
                        <li>✓ Your data is stored securely in the EU (Frankfurt)</li>
                        <li>✓ You have full control: access, export, or delete your data anytime</li>
                        <li>✓ We use privacy-friendly analytics (Plausible - no cookies)</li>
                    </ul>
                </div>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data Controller</h2>
                        <p className="text-gray-600 mb-4">
                            PrivacyChecker SAS (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is the data controller for the personal
                            data collected through our website at www.privacychecker.pro and related services.
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <p className="text-gray-900 font-medium mb-2">Contact Information</p>
                            <p className="text-gray-600 text-sm">
                                Email: <a href="mailto:privacy@privacychecker.pro" className="text-blue-600 hover:underline">privacy@privacychecker.pro</a><br />
                                DPO: <a href="mailto:dpo@privacychecker.pro" className="text-blue-600 hover:underline">dpo@privacychecker.pro</a>
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>

                        <h3 className="text-lg font-medium text-gray-900 mb-3">2.1 Account Information</h3>
                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Data</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Purpose</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Legal Basis</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Email address</td>
                                        <td className="py-2 px-4">Account creation, login, notifications</td>
                                        <td className="py-2 px-4">Contract</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Password (hashed)</td>
                                        <td className="py-2 px-4">Authentication</td>
                                        <td className="py-2 px-4">Contract</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4">Company name (optional)</td>
                                        <td className="py-2 px-4">Report customization</td>
                                        <td className="py-2 px-4">Consent</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-3">2.2 Service Data</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Website URLs:</strong> URLs you submit for compliance scanning</li>
                            <li><strong>Scan Results:</strong> Compliance audit data, cookies detected, scores</li>
                            <li><strong>Widget Data:</strong> Consent records from your visitors (if using our widget)</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-900 mb-3">2.3 Technical Data</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>IP Address:</strong> Used for security and fraud prevention (anonymized after 30 days)</li>
                            <li><strong>Browser/Device Info:</strong> For compatibility and troubleshooting</li>
                            <li><strong>Usage Patterns:</strong> Aggregated analytics via Plausible (no personal tracking)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Data</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Service Delivery:</strong> To perform compliance scans and generate reports</li>
                            <li><strong>Account Management:</strong> To authenticate you and manage your subscription</li>
                            <li><strong>Billing:</strong> To process payments via Stripe (we never see full card numbers)</li>
                            <li><strong>Communication:</strong> To send scan results, alerts, and important service updates</li>
                            <li><strong>Improvement:</strong> To analyze aggregated usage and improve our service</li>
                            <li><strong>Legal Compliance:</strong> To comply with legal obligations and respond to lawful requests</li>
                        </ul>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 text-sm">
                                <strong>We do NOT:</strong> Sell your data, use it for advertising, share it with data brokers,
                                or profile you for purposes unrelated to our service.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
                        <p className="text-gray-600 mb-4">
                            We only share data with trusted service providers necessary to operate our service:
                        </p>
                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Provider</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Purpose</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Supabase</td>
                                        <td className="py-2 px-4">Database & Authentication</td>
                                        <td className="py-2 px-4">EU (Frankfurt)</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Stripe</td>
                                        <td className="py-2 px-4">Payment Processing</td>
                                        <td className="py-2 px-4">EU/US (SCCs)</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Render</td>
                                        <td className="py-2 px-4">Hosting & CDN</td>
                                        <td className="py-2 px-4">EU/US (SCCs)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4">Plausible</td>
                                        <td className="py-2 px-4">Privacy-friendly Analytics</td>
                                        <td className="py-2 px-4">EU</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-gray-600 mb-4">
                            We may also disclose data to law enforcement or regulatory authorities when legally required.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights (GDPR)</h2>
                        <p className="text-gray-600 mb-4">
                            Under the GDPR and other applicable laws, you have the following rights:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">🔍 Right of Access</h4>
                                <p className="text-gray-600 text-sm">Request a copy of all personal data we hold about you.</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">✏️ Right to Rectification</h4>
                                <p className="text-gray-600 text-sm">Request correction of inaccurate or incomplete data.</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">🗑️ Right to Erasure</h4>
                                <p className="text-gray-600 text-sm">Request deletion of your data (&quot;Right to be Forgotten&quot;).</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">📦 Right to Portability</h4>
                                <p className="text-gray-600 text-sm">Receive your data in a machine-readable format (JSON/CSV).</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">⏸️ Right to Restriction</h4>
                                <p className="text-gray-600 text-sm">Request limitation of processing in certain circumstances.</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">✋ Right to Object</h4>
                                <p className="text-gray-600 text-sm">Object to processing based on legitimate interests.</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            To exercise these rights, email <a href="mailto:privacy@privacychecker.pro" className="text-blue-600 hover:underline">privacy@privacychecker.pro</a>
                            or use the self-service options in your dashboard. We respond within 30 days.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
                        <p className="text-gray-600 mb-4">
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>TLS 1.3 encryption for all data in transit</li>
                            <li>AES-256 encryption for data at rest</li>
                            <li>Secure password hashing (bcrypt)</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Access controls and employee security training</li>
                            <li>Incident response procedures</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Data Type</th>
                                        <th className="text-left py-2 px-4 font-semibold text-gray-700">Retention Period</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Account data</td>
                                        <td className="py-2 px-4">Until account deletion + 30 days</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Scan history</td>
                                        <td className="py-2 px-4">12 months</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Billing records</td>
                                        <td className="py-2 px-4">7 years (legal requirement)</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2 px-4">Server logs</td>
                                        <td className="py-2 px-4">30 days</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4">Backup data</td>
                                        <td className="py-2 px-4">90 days after primary deletion</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Transfers</h2>
                        <p className="text-gray-600 mb-4">
                            Your data is primarily stored in the EU (Frankfurt, Germany). When data is transferred
                            outside the EEA, we ensure appropriate safeguards:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Standard Contractual Clauses (SCCs) approved by the EU Commission</li>
                            <li>Adequacy decisions where applicable</li>
                            <li>Supplementary measures per EDPB guidance</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
                        <p className="text-gray-600 mb-4">
                            Our service is not directed at individuals under 16 years of age.
                            We do not knowingly collect personal data from children. If you believe
                            we have collected data from a child, please contact us immediately.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Updates to This Policy</h2>
                        <p className="text-gray-600 mb-4">
                            We may update this Privacy Policy periodically. Material changes will be
                            communicated via email or prominent website notice at least 30 days before taking effect.
                            The &quot;Last updated&quot; date at the top reflects the most recent revision.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Complaints</h2>
                        <p className="text-gray-600 mb-4">
                            If you have concerns about our data practices, please contact us first at
                            <a href="mailto:privacy@privacychecker.pro" className="text-blue-600 hover:underline ml-1">privacy@privacychecker.pro</a>.
                        </p>
                        <p className="text-gray-600 mb-4">
                            You also have the right to lodge a complaint with your local supervisory authority.
                            In France, this is the CNIL (Commission Nationale de l&apos;Informatique et des Libertés).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                        <div className="bg-gray-100 rounded-lg p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-900 font-medium mb-1">Privacy Inquiries</p>
                                    <a href="mailto:privacy@privacychecker.pro" className="text-blue-600 hover:underline">
                                        privacy@privacychecker.pro
                                    </a>
                                </div>
                                <div>
                                    <p className="text-gray-900 font-medium mb-1">Data Protection Officer</p>
                                    <a href="mailto:dpo@privacychecker.pro" className="text-blue-600 hover:underline">
                                        dpo@privacychecker.pro
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-gray-900 font-medium text-gray-900">Privacy Policy</Link>
                        <Link href="/legal/dpa" className="hover:text-gray-900">DPA</Link>
                        <Link href="/legal/cookies" className="hover:text-gray-900">Cookies</Link>
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
