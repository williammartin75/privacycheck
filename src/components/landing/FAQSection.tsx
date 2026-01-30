'use client';

const faqData = [
    {
        question: "What does PrivacyChecker scan?",
        answer: "We analyze 25+ compliance criteria including: cookies & consent banners, privacy policy, legal mentions, DPO contact, data deletion options, secure forms, security headers (CSP, HSTS, X-Frame-Options), SSL/TLS, email security (SPF/DMARC). Plus advanced analysis: Dark Patterns Detection, Consent Behavior Analysis, Cookie Lifespan checks, Fingerprinting Detection, Third-party Vendor Risk (80+ trackers), Attack Surface Scanner, AI-powered Policy Analysis, and GDPR Fine Risk Estimation."
    },
    {
        question: "Is the audit really free?",
        answer: "Yes! Free users get 10 scans/month with the full compliance audit. You'll see your privacy score, all issues detected, cookie categories, and severity levels. Pro unlocks detailed fix recommendations, PDF reports, and monitoring features."
    },
    {
        question: "How long does a scan take?",
        answer: "Usually 30-60 seconds depending on your website size. Free scans cover 20 pages, Pro covers 200 pages, and Pro+ scans up to 1,000 pages for comprehensive site analysis."
    },
    {
        question: "What regulations do you check?",
        answer: "We check compliance against GDPR (Europe), CCPA/CPRA (California), LGPD (Brazil), POPIA (South Africa), PDPA (Singapore/Thailand), and 50+ other global privacy regulations. Your results show which laws apply based on your site's content and detected jurisdictions."
    },
    {
        question: "What's included in Pro and Pro+?",
        answer: "Pro (€19/mo): 50 scans, 200 pages, step-by-step fix recommendations, PDF reports, email alerts, monthly auto-scans, Cookie Banner Widget, WordPress Plugin, Google Consent Mode v2. Pro+ (€29/mo): 200 scans, 1,000 pages, weekly auto-scans, Data Breach Detection (HIBP), AI Risk Predictor (€ fine estimation), Vendor Risk Scores, Attack Surface Scanner, Compliance Drift Detection, and priority support."
    },
    {
        question: "What is the Cookie Banner Widget?",
        answer: "It's a fully customizable, GDPR-compliant cookie consent banner you can embed with one line of code. It handles consent for Analytics, Marketing, and Functional cookies, stores user preferences, and integrates with Google Consent Mode v2 to ensure your Google Analytics and Ads respect user choices automatically."
    },
    {
        question: "What is Compliance Drift Detection?",
        answer: "It monitors your site for changes that could affect compliance. When you run a new scan, we compare it to previous scans and alert you if your score drops, new trackers appear, or security headers change. Pro+ includes automatic weekly scans with email alerts."
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel at any time from your Dashboard or by emailing support@privacychecker.pro. Your access continues until the end of your billing period. No cancellation fees, no questions asked."
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
