// Site-wide translations for PrivacyChecker.pro
// 8 languages: EN, FR, DE, ES, IT, PT, NL, PL

export type SupportedLanguage = 'en' | 'fr' | 'de' | 'es' | 'it' | 'pt' | 'nl' | 'pl';

export interface SiteTranslation {
    // Header
    pricing: string;
    faq: string;
    dashboard: string;
    signIn: string;
    logout: string;

    // Hero
    heroTitle1: string;
    heroTitle2: string;
    heroSubtitle: string;
    checkNow: string;
    scanning: string;
    urlPlaceholder: string;

    // Scan Progress
    scanInProgress: string;
    scanStatus: string;
    pages: string;
    freeScan: string;
    proScan: string;
    proPlusScan: string;

    // Results
    privacyAuditReport: string;
    executiveSummary: string;
    issuesFound: string;
    checksPassed: string;
    pagesScanned: string;
    downloadPDF: string;
    downloadPDFPro: string;
    scheduleMonthly: string;
    scheduleWeekly: string;
    scheduled: string;

    // Compliance Checks
    complianceChecklist: string;
    clickToView: string;
    httpsEnabled: string;
    cookieConsent: string;
    privacyPolicy: string;
    cookiePolicy: string;
    legalMentions: string;
    dpoContact: string;
    dataDeletion: string;
    optOut: string;
    secureForms: string;
    cookiesDeclared: string;

    // Security
    securityChecks: string;
    sslTls: string;
    emailSecurity: string;
    securityHeaders: string;

    // Risk Assessment
    riskAssessment: string;
    potentialFineRange: string;
    riskLevel: string;
    enforcementProbability: string;
    riskFactors: string;
    recommendation: string;

    // Compliance Drift
    complianceDrift: string;
    privacyImproving: string;
    privacyDeclining: string;
    noSignificantChange: string;
    changesSinceLastScan: string;

    // Security Exposure
    securityExposure: string;
    findingsDetected: string;

    // Vendor Risk
    vendorRiskAssessment: string;
    vendorsDetected: string;

    // Pricing
    pricingTitle: string;
    pricingSubtitle: string;
    free: string;
    pro: string;
    proPlus: string;
    perMonth: string;
    oneTimeScan: string;
    getStarted: string;
    subscribe: string;
    currentPlan: string;
    popular: string;

    // Features
    featuresScan: string;
    featuresPages: string;
    featuresReports: string;
    featuresMonitoring: string;
    featuresAlerts: string;
    featuresBanner: string;
    featuresSupport: string;

    // FAQ
    faqTitle: string;

    // Footer
    footerRights: string;
    privacyPolicyLink: string;
    termsOfService: string;
    contact: string;

    // Misc
    upgradeToProToSee: string;
    upgradeToPro: string;
}

