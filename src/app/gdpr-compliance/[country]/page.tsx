import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { countries, getCountryBySlug } from '../data';

export function generateStaticParams() {
    return countries.map((country) => ({
        country: country.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country: slug } = await params;
    const country = getCountryBySlug(slug);
    if (!country) return {};

    return {
        title: country.metaTitle,
        description: country.metaDescription,
        alternates: {
            canonical: `https://privacychecker.pro/gdpr-compliance/${country.slug}`,
        },
        openGraph: {
            title: country.metaTitle,
            description: country.metaDescription,
            url: `https://privacychecker.pro/gdpr-compliance/${country.slug}`,
            siteName: 'PrivacyChecker',
            type: 'article',
        },
    };
}

export default async function CountryPage({ params }: { params: Promise<{ country: string }> }) {
    const { country: slug } = await params;
    const country = getCountryBySlug(slug);
    if (!country) notFound();

    const otherCountries = countries.filter(c => c.slug !== country.slug).slice(0, 8);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: country.metaTitle,
        description: country.metaDescription,
        author: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        publisher: { '@type': 'Organization', name: 'PrivacyChecker', url: 'https://privacychecker.pro' },
        datePublished: '2026-02-20',
        dateModified: new Date().toISOString().split('T')[0],
        mainEntityOfPage: `https://privacychecker.pro/gdpr-compliance/${country.slug}`,
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What are the GDPR requirements for websites in ${country.name}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `In ${country.name}, websites must comply with GDPR as implemented by the ${country.localLaw}. Key requirements include: ${country.keyRequirements.slice(0, 3).join('. ')}. The supervisory authority is the ${country.dpa}.`,
                },
            },
            {
                '@type': 'Question',
                name: `Who is the Data Protection Authority in ${country.name}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `The Data Protection Authority in ${country.name} is the ${country.dpa}. You can reach them at ${country.dpaUrl}`,
                },
            },
            {
                '@type': 'Question',
                name: `How can I check if my ${country.name} website is GDPR compliant?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `You can use PrivacyChecker's free GDPR scanner to instantly audit your website. It checks cookie consent, privacy policy, security headers, and 25+ compliance points relevant to ${country.name}'s data protection requirements.`,
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
                    <nav style={{ fontSize: 13, color: '#64748b' }}>
                        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                        {' '}<span style={{ margin: '0 6px' }}>›</span>{' '}
                        <Link href="/gdpr-compliance" style={{ color: '#3b82f6', textDecoration: 'none' }}>GDPR by Country</Link>
                        {' '}<span style={{ margin: '0 6px' }}>›</span>{' '}
                        <span style={{ color: '#94a3b8' }}>{country.name}</span>
                    </nav>
                </div>

                {/* Hero */}
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <span style={{ fontSize: 48 }}>{country.flag}</span>
                        <div>
                            <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                                GDPR Compliance in {country.name}
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: 16, margin: '8px 0 0' }}>
                                {country.localName !== country.name && <span style={{ color: '#64748b' }}>{country.localName} · </span>}
                                {country.localLaw}
                            </p>
                        </div>
                    </div>

                    {/* TL;DR box — optimized for AI search citations */}
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
                        <p style={{ color: '#93c5fd', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>TL;DR</p>
                        <p style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                            Websites targeting users in {country.name} must comply with GDPR as implemented locally through the <strong>{country.localLaw}</strong>.
                            The supervisory authority is the <strong>{country.dpa}</strong>.
                            {country.fineExample && <> Notable enforcement: {country.fineExample} ({country.fineAmount}).</>}
                            {' '}Use our free scanner below to check your website instantly.
                        </p>
                    </div>

                    {/* Quick check CTA */}
                    <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
                            Check your website&apos;s {country.name} compliance now
                        </h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 20px' }}>
                            Free audit — 25+ automated checks in 60 seconds
                        </p>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-block',
                                background: 'white',
                                color: '#1e40af',
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

                    {/* DPA Info */}
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                            Data Protection Authority
                        </h2>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Authority</p>
                                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0, fontWeight: 600 }}>{country.dpa}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Website</p>
                                    <a href={country.dpaUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 15, textDecoration: 'none' }}>
                                        {country.dpaUrl.replace('https://', '').replace('/', '')} ↗
                                    </a>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Local Law</p>
                                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>{country.localLaw}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Language</p>
                                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>{country.language}</p>
                                </div>
                                {country.fineAmount && (
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Largest Fine</p>
                                        <p style={{ color: '#f87171', fontSize: 15, margin: 0, fontWeight: 700 }}>{country.fineAmount}</p>
                                    </div>
                                )}
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 4px' }}>Population</p>
                                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0 }}>{country.population}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Key Requirements */}
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                            Key Requirements for {country.name}
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {country.keyRequirements.map((req, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <span style={{ color: '#3b82f6', fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </span>
                                    <p style={{ color: '#e2e8f0', fontSize: 15, margin: 0, lineHeight: 1.6 }}>{req}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Specific Notes */}
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                            What Makes {country.name} Different?
                        </h2>
                        <div style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: 12, padding: 24 }}>
                            <p style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                                {country.specificNotes}
                            </p>
                        </div>
                    </section>

                    {/* Compliance Checklist */}
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                            {country.name} Website Compliance Checklist
                        </h2>
                        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                            {[
                                `Cookie consent banner that requires opt-in before non-essential cookies`,
                                `Privacy policy available in ${country.language}`,
                                `Clear identification of data controller and contact details`,
                                `Data Processing Agreement (DPA) with all third-party processors`,
                                `Lawful basis documented for each processing activity`,
                                `Data Subject Access Request (DSAR) process in place`,
                                `Data breach notification procedure compliant with 72-hour rule`,
                                `Data Protection Impact Assessment for high-risk processing`,
                                `International data transfer mechanisms documented (SCCs, adequacy decisions)`,
                                `Records of processing activities (ROPA) maintained`,
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 9 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <span style={{ color: '#64748b', fontSize: 14, flexShrink: 0, width: 24, textAlign: 'center' }}>☐</span>
                                    <p style={{ color: '#cbd5e1', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{item}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section style={{ marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                            Frequently Asked Questions
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <details style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
                                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                                    What are the GDPR requirements for websites in {country.name}?
                                </summary>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                                    In {country.name}, websites must comply with GDPR as implemented by the {country.localLaw}. Key requirements include obtaining explicit consent before setting non-essential cookies, providing a clear privacy policy, appointing a DPO when required, and notifying data breaches within 72 hours to the {country.dpa}.
                                </p>
                            </details>
                            <details style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
                                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                                    Who enforces GDPR in {country.name}?
                                </summary>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                                    The {country.dpa} is the supervisory authority responsible for enforcing data protection laws in {country.name}. They can investigate complaints, conduct audits, and issue fines up to €20 million or 4% of annual global turnover.
                                </p>
                            </details>
                            <details style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
                                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                                    How can I check if my website complies with {country.name} data protection laws?
                                </summary>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>
                                    Use PrivacyChecker&apos;s free scanner to perform an instant audit of your website. Our tool checks 25+ compliance points including cookie consent, privacy policy presence, security headers, tracker detection, and more — all relevant to {country.name}&apos;s GDPR requirements.
                                </p>
                            </details>
                        </div>
                    </section>

                    {/* Second CTA */}
                    <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 40 }}>
                        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                            Is your website compliant in {country.name}?
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px' }}>
                            Find out in 60 seconds with our free GDPR scanner
                        </p>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-block',
                                background: '#3b82f6',
                                color: 'white',
                                fontWeight: 700,
                                padding: '14px 32px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                fontSize: 15,
                            }}
                        >
                            Run Free Audit →
                        </Link>
                    </div>

                    {/* Other Countries */}
                    <section style={{ marginBottom: 60 }}>
                        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
                            GDPR Compliance in Other Countries
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {otherCountries.map(c => (
                                <Link
                                    key={c.slug}
                                    href={`/gdpr-compliance/${c.slug}`}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        padding: '12px 16px',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        transition: 'border-color 0.2s',
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>{c.flag}</span>
                                    <span style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500 }}>{c.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>
                        © 2026 PrivacyChecker. Free GDPR compliance scanner for websites.
                    </p>
                </footer>
            </div>
        </>
    );
}
