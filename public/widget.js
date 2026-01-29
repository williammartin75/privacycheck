/**
 * PrivacyChecker.pro Cookie Banner Widget v2.0
 * A GDPR-compliant cookie consent banner with:
 * - Google Consent Mode v2 support
 * - Multi-language auto-detection (16 languages)
 * - Cookie/Script auto-blocking before consent
 * 
 * Usage: <script src="https://privacychecker.pro/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 */
(function () {
    'use strict';

    const CONSENT_KEY = 'pc_consent';
    const API_BASE = 'https://privacychecker.pro';

    // ==========================================
    // TRANSLATIONS (16 languages)
    // ==========================================
    const translations = {
        en: {
            bannerTitle: "We use cookies",
            bannerText: "We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.",
            acceptAll: "Accept All",
            rejectAll: "Reject All",
            preferences: "Preferences",
            savePreferences: "Save Preferences",
            privacyPolicy: "Privacy Policy",
            necessary: "Necessary",
            necessaryDesc: "Required for the website to function properly.",
            analytics: "Analytics",
            analyticsDesc: "Help us understand how visitors interact with our website.",
            marketing: "Marketing",
            marketingDesc: "Used to deliver personalized advertisements.",
            functional: "Functional",
            functionalDesc: "Enable enhanced functionality and personalization."
        },
        fr: {
            bannerTitle: "Nous utilisons des cookies",
            bannerText: "Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.",
            acceptAll: "Tout accepter",
            rejectAll: "Tout refuser",
            preferences: "Préférences",
            savePreferences: "Enregistrer",
            privacyPolicy: "Politique de confidentialité",
            necessary: "Nécessaires",
            necessaryDesc: "Requis pour le bon fonctionnement du site.",
            analytics: "Analytiques",
            analyticsDesc: "Nous aident à comprendre comment les visiteurs utilisent notre site.",
            marketing: "Marketing",
            marketingDesc: "Utilisés pour afficher des publicités personnalisées.",
            functional: "Fonctionnels",
            functionalDesc: "Permettent des fonctionnalités améliorées et la personnalisation."
        },
        de: {
            bannerTitle: "Wir verwenden Cookies",
            bannerText: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.",
            acceptAll: "Alle akzeptieren",
            rejectAll: "Alle ablehnen",
            preferences: "Einstellungen",
            savePreferences: "Speichern",
            privacyPolicy: "Datenschutzrichtlinie",
            necessary: "Notwendig",
            necessaryDesc: "Erforderlich für die ordnungsgemäße Funktion der Website.",
            analytics: "Analyse",
            analyticsDesc: "Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.",
            marketing: "Marketing",
            marketingDesc: "Werden verwendet, um personalisierte Werbung zu liefern.",
            functional: "Funktional",
            functionalDesc: "Ermöglichen erweiterte Funktionalität und Personalisierung."
        },
        es: {
            bannerTitle: "Usamos cookies",
            bannerText: "Utilizamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.",
            acceptAll: "Aceptar todo",
            rejectAll: "Rechazar todo",
            preferences: "Preferencias",
            savePreferences: "Guardar",
            privacyPolicy: "Política de privacidad",
            necessary: "Necesarias",
            necessaryDesc: "Requeridas para el correcto funcionamiento del sitio.",
            analytics: "Analíticas",
            analyticsDesc: "Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.",
            marketing: "Marketing",
            marketingDesc: "Se utilizan para mostrar anuncios personalizados.",
            functional: "Funcionales",
            functionalDesc: "Permiten funcionalidad mejorada y personalización."
        },
        it: {
            bannerTitle: "Utilizziamo i cookie",
            bannerText: "Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito accetti l'utilizzo dei cookie.",
            acceptAll: "Accetta tutto",
            rejectAll: "Rifiuta tutto",
            preferences: "Preferenze",
            savePreferences: "Salva",
            privacyPolicy: "Informativa sulla privacy",
            necessary: "Necessari",
            necessaryDesc: "Richiesti per il corretto funzionamento del sito.",
            analytics: "Analitici",
            analyticsDesc: "Ci aiutano a capire come i visitatori interagiscono con il nostro sito.",
            marketing: "Marketing",
            marketingDesc: "Utilizzati per mostrare annunci personalizzati.",
            functional: "Funzionali",
            functionalDesc: "Abilitano funzionalità avanzate e personalizzazione."
        },
        pt: {
            bannerTitle: "Usamos cookies",
            bannerText: "Utilizamos cookies para melhorar a sua experiência. Ao continuar a visitar este site, concorda com a nossa utilização de cookies.",
            acceptAll: "Aceitar tudo",
            rejectAll: "Rejeitar tudo",
            preferences: "Preferências",
            savePreferences: "Guardar",
            privacyPolicy: "Política de privacidade",
            necessary: "Necessários",
            necessaryDesc: "Necessários para o funcionamento correto do site.",
            analytics: "Analíticos",
            analyticsDesc: "Ajudam-nos a compreender como os visitantes interagem com o nosso site.",
            marketing: "Marketing",
            marketingDesc: "Utilizados para apresentar anúncios personalizados.",
            functional: "Funcionais",
            functionalDesc: "Permitem funcionalidades melhoradas e personalização."
        },
        nl: {
            bannerTitle: "Wij gebruiken cookies",
            bannerText: "Wij gebruiken cookies om uw ervaring te verbeteren. Door deze site te blijven bezoeken, gaat u akkoord met ons gebruik van cookies.",
            acceptAll: "Alles accepteren",
            rejectAll: "Alles weigeren",
            preferences: "Voorkeuren",
            savePreferences: "Opslaan",
            privacyPolicy: "Privacybeleid",
            necessary: "Noodzakelijk",
            necessaryDesc: "Vereist voor de goede werking van de website.",
            analytics: "Analytisch",
            analyticsDesc: "Helpen ons te begrijpen hoe bezoekers onze website gebruiken.",
            marketing: "Marketing",
            marketingDesc: "Worden gebruikt om gepersonaliseerde advertenties te tonen.",
            functional: "Functioneel",
            functionalDesc: "Maken verbeterde functionaliteit en personalisatie mogelijk."
        },
        pl: {
            bannerTitle: "Używamy plików cookie",
            bannerText: "Używamy plików cookie, aby poprawić Twoje wrażenia. Kontynuując wizytę na tej stronie, zgadzasz się na używanie przez nas plików cookie.",
            acceptAll: "Zaakceptuj wszystko",
            rejectAll: "Odrzuć wszystko",
            preferences: "Preferencje",
            savePreferences: "Zapisz",
            privacyPolicy: "Polityka prywatności",
            necessary: "Niezbędne",
            necessaryDesc: "Wymagane do prawidłowego działania strony.",
            analytics: "Analityczne",
            analyticsDesc: "Pomagają nam zrozumieć, jak odwiedzający korzystają z naszej strony.",
            marketing: "Marketingowe",
            marketingDesc: "Używane do wyświetlania spersonalizowanych reklam.",
            functional: "Funkcjonalne",
            functionalDesc: "Umożliwiają ulepszone funkcje i personalizację."
        },
        ro: {
            bannerTitle: "Folosim cookie-uri",
            bannerText: "Folosim cookie-uri pentru a îmbunătăți experiența dvs. Continuând să vizitați acest site, sunteți de acord cu utilizarea cookie-urilor.",
            acceptAll: "Acceptă tot",
            rejectAll: "Refuză tot",
            preferences: "Preferințe",
            savePreferences: "Salvează",
            privacyPolicy: "Politica de confidențialitate",
            necessary: "Necesare",
            necessaryDesc: "Necesare pentru funcționarea corectă a site-ului.",
            analytics: "Analitice",
            analyticsDesc: "Ne ajută să înțelegem cum interacționează vizitatorii cu site-ul nostru.",
            marketing: "Marketing",
            marketingDesc: "Folosite pentru a afișa reclame personalizate.",
            functional: "Funcționale",
            functionalDesc: "Permit funcționalități îmbunătățite și personalizare."
        },
        cs: {
            bannerTitle: "Používáme cookies",
            bannerText: "Používáme cookies ke zlepšení vašeho zážitku. Pokračováním v návštěvě tohoto webu souhlasíte s používáním cookies.",
            acceptAll: "Přijmout vše",
            rejectAll: "Odmítnout vše",
            preferences: "Předvolby",
            savePreferences: "Uložit",
            privacyPolicy: "Zásady ochrany osobních údajů",
            necessary: "Nezbytné",
            necessaryDesc: "Vyžadováno pro správné fungování webu.",
            analytics: "Analytické",
            analyticsDesc: "Pomáhají nám pochopit, jak návštěvníci interagují s naším webem.",
            marketing: "Marketingové",
            marketingDesc: "Používají se k zobrazení personalizovaných reklam.",
            functional: "Funkční",
            functionalDesc: "Umožňují rozšířené funkce a personalizaci."
        },
        hu: {
            bannerTitle: "Cookie-kat használunk",
            bannerText: "Cookie-kat használunk az élmény javítására. Az oldal további használatával elfogadja a cookie-k használatát.",
            acceptAll: "Összes elfogadása",
            rejectAll: "Összes elutasítása",
            preferences: "Beállítások",
            savePreferences: "Mentés",
            privacyPolicy: "Adatvédelmi irányelvek",
            necessary: "Szükséges",
            necessaryDesc: "A weboldal megfelelő működéséhez szükséges.",
            analytics: "Analitikai",
            analyticsDesc: "Segítenek megérteni, hogyan használják a látogatók weboldalunkat.",
            marketing: "Marketing",
            marketingDesc: "Személyre szabott hirdetések megjelenítésére szolgálnak.",
            functional: "Funkcionális",
            functionalDesc: "Továbbfejlesztett funkciókat és testreszabást tesznek lehetővé."
        },
        el: {
            bannerTitle: "Χρησιμοποιούμε cookies",
            bannerText: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας. Συνεχίζοντας να επισκέπτεστε αυτόν τον ιστότοπο, συμφωνείτε με τη χρήση cookies.",
            acceptAll: "Αποδοχή όλων",
            rejectAll: "Απόρριψη όλων",
            preferences: "Προτιμήσεις",
            savePreferences: "Αποθήκευση",
            privacyPolicy: "Πολιτική απορρήτου",
            necessary: "Απαραίτητα",
            necessaryDesc: "Απαιτούνται για τη σωστή λειτουργία του ιστότοπου.",
            analytics: "Αναλυτικά",
            analyticsDesc: "Μας βοηθούν να κατανοήσουμε πώς οι επισκέπτες αλληλεπιδρούν με τον ιστότοπό μας.",
            marketing: "Marketing",
            marketingDesc: "Χρησιμοποιούνται για την προβολή εξατομικευμένων διαφημίσεων.",
            functional: "Λειτουργικά",
            functionalDesc: "Ενεργοποιούν βελτιωμένη λειτουργικότητα και εξατομίκευση."
        },
        sv: {
            bannerTitle: "Vi använder cookies",
            bannerText: "Vi använder cookies för att förbättra din upplevelse. Genom att fortsätta besöka denna webbplats godkänner du vår användning av cookies.",
            acceptAll: "Acceptera alla",
            rejectAll: "Avvisa alla",
            preferences: "Inställningar",
            savePreferences: "Spara",
            privacyPolicy: "Integritetspolicy",
            necessary: "Nödvändiga",
            necessaryDesc: "Krävs för att webbplatsen ska fungera korrekt.",
            analytics: "Analytiska",
            analyticsDesc: "Hjälper oss att förstå hur besökare interagerar med vår webbplats.",
            marketing: "Marknadsföring",
            marketingDesc: "Används för att visa personliga annonser.",
            functional: "Funktionella",
            functionalDesc: "Möjliggör förbättrad funktionalitet och anpassning."
        },
        da: {
            bannerTitle: "Vi bruger cookies",
            bannerText: "Vi bruger cookies for at forbedre din oplevelse. Ved at fortsætte med at besøge dette websted accepterer du vores brug af cookies.",
            acceptAll: "Accepter alle",
            rejectAll: "Afvis alle",
            preferences: "Præferencer",
            savePreferences: "Gem",
            privacyPolicy: "Privatlivspolitik",
            necessary: "Nødvendige",
            necessaryDesc: "Påkrævet for at webstedet fungerer korrekt.",
            analytics: "Analytiske",
            analyticsDesc: "Hjælper os med at forstå, hvordan besøgende interagerer med vores websted.",
            marketing: "Marketing",
            marketingDesc: "Bruges til at vise personlige annoncer.",
            functional: "Funktionelle",
            functionalDesc: "Muliggør forbedret funktionalitet og personalisering."
        },
        fi: {
            bannerTitle: "Käytämme evästeitä",
            bannerText: "Käytämme evästeitä parantaaksemme kokemustasi. Jatkamalla tämän sivuston käyttöä hyväksyt evästeiden käytön.",
            acceptAll: "Hyväksy kaikki",
            rejectAll: "Hylkää kaikki",
            preferences: "Asetukset",
            savePreferences: "Tallenna",
            privacyPolicy: "Tietosuojakäytäntö",
            necessary: "Välttämättömät",
            necessaryDesc: "Vaaditaan sivuston asianmukaisen toiminnan varmistamiseksi.",
            analytics: "Analytiikka",
            analyticsDesc: "Auttavat meitä ymmärtämään, miten kävijät käyttävät sivustoamme.",
            marketing: "Markkinointi",
            marketingDesc: "Käytetään henkilökohtaisten mainosten näyttämiseen.",
            functional: "Toiminnalliset",
            functionalDesc: "Mahdollistavat parannetut toiminnot ja mukauttamisen."
        },
        no: {
            bannerTitle: "Vi bruker informasjonskapsler",
            bannerText: "Vi bruker informasjonskapsler for å forbedre opplevelsen din. Ved å fortsette å besøke dette nettstedet godtar du bruken av informasjonskapsler.",
            acceptAll: "Godta alle",
            rejectAll: "Avvis alle",
            preferences: "Innstillinger",
            savePreferences: "Lagre",
            privacyPolicy: "Personvernerklæring",
            necessary: "Nødvendige",
            necessaryDesc: "Påkrevd for at nettstedet skal fungere riktig.",
            analytics: "Analytiske",
            analyticsDesc: "Hjelper oss å forstå hvordan besøkende samhandler med nettstedet vårt.",
            marketing: "Markedsføring",
            marketingDesc: "Brukes til å vise personlige annonser.",
            functional: "Funksjonelle",
            functionalDesc: "Muliggjør forbedret funksjonalitet og tilpasning."
        }
    };

    // ==========================================
    // SCRIPT BLOCKING (Strict Mode)
    // ==========================================
    const BLOCKED_DOMAINS = [
        // Google Analytics & Tag Manager
        'google-analytics.com', 'googletagmanager.com', 'analytics.google.com',
        'googlesyndication.com', 'googleadservices.com', 'doubleclick.net',
        // Facebook
        'connect.facebook.net', 'facebook.com/tr', 'fbcdn.net',
        // LinkedIn
        'snap.licdn.com', 'linkedin.com/px', 'ads.linkedin.com',
        // Twitter/X
        'platform.twitter.com', 'ads-twitter.com', 'analytics.twitter.com',
        // TikTok
        'analytics.tiktok.com', 'tiktok.com/i18n',
        // Microsoft/Bing
        'clarity.ms', 'bat.bing.com',
        // Hotjar
        'hotjar.com', 'static.hotjar.com',
        // Mixpanel
        'mixpanel.com', 'cdn.mxpnl.com',
        // Amplitude
        'amplitude.com', 'cdn.amplitude.com',
        // Segment
        'segment.com', 'cdn.segment.com',
        // Hubspot
        'hubspot.com', 'hs-analytics.net', 'hsforms.com',
        // Intercom
        'intercom.io', 'widget.intercom.io',
        // Drift
        'drift.com', 'js.driftt.com',
        // Crisp
        'crisp.chat',
        // Pinterest
        'pinimg.com', 'pinterest.com/ct.html',
        // Snapchat
        'sc-static.net',
        // Yahoo
        'analytics.yahoo.com',
        // Heap
        'heapanalytics.com',
        // Fullstory
        'fullstory.com',
        // Mouseflow
        'mouseflow.com',
        // Lucky Orange
        'luckyorange.com',
        // Crazy Egg
        'crazyegg.com'
    ];

    const blockedScripts = [];
    let consentGiven = false;

    // Block scripts before they load
    function shouldBlockScript(src) {
        if (!src || consentGiven) return false;
        const srcLower = src.toLowerCase();
        return BLOCKED_DOMAINS.some(domain => srcLower.includes(domain));
    }

    // Override appendChild to intercept script injection
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function (child) {
        if (child.tagName === 'SCRIPT' && shouldBlockScript(child.src)) {
            console.log('[PrivacyChecker] Blocked script:', child.src);
            blockedScripts.push({
                src: child.src,
                async: child.async,
                defer: child.defer,
                type: child.type
            });
            return child; // Return without appending
        }
        return originalAppendChild.call(this, child);
    };

    // Override insertBefore as well
    const originalInsertBefore = Element.prototype.insertBefore;
    Element.prototype.insertBefore = function (newNode, referenceNode) {
        if (newNode.tagName === 'SCRIPT' && shouldBlockScript(newNode.src)) {
            console.log('[PrivacyChecker] Blocked script:', newNode.src);
            blockedScripts.push({
                src: newNode.src,
                async: newNode.async,
                defer: newNode.defer,
                type: newNode.type
            });
            return newNode;
        }
        return originalInsertBefore.call(this, newNode, referenceNode);
    };

    // MutationObserver to catch inline scripts
    const observer = new MutationObserver((mutations) => {
        if (consentGiven) return;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'SCRIPT' && shouldBlockScript(node.src)) {
                    node.remove();
                    console.log('[PrivacyChecker] Removed script:', node.src);
                    blockedScripts.push({
                        src: node.src,
                        async: node.async,
                        defer: node.defer,
                        type: node.type
                    });
                }
            });
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // ==========================================
    // LANGUAGE DETECTION
    // ==========================================
    function detectLanguage() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        const shortLang = lang.substring(0, 2).toLowerCase();
        return translations[shortLang] ? shortLang : 'en';
    }

    // ==========================================
    // MAIN WIDGET LOGIC
    // ==========================================
    const scriptTag = document.currentScript || document.querySelector('script[data-widget-id]');
    const widgetId = scriptTag?.getAttribute('data-widget-id');

    if (!widgetId) {
        console.error('[PrivacyChecker] Missing data-widget-id attribute');
        return;
    }

    // Google Consent Mode v2: Set default consent state (denied until user consents)
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted',
        'wait_for_update': 500
    });

    // Check if consent already given
    const existingConsent = localStorage.getItem(CONSENT_KEY);
    if (existingConsent) {
        try {
            const consent = JSON.parse(existingConsent);
            applyConsent(consent);
            return;
        } catch (e) {
            localStorage.removeItem(CONSENT_KEY);
        }
    }

    // Fetch widget config and show banner
    fetch(`${API_BASE}/api/widget/config?id=${widgetId}`)
        .then(res => res.json())
        .then(config => {
            if (config.error) {
                console.error('[PrivacyChecker]', config.error);
                return;
            }
            showBanner(config);
        })
        .catch(err => console.error('[PrivacyChecker] Failed to load config:', err));

    function showBanner(config) {
        const colors = config.colors || {};
        const categories = config.categories || [];
        const lang = detectLanguage();
        const t = translations[lang];

        // Use config text if provided, otherwise use translations
        const bannerTitle = config.banner_title || t.bannerTitle;
        const bannerText = config.banner_text || t.bannerText;
        const acceptText = config.accept_text || t.acceptAll;
        const rejectText = config.reject_text || t.rejectAll;
        const prefsText = config.preferences_text || t.preferences;
        const saveText = config.save_preferences_text || t.savePreferences;

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
            #pc-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: ${colors.background || '#1a1a2e'};
                color: ${colors.text || '#ffffff'};
                padding: 20px;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #pc-banner * { box-sizing: border-box; }
            #pc-banner-inner {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 20px;
            }
            #pc-banner-content { flex: 1; min-width: 300px; }
            #pc-banner-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
            }
            #pc-banner-text {
                font-size: 14px;
                line-height: 1.5;
                opacity: 0.9;
            }
            #pc-banner-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .pc-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s, transform 0.2s;
            }
            .pc-btn:hover { opacity: 0.9; transform: translateY(-1px); }
            .pc-btn-accept {
                background: ${colors.buttonAccept || '#4ade80'};
                color: #000;
            }
            .pc-btn-reject {
                background: ${colors.buttonReject || '#6b7280'};
                color: #fff;
            }
            .pc-btn-preferences {
                background: transparent;
                border: 2px solid ${colors.buttonPreferences || '#3b82f6'};
                color: ${colors.buttonPreferences || '#3b82f6'};
            }
            #pc-preferences {
                display: none;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid rgba(255,255,255,0.2);
            }
            #pc-preferences.active { display: block; }
            .pc-category {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .pc-category:last-child { border-bottom: none; }
            .pc-category-info { flex: 1; }
            .pc-category-name { font-weight: 600; font-size: 14px; }
            .pc-category-desc { font-size: 12px; opacity: 0.7; margin-top: 4px; }
            .pc-toggle {
                width: 50px;
                height: 26px;
                background: #4b5563;
                border-radius: 13px;
                position: relative;
                cursor: pointer;
                transition: background 0.3s;
            }
            .pc-toggle.active { background: ${colors.buttonAccept || '#4ade80'}; }
            .pc-toggle.disabled { opacity: 0.5; cursor: not-allowed; }
            .pc-toggle::after {
                content: '';
                position: absolute;
                top: 3px;
                left: 3px;
                width: 20px;
                height: 20px;
                background: #fff;
                border-radius: 50%;
                transition: transform 0.3s;
            }
            .pc-toggle.active::after { transform: translateX(24px); }
            .pc-privacy-link {
                display: block;
                margin-top: 12px;
                font-size: 12px;
                color: ${colors.buttonPreferences || '#3b82f6'};
            }
            #pc-lang-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 10px;
                opacity: 0.5;
                text-transform: uppercase;
            }
            @media (max-width: 640px) {
                #pc-banner { padding: 16px; }
                #pc-banner-inner { flex-direction: column; text-align: center; }
                #pc-banner-buttons { justify-content: center; width: 100%; }
            }
        `;
        document.head.appendChild(style);

        // Create banner HTML with translated category names
        const categoryHtml = categories.length > 0 ? categories.map(cat => {
            const catName = t[cat.id] || cat.name;
            const catDesc = t[cat.id + 'Desc'] || cat.description || '';
            return `
                <div class="pc-category">
                    <div class="pc-category-info">
                        <div class="pc-category-name">${escapeHtml(catName)}</div>
                        <div class="pc-category-desc">${escapeHtml(catDesc)}</div>
                    </div>
                    <div class="pc-toggle ${cat.required ? 'active disabled' : ''}" data-category="${escapeHtml(cat.id)}" ${cat.required ? 'data-required="true"' : ''}></div>
                </div>
            `;
        }).join('') : `
            <div class="pc-category">
                <div class="pc-category-info">
                    <div class="pc-category-name">${escapeHtml(t.necessary)}</div>
                    <div class="pc-category-desc">${escapeHtml(t.necessaryDesc)}</div>
                </div>
                <div class="pc-toggle active disabled" data-category="necessary" data-required="true"></div>
            </div>
            <div class="pc-category">
                <div class="pc-category-info">
                    <div class="pc-category-name">${escapeHtml(t.analytics)}</div>
                    <div class="pc-category-desc">${escapeHtml(t.analyticsDesc)}</div>
                </div>
                <div class="pc-toggle" data-category="analytics"></div>
            </div>
            <div class="pc-category">
                <div class="pc-category-info">
                    <div class="pc-category-name">${escapeHtml(t.marketing)}</div>
                    <div class="pc-category-desc">${escapeHtml(t.marketingDesc)}</div>
                </div>
                <div class="pc-toggle" data-category="marketing"></div>
            </div>
            <div class="pc-category">
                <div class="pc-category-info">
                    <div class="pc-category-name">${escapeHtml(t.functional)}</div>
                    <div class="pc-category-desc">${escapeHtml(t.functionalDesc)}</div>
                </div>
                <div class="pc-toggle" data-category="functional"></div>
            </div>
        `;

        const banner = document.createElement('div');
        banner.id = 'pc-banner';
        banner.innerHTML = `
            <span id="pc-lang-badge">${lang.toUpperCase()}</span>
            <div id="pc-banner-inner">
                <div id="pc-banner-content">
                    <div id="pc-banner-title">${escapeHtml(bannerTitle)}</div>
                    <div id="pc-banner-text">${escapeHtml(bannerText)}</div>
                    ${config.privacy_policy_url ? `<a href="${escapeHtml(config.privacy_policy_url)}" target="_blank" class="pc-privacy-link">${escapeHtml(t.privacyPolicy)}</a>` : ''}
                </div>
                <div id="pc-banner-buttons">
                    <button class="pc-btn pc-btn-accept" id="pc-accept">${escapeHtml(acceptText)}</button>
                    <button class="pc-btn pc-btn-reject" id="pc-reject">${escapeHtml(rejectText)}</button>
                    <button class="pc-btn pc-btn-preferences" id="pc-prefs-toggle">${escapeHtml(prefsText)}</button>
                </div>
            </div>
            <div id="pc-preferences">
                ${categoryHtml}
                <button class="pc-btn pc-btn-accept" id="pc-save" style="margin-top: 16px;">${escapeHtml(saveText)}</button>
            </div>
        `;
        document.body.appendChild(banner);

        // Event handlers
        document.getElementById('pc-accept').addEventListener('click', () => {
            const consent = { necessary: true, analytics: true, marketing: true, functional: true };
            categories.forEach(cat => consent[cat.id] = true);
            saveAndApply(consent);
        });

        document.getElementById('pc-reject').addEventListener('click', () => {
            const consent = { necessary: true, analytics: false, marketing: false, functional: false };
            categories.forEach(cat => consent[cat.id] = cat.required);
            saveAndApply(consent);
        });

        document.getElementById('pc-prefs-toggle').addEventListener('click', () => {
            document.getElementById('pc-preferences').classList.toggle('active');
        });

        document.getElementById('pc-save').addEventListener('click', () => {
            const consent = { necessary: true };
            document.querySelectorAll('.pc-toggle').forEach(toggle => {
                const category = toggle.getAttribute('data-category');
                consent[category] = toggle.classList.contains('active');
            });
            saveAndApply(consent);
        });

        document.querySelectorAll('.pc-toggle:not(.disabled)').forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
            });
        });
    }

    function saveAndApply(consent) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        applyConsent(consent);
        const banner = document.getElementById('pc-banner');
        if (banner) banner.remove();
    }

    function applyConsent(consent) {
        consentGiven = true;
        observer.disconnect();

        // Google Consent Mode v2
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': consent.marketing ? 'granted' : 'denied',
                'ad_user_data': consent.marketing ? 'granted' : 'denied',
                'ad_personalization': consent.marketing ? 'granted' : 'denied',
                'analytics_storage': consent.analytics ? 'granted' : 'denied',
                'functionality_storage': consent.functional ? 'granted' : 'denied',
                'personalization_storage': consent.functional ? 'granted' : 'denied',
                'security_storage': 'granted'
            });
        }

        // Reload blocked scripts if consent given
        if (consent.analytics || consent.marketing) {
            blockedScripts.forEach(scriptInfo => {
                const script = document.createElement('script');
                script.src = scriptInfo.src;
                if (scriptInfo.async) script.async = true;
                if (scriptInfo.defer) script.defer = true;
                if (scriptInfo.type) script.type = scriptInfo.type;
                document.head.appendChild(script);
                console.log('[PrivacyChecker] Loaded script after consent:', scriptInfo.src);
            });
        }

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('pc:consent', { detail: consent }));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
