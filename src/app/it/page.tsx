import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Controllo GDPR Gratuito — Scanner Conformità Sito Web | PrivacyChecker',
    description: 'Verifica gratuitamente se il tuo sito web è conforme al GDPR. Scansiona cookie, tracker, banner di consenso, informativa privacy e header di sicurezza in 60 secondi.',
    keywords: ['controllo GDPR', 'conformità GDPR', 'scanner GDPR', 'verifica cookie', 'Garante Privacy', 'informativa privacy', 'protezione dati', 'banner consenso'],
    alternates: { canonical: 'https://privacychecker.pro/it', languages: { 'en': 'https://privacychecker.pro', 'it': 'https://privacychecker.pro/it' } },
    openGraph: { title: 'Controllo GDPR Gratuito — Scanner Conformità | PrivacyChecker', description: 'Verifica se il tuo sito è conforme al GDPR. Cookie, tracker, consenso e informativa privacy in 60 secondi.', url: 'https://privacychecker.pro/it', siteName: 'PrivacyChecker', locale: 'it_IT', type: 'website' },
};

export default function ItalianHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/it', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'it', description: 'Scanner gratuito di conformità GDPR per siti web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: 'Come verifico se il mio sito è conforme al GDPR?', acceptedAnswer: { '@type': 'Answer', text: 'Usa lo strumento gratuito PrivacyChecker per scansionare il tuo sito web in 60 secondi. Il nostro scanner verifica automaticamente cookie, banner di consenso, informativa privacy, header di sicurezza e oltre 25 punti di conformità GDPR.' } },
            { '@type': 'Question', name: 'Il controllo è davvero gratuito?', acceptedAnswer: { '@type': 'Answer', text: 'Sì, il controllo base è 100% gratuito e non richiede registrazione. I piani Pro offrono funzionalità aggiuntive come monitoraggio continuo e report PDF.' } },
            { '@type': 'Question', name: 'Quali normative vengono verificate?', acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker verifica la conformità al GDPR (Europa), Codice della Privacy (Italia), CCPA (California), LGPD (Brasile) e EAA 2025 (Accessibilità Europea).' } },
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
                            <Link href="/gdpr-compliance/italy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>GDPR Italia</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratuito · Nessuna registrazione · Risultati in 60 secondi</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Il tuo sito web è<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>conforme al GDPR?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Scansiona il tuo sito web e ottieni un rapporto completo di conformità GDPR in 60 secondi. Cookie, tracker, banner di consenso, informativa privacy — tutto viene verificato automaticamente.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Scansiona gratis →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ controlli automatizzati</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookie e Tracker', desc: 'Rileva tutti i cookie di terze parti, Google Analytics, pixel Facebook e tracker pubblicitari.' },
                            { title: 'Banner di Consenso', desc: 'Verifica presenza, conformità e dark pattern del tuo banner cookie.' },
                            { title: 'Informativa Privacy', desc: 'Analizza il contenuto e la completezza della tua informativa sulla privacy.' },
                            { title: 'Header di Sicurezza', desc: 'HTTPS, HSTS, CSP, X-Frame-Options e altri header di sicurezza essenziali.' },
                            { title: 'Trasferimenti Dati', desc: 'Identifica i trasferimenti di dati verso gli USA e paesi terzi.' },
                            { title: 'Rilevamento IA', desc: 'Verifica come il tuo sito interagisce con i crawler di intelligenza artificiale.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Domande frequenti</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Come verifico se il mio sito è conforme al GDPR?', a: 'Inserisci l\'URL del tuo sito nel nostro scanner gratuito. In 60 secondi riceverai un rapporto dettagliato su cookie, banner di consenso, informativa privacy e oltre 25 punti di verifica.' },
                            { q: 'Il controllo è davvero gratuito?', a: 'Sì, il controllo base è 100% gratuito. I piani Pro (da 9€/mese) offrono funzionalità aggiuntive come il monitoraggio continuo e report PDF esportabili.' },
                            { q: 'Vengono verificate anche le linee guida del Garante?', a: 'Sì. Il nostro scanner verifica la conformità al GDPR e tiene conto delle linee guida specifiche del Garante per la protezione dei dati personali, incluse le regole sui cookie.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Pronto per il controllo GDPR?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratuito · 60 secondi · 25+ controlli automatizzati</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Avvia audit gratuito →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Scanner gratuito di conformità GDPR per siti web.</p>
                </footer>
            </div>
        </>
    );
}
