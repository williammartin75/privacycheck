'use client';

const faqData = [
    {
        question: "What does PrivacyChecker scan?",
        answer: "We check 14+ compliance criteria including HTTPS, cookie consent banner, privacy policy, legal mentions, DPO contact, data deletion options, secure forms, and security headers. Plus: third-party vendor risk scores (80+ trackers), exposed files (.git, .env, backups), DNS security (SPF/DMARC), and AI-powered GDPR fine estimation."
    },
    {
        question: "Is the audit really free?",
        answer: "Yes! The full audit is 100% free. You'll see your privacy score and all issues detected. Pro unlocks step-by-step recommendations on how to fix each issue, plus PDF reports and email alerts."
    },
    {
        question: "How long does a scan take?",
        answer: "Usually 30-60 seconds depending on your website size. We analyze your pages in real-time to give you accurate results."
    },
    {
        question: "What regulations do you check?",
        answer: "We check compliance against GDPR (Europe), CCPA (California), LGPD (Brazil), and 50+ other global privacy regulations. Your results show which laws apply to your site based on its content."
    },
    {
        question: "What's included in Pro and Pro+?",
        answer: "Pro (€19/mo) includes step-by-step fix recommendations, PDF reports, email alerts, monthly auto-scans, Security Headers Analysis, Email Security checks (SPF/DKIM/DMARC), Exposed Emails Detection, Cookie Banner Widget, WordPress Plugin, and Google Consent Mode v2. Pro+ (€29/mo) adds: 200 scans/month, 1,000 pages, weekly auto-scans, Data Breach Detection (HIBP), AI Risk Predictor (€ fine estimation), Vendor Risk Scores, Attack Surface Scanner, and Compliance Drift Detection."
    },
    {
        question: "What is the Cookie Banner Widget?",
        answer: "It's a customizable cookie consent banner you can embed on your site with one line of code. It handles consent for Analytics, Marketing, and Functional cookies, and integrates with Google Consent Mode v2 to ensure your Google Analytics and Ads respect user choices."
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel at any time from your Dashboard or by emailing support@privacychecker.pro. Your access continues until the end of your billing period. There are no cancellation fees."
    }
];

export function FAQSection() {
    return (
        <section id="faq" className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
                {faqData.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-md border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                        <p className="text-gray-600">{item.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
