import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | PrivacyChecker',
    description: 'Terms of Service for PrivacyChecker - subscription terms, acceptable use policy, and service level agreement.',
};

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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: January 2025 | Version 2.0</p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            By accessing and using PrivacyChecker (&quot;the Service&quot;), operated by PrivacyChecker SAS
                            (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                            If you are entering into these Terms on behalf of a company or other legal entity,
                            you represent that you have the authority to bind such entity to these Terms.
                        </p>
                        <p className="text-gray-600 mb-4">
                            If you do not agree to these Terms, you must not use our Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                        <p className="text-gray-600 mb-4">
                            PrivacyChecker provides website compliance scanning and cookie consent management services, including:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Website privacy compliance audits (GDPR, CCPA, ePrivacy)</li>
                            <li>Cookie and tracker detection and classification</li>
                            <li>Security header analysis and vulnerability assessment</li>
                            <li>Email security checks (SPF, DKIM, DMARC)</li>
                            <li>Data breach monitoring</li>
                            <li>Cookie consent banner widget (Pro plans)</li>
                            <li>Compliance score and actionable recommendations</li>
                            <li>PDF compliance reports and monitoring alerts</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Subscription Plans</h2>

                        <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Features</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-medium">Free</td>
                                        <td className="py-3 px-4">€0/month</td>
                                        <td className="py-3 px-4">5 scans/month, 20 pages/scan</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-3 px-4 font-medium">Pro</td>
                                        <td className="py-3 px-4">€19/month</td>
                                        <td className="py-3 px-4">50 scans/month, 200 pages/scan, PDF reports, Cookie Widget</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Pro+</td>
                                        <td className="py-3 px-4">€49/month</td>
                                        <td className="py-3 px-4">Unlimited scans, 1000 pages/scan, API access, Priority support</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Billing</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Subscriptions are billed monthly in advance</li>
                            <li>All prices are in Euros (€) and exclude applicable taxes</li>
                            <li>Payment is processed securely by Stripe</li>
                            <li>Failed payments may result in service suspension after 7 days</li>
                        </ul>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Cancellation & Refunds</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>You may cancel your subscription at any time from your dashboard</li>
                            <li>Cancellation takes effect at the end of the current billing period</li>
                            <li>No prorated refunds for partial months</li>
                            <li>14-day money-back guarantee for first-time Pro subscribers</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. User Accounts</h2>
                        <p className="text-gray-600 mb-4">You are responsible for:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Maintaining the confidentiality of your account credentials</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized access</li>
                            <li>Ensuring your contact information is accurate and up to date</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            We reserve the right to suspend or terminate accounts that violate these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use Policy</h2>
                        <p className="text-gray-600 mb-4">You agree NOT to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Scan websites you do not own or have explicit authorization to scan</li>
                            <li>Use the Service for any illegal purpose or to violate any laws</li>
                            <li>Attempt to overload, disrupt, or interfere with our infrastructure</li>
                            <li>Reverse engineer, decompile, or attempt to extract source code</li>
                            <li>Resell or redistribute the Service without written authorization</li>
                            <li>Share account credentials with unauthorized users</li>
                            <li>Use the Service to conduct security testing on third-party websites</li>
                            <li>Scrape, crawl, or harvest data beyond your permitted scan limits</li>
                        </ul>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">
                                <strong>Violation of this policy may result in immediate account termination
                                    without refund and potential legal action.</strong>
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Level Agreement (SLA)</h2>
                        <p className="text-gray-600 mb-4">
                            For Pro and Pro+ subscribers, we commit to the following service levels:
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <ul className="text-green-800 space-y-2 text-sm">
                                <li><strong>Uptime:</strong> 99.5% monthly availability (excluding scheduled maintenance)</li>
                                <li><strong>Scan Performance:</strong> Results within 60 seconds for up to 50 pages</li>
                                <li><strong>Support Response:</strong> Business hours response within 24 hours (Pro) / 4 hours (Pro+)</li>
                                <li><strong>Data Retention:</strong> Scan history retained for 12 months</li>
                            </ul>
                        </div>
                        <p className="text-gray-600 mb-4">
                            If we fail to meet these commitments, Pro+ subscribers may request a service credit
                            equal to 10% of their monthly fee for each 0.1% below the uptime target.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                        <p className="text-gray-600 mb-4">
                            <strong>Our IP:</strong> The Service, including all software, algorithms, designs, and documentation,
                            remains our exclusive property. You receive a limited, non-exclusive license to use the Service
                            during your subscription.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>Your Content:</strong> You retain ownership of your data and scan results.
                            You grant us a license to process this data solely to provide the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 text-sm">
                                <strong>IMPORTANT:</strong> Our compliance reports are for informational purposes only
                                and do not constitute legal advice. We are not responsible for regulatory decisions
                                made based on our reports.
                            </p>
                        </div>
                        <p className="text-gray-600 mb-4">
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>The Service will be uninterrupted or error-free</li>
                            <li>All compliance issues will be detected</li>
                            <li>Using our Service guarantees GDPR/CCPA compliance</li>
                            <li>The Service will meet all your specific requirements</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            For legal compliance questions, consult a qualified attorney or Data Protection Officer.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                        <p className="text-gray-600 mb-4">
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
                            <li>We are not liable for lost profits, data loss, or business interruption</li>
                            <li>Our total liability is limited to the fees paid by you in the 12 months preceding the claim</li>
                            <li>We are not liable for actions of third parties or force majeure events</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Indemnification</h2>
                        <p className="text-gray-600 mb-4">
                            You agree to indemnify and hold harmless PrivacyChecker and its employees from any claims,
                            damages, or expenses arising from:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Your use of the Service</li>
                            <li>Your violation of these Terms</li>
                            <li>Your violation of any third-party rights</li>
                            <li>Scanning websites without proper authorization</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            We may modify these Terms at any time. Changes will be posted with an updated version number
                            and &quot;Last updated&quot; date. Material changes will be notified via email 30 days in advance.
                            Continued use of the Service after changes constitutes acceptance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law & Disputes</h2>
                        <p className="text-gray-600 mb-4">
                            These Terms are governed by the laws of France, excluding conflict of law provisions.
                            Any disputes shall be resolved by the courts of Paris, France.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Before initiating legal proceedings, both parties agree to attempt resolution through
                            good-faith negotiation for a period of 30 days.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Miscellaneous</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions remain in effect</li>
                            <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and DPA, constitute the entire agreement</li>
                            <li><strong>No Waiver:</strong> Failure to enforce any provision does not waive our right to do so later</li>
                            <li><strong>Assignment:</strong> You may not assign these Terms without our written consent</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact</h2>
                        <p className="text-gray-600 mb-4">
                            For questions about these Terms, contact us at:
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4">
                            <p className="text-gray-900 font-medium mb-2">PrivacyChecker SAS</p>
                            <p className="text-gray-600 text-sm">
                                Email: <a href="mailto:legal@privacychecker.pro" className="text-blue-600 hover:underline">legal@privacychecker.pro</a><br />
                                Support: <a href="mailto:support@privacychecker.pro" className="text-blue-600 hover:underline">support@privacychecker.pro</a>
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-gray-900 font-medium text-gray-900">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
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
