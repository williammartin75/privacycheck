import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Darmowy Audyt RODO — Skaner Zgodności Strony WWW | PrivacyChecker',
    description: 'Sprawdź za darmo, czy Twoja strona internetowa jest zgodna z RODO. Skanuj pliki cookie, trackery, baner zgody, politykę prywatności i nagłówki bezpieczeństwa w 60 sekund.',
    keywords: ['audyt RODO', 'zgodność RODO', 'skaner RODO', 'sprawdzenie cookies', 'UODO', 'ochrona danych osobowych', 'polityka prywatności', 'RODO strona internetowa'],
    alternates: { canonical: 'https://privacychecker.pro/pl', languages: { 'en': 'https://privacychecker.pro', 'pl': 'https://privacychecker.pro/pl' } },
    openGraph: { title: 'Darmowy Audyt RODO — Skaner Zgodności | PrivacyChecker', description: 'Sprawdź zgodność strony z RODO. Cookies, trackery, baner zgody i polityka prywatności w 60 sekund.', url: 'https://privacychecker.pro/pl', siteName: 'PrivacyChecker', locale: 'pl_PL', type: 'website' },
};

export default function PolishHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/pl', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'pl', description: 'Darmowy skaner zgodności RODO dla stron internetowych', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: 'Jak sprawdzić, czy moja strona jest zgodna z RODO?', acceptedAnswer: { '@type': 'Answer', text: 'Użyj darmowego narzędzia PrivacyChecker, aby przeskanować swoją stronę w 60 sekund. Nasz skaner automatycznie sprawdza pliki cookie, baner zgody, politykę prywatności, nagłówki bezpieczeństwa i ponad 25 punktów zgodności z RODO.' } },
            { '@type': 'Question', name: 'Czy audyt RODO jest naprawdę darmowy?', acceptedAnswer: { '@type': 'Answer', text: 'Tak, podstawowy audyt jest 100% darmowy i nie wymaga rejestracji. Plany Pro oferują dodatkowe funkcje, takie jak ciągłe monitorowanie i raporty PDF.' } },
            { '@type': 'Question', name: 'Jakie przepisy są sprawdzane?', acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker sprawdza zgodność z RODO (Europa), ustawą o ochronie danych osobowych (Polska), CCPA (Kalifornia) i EAA 2025 (Europejska Dostępność).' } },
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
                            <Link href="/gdpr-compliance/poland" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>RODO Polska</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Darmowy · Bez rejestracji · Wyniki w 60 sekund</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Czy Twoja strona jest<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>zgodna z RODO?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Przeskanuj swoją stronę i uzyskaj pełny raport zgodności z RODO w 60 sekund. Pliki cookie, trackery, baner zgody, polityka prywatności — wszystko jest sprawdzane automatycznie.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Skanuj za darmo →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ automatycznych sprawdzeń</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies i Trackery', desc: 'Wykrywa wszystkie ciasteczka firm trzecich, Google Analytics, piksele Facebooka i trackery reklamowe.' },
                            { title: 'Baner Zgody', desc: 'Sprawdza obecność, zgodność i dark patterns Twojego baneru cookies.' },
                            { title: 'Polityka Prywatności', desc: 'Analizuje treść i kompletność Twojej polityki prywatności.' },
                            { title: 'Nagłówki Bezpieczeństwa', desc: 'HTTPS, HSTS, CSP, X-Frame-Options i inne kluczowe nagłówki bezpieczeństwa.' },
                            { title: 'Transfery Danych', desc: 'Identyfikuje transfery danych do USA i krajów trzecich.' },
                            { title: 'Wykrywanie AI', desc: 'Sprawdza jak Twoja strona współpracuje z crawlerami sztucznej inteligencji.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Najczęściej zadawane pytania</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Jak sprawdzić, czy moja strona jest zgodna z RODO?', a: 'Wpisz adres URL swojej strony w nasz darmowy skaner. W 60 sekund otrzymasz szczegółowy raport o plikach cookie, banerze zgody, polityce prywatności i ponad 25 punktach kontroli.' },
                            { q: 'Czy audyt jest naprawdę darmowy?', a: 'Tak, podstawowy audyt jest 100% darmowy. Plany Pro (od 9€/miesiąc) oferują dodatkowe funkcje, takie jak ciągłe monitorowanie i eksportowalne raporty PDF.' },
                            { q: 'Czy sprawdzane są wytyczne UODO?', a: 'Tak. Nasz skaner sprawdza zgodność z RODO i uwzględnia wytyczne UODO (Urząd Ochrony Danych Osobowych), w tym wymagania dotyczące cookies i przetwarzania danych pracowników.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Gotowy na audyt RODO?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Darmowy · 60 sekund · 25+ automatycznych sprawdzeń</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Rozpocznij darmowy audyt →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Darmowy skaner zgodności RODO dla stron internetowych.</p>
                </footer>
            </div>
        </>
    );
}
