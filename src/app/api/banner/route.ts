import { NextRequest, NextResponse } from 'next/server';
import { getTranslation } from '@/lib/translations';

// Generate personalized cookie banner script for Pro users with geo-targeting
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('id');
  const primaryColor = searchParams.get('color') || '2563eb';
  const position = searchParams.get('position') || 'bottom';
  const privacyUrl = searchParams.get('privacy') || '/privacy';
  const lang = searchParams.get('lang') || 'auto'; // 'auto' = detect from geo
  const geoMode = searchParams.get('geo') !== 'false'; // Enable geo-targeting by default

  // Get default translations
  const t = getTranslation(lang === 'auto' ? 'en' : lang);

  const script = `
(function() {
  'use strict';
  
  var STORAGE_KEY = 'privacychecker_consent';
  var VISITOR_KEY = 'privacychecker_visitor_id';
  var SITE_ID = '${siteId || 'default'}';
  var API_URL = 'https://privacychecker.pro/api/consent';
  var GEO_URL = 'https://privacychecker.pro/api/geo';
  var GEO_ENABLED = ${geoMode};
  var LANG_OVERRIDE = '${lang !== 'auto' ? lang : ''}';
  
  // Translations - updated based on geo if auto
  var T = {
    bannerText: ${JSON.stringify(t.bannerText)},
    learnMore: ${JSON.stringify(t.learnMore)},
    acceptAll: ${JSON.stringify(t.acceptAll)},
    rejectAll: ${JSON.stringify(t.rejectAll)},
    preferences: ${JSON.stringify(t.preferences)},
    savePreferences: ${JSON.stringify(t.savePreferences)},
    necessary: ${JSON.stringify(t.necessary)},
    necessaryDesc: ${JSON.stringify(t.necessaryDesc)},
    analytics: ${JSON.stringify(t.analytics)},
    analyticsDesc: ${JSON.stringify(t.analyticsDesc)},
    marketing: ${JSON.stringify(t.marketing)},
    marketingDesc: ${JSON.stringify(t.marketingDesc)},
    functional: ${JSON.stringify(t.functional)},
    functionalDesc: ${JSON.stringify(t.functionalDesc)}
  };
  
  // Geo-detected settings
  var GEO = {
    countryCode: null,
    regulation: 'default',
    regulationName: 'Privacy',
    consentMode: 'opt-out',
    blockByDefault: false
  };
  
  // Language map for country codes
  var LANG_MAP = {
    'FR': 'fr', 'DE': 'de', 'ES': 'es', 'IT': 'it', 
    'PT': 'pt', 'BR': 'pt', 'NL': 'nl', 'PL': 'pl',
    'AT': 'de', 'CH': 'de', 'BE': 'fr', 'LU': 'fr'
  };
  
  // Translation sets for each language
  var TRANSLATIONS = {
    en: { bannerText: 'We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.', learnMore: 'Learn more', acceptAll: 'Accept All', rejectAll: 'Reject All', preferences: 'Preferences', savePreferences: 'Save Preferences', necessary: 'Necessary', necessaryDesc: 'Required for the website to function properly.', analytics: 'Analytics', analyticsDesc: 'Help us understand how visitors interact with our website.', marketing: 'Marketing', marketingDesc: 'Used to deliver personalized advertisements.', functional: 'Functional', functionalDesc: 'Enable enhanced functionality and personalization.' },
    fr: { bannerText: 'Nous utilisons des cookies pour améliorer votre expérience. En continuant à visiter ce site, vous acceptez notre utilisation des cookies.', learnMore: 'En savoir plus', acceptAll: 'Tout accepter', rejectAll: 'Tout refuser', preferences: 'Préférences', savePreferences: 'Enregistrer', necessary: 'Nécessaires', necessaryDesc: 'Requis pour le bon fonctionnement du site.', analytics: 'Analytiques', analyticsDesc: 'Nous aident à comprendre comment les visiteurs utilisent notre site.', marketing: 'Marketing', marketingDesc: 'Utilisés pour afficher des publicités personnalisées.', functional: 'Fonctionnels', functionalDesc: 'Permettent des fonctionnalités améliorées et la personnalisation.' },
    de: { bannerText: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung dieser Website stimmen Sie der Verwendung von Cookies zu.', learnMore: 'Mehr erfahren', acceptAll: 'Alle akzeptieren', rejectAll: 'Alle ablehnen', preferences: 'Einstellungen', savePreferences: 'Speichern', necessary: 'Notwendig', necessaryDesc: 'Erforderlich für die ordnungsgemäße Funktion der Website.', analytics: 'Analyse', analyticsDesc: 'Helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.', marketing: 'Marketing', marketingDesc: 'Werden verwendet, um personalisierte Werbung zu liefern.', functional: 'Funktional', functionalDesc: 'Ermöglichen erweiterte Funktionalität und Personalisierung.' },
    es: { bannerText: 'Utilizamos cookies para mejorar su experiencia. Al continuar visitando este sitio, acepta nuestro uso de cookies.', learnMore: 'Más información', acceptAll: 'Aceptar todo', rejectAll: 'Rechazar todo', preferences: 'Preferencias', savePreferences: 'Guardar', necessary: 'Necesarias', necessaryDesc: 'Requeridas para el correcto funcionamiento del sitio.', analytics: 'Analíticas', analyticsDesc: 'Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.', marketing: 'Marketing', marketingDesc: 'Se utilizan para mostrar anuncios personalizados.', functional: 'Funcionales', functionalDesc: 'Permiten funcionalidad mejorada y personalización.' },
    it: { bannerText: 'Utilizziamo i cookie per migliorare la tua esperienza. Continuando a visitare questo sito accetti l\\'utilizzo dei cookie.', learnMore: 'Scopri di più', acceptAll: 'Accetta tutto', rejectAll: 'Rifiuta tutto', preferences: 'Preferenze', savePreferences: 'Salva', necessary: 'Necessari', necessaryDesc: 'Richiesti per il corretto funzionamento del sito.', analytics: 'Analitici', analyticsDesc: 'Ci aiutano a capire come i visitatori interagiscono con il nostro sito.', marketing: 'Marketing', marketingDesc: 'Utilizzati per mostrare annunci personalizzati.', functional: 'Funzionali', functionalDesc: 'Abilitano funzionalità avanzate e personalizzazione.' },
    pt: { bannerText: 'Utilizamos cookies para melhorar a sua experiência. Ao continuar a visitar este site, concorda com a nossa utilização de cookies.', learnMore: 'Saiba mais', acceptAll: 'Aceitar tudo', rejectAll: 'Rejeitar tudo', preferences: 'Preferências', savePreferences: 'Guardar', necessary: 'Necessários', necessaryDesc: 'Necessários para o funcionamento correto do site.', analytics: 'Analíticos', analyticsDesc: 'Ajudam-nos a compreender como os visitantes interagem com o nosso site.', marketing: 'Marketing', marketingDesc: 'Utilizados para apresentar anúncios personalizados.', functional: 'Funcionais', functionalDesc: 'Permitem funcionalidades melhoradas e personalização.' },
    nl: { bannerText: 'Wij gebruiken cookies om uw ervaring te verbeteren. Door deze site te blijven bezoeken, gaat u akkoord met ons gebruik van cookies.', learnMore: 'Meer informatie', acceptAll: 'Alles accepteren', rejectAll: 'Alles weigeren', preferences: 'Voorkeuren', savePreferences: 'Opslaan', necessary: 'Noodzakelijk', necessaryDesc: 'Vereist voor de goede werking van de website.', analytics: 'Analytisch', analyticsDesc: 'Helpen ons te begrijpen hoe bezoekers onze website gebruiken.', marketing: 'Marketing', marketingDesc: 'Worden gebruikt om gepersonaliseerde advertenties te tonen.', functional: 'Functioneel', functionalDesc: 'Maken verbeterde functionaliteit en personalisatie mogelijk.' },
    pl: { bannerText: 'Używamy plików cookie, aby poprawić Twoje wrażenia. Kontynuując wizytę na tej stronie, zgadzasz się na używanie przez nas plików cookie.', learnMore: 'Dowiedz się więcej', acceptAll: 'Zaakceptuj wszystko', rejectAll: 'Odrzuć wszystko', preferences: 'Preferencje', savePreferences: 'Zapisz', necessary: 'Niezbędne', necessaryDesc: 'Wymagane do prawidłowego działania strony.', analytics: 'Analityczne', analyticsDesc: 'Pomagają nam zrozumieć, jak odwiedzający korzystają z naszej strony.', marketing: 'Marketingowe', marketingDesc: 'Używane do wyświetlania spersonalizowanych reklam.', functional: 'Funkcjonalne', functionalDesc: 'Umożliwiają ulepszone funkcje i personalizację.' }
  };
  
  // Regulation-specific banner text
  var REGULATION_TEXT = {
    gdpr: { en: 'We use cookies. Under GDPR, we need your explicit consent before setting non-essential cookies.', fr: 'Nous utilisons des cookies. Conformément au RGPD, nous avons besoin de votre consentement explicite.', de: 'Wir verwenden Cookies. Gemäß DSGVO benötigen wir Ihre ausdrückliche Zustimmung.' },
    ccpa: { en: 'We use cookies and may share your data. Under CCPA, you have the right to opt out.', es: 'Utilizamos cookies y podemos compartir sus datos. Según la CCPA, tiene derecho a rechazar.' },
    lgpd: { pt: 'Utilizamos cookies. De acordo com a LGPD, precisamos do seu consentimento explícito.' }
  };
  
  // Generate or retrieve visitor ID
  function getVisitorId() {
    var id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }
  
  // Update translations based on language
  function updateTranslations(lang) {
    if (TRANSLATIONS[lang]) {
      T = TRANSLATIONS[lang];
    }
  }
  
  // Update banner text for regulation
  function getRegulationText(regulation, lang) {
    if (REGULATION_TEXT[regulation] && REGULATION_TEXT[regulation][lang]) {
      return REGULATION_TEXT[regulation][lang];
    }
    if (REGULATION_TEXT[regulation] && REGULATION_TEXT[regulation]['en']) {
      return REGULATION_TEXT[regulation]['en'];
    }
    return T.bannerText;
  }
  
  if (localStorage.getItem(STORAGE_KEY)) return;
  
  // ============================================
  // SCRIPT BLOCKING - Block trackers until consent
  // ============================================
  
  // Patterns for scripts to block (analytics/marketing)
  var BLOCK_PATTERNS = [
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    /googlesyndication\.com/i,
    /googleadservices\.com/i,
    /doubleclick\.net/i,
    /connect\.facebook\.net/i,
    /facebook\.com\/tr/i,
    /analytics\.tiktok\.com/i,
    /tiktok\.com\/i18n\/pixel/i,
    /snap\.licdn\.com/i,
    /linkedin\.com\/px/i,
    /ads-twitter\.com/i,
    /t\.co\/i\/adsct/i,
    /hotjar\.com/i,
    /mixpanel\.com/i,
    /amplitude\.com/i,
    /segment\.com/i,
    /clarity\.ms/i,
    /criteo\.com/i,
    /outbrain\.com/i,
    /taboola\.com/i,
    /hubspot\.com/i,
    /intercom\.io/i,
    /fullstory\.com/i,
    /logrocket\.io/i
  ];
  
  // Store blocked scripts to execute after consent
  var blockedScripts = [];
  
  // Check if URL should be blocked
  function shouldBlock(url) {
    if (!url) return false;
    for (var i = 0; i < BLOCK_PATTERNS.length; i++) {
      if (BLOCK_PATTERNS[i].test(url)) return true;
    }
    return false;
  }
  
  // Block script execution if consent mode is opt-in
  function blockScripts() {
    // Override document.createElement to intercept script tags
    var originalCreateElement = document.createElement.bind(document);
    document.createElement = function(tagName) {
      var element = originalCreateElement(tagName);
      
      if (tagName.toLowerCase() === 'script') {
        var originalSetAttribute = element.setAttribute.bind(element);
        element.setAttribute = function(name, value) {
          if (name === 'src' && shouldBlock(value)) {
            // Store for later and block
            blockedScripts.push({ src: value, element: element });
            return; // Don't set src, effectively blocking
          }
          return originalSetAttribute(name, value);
        };
        
        // Also intercept direct src assignment
        Object.defineProperty(element, 'src', {
          set: function(value) {
            if (shouldBlock(value)) {
              blockedScripts.push({ src: value, element: element });
              return;
            }
            originalSetAttribute('src', value);
          },
          get: function() {
            return element.getAttribute('src');
          }
        });
      }
      
      return element;
    };
    
    // Block inline scripts that match patterns (data-src approach)
    document.querySelectorAll('script[type="text/plain"][data-cookiecategory]').forEach(function(script) {
      blockedScripts.push({ 
        inline: script.textContent, 
        category: script.getAttribute('data-cookiecategory') 
      });
    });
  }
  
  // Unblock and execute scripts after consent
  function unblockScripts(categories) {
    blockedScripts.forEach(function(blocked) {
      if (blocked.src) {
        var script = document.createElement('script');
        // Temporarily disable blocking for this script
        script.setAttribute('data-unblocked', 'true');
        script.src = blocked.src;
        document.head.appendChild(script);
      } else if (blocked.inline && categories[blocked.category]) {
        var script = document.createElement('script');
        script.textContent = blocked.inline;
        document.head.appendChild(script);
      }
    });
    blockedScripts = [];
  }
  
  // Initialize blocking if consent mode requires it
  var shouldBlockInitially = GEO.consentMode === 'opt-in' || GEO.blockByDefault;
  if (shouldBlockInitially) {
    blockScripts();
  }

  // Fetch geo data and then show banner
  function initBanner(geoData) {
    if (geoData) {
      GEO = geoData;
      // Auto-detect language from country
      if (!LANG_OVERRIDE && LANG_MAP[geoData.countryCode]) {
        updateTranslations(LANG_MAP[geoData.countryCode]);
      }
      // Update banner text for regulation
      var lang = LANG_MAP[geoData.countryCode] || 'en';
      T.bannerText = getRegulationText(geoData.regulation, lang);
    }
    showBanner();
  }
  
  function showBanner() {
    var styles = \`
      .pc-banner {
        position: fixed;
        ${position === 'top' ? 'top: 0;' : 'bottom: 0;'}
        left: 0;
        right: 0;
        background: #1f2937;
        color: #fff;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 16px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        box-shadow: 0 ${position === 'top' ? '4px' : '-4px'} 20px rgba(0,0,0,0.15);
      }
      .pc-banner-text { flex: 1; min-width: 300px; }
      .pc-banner-text a { color: #60a5fa; text-decoration: underline; }
      .pc-banner-reg { display: inline-block; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 11px; margin-left: 8px; opacity: 0.8; }
      .pc-banner-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
      .pc-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
      }
      .pc-btn-accept { background: #${primaryColor}; color: #fff; }
      .pc-btn-accept:hover { filter: brightness(0.9); }
      .pc-btn-reject {
        background: transparent;
        color: #9ca3af;
        border: 1px solid #374151;
      }
      .pc-btn-reject:hover { background: #374151; color: #fff; }
      .pc-btn-prefs {
        background: transparent;
        color: #60a5fa;
        border: none;
        text-decoration: underline;
        padding: 10px 8px;
      }
      .pc-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999999;
        align-items: center;
        justify-content: center;
      }
      .pc-modal.active { display: flex; }
      .pc-modal-content {
        background: #fff;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        color: #1f2937;
      }
      .pc-modal-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
      .pc-category {
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .pc-category:last-child { border-bottom: none; }
      .pc-category-info { flex: 1; }
      .pc-category-name { font-weight: 600; margin-bottom: 4px; }
      .pc-category-desc { font-size: 12px; color: #6b7280; }
      .pc-toggle {
        width: 44px;
        height: 24px;
        background: #d1d5db;
        border-radius: 12px;
        position: relative;
        cursor: pointer;
        transition: background 0.2s;
      }
      .pc-toggle.active { background: #${primaryColor}; }
      .pc-toggle.disabled { background: #${primaryColor}; cursor: not-allowed; opacity: 0.7; }
      .pc-toggle::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: transform 0.2s;
      }
      .pc-toggle.active::after { transform: translateX(20px); }
      .pc-modal-buttons {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        justify-content: flex-end;
      }
      @media (max-width: 640px) {
        .pc-banner { flex-direction: column; text-align: center; }
        .pc-banner-text { min-width: auto; }
      }
    \`;
    
    var styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    
    var regBadge = GEO.regulationName && GEO.regulationName !== 'Privacy' ? '<span class="pc-banner-reg">' + GEO.regulationName + '</span>' : '';
    
    var banner = document.createElement('div');
    banner.className = 'pc-banner';
    banner.id = 'pc-banner';
    banner.innerHTML = \`
      <div class="pc-banner-text">
        \${T.bannerText}\${regBadge}
        <a href="${privacyUrl}" target="_blank">\${T.learnMore}</a>
      </div>
      <div class="pc-banner-buttons">
        <button class="pc-btn pc-btn-prefs" id="pc-prefs">\${T.preferences}</button>
        <button class="pc-btn pc-btn-reject" id="pc-reject">\${T.rejectAll}</button>
        <button class="pc-btn pc-btn-accept" id="pc-accept">\${T.acceptAll}</button>
      </div>
    \`;
    
    var modal = document.createElement('div');
    modal.className = 'pc-modal';
    modal.id = 'pc-modal';
    // Default toggles based on consent mode
    var defaultOn = GEO.consentMode !== 'opt-in';
    modal.innerHTML = \`
      <div class="pc-modal-content">
        <div class="pc-modal-title">\${T.preferences}</div>
        <div class="pc-category">
          <div class="pc-category-info">
            <div class="pc-category-name">\${T.necessary}</div>
            <div class="pc-category-desc">\${T.necessaryDesc}</div>
          </div>
          <div class="pc-toggle active disabled"></div>
        </div>
        <div class="pc-category">
          <div class="pc-category-info">
            <div class="pc-category-name">\${T.analytics}</div>
            <div class="pc-category-desc">\${T.analyticsDesc}</div>
          </div>
          <div class="pc-toggle \${defaultOn ? 'active' : ''}" data-category="analytics"></div>
        </div>
        <div class="pc-category">
          <div class="pc-category-info">
            <div class="pc-category-name">\${T.marketing}</div>
            <div class="pc-category-desc">\${T.marketingDesc}</div>
          </div>
          <div class="pc-toggle" data-category="marketing"></div>
        </div>
        <div class="pc-category">
          <div class="pc-category-info">
            <div class="pc-category-name">\${T.functional}</div>
            <div class="pc-category-desc">\${T.functionalDesc}</div>
          </div>
          <div class="pc-toggle \${defaultOn ? 'active' : ''}" data-category="preferences"></div>
        </div>
        <div class="pc-modal-buttons">
          <button class="pc-btn pc-btn-reject" id="pc-modal-reject">\${T.rejectAll}</button>
          <button class="pc-btn pc-btn-accept" id="pc-modal-save">\${T.savePreferences}</button>
        </div>
      </div>
    \`;
    
    document.body.appendChild(banner);
    document.body.appendChild(modal);
    
    // Toggle handlers
    modal.querySelectorAll('.pc-toggle[data-category]').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    });
    
    function getSelectedCategories() {
      var categories = { necessary: true, analytics: false, marketing: false, preferences: false };
      modal.querySelectorAll('.pc-toggle[data-category]').forEach(function(toggle) {
        var cat = toggle.getAttribute('data-category');
        categories[cat] = toggle.classList.contains('active');
      });
      return categories;
    }
    
    function saveConsent(type, categories) {
      var visitorId = getVisitorId();
      if (!categories) {
        categories = {
          necessary: true,
          analytics: type === 'accept',
          marketing: type === 'accept',
          preferences: type === 'accept'
        };
      }
      var consent = {
        siteId: SITE_ID,
        visitorId: visitorId,
        type: type,
        timestamp: new Date().toISOString(),
        necessary: categories.necessary,
        analytics: categories.analytics,
        marketing: categories.marketing,
        preferences: categories.preferences,
        geo: GEO
      };
      
      // Update Google Consent Mode v2
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          'analytics_storage': categories.analytics ? 'granted' : 'denied',
          'ad_storage': categories.marketing ? 'granted' : 'denied',
          'ad_user_data': categories.marketing ? 'granted' : 'denied',
          'ad_personalization': categories.marketing ? 'granted' : 'denied',
          'functionality_storage': categories.preferences ? 'granted' : 'denied',
          'personalization_storage': categories.preferences ? 'granted' : 'denied',
          'security_storage': 'granted'
        });
      }
      
      // Unblock scripts if user accepted analytics or marketing
      if (categories.analytics || categories.marketing) {
        unblockScripts(categories);
      }
      
      // Save locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      banner.remove();
      modal.remove();
      
      // Send to API for audit trail (fire and forget)
      try {
        fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteId: SITE_ID,
            visitorId: visitorId,
            consentType: type,
            categories: categories,
            geo: GEO
          })
        }).catch(function() {});
      } catch(e) {}
      
      window.dispatchEvent(new CustomEvent('privacychecker:consent', { detail: consent }));
    }
    
    document.getElementById('pc-accept').onclick = function() { saveConsent('accept'); };
    document.getElementById('pc-reject').onclick = function() { saveConsent('reject'); };
    document.getElementById('pc-prefs').onclick = function() { modal.classList.add('active'); };
    document.getElementById('pc-modal-reject').onclick = function() { saveConsent('reject'); };
    document.getElementById('pc-modal-save').onclick = function() { 
      saveConsent('custom', getSelectedCategories()); 
    };
    modal.onclick = function(e) { 
      if (e.target === modal) modal.classList.remove('active'); 
    };
  }
  
  // Start: Fetch geo data or show banner directly
  if (GEO_ENABLED) {
    fetch(GEO_URL, { signal: AbortSignal.timeout(2000) })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        initBanner({
          countryCode: data.detected.countryCode,
          regulation: data.regulation.code,
          regulationName: data.regulation.shortName,
          consentMode: data.settings.consentMode,
          blockByDefault: data.settings.blockByDefault
        });
      })
      .catch(function() {
        initBanner(null);
      });
  } else {
    initBanner(null);
  }
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
