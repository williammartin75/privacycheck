import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Verificador RGPD Gratuito — Scanner de Conformidade Web | PrivacyChecker',
    description: 'Verifique gratuitamente se o seu site está em conformidade com o RGPD. Analise cookies, rastreadores, banner de consentimento, política de privacidade e cabeçalhos de segurança em 60 segundos.',
    keywords: ['verificador RGPD', 'conformidade RGPD', 'scanner RGPD', 'verificar cookies', 'CNPD', 'proteção de dados', 'política de privacidade'],
    alternates: { canonical: 'https://privacychecker.pro/pt', languages: { 'en': 'https://privacychecker.pro', 'pt': 'https://privacychecker.pro/pt' } },
    openGraph: { title: 'Verificador RGPD Gratuito — Scanner de Conformidade | PrivacyChecker', description: 'Verifique se o seu site cumpre o RGPD. Cookies, rastreadores, consentimento e privacidade em 60 segundos.', url: 'https://privacychecker.pro/pt', siteName: 'PrivacyChecker', locale: 'pt_PT', type: 'website' },
};

export default function PortugueseHomepage() {
    const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'PrivacyChecker', url: 'https://privacychecker.pro/pt', applicationCategory: 'SecurityApplication', operatingSystem: 'Web', inLanguage: 'pt', description: 'Scanner gratuito de conformidade RGPD para websites', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } };
    const faqJsonLd = {
        '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
            { '@type': 'Question', name: 'Como verifico se o meu site cumpre o RGPD?', acceptedAnswer: { '@type': 'Answer', text: 'Use a ferramenta gratuita PrivacyChecker para analisar o seu site em 60 segundos. O nosso scanner verifica automaticamente cookies, banner de consentimento, política de privacidade, cabeçalhos de segurança e mais de 25 pontos de conformidade.' } },
            { '@type': 'Question', name: 'A auditoria é mesmo gratuita?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, a auditoria básica é 100% gratuita e não requer registo. Os planos Pro oferecem funcionalidades adicionais como monitorização contínua e relatórios PDF.' } },
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
                            <Link href="/gdpr-compliance/portugal" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>RGPD Portugal</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratuito · Sem registo · Resultados em 60 segundos</span>
                    </div>
                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        O seu site está em<br /><span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>conformidade com o RGPD?</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Analise o seu site e obtenha um relatório completo de conformidade RGPD em 60 segundos. Cookies, rastreadores, banner de consentimento, política de privacidade — tudo é verificado automaticamente.
                    </p>
                    <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16, boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)' }}>
                        Analisar gratuitamente →
                    </Link>
                </section>
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>25+ verificações automatizadas</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies e Rastreadores', desc: 'Deteta todos os cookies de terceiros, Google Analytics, píxeis do Facebook e rastreadores publicitários.' },
                            { title: 'Banner de Consentimento', desc: 'Verifica a presença, conformidade e dark patterns do seu banner de cookies.' },
                            { title: 'Política de Privacidade', desc: 'Analisa o conteúdo e a integridade da sua política de privacidade.' },
                            { title: 'Cabeçalhos de Segurança', desc: 'HTTPS, HSTS, CSP, X-Frame-Options e outros cabeçalhos de segurança essenciais.' },
                            { title: 'Transferências de Dados', desc: 'Identifica transferências de dados para os EUA e países terceiros.' },
                            { title: 'Deteção de IA', desc: 'Verifica como o seu site interage com crawlers de inteligência artificial.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>Perguntas frequentes</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Como verifico se o meu site cumpre o RGPD?', a: 'Introduza o URL do seu site no nosso scanner gratuito. Em 60 segundos receberá um relatório detalhado sobre cookies, banner de consentimento, política de privacidade e mais de 25 pontos de verificação.' },
                            { q: 'A auditoria é mesmo gratuita?', a: 'Sim, a auditoria básica é 100% gratuita. Os planos Pro (a partir de 9€/mês) oferecem funcionalidades adicionais como monitorização contínua e relatórios PDF exportáveis.' },
                            { q: 'São verificadas as diretrizes da CNPD?', a: 'Sim. O nosso scanner verifica a conformidade com o RGPD e tem em conta as diretrizes específicas da CNPD (Comissão Nacional de Proteção de Dados), incluindo requisitos para cookies e dados biométricos.' },
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
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Pronto para verificar?</h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>Gratuito · 60 segundos · 25+ verificações</p>
                        <Link href="/" style={{ display: 'inline-block', background: 'white', color: '#1e40af', fontWeight: 700, padding: '16px 40px', borderRadius: 10, textDecoration: 'none', fontSize: 16 }}>
                            Iniciar auditoria gratuita →
                        </Link>
                    </div>
                </section>
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: 13 }}>© 2026 PrivacyChecker. Scanner gratuito de conformidade RGPD para websites.</p>
                </footer>
            </div>
        </>
    );
}
