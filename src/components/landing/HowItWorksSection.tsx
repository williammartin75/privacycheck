'use client';

const steps = [
    {
        number: 1,
        title: "Enter your website URL",
        highlight: "20+ compliance & security checks",
        description: "We crawl up to 1,000 pages and run a comprehensive analysis.",
        sections: [
            {
                label: "Compliance",
                items: [
                    "Cookies, consent banner, privacy policy",
                    "HTTPS, DPO contact, data deletion",
                    "Legal mentions, opt-out mechanisms"
                ]
            },
            {
                label: "Security",
                items: [
                    "Third-party vendor risk scoring",
                    "Exposed files detection (.git, .env)",
                    "DNS security (SPF, DKIM, DMARC)"
                ]
            }
        ]
    },
    {
        number: 2,
        title: "Get your compliance score",
        highlight: "Privacy score from 0 to 100%",
        description: "We check 20+ compliance criteria and show you exactly what needs fixing.",
        sections: [
            {
                label: "Free",
                items: [
                    "Applicable regulations (GDPR, CCPA...)",
                    "Issues with severity levels",
                    "Cookies and trackers detected"
                ]
            },
            {
                label: "Pro+",
                items: [
                    "AI Risk Predictor (€ fine estimation)",
                    "Vendor risk scores (80+ trackers)",
                    "Attack surface vulnerabilities"
                ]
            }
        ]
    },
    {
        number: 3,
        title: "Fix issues and stay compliant",
        highlight: "Step-by-step fixes + monitoring",
        description: "Pro users get everything to fix and maintain compliance over time.",
        sections: [
            {
                label: "Fix",
                items: [
                    "Step-by-step recommendations",
                    "PDF compliance report",
                    "Cookie Banner Widget"
                ]
            },
            {
                label: "Monitor",
                items: [
                    "Weekly or monthly auto-rescans",
                    "Email alerts if score drops",
                    "Compliance drift detection"
                ]
            }
        ]
    }
];

export function HowItWorksSection() {
    return (
        <section className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">A complete privacy audit of your website in under 60 seconds</p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {steps.map((step) => (
                    <div key={step.number} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-blue-600 mb-3">{step.number}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-lg font-medium text-blue-600 mb-3">{step.highlight}</p>
                        <p className="text-gray-500 text-sm mb-4">{step.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {step.sections.map((section, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{section.label}</p>
                                    <ul className="text-gray-500 text-xs space-y-1">
                                        {section.items.map((item, itemIdx) => (
                                            <li key={itemIdx}>• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

