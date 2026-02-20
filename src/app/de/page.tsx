import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Kostenloser DSGVO-Check — Website-Datenschutz-Scanner | PrivacyChecker',
    description: 'Prüfen Sie kostenlos, ob Ihre Website DSGVO-konform ist. Scannen Sie Cookies, Tracker, Consent-Banner, Datenschutzerklärung und Sicherheits-Header in 60 Sekunden. 25+ automatisierte Prüfungen.',
    keywords: ['DSGVO Check', 'DSGVO Prüfung', 'Datenschutz Scanner', 'Cookie Banner prüfen', 'DSGVO Konformität', 'Datenschutzerklärung prüfen', 'TTDSG Prüfung', 'Website Datenschutz'],
    alternates: {
        canonical: 'https://privacychecker.pro/de',
        languages: { 'en': 'https://privacychecker.pro', 'de': 'https://privacychecker.pro/de', 'fr': 'https://privacychecker.pro/fr' },
    },
    openGraph: {
        title: 'Kostenloser DSGVO-Check — Website Datenschutz Scanner | PrivacyChecker',
        description: 'Prüfen Sie Ihre Website auf DSGVO-Konformität. Cookies, Tracker, Consent-Banner und Datenschutzerklärung in 60 Sekunden scannen.',
        url: 'https://privacychecker.pro/de',
        siteName: 'PrivacyChecker',
        locale: 'de_DE',
        type: 'website',
    },
};

export default function GermanHomepage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PrivacyChecker',
        url: 'https://privacychecker.pro/de',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        inLanguage: 'de',
        description: 'Kostenloser DSGVO-Konformitätsscanner für Websites',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Wie überprüfe ich, ob meine Website DSGVO-konform ist?',
                acceptedAnswer: { '@type': 'Answer', text: 'Nutzen Sie das kostenlose Tool PrivacyChecker, um Ihre Website in 60 Sekunden zu scannen. Unser Scanner überprüft automatisch Cookies, Consent-Banner, Datenschutzerklärung, Sicherheits-Header und über 25 DSGVO-Konformitätspunkte.' },
            },
            {
                '@type': 'Question',
                name: 'Ist der DSGVO-Check wirklich kostenlos?',
                acceptedAnswer: { '@type': 'Answer', text: 'Ja, der Basis-Check ist 100% kostenlos. Sie können jede Website ohne Registrierung scannen. Die Pro-Pläne bieten erweiterte Funktionen wie kontinuierliches Monitoring und PDF-Berichte.' },
            },
            {
                '@type': 'Question',
                name: 'Welche Gesetze werden überprüft?',
                acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker überprüft die Konformität mit DSGVO (EU), TTDSG (Deutschland), BDSG, CCPA (Kalifornien), LGPD (Brasilien), PIPEDA (Kanada) und EAA 2025 (Europäische Barrierefreiheit).' },
            },
        ],
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
                            <Link href="/gdpr-compliance/germany" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>DSGVO Deutschland</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Kostenlos · Keine Registrierung · Ergebnisse in 60 Sekunden</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Ist Ihre Website<br />
                        <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DSGVO-konform?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Scannen Sie Ihre Website und erhalten Sie in 60 Sekunden einen vollständigen DSGVO-Konformitätsbericht. Cookies, Tracker, Consent-Banner, Datenschutzerklärung — alles wird automatisch geprüft.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Jetzt kostenlos scannen →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ automatisierte Prüfungen</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies & Tracker', desc: 'Erkennt alle Drittanbieter-Cookies, Google Analytics, Facebook-Pixel und Werbetracker.' },
                            { title: 'Consent-Banner', desc: 'Überprüft Vorhandensein, Konformität und Dark Patterns Ihres Cookie-Banners.' },
                            { title: 'Datenschutzerklärung', desc: 'Analysiert den Inhalt und die Vollständigkeit Ihrer Datenschutzerklärung.' },
                            { title: 'Sicherheits-Header', desc: 'HTTPS, HSTS, CSP, X-Frame-Options und andere wichtige Sicherheits-Header.' },
                            { title: 'Datentransfers', desc: 'Identifiziert Datenübertragungen in die USA und Drittländer gemäß Schrems II.' },
                            { title: 'KI-Erkennung', desc: 'Überprüft wie Ihre Website mit Crawlern künstlicher Intelligenz interagiert.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>Geprüfte Vorschriften</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        {[
                            { name: 'DSGVO', region: 'Europa', color: '#3b82f6' },
                            { name: 'TTDSG', region: 'Deutschland', color: '#f97316' },
                            { name: 'BDSG', region: 'Deutschland', color: '#8b5cf6' },
                            { name: 'CCPA', region: 'Kalifornien', color: '#f59e0b' },
                            { name: 'EAA 2025', region: 'Barrierefreiheit', color: '#06b6d4' },
                            { name: 'nDSG', region: 'Schweiz', color: '#ec4899' },
                        ].map((reg, i) => (
                            <div key={i} style={{ background: `${reg.color}15`, border: `1px solid ${reg.color}40`, borderRadius: 8, padding: '10px 16px' }}>
                                <span style={{ color: reg.color, fontWeight: 700, fontSize: 14 }}>{reg.name}</span>
                                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>{reg.region}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Häufig gestellte Fragen</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Wie überprüfe ich, ob meine Website DSGVO-konform ist?', a: 'Geben Sie die URL Ihrer Website in unseren kostenlosen Scanner ein. In 60 Sekunden erhalten Sie einen detaillierten Bericht über Cookies, Consent-Banner, Datenschutzerklärung, Sicherheits-Header und über 25 Prüfpunkte.' },
                            { q: 'Ist der DSGVO-Check wirklich kostenlos?', a: 'Ja, der Basis-Check ist 100% kostenlos und erfordert keine Registrierung. Pro-Pläne (ab 9€/Monat) bieten zusätzliche Funktionen wie kontinuierliches Monitoring und exportierbare PDF-Berichte.' },
                            { q: 'Wird auch das TTDSG geprüft?', a: 'Ja. Unser Scanner überprüft die Konformität mit dem TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz), einschließlich Cookie-Consent-Anforderungen und Telemedienrecht.' },
                            { q: 'Was passiert, wenn meine Website nicht konform ist?', a: 'Unser Bericht zeigt genau, welche Probleme bestehen und wie Sie diese beheben können. Für die meisten Websites können die wichtigsten Korrekturen (Cookie-Banner, Datenschutzerklärung) in 1-3 Tagen umgesetzt werden.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Bereit für den DSGVO-Check?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Kostenlos · 60 Sekunden · 25+ automatisierte Prüfungen</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Kostenlosen Audit starten →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Kostenloser DSGVO-Konformitätsscanner für Websites.</p>
                </footer>
            </div>
        </>
    );
}
