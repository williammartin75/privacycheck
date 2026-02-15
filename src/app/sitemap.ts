import { MetadataRoute } from 'next'

const blogSlugs = [
    'gdpr-compliance-checklist-2026',
    'ccpa-vs-gdpr-differences',
    'eaa-2025-accessibility-requirements',
    'eu-ai-act-website-compliance',
    'cookie-consent-banner-guide',
    'dark-patterns-detection',
    'spf-dkim-dmarc-email-deliverability',
    'website-security-headers-guide',
    'third-party-scripts-supply-chain-security',
    'domain-security-typosquatting-protection',
    'how-to-audit-website-privacy',
    'website-privacy-score-meaning',
    'reduce-saas-costs-hidden-tools',
    'vendor-risk-assessment-gdpr',
    'compliance-monitoring-drift-detection',
    'google-consent-mode-v2-setup',
    'privacy-policy-generator-vs-custom',
    'wordpress-gdpr-compliance-guide',
    'shopify-privacy-compliance',
    'data-protection-impact-assessment-guide',
    'data-breach-response-plan',
    'cookie-free-analytics-alternatives',
    'pecr-eprivacy-cookie-rules',
    'coppa-children-privacy-website',
    'cross-border-data-transfers-schrems',
    'privacy-by-design-implementation',
    'consent-management-platform-comparison',
    'website-trust-signals-conversion',
    'core-web-vitals-privacy-impact',
    'ecommerce-checkout-privacy-compliance',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://privacychecker.pro'

    const blogEntries: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...blogSlugs.map(slug => ({
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })),
    ]

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...blogEntries,
        {
            url: `${baseUrl}/docs/consent-mode`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/legal`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]
}
