import { NextRequest, NextResponse } from 'next/server';
import { getTranslation } from '@/lib/translations';

// Generate personalized cookie banner script for Pro users
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('id');
  const primaryColor = searchParams.get('color') || '2563eb';
  const position = searchParams.get('position') || 'bottom';
  const privacyUrl = searchParams.get('privacy') || '/privacy';
  const lang = searchParams.get('lang') || 'en';

  // Get translations for the specified language
  const t = getTranslation(lang);

  const script = `
(function() {
  'use strict';
  
  var STORAGE_KEY = 'privacychecker_consent';
  var VISITOR_KEY = 'privacychecker_visitor_id';
  var SITE_ID = '${siteId || 'default'}';
  var API_URL = 'https://privacychecker.pro/api/consent';
  
  // Translations
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
  
  // Generate or retrieve visitor ID
  function getVisitorId() {
    var id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }
  
  if (localStorage.getItem(STORAGE_KEY)) return;
  
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
  
  var banner = document.createElement('div');
  banner.className = 'pc-banner';
  banner.innerHTML = \`
    <div class="pc-banner-text">
      \${T.bannerText}
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
        <div class="pc-toggle active" data-category="analytics"></div>
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
        <div class="pc-toggle active" data-category="preferences"></div>
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
      preferences: categories.preferences
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
          categories: categories
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
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
