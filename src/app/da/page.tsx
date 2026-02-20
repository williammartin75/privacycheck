import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Gratis GDPR-tjek — Website Databeskyttelses-scanner | PrivacyChecker',
    description: 'Tjek gratis om din hjemmeside overholder GDPR. Scan cookies, trackere, samtykke-banner, privatlivspolitik og sikkerhedsheadere på 60 sekunder. 25+ automatiserede tjek.',
    keywords: ['GDPR tjek', 'GDPR overholdelse', 'databeskyttelse scanner', 'cookie banner tjek', 'Datatilsynet', 'privatlivspolitik', 'persondataforordningen'],
    alternates: { canonical: 'https://privacychecker.pro/da', languages: { 'en': 'https://privacychecker.pro', 'da': 'https://privacychecker.pro/da' } },
    openGraph: { title: 'Gratis GDPR-tjek — Databeskyttelses-scanner | PrivacyChecker', description: 'Tjek om din hjemmeside overholder GDPR. Scan cookies, trackere og samtykke-banner på 60 sekunder.', url: 'https://privacychecker.pro/da', siteName: 'PrivacyChecker', locale: 'da_DK', type: 'website' },
};

export default function DanishHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/da', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'da', description: 'Gratis GDPR-overensstemmelsesscanner til hjemmesider', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: 'Hvordan tjekker jeg om min hjemmeside overholder GDPR?', acceptedAnswer: { '@type': 'Answer', text: 'Brug det gratis PrivacyChecker-værktøj til at scanne din hjemmeside på 60 sekunder. Vores scanner kontrollerer automatisk cookies, samtykke-banner, privatlivspolitik, sikkerhedsheadere og mere end 25 GDPR-overensstemmelsespunkter.' } },
            { '@type': 'Question', name: 'Er GDPR-tjekket virkelig gratis?', acceptedAnswer: { '@type': 'Answer', text: 'Ja, basis-tjekket er 100% gratis og kræver ingen registrering. Pro-planer tilbyder ekstra funktioner som løbende overvågning og PDF-rapporter.' } },
            { '@type': 'Question', name: 'Hvilke regler kontrolleres?', acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker kontrollerer overholdelse af GDPR (Europa), Databeskyttelsesloven (Danmark), CCPA (Californien) og EAA 2025 (Europæisk Tilgængelighed).' } },
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
                            <Link href="/gdpr-compliance/denmark" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>GDPR Danmark</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratis · Ingen registrering · Resultater på 60 sekunder</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Overholder din hjemmeside<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GDPR-reglerne?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Scan din hjemmeside og få en komplet GDPR-overensstemmelsesrapport på 60 sekunder. Cookies, trackere, samtykke-banner, privatlivspolitik — alt kontrolleres automatisk.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Scan gratis nu →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ automatiserede kontroller</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies og Trackere', desc: 'Registrerer alle tredjepartscookies, Google Analytics, Facebook-pixels og reklametrackere.' },
                            { title: 'Samtykke-banner', desc: 'Kontrollerer tilstedeværelse, overensstemmelse og dark patterns i dit cookie-banner.' },
                            { title: 'Privatlivspolitik', desc: 'Analyserer indholdet og fuldstændigheden af din privatlivspolitik.' },
                            { title: 'Sikkerhedsheadere', desc: 'HTTPS, HSTS, CSP, X-Frame-Options og andre vigtige sikkerhedsheadere.' },
                            { title: 'Dataoverførsler', desc: 'Identificerer dataoverførsler til USA og tredjelande.' },
                            { title: 'AI-registrering', desc: 'Kontrollerer hvordan din hjemmeside interagerer med kunstig intelligens-crawlere.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Ofte stillede spørgsmål</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Hvordan tjekker jeg om min hjemmeside overholder GDPR?', a: 'Indtast din hjemmesides URL i vores gratis scanner. På 60 sekunder modtager du en detaljeret rapport om cookies, samtykke-banner, privatlivspolitik og mere end 25 kontrolpunkter.' },
                            { q: 'Er tjekket virkelig gratis?', a: 'Ja, basis-tjekket er 100% gratis og kræver ingen registrering. Pro-planer (fra 9€/måned) tilbyder ekstra funktioner som løbende overvågning og PDF-rapporter.' },
                            { q: 'Kontrolleres Datatilsynets retningslinjer?', a: 'Ja. Vores scanner kontrollerer overholdelse af GDPR og tager højde for Datatilsynets specifikke retningslinjer, herunder krav til cookies og cloud-tjenester.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Klar til GDPR-tjek?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratis · 60 sekunder · 25+ automatiserede kontroller</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Start gratis audit →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Gratis GDPR-overensstemmelsesscanner til hjemmesider.</p>
                </footer>
            </div>
        </>
    );
}
