import Link from 'next/link';

export const metadata = {
    title: 'Data Processing Agreement (DPA) | PrivacyChecker',
    description: 'Data Processing Agreement for PrivacyChecker - GDPR-compliant terms for processing personal data on behalf of our customers.',
};

export default function DPAPage() {
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <p className="text-blue-800 text-sm">
                        <strong>For Enterprise Customers:</strong> This standard DPA applies to all Pro and Pro+ subscriptions.
                        For custom enterprise agreements, contact <a href="mailto:enterprise@privacychecker.pro" className="underline">enterprise@privacychecker.pro</a>
                    </p>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Processing Agreement</h1>
                <p className="text-gray-500 mb-8">Effective Date: January 2025 | Version 1.0</p>

                <div className="prose prose-lg max-w-none">
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Definitions</h2>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>&quot;Controller&quot;</strong> means the Customer who determines the purposes and means of processing Personal Data.</li>
                            <li><strong>&quot;Processor&quot;</strong> means PrivacyChecker, which processes Personal Data on behalf of the Controller.</li>
                            <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable natural person.</li>
                            <li><strong>&quot;Processing&quot;</strong> means any operation performed on Personal Data.</li>
                            <li><strong>&quot;Sub-processor&quot;</strong> means any third party engaged by PrivacyChecker to Process Personal Data.</li>
                            <li><strong>&quot;Data Subject&quot;</strong> means the individual to whom Personal Data relates.</li>
                            <li><strong>&quot;GDPR&quot;</strong> means Regulation (EU) 2016/679 (General Data Protection Regulation).</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Scope and Purpose</h2>
                        <p className="text-gray-600 mb-4">
                            This Data Processing Agreement (&quot;DPA&quot;) governs the processing of Personal Data by PrivacyChecker
                            (&quot;Processor&quot;) on behalf of the Customer (&quot;Controller&quot;) in connection with the PrivacyChecker
                            compliance scanning and cookie consent services.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>Categories of Data Processed:</strong>
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Website URLs submitted for scanning</li>
                            <li>Compliance audit results and reports</li>
                            <li>Cookie consent records (if using our banner widget)</li>
                            <li>End-user IP addresses (anonymized after 30 days)</li>
                            <li>Browser/device information for consent records</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Controller Obligations</h2>
                        <p className="text-gray-600 mb-4">The Controller agrees to:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Ensure lawful basis for collecting Personal Data from Data Subjects</li>
                            <li>Provide transparent privacy notices to Data Subjects</li>
                            <li>Ensure data accuracy and relevance</li>
                            <li>Respond to Data Subject requests and inform Processor when assistance is needed</li>
                            <li>Notify Processor of any changes to data processing requirements</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Processor Obligations</h2>
                        <p className="text-gray-600 mb-4">PrivacyChecker, as Processor, shall:</p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Process Personal Data only on documented instructions from the Controller</li>
                            <li>Ensure that persons authorized to process Personal Data are bound by confidentiality</li>
                            <li>Implement appropriate technical and organizational security measures (see Section 6)</li>
                            <li>Assist the Controller in responding to Data Subject requests</li>
                            <li>Delete or return all Personal Data upon termination of services (within 30 days)</li>
                            <li>Make available all information necessary to demonstrate compliance</li>
                            <li>Notify the Controller without undue delay of any Personal Data Breach</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sub-processors</h2>
                        <p className="text-gray-600 mb-4">
                            The Controller authorizes the Processor to engage the following Sub-processors:
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="text-left py-2 font-semibold text-gray-700">Sub-processor</th>
                                        <th className="text-left py-2 font-semibold text-gray-700">Purpose</th>
                                        <th className="text-left py-2 font-semibold text-gray-700">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2">Supabase Inc.</td>
                                        <td className="py-2">Database & Authentication</td>
                                        <td className="py-2">EU (Frankfurt)</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2">Stripe Inc.</td>
                                        <td className="py-2">Payment Processing</td>
                                        <td className="py-2">EU/US (SCCs)</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="py-2">Vercel Inc.</td>
                                        <td className="py-2">Hosting & CDN</td>
                                        <td className="py-2">EU/US (SCCs)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2">Plausible Analytics</td>
                                        <td className="py-2">Privacy-friendly Analytics</td>
                                        <td className="py-2">EU</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-gray-600 mb-4">
                            The Processor will notify the Controller of any intended changes to Sub-processors,
                            giving the Controller a reasonable opportunity to object.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Security Measures</h2>
                        <p className="text-gray-600 mb-4">
                            PrivacyChecker implements the following technical and organizational measures:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">Technical Measures</h4>
                                <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
                                    <li>TLS 1.3 encryption in transit</li>
                                    <li>AES-256 encryption at rest</li>
                                    <li>Regular security audits</li>
                                    <li>Automated vulnerability scanning</li>
                                    <li>Multi-factor authentication</li>
                                    <li>Role-based access controls</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-800 mb-2">Organizational Measures</h4>
                                <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                                    <li>Staff confidentiality agreements</li>
                                    <li>Data protection training</li>
                                    <li>Incident response procedures</li>
                                    <li>Business continuity plans</li>
                                    <li>Vendor due diligence</li>
                                    <li>Regular policy reviews</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Subject Rights</h2>
                        <p className="text-gray-600 mb-4">
                            The Processor shall assist the Controller in fulfilling Data Subject requests including:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li><strong>Right of Access</strong> - Provide copies of Personal Data upon request</li>
                            <li><strong>Right to Rectification</strong> - Correct inaccurate Personal Data</li>
                            <li><strong>Right to Erasure</strong> - Delete Personal Data (&quot;Right to be Forgotten&quot;)</li>
                            <li><strong>Right to Portability</strong> - Export Personal Data in machine-readable format</li>
                            <li><strong>Right to Restriction</strong> - Limit processing in certain circumstances</li>
                            <li><strong>Right to Object</strong> - Object to processing based on legitimate interests</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            Response timeframe: Within 30 days of receiving a valid request.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Breach Notification</h2>
                        <p className="text-gray-600 mb-4">
                            In the event of a Personal Data Breach, the Processor shall:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Notify the Controller within <strong>24 hours</strong> of becoming aware of the breach</li>
                            <li>Provide details of the nature of the breach, categories of data affected, and approximate number of Data Subjects</li>
                            <li>Describe likely consequences and measures taken or proposed to address the breach</li>
                            <li>Cooperate with the Controller in notifying supervisory authorities and Data Subjects as required</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Transfers</h2>
                        <p className="text-gray-600 mb-4">
                            Where Personal Data is transferred outside the European Economic Area (EEA),
                            the Processor ensures appropriate safeguards are in place:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                            <li>Adequacy decisions for destination countries where applicable</li>
                            <li>Additional supplementary measures as required by EDPB guidance</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Duration and Termination</h2>
                        <p className="text-gray-600 mb-4">
                            This DPA is effective for the duration of the service agreement. Upon termination:
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                            <li>Personal Data will be deleted within <strong>30 days</strong></li>
                            <li>Upon request, data will be exported before deletion</li>
                            <li>Backup copies are purged within 90 days</li>
                            <li>A written confirmation of deletion will be provided upon request</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Liability</h2>
                        <p className="text-gray-600 mb-4">
                            Each party shall be liable for damages caused by processing that infringes the GDPR,
                            in accordance with Article 82 of the GDPR. The Processor&apos;s liability is limited to the
                            fees paid by the Controller in the 12 months preceding the claim.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
                        <p className="text-gray-600 mb-4">
                            This DPA shall be governed by and construed in accordance with the laws of France,
                            without regard to its conflict of law principles. Any disputes shall be submitted
                            to the exclusive jurisdiction of the courts of Paris, France.
                        </p>
                    </section>

                    <section className="mb-8 bg-gray-100 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 mb-2"><strong>Data Protection Officer:</strong></p>
                                <p className="text-gray-900">
                                    <a href="mailto:dpo@privacychecker.pro" className="text-blue-600 hover:underline">
                                        dpo@privacychecker.pro
                                    </a>
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-2"><strong>Enterprise Inquiries:</strong></p>
                                <p className="text-gray-900">
                                    <a href="mailto:enterprise@privacychecker.pro" className="text-blue-600 hover:underline">
                                        enterprise@privacychecker.pro
                                    </a>
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                            <strong>Acceptance:</strong> By subscribing to PrivacyChecker Pro or Pro+ plans,
                            you acknowledge that you have read, understood, and agree to be bound by this
                            Data Processing Agreement.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
                        <Link href="/legal/dpa" className="hover:text-gray-900 font-medium text-gray-900">DPA</Link>
                        <Link href="/" className="hover:text-gray-900">Back to Home</Link>
                    </div>
                    <p className="text-center text-gray-500 text-sm mt-4">
                        © 2025 PrivacyChecker. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
