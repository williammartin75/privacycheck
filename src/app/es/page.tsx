import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Verificador RGPD Gratuito — Escáner de Cumplimiento Web | PrivacyChecker',
    description: 'Compruebe gratis si su sitio web cumple con el RGPD. Escanee cookies, rastreadores, banner de consentimiento, política de privacidad y cabeceras de seguridad en 60 segundos.',
    keywords: ['verificador RGPD', 'cumplimiento RGPD', 'escáner RGPD', 'comprobar cookies', 'LOPDGDD', 'AEPD', 'protección de datos', 'política de privacidad'],
    alternates: {
        canonical: 'https://privacychecker.pro/es',
        languages: { 'en': 'https://privacychecker.pro', 'es': 'https://privacychecker.pro/es' },
    },
    openGraph: {
        title: 'Verificador RGPD Gratuito — Escáner de Cumplimiento | PrivacyChecker',
        description: 'Compruebe si su sitio web cumple con el RGPD. Cookies, rastreadores, consentimiento y política de privacidad en 60 segundos.',
        url: 'https://privacychecker.pro/es', siteName: 'PrivacyChecker', locale: 'es_ES', type: 'website',
    },
};

export default function SpanishHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/es', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'es', description: 'Escáner gratuito de cumplimiento RGPD para sitios web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: '¿Cómo verifico si mi web cumple el RGPD?', acceptedAnswer: { '@type': 'Answer', text: 'Use la herramienta gratuita PrivacyChecker para escanear su sitio web en 60 segundos. Nuestro escáner verifica automáticamente cookies, banner de consentimiento, política de privacidad, cabeceras de seguridad y más de 25 puntos de cumplimiento.' } },
            { '@type': 'Question', name: '¿La auditoría es realmente gratuita?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, la auditoría básica es 100% gratuita y no requiere registro. Los planes Pro ofrecen funcionalidades adicionales como monitorización continua e informes PDF.' } },
            { '@type': 'Question', name: '¿Qué normativas se verifican?', acceptedAnswer: { '@type': 'Answer', text: 'PrivacyChecker verifica el cumplimiento del RGPD (Europa), LOPDGDD (España), CCPA (California), LGPD (Brasil), y EAA 2025 (Accesibilidad Europea).' } },
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
                            <Link href="/gdpr-compliance/spain" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>RGPD España</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratuito · Sin registro · Resultados en 60 segundos</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        ¿Su sitio web cumple<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>con el RGPD?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Escanee su sitio web y obtenga un informe completo de cumplimiento RGPD en 60 segundos. Cookies, rastreadores, banner de consentimiento, política de privacidad — todo se verifica automáticamente.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Escanear mi web gratis →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ verificaciones automatizadas</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies y Rastreadores', desc: 'Detecta todas las cookies de terceros, Google Analytics, píxeles de Facebook y rastreadores publicitarios.' },
                            { title: 'Banner de Consentimiento', desc: 'Verifica presencia, conformidad y dark patterns de su banner de cookies.' },
                            { title: 'Política de Privacidad', desc: 'Analiza el contenido y la completitud de su política de privacidad.' },
                            { title: 'Cabeceras de Seguridad', desc: 'HTTPS, HSTS, CSP, X-Frame-Options y otras cabeceras de seguridad esenciales.' },
                            { title: 'Transferencias de Datos', desc: 'Identifica transferencias de datos a EE.UU. y terceros países.' },
                            { title: 'Detección IA', desc: 'Verifica cómo su web interactúa con los rastreadores de inteligencia artificial.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Preguntas frecuentes</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: '¿Cómo verifico si mi web cumple el RGPD?', a: 'Introduzca la URL de su web en nuestro escáner gratuito. En 60 segundos recibirá un informe detallado sobre cookies, banner de consentimiento, política de privacidad y más de 25 puntos de verificación.' },
                            { q: '¿La auditoría es realmente gratuita?', a: 'Sí, la auditoría básica es 100% gratuita. Los planes Pro (desde 9€/mes) ofrecen funcionalidades adicionales como monitorización continua e informes PDF exportables.' },
                            { q: '¿Se verifica también la LOPDGDD?', a: 'Sí. Nuestro escáner verifica el cumplimiento del RGPD y tiene en cuenta las directrices específicas de la AEPD y la LOPDGDD española.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>¿Listo para la verificación?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratuito · 60 segundos · 25+ verificaciones</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Iniciar auditoría gratuita →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Escáner gratuito de cumplimiento RGPD.</p>
                </footer>
            </div>
        </>
    );
}
