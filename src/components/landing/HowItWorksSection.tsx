'use client';

const steps = [
    {
        number: 1,
        title: "Paste your website",
        highlight: "We scan everything automatically",
        items: [
            "Find cookies that track your visitors",
            "Check if you ask permission properly",
            "Spot hidden trackers from Facebook, Google...",
            "Detect security issues hackers could exploit"
        ]
    },
    {
        number: 2,
        title: "See what's wrong",
        highlight: "Get a clear score from 0 to 100%",
        items: [
            "See exactly which laws apply to you",
            "Know which problems are most urgent",
            "Understand what each issue means",
            "Learn how much a fine could cost you"
        ]
    },
    {
        number: 3,
        title: "Fix it easily",
        highlight: "Step-by-step instructions included",
        items: [
            "Simple guide to fix each problem",
            "Get a PDF report for your team",
            "Add our cookie banner in one click",
            "Get alerts if something breaks later"
        ]
    }
];

export function HowItWorksSection() {
    return (
        <section className="py-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How it works</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">A complete privacy audit in under 60 seconds</p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {steps.map((step) => (
                    <div key={step.number} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-blue-600 mb-3">{step.number}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-lg font-medium text-blue-600 mb-4">{step.highlight}</p>
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


