'use client';

const faqData = [
    {
        question: "What does PrivacyChecker scan?",
        answer: "We run 25+ security and privacy checks on your website: cookies, consent banners, privacy policy, security settings, and hidden trackers. For Pro+ users, we also estimate potential fines, detect data breaches, and analyze third-party risks from 80+ services like Google, Facebook, and others."
    },
    {
        question: "Is the audit really free?",
        answer: "Yes! Free users get 10 scans per month with the full audit. You'll see your privacy score, all issues found, and how serious each one is. Pro unlocks step-by-step fix guides, PDF reports, and automatic monitoring."
    },
    {
        question: "How long does a scan take?",
        answer: "Usually under 60 seconds. Free scans cover 20 pages, Pro covers 200 pages, and Pro+ scans up to 1,000 pages for a complete site analysis."
    },
    {
        question: "What regulations do you check?",
        answer: "We check compliance with GDPR (Europe), CCPA (California), and 50+ other privacy laws worldwide. Your results show which laws apply to your site based on where your visitors come from."
    },
    {
        question: "What's included in Pro and Pro+?",
        answer: "Pro (€19/mo): 50 scans, step-by-step fix guides, PDF reports, email alerts, auto-scans, and a Cookie Banner Widget. Pro+ (€29/mo): everything in Pro plus data breach detection, AI-powered fine estimation, vendor risk scores, and weekly monitoring."
    },
    {
        question: "What is the Cookie Banner Widget?",
        answer: "It's a ready-to-use cookie consent popup you can add to your site with one line of code. It asks visitors for permission before tracking them, and works automatically with Google Analytics and Ads."
    },
    {
        question: "What is Compliance Drift Detection?",
        answer: "It watches your site for changes that could cause privacy problems. If your score drops or new trackers appear, we send you an email alert so you can fix it quickly."
    },
    {
        question: "What is the European Accessibility Act (EAA 2025)?",
        answer: "The EAA is a new EU law that came into effect on June 28, 2025. It requires websites selling products or services in the EU to meet WCAG 2.1 AA accessibility standards. Non-compliance can result in fines up to €30,000. Our accessibility audit checks your site against 15+ WCAG criteria including images, forms, headings, links, color contrast, and ARIA attributes."
    },
    {
        question: "What is Domain Security Monitor?",
        answer: "We scan your domain for security risks including WHOIS expiration alerts (prevent domain loss), DNS security (SPF, DKIM, DMARC configuration), and typosquatting detection (similar domains that could be used for phishing). Domain expiration can cause complete business loss overnight, and typosquatting domains are often used to steal your customers."
    },
    {
        question: "What is Supply Chain Security?",
        answer: "We analyze all external scripts and third-party dependencies on your website. This includes identifying unknown origins, flagging compromised libraries (like the Polyfill.io attack), categorizing dependencies (analytics, payment, advertising), and alerting when critical scripts change. Supply chain attacks can inject malware or steal customer data."
    },
    {
        question: "What is the Hidden Costs Audit?",
        answer: "We analyze your external SaaS tools (analytics, chat, monitoring, etc.) to estimate your monthly costs and identify redundancies. Many businesses pay for multiple similar tools without realizing it. We detect duplicates, suggest consolidations, and show potential monthly savings."
    },
    {
        question: "What is the Email Deliverability Audit?",
        answer: "We analyze your SPF, DKIM, and DMARC records to determine if your emails will reach inboxes or get marked as spam. Gmail, Outlook, and Yahoo now require proper email authentication. Our audit grades your configuration (A-F) and provides specific recommendations to improve delivery rates."
    },
    {
        question: "What is the AI Compliance Audit?",
        answer: "We detect AI systems on your website (chatbots, analytics, personalization, etc.) and assess EU AI Act compliance. The 2024 regulation requires transparency for AI chatbots, conformity assessments for high-risk systems, and prohibits manipulative AI. We identify your AI inventory, risk levels, and provide specific compliance recommendations."
    },
    {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, cancel anytime from your Dashboard. Your access continues until the end of your billing period. No fees, no questions asked."
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
