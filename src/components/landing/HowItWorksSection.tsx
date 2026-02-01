'use client';

const steps = [
    {
        number: 1,
        title: "Paste your website",
        highlight: "We do the hard work for you",
        subtitle: "Our platform crawls up to 1,000 pages of your site and runs 25+ security checks.",
        items: [
            "Find all cookies and trackers on your site",
            "Check your consent banner works correctly",
            "Analyze 80+ third-party services for privacy risks",
            "Detect security vulnerabilities hackers target",
            "Verify WCAG 2.1 AA accessibility compliance (EAA 2025)",
            "Monitor domain expiry and typosquatting risks"
        ]
    },
    {
        number: 2,
        title: "Get your full report",
        highlight: "A complete risk assessment",
        subtitle: "We produce a detailed report showing every issue, ranked by urgency, with the actual risk to your business.",
        items: [
            "Privacy score from 0 to 100%",
            "Issues sorted by severity (critical → low)",
            "Which laws apply: GDPR, CCPA, and 50+ others",
            "Estimated fine if you don't fix it (Pro+)"
        ]
    },
    {
        number: 3,
        title: "Fix everything step-by-step",
        highlight: "Clear instructions, no tech jargon",
        subtitle: "We don't just find problems — we tell you exactly how to fix them in a simple way your team can follow.",
        items: [
            "Step-by-step guide for each issue",
            "PDF report to share with your team",
            "One-click cookie banner to install",
            "Alerts if your compliance changes later"
        ]
    }
];

const stats = [
    { number: "30+", label: "Privacy & accessibility checks" },
    { number: "80+", label: "Vendors analyzed" },
    { number: "50+", label: "Regulations covered" },
    { number: "60s", label: "Average scan time" }
];

export function HowItWorksSection() {
    return (
        <section className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
            <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                We scan your website, identify every privacy and security risk, and give you a clear report with step-by-step fixes — all in under 60 seconds.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {steps.map((step) => (
                    <div key={step.number} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-blue-600 mb-3">{step.number}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-lg font-medium text-blue-600 mb-2">{step.highlight}</p>
                        <p className="text-gray-500 text-sm mb-4">{step.subtitle}</p>
                        <ul className="text-gray-600 text-sm space-y-2">
                            {step.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}



