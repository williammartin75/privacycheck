import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Gratis AVG/GDPR-check — Website Privacyscanner | PrivacyChecker',
    description: 'Controleer gratis of uw website AVG-conform is. Scan cookies, trackers, cookiebanner, privacyverklaring en beveiligingsheaders in 60 seconden. 25+ geautomatiseerde controles.',
    keywords: ['AVG check', 'GDPR check', 'privacy scanner', 'cookiebanner controleren', 'AVG conformiteit', 'privacyverklaring', 'AP richtlijnen', 'website privacy'],
    alternates: {
        canonical: 'https://privacychecker.pro/nl',
        languages: { 'en': 'https://privacychecker.pro', 'nl': 'https://privacychecker.pro/nl', 'de': 'https://privacychecker.pro/de', 'fr': 'https://privacychecker.pro/fr' },
    },
    openGraph: {
        title: 'Gratis AVG/GDPR-check — Website Privacyscanner | PrivacyChecker',
        description: 'Controleer uw website op AVG-conformiteit. Cookies, trackers, cookiebanner en privacyverklaring in 60 seconden scannen.',
        url: 'https://privacychecker.pro/nl',
        siteName: 'PrivacyChecker',
        locale: 'nl_NL',
        type: 'website',
    },
};

export default function DutchHomepage() {
    const jsonLd = {
        '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker',
        url: 'https://privacychecker.pro/nl', applicationCategory: 'SecurityApplication', operatingSystem: 'Web',
        inLanguage: 'nl', description: 'Gratis AVG-conformiteitsscanner voor websites',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
            { '@type': 'Question', name: 'Hoe controleer ik of mijn website AVG-conform is?', acceptedAnswer: { '@type': 'Answer', text: 'Gebruik de gratis PrivacyChecker tool om uw website in 60 seconden te scannen. Onze scanner controleert automatisch cookies, cookiebanner, privacyverklaring, beveiligingsheaders en meer dan 25 AVG-conformiteitspunten.' } },
            { '@type': 'Question', name: 'Is de AVG-check echt gratis?', acceptedAnswer: { '@type': 'Answer', text: 'Ja, de basiscontrole is 100% gratis en vereist geen registratie. Pro-abonnementen bieden extra functies zoals continue monitoring en PDF-rapporten.' } },
            { '@type': 'Question', name: 'Welke regelgeving wordt gecontroleerd?', acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker controleert de conformiteit met AVG/GDPR (Europa), UAVG (Nederland), CCPA (Californië), LGPD (Brazilië), en EAA 2025 (Europese Toegankelijkheid).' } },
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
                            <Link href="/gdpr-compliance/netherlands" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>AVG Nederland</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratis · Geen registratie nodig · Resultaat in 60 seconden</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Is uw website<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AVG-conform?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Scan uw website en ontvang in 60 seconden een volledig AVG-conformiteitsrapport. Cookies, trackers, cookiebanner, privacyverklaring — alles wordt automatisch gecontroleerd.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Gratis scannen →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ geautomatiseerde controles</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies & Trackers', desc: 'Detecteert alle cookies van derden, Google Analytics, Facebook-pixels en advertentietrackers.' },
                            { title: 'Cookiebanner', desc: 'Controleert aanwezigheid, conformiteit en dark patterns van uw cookiebanner.' },
                            { title: 'Privacyverklaring', desc: 'Analyseert de inhoud en volledigheid van uw privacyverklaring.' },
                            { title: 'Beveiligingsheaders', desc: 'HTTPS, HSTS, CSP, X-Frame-Options en andere essentiële beveiligingsheaders.' },
                            { title: 'Gegevensoverdrachten', desc: 'Identificeert gegevensoverdrachten naar de VS en derde landen.' },
                            { title: 'AI-detectie', desc: 'Controleert hoe uw website omgaat met crawlers van kunstmatige intelligentie.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Veelgestelde vragen</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Hoe controleer ik of mijn website AVG-conform is?', a: 'Voer de URL van uw website in onze gratis scanner in. In 60 seconden ontvangt u een gedetailleerd rapport over cookies, cookiebanner, privacyverklaring, beveiligingsheaders en meer dan 25 controlepunten.' },
                            { q: 'Is de controle echt gratis?', a: 'Ja, de basiscontrole is 100% gratis en vereist geen registratie. Pro-abonnementen (vanaf €9/maand) bieden extra functies zoals continue monitoring en exporteerbare PDF-rapporten.' },
                            { q: 'Controleert u ook de Autoriteit Persoonsgegevens-richtlijnen?', a: 'Ja. Onze scanner controleert naleving van de AVG/GDPR en houdt rekening met de specifieke richtlijnen van de Autoriteit Persoonsgegevens (AP), inclusief eisen aan cookies en Google Analytics.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Klaar voor de AVG-check?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratis · 60 seconden · 25+ geautomatiseerde controles</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Gratis audit starten →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Gratis AVG-conformiteitsscanner voor websites.</p>
                </footer>
            </div>
        </>
    );
}
