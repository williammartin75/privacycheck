import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Vérificateur RGPD Gratuit — Audit de Conformité Site Web | PrivacyChecker',
    description: 'Vérifiez gratuitement si votre site web est conforme au RGPD. Scannez les cookies, trackers, bannières de consentement, politique de confidentialité et en-têtes de sécurité en 60 secondes. 25+ vérifications automatisées.',
    keywords: ['vérificateur RGPD', 'conformité RGPD', 'audit RGPD gratuit', 'scanner RGPD', 'vérification cookies', 'politique de confidentialité', 'CNIL conformité', 'protection des données'],
    alternates: {
        canonical: 'https://privacychecker.pro/fr',
        languages: {
            'en': 'https://privacychecker.pro',
            'fr': 'https://privacychecker.pro/fr',
        },
    },
    openGraph: {
        title: 'Vérificateur RGPD Gratuit — Scanner de Conformité | PrivacyChecker',
        description: 'Vérifiez si votre site est conforme au RGPD gratuitement. Scannez cookies, trackers, bannières de consentement et politique de confidentialité en 60 secondes.',
        url: 'https://privacychecker.pro/fr',
        siteName: 'PrivacyChecker',
        locale: 'fr_FR',
        type: 'website',
    },
};

export default function FrenchHomepage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PrivacyChecker',
        url: 'https://privacychecker.pro/fr',
        applicationCategory: 'SecurityApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr',
        description: 'Scanner de conformité RGPD gratuit pour sites web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Comment vérifier si mon site est conforme au RGPD ?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Utilisez l\'outil gratuit PrivacyChecker pour scanner votre site web en 60 secondes. Notre scanner vérifie automatiquement les cookies, la bannière de consentement, la politique de confidentialité, les en-têtes de sécurité et 25+ points de conformité RGPD.',
                },
            },
            {
                '@type': 'Question',
                name: 'L\'audit RGPD est-il vraiment gratuit ?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Oui, l\'audit de base est 100% gratuit. Vous pouvez scanner n\'importe quel site web sans inscription. Les plans Pro offrent des fonctionnalités avancées comme le monitoring continu et les rapports PDF.',
                },
            },
            {
                '@type': 'Question',
                name: 'Quelles réglementations vérifiez-vous ?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'PrivacyChecker vérifie la conformité au RGPD (Europe), CCPA (Californie), LGPD (Brésil), PIPEDA (Canada), EAA 2025 (Accessibilité européenne), et la Loi Informatique et Libertés (France/CNIL).',
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
                        <nav style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                            <Link href="/blog" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>Blog</Link>
                            <Link href="/gdpr-compliance" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>RGPD par pays</Link>
                            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>English</Link>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.15)', borderRadius: 20, padding: '6px 16px', marginBottom: 24 }}>
                        <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>Gratuit · Aucune inscription requise · Résultats en 60 secondes</span>
                    </div>

                    <h1 style={{ color: 'white', fontSize: 42, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px' }}>
                        Votre site web est-il<br />
                        <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            conforme au RGPD ?
                        </span>
                    </h1>

                    <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
                        Scannez votre site web et obtenez un rapport complet de conformité RGPD en 60 secondes.
                        Cookies, trackers, bannière de consentement, politique de confidentialité — tout est vérifié automatiquement.
                    </p>

                    <Link
                        href="/"
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            color: 'white',
                            fontWeight: 700,
                            padding: '16px 40px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            fontSize: 16,
                            boxShadow: '0 4px 24px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        Scanner mon site gratuitement →
                    </Link>
                </section>

                {/* What we check */}
                <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40 }}>
                        25+ vérifications automatisées
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {[
                            { title: 'Cookies & Trackers', desc: 'Détecte tous les cookies tiers, Google Analytics, pixels Facebook, et trackers publicitaires.' },
                            { title: 'Bannière de consentement', desc: 'Vérifie la présence, la conformité et les dark patterns de votre bandeau cookies.' },
                            { title: 'Politique de confidentialité', desc: 'Analyse le contenu et la complétude de votre politique de confidentialité.' },
                            { title: 'En-têtes de sécurité', desc: 'HTTPS, HSTS, CSP, X-Frame-Options et autres en-têtes de sécurité essentiels.' },
                            { title: 'Transferts de données', desc: 'Identifie les transferts de données vers les États-Unis et les pays tiers.' },
                            { title: 'Détection IA', desc: 'Vérifie comment votre site interagit avec les crawlers d\'intelligence artificielle.' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
                                <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Regulations */}
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
                        Réglementations vérifiées
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
                        Nous vérifions la conformité aux principales réglementations mondiales
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                        {[
                            { name: 'RGPD', region: 'Europe', color: '#3b82f6' },
                            { name: 'CNIL', region: 'France', color: '#8b5cf6' },
                            { name: 'CCPA', region: 'Californie', color: '#f59e0b' },
                            { name: 'LGPD', region: 'Brésil', color: '#10b981' },
                            { name: 'PIPEDA', region: 'Canada', color: '#ef4444' },
                            { name: 'EAA 2025', region: 'Accessibilité', color: '#06b6d4' },
                            { name: 'TTDSG', region: 'Allemagne', color: '#f97316' },
                            { name: 'nDSG', region: 'Suisse', color: '#ec4899' },
                        ].map((reg, i) => (
                            <div key={i} style={{ background: `${reg.color}15`, border: `1px solid ${reg.color}40`, borderRadius: 8, padding: '10px 16px', textAlign: 'center' }}>
                                <span style={{ color: reg.color, fontWeight: 700, fontSize: 14 }}>{reg.name}</span>
                                <span style={{ color: '#64748b', fontSize: 12, marginLeft: 6 }}>{reg.region}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Country-specific */}
                <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
                        Conformité RGPD par pays
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                        {[
                            { flag: '🇫🇷', name: 'France', slug: 'france' },
                            { flag: '🇩🇪', name: 'Allemagne', slug: 'germany' },
                            { flag: '🇧🇪', name: 'Belgique', slug: 'belgium' },
                            { flag: '🇨🇭', name: 'Suisse', slug: 'switzerland' },
                            { flag: '🇪🇸', name: 'Espagne', slug: 'spain' },
                            { flag: '🇮🇹', name: 'Italie', slug: 'italy' },
                            { flag: '🇳🇱', name: 'Pays-Bas', slug: 'netherlands' },
                            { flag: '🇬🇧', name: 'Royaume-Uni', slug: 'united-kingdom' },
                        ].map((c) => (
                            <Link
                                key={c.slug}
                                href={`/gdpr-compliance/${c.slug}`}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8,
                                    padding: '10px 16px',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{c.flag}</span>
                                <span style={{ color: '#e2e8f0', fontSize: 14 }}>{c.name}</span>
                            </Link>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Link href="/gdpr-compliance" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
                            Voir les 23 pays →
                        </Link>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 60px' }}>
                    <h2 style={{ color: 'white', fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 24 }}>
                        Questions fréquentes
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { q: 'Comment vérifier si mon site est conforme au RGPD ?', a: 'Entrez l\'URL de votre site web dans notre scanner gratuit. En 60 secondes, vous obtiendrez un rapport détaillé couvrant les cookies, la bannière de consentement, la politique de confidentialité, les en-têtes de sécurité et plus de 25 points de vérification.' },
                            { q: 'L\'audit est-il vraiment gratuit ?', a: 'Oui, l\'audit de base est 100% gratuit et ne nécessite aucune inscription. Les plans Pro (à partir de 9€/mois) offrent des fonctionnalités supplémentaires comme le monitoring continu, les rapports PDF exportables et le widget de bannière cookies.' },
                            { q: 'Quelles réglementations vérifiez-vous ?', a: 'Nous vérifions la conformité au RGPD (Europe), CCPA (Californie), LGPD (Brésil), PIPEDA (Canada), l\'EAA 2025 (Accessibilité européenne), et les réglementations locales comme la Loi Informatique et Libertés (France/CNIL), le TTDSG (Allemagne) et le nDSG (Suisse).' },
                            { q: 'Mon site utilise Google Analytics, est-ce conforme ?', a: 'Google Analytics 4 peut être conforme au RGPD si correctement configuré avec le Consent Mode v2, l\'anonymisation d\'IP, et une bannière de consentement valide. Notre scanner détecte automatiquement votre configuration GA4 et identifie les problèmes.' },
                            { q: 'Combien de temps faut-il pour rendre un site conforme ?', a: 'Pour la plupart des sites, les corrections essentielles (bannière cookies, politique de confidentialité) prennent 1 à 3 jours. La conformité complète, incluant les contrats de sous-traitance et le registre des traitements, peut prendre 2 à 4 semaines.' },
                        ].map((item, i) => (
                            <details key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 20 }}>
                                <summary style={{ color: '#e2e8f0', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>{item.q}</summary>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginTop: 12, marginBottom: 0 }}>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px', textAlign: 'center' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', borderRadius: 16, padding: 48 }}>
                        <h2 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>
                            Prêt à vérifier votre conformité ?
                        </h2>
                        <p style={{ color: '#bfdbfe', fontSize: 15, margin: '0 0 24px' }}>
                            Scan gratuit · 60 secondes · 25+ vérifications automatisées
                        </p>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-block',
                                background: 'white',
                                color: '#1e40af',
                                fontWeight: 700,
                                padding: '16px 40px',
                                borderRadius: 10,
                                textDecoration: 'none',
                                fontSize: 16,
                            }}
                        >
                            Lancer l&apos;audit gratuit →
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '32px 0', textAlign: 'center' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
                        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>
                            © 2026 PrivacyChecker. Scanner de conformité RGPD gratuit pour sites web.
                        </p>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/about" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>À propos</Link>
                            <Link href="/privacy" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>Confidentialité</Link>
                            <Link href="/terms" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>CGU</Link>
                            <Link href="/legal" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>Mentions légales</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
