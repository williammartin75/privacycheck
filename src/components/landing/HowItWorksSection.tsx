'use client';

const steps = [
    {
        number: 1,
        title: "Enter your website URL",
        description: "We crawl up to 1,000 pages and run a comprehensive analysis.",
        sections: [
            {
                label: "Compliance checks",
                items: [
                    "Cookies, consent banner, privacy policy",
                    "HTTPS, DPO contact, data deletion",
                    "Legal mentions, opt-out mechanisms"
                ]
            },
            {
                label: "Security analysis",
                items: [
                    "Third-party vendor risk scoring",
                    "Exposed files detection (.git, .env)",
                    "DNS security (SPF, DKIM, DMARC)",
                    "Dark patterns & fingerprinting detection"
                ]
            }
        ]
    },
    {
        number: 2,
        title: "Get your compliance score",
        description: "We check 20+ compliance criteria and calculate your privacy score from 0 to 100%.",
        sections: [
            {
                label: "What you will see",
                items: [
                    "Applicable regulations (GDPR, CCPA, LGPD...)",
                    "Issues found with severity levels",
                    "Cookies and trackers detected"
                ]
            },
            {
                label: "Pro+ insights",
                items: [
                    "AI Risk Predictor with fine estimation",
                    "Vendor risk scores (80+ third-parties)",
                    "Attack surface vulnerabilities",
                    "Data Breach Check & EU Transfers Map"
                ]
            }
        ]
    },
    {
        number: 3,
        title: "Fix issues and stay compliant",
        description: "Pro users get everything to fix and maintain compliance over time.",
        sections: [
            {
                label: "Fix tools",
                items: [
                    "Step-by-step fix recommendations",
                    "PDF compliance report",
                    "Cookie Banner Widget with geo-targeting",
                    "WordPress Plugin"
                ]
            },
            {
                label: "Monitoring",
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
                    <div key={step.number} className="p-8 bg-white rounded-lg border border-gray-100">
                        <div className="text-4xl font-bold text-blue-600 mb-4">{step.number}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                        {step.sections.map((section, idx) => (
                            <div key={idx} className={idx > 0 ? "" : "mb-4"}>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{section.label}</p>
                                <ul className="text-gray-600 text-sm space-y-1">
                                    {section.items.map((item, itemIdx) => (
                                        <li key={itemIdx}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
