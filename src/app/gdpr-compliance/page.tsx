import { Metadata } from 'next';
import Link from 'next/link';
import { countries } from './data';

export const metadata: Metadata = {
    title: 'GDPR Compliance by Country — Data Protection Requirements Worldwide | PrivacyChecker',
    description: 'Explore GDPR and data protection requirements across 23 countries. Find your country\'s Data Protection Authority, local privacy laws, key requirements, and check your website\'s compliance for free.',
    alternates: {
        canonical: 'https://privacychecker.pro/gdpr-compliance',
    },
    openGraph: {
        title: 'GDPR Compliance by Country — Data Protection Requirements Worldwide',
        description: 'Explore GDPR and data protection requirements across 23 countries. Find your country\'s DPA, local laws, and scan your website for free.',
        url: 'https://privacychecker.pro/gdpr-compliance',
        siteName: 'PrivacyChecker',
        type: 'website',
    },
};

export default function GDPRCompliancePage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'GDPR Compliance by Country',
        description: 'Data protection requirements and local privacy laws across 23 European and international markets.',
        url: 'https://privacychecker.pro/gdpr-compliance',
        publisher: { '@type': 'Organization', name: 'PrivacyChecker' },
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
                {/* Header */}
                <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>PrivacyChecker</span>
                        </Link>
                        <nav style={{ display: 'flex', gap: 24 }}>
                            <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
                            <Link href="/fines" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Fines</Link>
                            <Link href="/glossary" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Glossary</Link>
                        </nav>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
                    <nav style={{ fontSize: 13, color: '#64748b' }}>
                        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                        {' '}<span style={{ margin: '0 6px' }}>›</span>{' '}
                        <span style={{ color: '#94a3b8' }}>GDPR by Country</span>
                    </nav>
                </div>

                {/* Hero */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
                    <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 12px', textAlign: 'center' }}>
                        GDPR Compliance by Country
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 17, textAlign: 'center', maxWidth: 700, margin: '0 auto 40px', lineHeight: 1.7 }}>
                        Each EU/EEA country implements GDPR through local legislation with specific requirements.
                        Select your target market to understand the exact rules and audit your website for compliance.
                    </p>

                    {/* CTA */}
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-block',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                color: 'white',
                                fontWeight: 700,
                                padding: '14px 32px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                fontSize: 15,
                            }}
                        >
                            Scan My Website Free →
                        </Link>
                    </div>

                    {/* Country Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {countries.map(country => (
                            <Link
                                key={country.slug}
                                href={`/gdpr-compliance/${country.slug}`}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12,
                                    padding: 20,
                                    textDecoration: 'none',
                                    transition: 'border-color 0.2s, transform 0.2s',
                                    display: 'block',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                    <span style={{ fontSize: 28 }}>{country.flag}</span>
                                    <div>
                                        <h2 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: 0 }}>{country.name}</h2>
                                        {country.localName !== country.name && (
                                            <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{country.localName}</p>
                                        )}
                                    </div>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>
                                    {country.localLaw}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#64748b', fontSize: 12 }}>{country.dpa.split('(')[0].trim().substring(0, 30)}...</span>
                                    {country.fineAmount && (
                                        <span style={{ color: '#f87171', fontSize: 12, fontWeight: 600 }}>Max: {country.fineAmount}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center', marginTop: 40 }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>
                        © 2026 PrivacyChecker. Free GDPR compliance scanner for websites.
                    </p>
                </footer>
            </div>
        </>
    );
}
