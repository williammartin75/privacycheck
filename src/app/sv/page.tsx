import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Gratis GDPR-kontroll — Webbplats Integritetsskanner | PrivacyChecker',
    description: 'Kontrollera gratis om din webbplats följer GDPR. Skanna cookies, spårare, samtyckesbanner, integritetspolicy och säkerhetsrubriker på 60 sekunder. 25+ automatiserade kontroller.',
    keywords: ['GDPR kontroll', 'GDPR efterlevnad', 'integritetsskanner', 'cookie banner kontroll', 'IMY', 'dataskydd', 'integritetspolicy', 'dataskyddsförordningen'],
    alternates: { canonical: 'https://privacychecker.pro/sv', languages: { 'en': 'https://privacychecker.pro', 'sv': 'https://privacychecker.pro/sv' } },
    openGraph: { title: 'Gratis GDPR-kontroll — Integritetsskanner | PrivacyChecker', description: 'Kontrollera om din webbplats följer GDPR. Skanna cookies, spårare och samtycke på 60 sekunder.', url: 'https://privacychecker.pro/sv', siteName: 'PrivacyChecker', locale: 'sv_SE', type: 'website' },
};

export default function SwedishHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/sv', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'sv', description: 'Gratis GDPR-efterlevnadsskanner för webbplatser', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: 'Hur kontrollerar jag om min webbplats följer GDPR?', acceptedAnswer: { '@type': 'Answer', text: 'Använd det kostnadsfria verktyget PrivacyChecker för att skanna din webbplats på 60 sekunder. Vår skanner kontrollerar automatiskt cookies, samtyckesbanner, integritetspolicy, säkerhetsrubriker och fler än 25 GDPR-efterlevnadspunkter.' } },
            { '@type': 'Question', name: 'Är GDPR-kontrollen verkligen gratis?', acceptedAnswer: { '@type': 'Answer', text: 'Ja, grundkontrollen är 100% gratis och kräver ingen registrering. Pro-planer erbjuder utökade funktioner som löpande övervakning och PDF-rapporter.' } },
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
                <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>PrivacyChecker</span>
                        </Link>
                        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                            <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
                            <Link href="/gdpr-compliance/sweden" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>GDPR Sverige</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratis · Ingen registrering · Resultat på 60 sekunder</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Följer din webbplats<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GDPR-kraven?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Skanna din webbplats och få en komplett GDPR-efterlevnadsrapport på 60 sekunder. Cookies, spårare, samtyckesbanner, integritetspolicy — allt kontrolleras automatiskt.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Skanna gratis →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ automatiserade kontroller</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies och Spårare', desc: 'Upptäcker alla tredjepartscookies, Google Analytics, Facebook-pixlar och reklamspårare.' },
                            { title: 'Samtyckesbanner', desc: 'Kontrollerar närvaro, efterlevnad och dark patterns i din cookie-banner.' },
                            { title: 'Integritetspolicy', desc: 'Analyserar innehåll och fullständighet i din integritetspolicy.' },
                            { title: 'Säkerhetsrubriker', desc: 'HTTPS, HSTS, CSP, X-Frame-Options och andra viktiga säkerhetsrubriker.' },
                            { title: 'Dataöverföringar', desc: 'Identifierar dataöverföringar till USA och tredje länder.' },
                            { title: 'AI-detektering', desc: 'Kontrollerar hur din webbplats interagerar med AI-crawlers.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Vanliga frågor</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Hur kontrollerar jag om min webbplats följer GDPR?', a: 'Ange din webbplats URL i vår kostnadsfria skanner. På 60 sekunder får du en detaljerad rapport om cookies, samtyckesbanner, integritetspolicy och fler än 25 kontrollpunkter.' },
                            { q: 'Är kontrollen verkligen gratis?', a: 'Ja, grundkontrollen är 100% gratis. Pro-planer (från 9€/månad) erbjuder utökade funktioner som löpande övervakning och exporterbara PDF-rapporter.' },
                            { q: 'Kontrolleras även IMY:s riktlinjer?', a: 'Ja. Vår skanner kontrollerar efterlevnad av GDPR och tar hänsyn till IMY:s (Integritetsskyddsmyndigheten) specifika riktlinjer, inklusive regler kring Google Analytics och dataöverföringar.' },
                        ].map((item, i) => (
                            <details key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
                                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>{item.q}</summary>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px', textAlign: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 16, padding: 48 }}>
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Redo för GDPR-kontroll?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratis · 60 sekunder · 25+ automatiserade kontroller</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Starta gratis granskning →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Gratis GDPR-efterlevnadsskanner för webbplatser.</p>
                </footer>
            </div>
        </>
    );
}