export const siteTranslations: Record<SupportedLanguage, SiteTranslation> = {
    en: {
        // Header
        pricing: "Pricing",
        faq: "FAQ",
        dashboard: "Dashboard",
        signIn: "Sign In",
        logout: "Logout",

        // Hero
        heroTitle1: "Is your website",
        heroTitle2: "privacy compliant?",
        heroSubtitle: "Check your site against GDPR, CCPA, and 50+ global privacy regulations. Avoid fines and build customer trust.",
        checkNow: "Check Now",
        scanning: "Scanning...",
        urlPlaceholder: "Enter your website URL (e.g., https://example.com)",

        // Scan Progress
        scanInProgress: "Scanning in progress...",
        scanStatus: "Analyzing privacy compliance",
        pages: "pages",
        freeScan: "Free scan: up to 20 pages",
        proScan: "Pro scan: up to 200 pages",
        proPlusScan: "Pro+ scan: up to 1,000 pages",

        // Results
        privacyAuditReport: "Privacy Audit Report",
        executiveSummary: "Executive Summary",
        issuesFound: "Issues Found",
        checksPassed: "Checks Passed",
        pagesScanned: "Pages Scanned",
        downloadPDF: "Download Full PDF Report",
        downloadPDFPro: "Download PDF Compliance Report (Pro)",
        scheduleMonthly: "Schedule Monthly Scan",
        scheduleWeekly: "Schedule Weekly Scan",
        scheduled: "Scheduled",

        // Compliance Checks
        complianceChecklist: "Compliance Checklist",
        clickToView: "Click on any failed item to view detailed fix instructions",
        httpsEnabled: "HTTPS Enabled",
        cookieConsent: "Cookie Consent Banner",
        privacyPolicy: "Privacy Policy",
        cookiePolicy: "Cookie Policy",
        legalMentions: "Legal Mentions / Terms",
        dpoContact: "DPO / Privacy Contact",
        dataDeletion: "Data Deletion Option",
        optOut: "Opt-out Mechanism",
        secureForms: "Form Consent Checkbox",
        cookiesDeclared: "Cookies Declared",

        // Security
        securityChecks: "Security Checks",
        sslTls: "SSL/TLS",
        emailSecurity: "Email Security",
        securityHeaders: "Security Headers",

        // Risk Assessment
        riskAssessment: "Risk Assessment - GDPR Fine Estimation",
        potentialFineRange: "Potential GDPR Fine Range",
        riskLevel: "Risk Level",
        enforcementProbability: "Enforcement Probability",
        riskFactors: "Risk Factors Identified",
        recommendation: "Recommendation",

        // Compliance Drift
        complianceDrift: "Compliance Drift Detection",
        privacyImproving: "Privacy Improving",
        privacyDeclining: "Privacy Declining",
        noSignificantChange: "No Significant Change",
        changesSinceLastScan: "change(s) detected since last scan",

        // Security Exposure
        securityExposure: "Security Exposure Analysis",
        findingsDetected: "finding(s) detected",

        // Vendor Risk
        vendorRiskAssessment: "Vendor Risk Assessment",
        vendorsDetected: "third-party vendors detected",

        // Pricing
        pricingTitle: "Simple, Transparent Pricing",
        pricingSubtitle: "Choose the plan that fits your needs",
        free: "Free",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/month",
        oneTimeScan: "One-time scan",
        getStarted: "Get Started",
        subscribe: "Subscribe",
        currentPlan: "Current Plan",
        popular: "Most Popular",

        // Features
        featuresScan: "Privacy compliance scan",
        featuresPages: "pages per scan",
        featuresReports: "PDF reports",
        featuresMonitoring: "monitoring",
        featuresAlerts: "Email alerts",
        featuresBanner: "Cookie banner widget",
        featuresSupport: "Priority support",

        // FAQ
        faqTitle: "Frequently Asked Questions",

        // Footer
        footerRights: "All rights reserved.",
        privacyPolicyLink: "Privacy Policy",
        termsOfService: "Terms of Service",
        contact: "Contact",

        // Misc
        upgradeToProToSee: "Upgrade to Pro to see step-by-step fix instructions",
        upgradeToPro: "Upgrade to Pro",
    },

    fr: {
        // Header
        pricing: "Tarifs",
        faq: "FAQ",
        dashboard: "Tableau de bord",
        signIn: "Connexion",
        logout: "Déconnexion",

        // Hero
        heroTitle1: "Votre site web est-il",
        heroTitle2: "conforme au RGPD ?",
        heroSubtitle: "Vérifiez votre site par rapport au RGPD, CCPA et plus de 50 réglementations mondiales. Évitez les amendes et gagnez la confiance de vos clients.",
        checkNow: "Vérifier",
        scanning: "Analyse...",
        urlPlaceholder: "Entrez l'URL de votre site (ex: https://exemple.com)",

        // Scan Progress
        scanInProgress: "Analyse en cours...",
        scanStatus: "Analyse de la conformité",
        pages: "pages",
        freeScan: "Scan gratuit : jusqu'à 20 pages",
        proScan: "Scan Pro : jusqu'à 200 pages",
        proPlusScan: "Scan Pro+ : jusqu'à 1 000 pages",

        // Results
        privacyAuditReport: "Rapport d'audit de confidentialité",
        executiveSummary: "Résumé exécutif",
        issuesFound: "Problèmes détectés",
        checksPassed: "Vérifications réussies",
        pagesScanned: "Pages analysées",
        downloadPDF: "Télécharger le rapport PDF complet",
        downloadPDFPro: "Télécharger le rapport PDF (Pro)",
        scheduleMonthly: "Planifier un scan mensuel",
        scheduleWeekly: "Planifier un scan hebdomadaire",
        scheduled: "Planifié",

        // Compliance Checks
        complianceChecklist: "Liste de conformité",
        clickToView: "Cliquez sur un élément pour voir les instructions de correction",
        httpsEnabled: "HTTPS activé",
        cookieConsent: "Bannière de consentement cookies",
        privacyPolicy: "Politique de confidentialité",
        cookiePolicy: "Politique des cookies",
        legalMentions: "Mentions légales",
        dpoContact: "Contact DPO",
        dataDeletion: "Option de suppression des données",
        optOut: "Mécanisme d'opt-out",
        secureForms: "Case de consentement formulaires",
        cookiesDeclared: "Cookies déclarés",

        // Security
        securityChecks: "Vérifications de sécurité",
        sslTls: "SSL/TLS",
        emailSecurity: "Sécurité email",
        securityHeaders: "En-têtes de sécurité",

        // Risk Assessment
        riskAssessment: "Évaluation des risques - Estimation d'amende RGPD",
        potentialFineRange: "Fourchette d'amende potentielle",
        riskLevel: "Niveau de risque",
        enforcementProbability: "Probabilité de sanction",
        riskFactors: "Facteurs de risque identifiés",
        recommendation: "Recommandation",

        // Compliance Drift
        complianceDrift: "Détection de dérive de conformité",
        privacyImproving: "Confidentialité en amélioration",
        privacyDeclining: "Confidentialité en déclin",
        noSignificantChange: "Aucun changement significatif",
        changesSinceLastScan: "changement(s) détecté(s) depuis le dernier scan",

        // Security Exposure
        securityExposure: "Analyse d'exposition sécurité",
        findingsDetected: "problème(s) détecté(s)",

        // Vendor Risk
        vendorRiskAssessment: "Évaluation des risques fournisseurs",
        vendorsDetected: "fournisseurs tiers détectés",

        // Pricing
        pricingTitle: "Tarification simple et transparente",
        pricingSubtitle: "Choisissez le plan adapté à vos besoins",
        free: "Gratuit",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/mois",
        oneTimeScan: "Scan unique",
        getStarted: "Commencer",
        subscribe: "S'abonner",
        currentPlan: "Plan actuel",
        popular: "Le plus populaire",

        // Features
        featuresScan: "Scan de conformité",
        featuresPages: "pages par scan",
        featuresReports: "Rapports PDF",
        featuresMonitoring: "surveillance",
        featuresAlerts: "Alertes email",
        featuresBanner: "Widget bannière cookies",
        featuresSupport: "Support prioritaire",

        // FAQ
        faqTitle: "Questions fréquentes",

        // Footer
        footerRights: "Tous droits réservés.",
        privacyPolicyLink: "Politique de confidentialité",
        termsOfService: "Conditions d'utilisation",
        contact: "Contact",

        // Misc
        upgradeToProToSee: "Passez à Pro pour voir les instructions de correction",
        upgradeToPro: "Passer à Pro",
    },

    de: {
        pricing: "Preise",
        faq: "FAQ",
        dashboard: "Dashboard",
        signIn: "Anmelden",
        logout: "Abmelden",
        heroTitle1: "Ist Ihre Website",
        heroTitle2: "datenschutzkonform?",
        heroSubtitle: "Überprüfen Sie Ihre Website auf DSGVO, CCPA und über 50 globale Datenschutzvorschriften. Vermeiden Sie Bußgelder und bauen Sie Kundenvertrauen auf.",
        checkNow: "Jetzt prüfen",
        scanning: "Wird gescannt...",
        urlPlaceholder: "Geben Sie Ihre Website-URL ein (z.B. https://beispiel.de)",
        scanInProgress: "Scan läuft...",
        scanStatus: "Datenschutz-Compliance wird analysiert",
        pages: "Seiten",
        freeScan: "Kostenloser Scan: bis zu 20 Seiten",
        proScan: "Pro-Scan: bis zu 200 Seiten",
        proPlusScan: "Pro+-Scan: bis zu 1.000 Seiten",
        privacyAuditReport: "Datenschutz-Auditbericht",
        executiveSummary: "Zusammenfassung",
        issuesFound: "Probleme gefunden",
        checksPassed: "Prüfungen bestanden",
        pagesScanned: "Seiten gescannt",
        downloadPDF: "Vollständigen PDF-Bericht herunterladen",
        downloadPDFPro: "PDF-Compliance-Bericht herunterladen (Pro)",
        scheduleMonthly: "Monatlichen Scan planen",
        scheduleWeekly: "Wöchentlichen Scan planen",
        scheduled: "Geplant",
        complianceChecklist: "Compliance-Checkliste",
        clickToView: "Klicken Sie auf ein Element für detaillierte Anweisungen",
        httpsEnabled: "HTTPS aktiviert",
        cookieConsent: "Cookie-Zustimmungsbanner",
        privacyPolicy: "Datenschutzerklärung",
        cookiePolicy: "Cookie-Richtlinie",
        legalMentions: "Impressum / AGB",
        dpoContact: "DSB-Kontakt",
        dataDeletion: "Datenlöschung",
        optOut: "Opt-out-Mechanismus",
        secureForms: "Formular-Zustimmung",
        cookiesDeclared: "Cookies deklariert",
        securityChecks: "Sicherheitsprüfungen",
        sslTls: "SSL/TLS",
        emailSecurity: "E-Mail-Sicherheit",
        securityHeaders: "Sicherheits-Header",
        riskAssessment: "Risikobewertung - DSGVO-Bußgeldschätzung",
        potentialFineRange: "Potentielle Bußgeldspanne",
        riskLevel: "Risikoniveau",
        enforcementProbability: "Durchsetzungswahrscheinlichkeit",
        riskFactors: "Identifizierte Risikofaktoren",
        recommendation: "Empfehlung",
        complianceDrift: "Compliance-Drift-Erkennung",
        privacyImproving: "Datenschutz verbessert sich",
        privacyDeclining: "Datenschutz verschlechtert sich",
        noSignificantChange: "Keine signifikante Änderung",
        changesSinceLastScan: "Änderung(en) seit letztem Scan erkannt",
        securityExposure: "Sicherheitsexpositionsanalyse",
        findingsDetected: "Befund(e) erkannt",
        vendorRiskAssessment: "Anbieter-Risikobewertung",
        vendorsDetected: "Drittanbieter erkannt",
        pricingTitle: "Einfache, transparente Preisgestaltung",
        pricingSubtitle: "Wählen Sie den Plan, der zu Ihnen passt",
        free: "Kostenlos",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/Monat",
        oneTimeScan: "Einmaliger Scan",
        getStarted: "Loslegen",
        subscribe: "Abonnieren",
        currentPlan: "Aktueller Plan",
        popular: "Am beliebtesten",
        featuresScan: "Datenschutz-Compliance-Scan",
        featuresPages: "Seiten pro Scan",
        featuresReports: "PDF-Berichte",
        featuresMonitoring: "Überwachung",
        featuresAlerts: "E-Mail-Benachrichtigungen",
        featuresBanner: "Cookie-Banner-Widget",
        featuresSupport: "Prioritärer Support",
        faqTitle: "Häufig gestellte Fragen",
        footerRights: "Alle Rechte vorbehalten.",
        privacyPolicyLink: "Datenschutzerklärung",
        termsOfService: "Nutzungsbedingungen",
        contact: "Kontakt",
        upgradeToProToSee: "Upgrade auf Pro für detaillierte Anweisungen",
        upgradeToPro: "Auf Pro upgraden",
    },

    es: {
        pricing: "Precios",
        faq: "FAQ",
        dashboard: "Panel",
        signIn: "Iniciar sesión",
        logout: "Cerrar sesión",
        heroTitle1: "¿Es su sitio web",
        heroTitle2: "compatible con la privacidad?",
        heroSubtitle: "Verifique su sitio contra GDPR, CCPA y más de 50 regulaciones globales de privacidad. Evite multas y genere confianza.",
        checkNow: "Verificar ahora",
        scanning: "Escaneando...",
        urlPlaceholder: "Ingrese la URL de su sitio (ej: https://ejemplo.com)",
        scanInProgress: "Escaneo en progreso...",
        scanStatus: "Analizando cumplimiento de privacidad",
        pages: "páginas",
        freeScan: "Escaneo gratuito: hasta 20 páginas",
        proScan: "Escaneo Pro: hasta 200 páginas",
        proPlusScan: "Escaneo Pro+: hasta 1,000 páginas",
        privacyAuditReport: "Informe de auditoría de privacidad",
        executiveSummary: "Resumen ejecutivo",
        issuesFound: "Problemas encontrados",
        checksPassed: "Verificaciones aprobadas",
        pagesScanned: "Páginas escaneadas",
        downloadPDF: "Descargar informe PDF completo",
        downloadPDFPro: "Descargar informe PDF (Pro)",
        scheduleMonthly: "Programar escaneo mensual",
        scheduleWeekly: "Programar escaneo semanal",
        scheduled: "Programado",
        complianceChecklist: "Lista de cumplimiento",
        clickToView: "Haga clic en cualquier elemento para ver instrucciones",
        httpsEnabled: "HTTPS habilitado",
        cookieConsent: "Banner de consentimiento de cookies",
        privacyPolicy: "Política de privacidad",
        cookiePolicy: "Política de cookies",
        legalMentions: "Aviso legal",
        dpoContact: "Contacto DPO",
        dataDeletion: "Opción de eliminación de datos",
        optOut: "Mecanismo de exclusión",
        secureForms: "Casilla de consentimiento en formularios",
        cookiesDeclared: "Cookies declaradas",
        securityChecks: "Verificaciones de seguridad",
        sslTls: "SSL/TLS",
        emailSecurity: "Seguridad de email",
        securityHeaders: "Cabeceras de seguridad",
        riskAssessment: "Evaluación de riesgos - Estimación de multa GDPR",
        potentialFineRange: "Rango potencial de multa",
        riskLevel: "Nivel de riesgo",
        enforcementProbability: "Probabilidad de sanción",
        riskFactors: "Factores de riesgo identificados",
        recommendation: "Recomendación",
        complianceDrift: "Detección de deriva de cumplimiento",
        privacyImproving: "Privacidad mejorando",
        privacyDeclining: "Privacidad en declive",
        noSignificantChange: "Sin cambios significativos",
        changesSinceLastScan: "cambio(s) detectado(s) desde el último escaneo",
        securityExposure: "Análisis de exposición de seguridad",
        findingsDetected: "hallazgo(s) detectado(s)",
        vendorRiskAssessment: "Evaluación de riesgos de proveedores",
        vendorsDetected: "proveedores externos detectados",
        pricingTitle: "Precios simples y transparentes",
        pricingSubtitle: "Elija el plan que se adapte a sus necesidades",
        free: "Gratis",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/mes",
        oneTimeScan: "Escaneo único",
        getStarted: "Comenzar",
        subscribe: "Suscribirse",
        currentPlan: "Plan actual",
        popular: "Más popular",
        featuresScan: "Escaneo de cumplimiento de privacidad",
        featuresPages: "páginas por escaneo",
        featuresReports: "Informes PDF",
        featuresMonitoring: "monitoreo",
        featuresAlerts: "Alertas por email",
        featuresBanner: "Widget de banner de cookies",
        featuresSupport: "Soporte prioritario",
        faqTitle: "Preguntas frecuentes",
        footerRights: "Todos los derechos reservados.",
        privacyPolicyLink: "Política de privacidad",
        termsOfService: "Términos de servicio",
        contact: "Contacto",
        upgradeToProToSee: "Actualice a Pro para ver instrucciones detalladas",
        upgradeToPro: "Actualizar a Pro",
    },

    it: {
        pricing: "Prezzi",
        faq: "FAQ",
        dashboard: "Dashboard",
        signIn: "Accedi",
        logout: "Esci",
        heroTitle1: "Il tuo sito web è",
        heroTitle2: "conforme alla privacy?",
        heroSubtitle: "Verifica il tuo sito rispetto a GDPR, CCPA e oltre 50 normative globali sulla privacy. Evita multe e costruisci fiducia.",
        checkNow: "Verifica ora",
        scanning: "Scansione...",
        urlPlaceholder: "Inserisci l'URL del tuo sito (es: https://esempio.it)",
        scanInProgress: "Scansione in corso...",
        scanStatus: "Analisi della conformità alla privacy",
        pages: "pagine",
        freeScan: "Scansione gratuita: fino a 20 pagine",
        proScan: "Scansione Pro: fino a 200 pagine",
        proPlusScan: "Scansione Pro+: fino a 1.000 pagine",
        privacyAuditReport: "Rapporto di audit sulla privacy",
        executiveSummary: "Riepilogo esecutivo",
        issuesFound: "Problemi trovati",
        checksPassed: "Controlli superati",
        pagesScanned: "Pagine scansionate",
        downloadPDF: "Scarica il rapporto PDF completo",
        downloadPDFPro: "Scarica il rapporto PDF (Pro)",
        scheduleMonthly: "Pianifica scansione mensile",
        scheduleWeekly: "Pianifica scansione settimanale",
        scheduled: "Pianificato",
        complianceChecklist: "Lista di conformità",
        clickToView: "Clicca su un elemento per le istruzioni dettagliate",
        httpsEnabled: "HTTPS abilitato",
        cookieConsent: "Banner consenso cookie",
        privacyPolicy: "Informativa sulla privacy",
        cookiePolicy: "Cookie policy",
        legalMentions: "Note legali",
        dpoContact: "Contatto DPO",
        dataDeletion: "Opzione eliminazione dati",
        optOut: "Meccanismo di opt-out",
        secureForms: "Checkbox consenso moduli",
        cookiesDeclared: "Cookie dichiarati",
        securityChecks: "Controlli di sicurezza",
        sslTls: "SSL/TLS",
        emailSecurity: "Sicurezza email",
        securityHeaders: "Header di sicurezza",
        riskAssessment: "Valutazione rischi - Stima multa GDPR",
        potentialFineRange: "Range potenziale di multa",
        riskLevel: "Livello di rischio",
        enforcementProbability: "Probabilità di sanzione",
        riskFactors: "Fattori di rischio identificati",
        recommendation: "Raccomandazione",
        complianceDrift: "Rilevamento deriva di conformità",
        privacyImproving: "Privacy in miglioramento",
        privacyDeclining: "Privacy in declino",
        noSignificantChange: "Nessun cambiamento significativo",
        changesSinceLastScan: "modifica/e rilevata/e dall'ultima scansione",
        securityExposure: "Analisi esposizione sicurezza",
        findingsDetected: "problema/i rilevato/i",
        vendorRiskAssessment: "Valutazione rischi fornitori",
        vendorsDetected: "fornitori terzi rilevati",
        pricingTitle: "Prezzi semplici e trasparenti",
        pricingSubtitle: "Scegli il piano adatto alle tue esigenze",
        free: "Gratuito",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/mese",
        oneTimeScan: "Scansione singola",
        getStarted: "Inizia",
        subscribe: "Abbonati",
        currentPlan: "Piano attuale",
        popular: "Più popolare",
        featuresScan: "Scansione conformità privacy",
        featuresPages: "pagine per scansione",
        featuresReports: "Report PDF",
        featuresMonitoring: "monitoraggio",
        featuresAlerts: "Avvisi email",
        featuresBanner: "Widget banner cookie",
        featuresSupport: "Supporto prioritario",
        faqTitle: "Domande frequenti",
        footerRights: "Tutti i diritti riservati.",
        privacyPolicyLink: "Informativa sulla privacy",
        termsOfService: "Termini di servizio",
        contact: "Contatti",
        upgradeToProToSee: "Passa a Pro per le istruzioni dettagliate",
        upgradeToPro: "Passa a Pro",
    },

    pt: {
        pricing: "Preços",
        faq: "FAQ",
        dashboard: "Painel",
        signIn: "Entrar",
        logout: "Sair",
        heroTitle1: "O seu site é",
        heroTitle2: "compatível com a privacidade?",
        heroSubtitle: "Verifique o seu site em relação ao RGPD, CCPA e mais de 50 regulamentos globais de privacidade. Evite multas e construa confiança.",
        checkNow: "Verificar agora",
        scanning: "A analisar...",
        urlPlaceholder: "Introduza o URL do seu site (ex: https://exemplo.pt)",
        scanInProgress: "Análise em curso...",
        scanStatus: "A analisar conformidade de privacidade",
        pages: "páginas",
        freeScan: "Análise gratuita: até 20 páginas",
        proScan: "Análise Pro: até 200 páginas",
        proPlusScan: "Análise Pro+: até 1.000 páginas",
        privacyAuditReport: "Relatório de auditoria de privacidade",
        executiveSummary: "Resumo executivo",
        issuesFound: "Problemas encontrados",
        checksPassed: "Verificações aprovadas",
        pagesScanned: "Páginas analisadas",
        downloadPDF: "Descarregar relatório PDF completo",
        downloadPDFPro: "Descarregar relatório PDF (Pro)",
        scheduleMonthly: "Agendar análise mensal",
        scheduleWeekly: "Agendar análise semanal",
        scheduled: "Agendado",
        complianceChecklist: "Lista de conformidade",
        clickToView: "Clique num item para ver instruções detalhadas",
        httpsEnabled: "HTTPS ativado",
        cookieConsent: "Banner de consentimento de cookies",
        privacyPolicy: "Política de privacidade",
        cookiePolicy: "Política de cookies",
        legalMentions: "Avisos legais",
        dpoContact: "Contacto DPO",
        dataDeletion: "Opção de eliminação de dados",
        optOut: "Mecanismo de opt-out",
        secureForms: "Caixa de consentimento em formulários",
        cookiesDeclared: "Cookies declarados",
        securityChecks: "Verificações de segurança",
        sslTls: "SSL/TLS",
        emailSecurity: "Segurança de email",
        securityHeaders: "Cabeçalhos de segurança",
        riskAssessment: "Avaliação de riscos - Estimativa de multa RGPD",
        potentialFineRange: "Intervalo potencial de multa",
        riskLevel: "Nível de risco",
        enforcementProbability: "Probabilidade de sanção",
        riskFactors: "Fatores de risco identificados",
        recommendation: "Recomendação",
        complianceDrift: "Deteção de desvio de conformidade",
        privacyImproving: "Privacidade a melhorar",
        privacyDeclining: "Privacidade em declínio",
        noSignificantChange: "Sem alterações significativas",
        changesSinceLastScan: "alteração(ões) detetada(s) desde a última análise",
        securityExposure: "Análise de exposição de segurança",
        findingsDetected: "problema(s) detetado(s)",
        vendorRiskAssessment: "Avaliação de riscos de fornecedores",
        vendorsDetected: "fornecedores terceiros detetados",
        pricingTitle: "Preços simples e transparentes",
        pricingSubtitle: "Escolha o plano adequado às suas necessidades",
        free: "Gratuito",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/mês",
        oneTimeScan: "Análise única",
        getStarted: "Começar",
        subscribe: "Subscrever",
        currentPlan: "Plano atual",
        popular: "Mais popular",
        featuresScan: "Análise de conformidade de privacidade",
        featuresPages: "páginas por análise",
        featuresReports: "Relatórios PDF",
        featuresMonitoring: "monitorização",
        featuresAlerts: "Alertas por email",
        featuresBanner: "Widget de banner de cookies",
        featuresSupport: "Suporte prioritário",
        faqTitle: "Perguntas frequentes",
        footerRights: "Todos os direitos reservados.",
        privacyPolicyLink: "Política de privacidade",
        termsOfService: "Termos de serviço",
        contact: "Contacto",
        upgradeToProToSee: "Atualize para Pro para ver instruções detalhadas",
        upgradeToPro: "Atualizar para Pro",
    },

    nl: {
        pricing: "Prijzen",
        faq: "FAQ",
        dashboard: "Dashboard",
        signIn: "Inloggen",
        logout: "Uitloggen",
        heroTitle1: "Is uw website",
        heroTitle2: "privacy-conform?",
        heroSubtitle: "Controleer uw site op AVG, CCPA en meer dan 50 wereldwijde privacyregels. Vermijd boetes en bouw vertrouwen op.",
        checkNow: "Nu controleren",
        scanning: "Scannen...",
        urlPlaceholder: "Voer uw website-URL in (bijv. https://voorbeeld.nl)",
        scanInProgress: "Scan bezig...",
        scanStatus: "Privacy-compliance analyseren",
        pages: "pagina's",
        freeScan: "Gratis scan: tot 20 pagina's",
        proScan: "Pro-scan: tot 200 pagina's",
        proPlusScan: "Pro+-scan: tot 1.000 pagina's",
        privacyAuditReport: "Privacy-auditrapport",
        executiveSummary: "Samenvatting",
        issuesFound: "Problemen gevonden",
        checksPassed: "Controles geslaagd",
        pagesScanned: "Pagina's gescand",
        downloadPDF: "Volledig PDF-rapport downloaden",
        downloadPDFPro: "PDF-rapport downloaden (Pro)",
        scheduleMonthly: "Maandelijkse scan plannen",
        scheduleWeekly: "Wekelijkse scan plannen",
        scheduled: "Gepland",
        complianceChecklist: "Compliance-checklist",
        clickToView: "Klik op een item voor gedetailleerde instructies",
        httpsEnabled: "HTTPS ingeschakeld",
        cookieConsent: "Cookietoestemmingsbanner",
        privacyPolicy: "Privacybeleid",
        cookiePolicy: "Cookiebeleid",
        legalMentions: "Juridische vermeldingen",
        dpoContact: "FG-contact",
        dataDeletion: "Optie gegevensverwijdering",
        optOut: "Opt-out-mechanisme",
        secureForms: "Toestemmingsvakje formulieren",
        cookiesDeclared: "Cookies gedeclareerd",
        securityChecks: "Beveiligingscontroles",
        sslTls: "SSL/TLS",
        emailSecurity: "E-mailbeveiliging",
        securityHeaders: "Beveiligingsheaders",
        riskAssessment: "Risicobeoordeling - AVG-boeteschatting",
        potentialFineRange: "Potentieel boetebereik",
        riskLevel: "Risiconiveau",
        enforcementProbability: "Handhavingswaarschijnlijkheid",
        riskFactors: "Geïdentificeerde risicofactoren",
        recommendation: "Aanbeveling",
        complianceDrift: "Compliance-drift detectie",
        privacyImproving: "Privacy verbetert",
        privacyDeclining: "Privacy verslechtert",
        noSignificantChange: "Geen significante wijziging",
        changesSinceLastScan: "wijziging(en) gedetecteerd sinds laatste scan",
        securityExposure: "Analyse beveiligingsblootstelling",
        findingsDetected: "bevinding(en) gedetecteerd",
        vendorRiskAssessment: "Leveranciersrisicobeoordeling",
        vendorsDetected: "externe leveranciers gedetecteerd",
        pricingTitle: "Eenvoudige, transparante prijzen",
        pricingSubtitle: "Kies het plan dat bij u past",
        free: "Gratis",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/maand",
        oneTimeScan: "Eenmalige scan",
        getStarted: "Aan de slag",
        subscribe: "Abonneren",
        currentPlan: "Huidig plan",
        popular: "Meest populair",
        featuresScan: "Privacy-compliance scan",
        featuresPages: "pagina's per scan",
        featuresReports: "PDF-rapporten",
        featuresMonitoring: "monitoring",
        featuresAlerts: "E-mailmeldingen",
        featuresBanner: "Cookie-banner widget",
        featuresSupport: "Prioriteitsondersteuning",
        faqTitle: "Veelgestelde vragen",
        footerRights: "Alle rechten voorbehouden.",
        privacyPolicyLink: "Privacybeleid",
        termsOfService: "Servicevoorwaarden",
        contact: "Contact",
        upgradeToProToSee: "Upgrade naar Pro voor gedetailleerde instructies",
        upgradeToPro: "Upgraden naar Pro",
    },

    pl: {
        pricing: "Cennik",
        faq: "FAQ",
        dashboard: "Panel",
        signIn: "Zaloguj się",
        logout: "Wyloguj",
        heroTitle1: "Czy Twoja strona jest",
        heroTitle2: "zgodna z przepisami o prywatności?",
        heroSubtitle: "Sprawdź swoją stronę pod kątem RODO, CCPA i ponad 50 globalnych przepisów o ochronie prywatności. Unikaj kar i buduj zaufanie.",
        checkNow: "Sprawdź teraz",
        scanning: "Skanowanie...",
        urlPlaceholder: "Wprowadź adres URL swojej strony (np. https://przyklad.pl)",
        scanInProgress: "Skanowanie w toku...",
        scanStatus: "Analizowanie zgodności z przepisami o prywatności",
        pages: "stron",
        freeScan: "Bezpłatne skanowanie: do 20 stron",
        proScan: "Skanowanie Pro: do 200 stron",
        proPlusScan: "Skanowanie Pro+: do 1000 stron",
        privacyAuditReport: "Raport z audytu prywatności",
        executiveSummary: "Podsumowanie",
        issuesFound: "Wykryte problemy",
        checksPassed: "Zaliczone kontrole",
        pagesScanned: "Przeskanowane strony",
        downloadPDF: "Pobierz pełny raport PDF",
        downloadPDFPro: "Pobierz raport PDF (Pro)",
        scheduleMonthly: "Zaplanuj miesięczne skanowanie",
        scheduleWeekly: "Zaplanuj tygodniowe skanowanie",
        scheduled: "Zaplanowane",
        complianceChecklist: "Lista kontrolna zgodności",
        clickToView: "Kliknij element, aby zobaczyć szczegółowe instrukcje",
        httpsEnabled: "HTTPS włączony",
        cookieConsent: "Baner zgody na pliki cookie",
        privacyPolicy: "Polityka prywatności",
        cookiePolicy: "Polityka plików cookie",
        legalMentions: "Informacje prawne",
        dpoContact: "Kontakt z IOD",
        dataDeletion: "Opcja usunięcia danych",
        optOut: "Mechanizm rezygnacji",
        secureForms: "Pole zgody w formularzach",
        cookiesDeclared: "Zadeklarowane pliki cookie",
        securityChecks: "Kontrole bezpieczeństwa",
        sslTls: "SSL/TLS",
        emailSecurity: "Bezpieczeństwo e-mail",
        securityHeaders: "Nagłówki bezpieczeństwa",
        riskAssessment: "Ocena ryzyka - Szacowanie kary RODO",
        potentialFineRange: "Potencjalny zakres kary",
        riskLevel: "Poziom ryzyka",
        enforcementProbability: "Prawdopodobieństwo egzekwowania",
        riskFactors: "Zidentyfikowane czynniki ryzyka",
        recommendation: "Rekomendacja",
        complianceDrift: "Wykrywanie dryftu zgodności",
        privacyImproving: "Prywatność się poprawia",
        privacyDeclining: "Prywatność się pogarsza",
        noSignificantChange: "Brak istotnych zmian",
        changesSinceLastScan: "zmiana(y) wykryta(e) od ostatniego skanowania",
        securityExposure: "Analiza ekspozycji bezpieczeństwa",
        findingsDetected: "wykryte problemy",
        vendorRiskAssessment: "Ocena ryzyka dostawców",
        vendorsDetected: "wykrytych dostawców zewnętrznych",
        pricingTitle: "Proste, przejrzyste ceny",
        pricingSubtitle: "Wybierz plan dopasowany do Twoich potrzeb",
        free: "Bezpłatny",
        pro: "Pro",
        proPlus: "Pro+",
        perMonth: "/miesiąc",
        oneTimeScan: "Jednorazowe skanowanie",
        getStarted: "Rozpocznij",
        subscribe: "Subskrybuj",
        currentPlan: "Obecny plan",
        popular: "Najpopularniejszy",
        featuresScan: "Skanowanie zgodności prywatności",
        featuresPages: "stron na skanowanie",
        featuresReports: "Raporty PDF",
        featuresMonitoring: "monitoring",
        featuresAlerts: "Powiadomienia e-mail",
        featuresBanner: "Widget banera cookie",
        featuresSupport: "Priorytetowe wsparcie",
        faqTitle: "Często zadawane pytania",
        footerRights: "Wszelkie prawa zastrzeżone.",
        privacyPolicyLink: "Polityka prywatności",
        termsOfService: "Regulamin",
        contact: "Kontakt",
        upgradeToProToSee: "Przejdź na Pro, aby zobaczyć szczegółowe instrukcje",
        upgradeToPro: "Przejdź na Pro",
    },
};
