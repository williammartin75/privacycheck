(function () {
    'use strict';

    // PrivacyChecker Cookie Banner v1.0 with Google Consent Mode v2
    var STORAGE_KEY = 'privacychecker_consent';

    // Initialize Google Consent Mode with default denied state
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }

    // Set default consent state (denied until user accepts)
    gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'denied',
        'functionality_storage': 'granted',
        'personalization_storage': 'denied',
        'security_storage': 'granted',
        'wait_for_update': 500
    });

    // Check if consent already given
    var existingConsent = localStorage.getItem(STORAGE_KEY);
    if (existingConsent) {
        var consent = JSON.parse(existingConsent);
        updateGoogleConsent(consent.type === 'accept');
        return;
    }

    // Update Google Consent Mode
    function updateGoogleConsent(granted) {
        gtag('consent', 'update', {
            'ad_storage': granted ? 'granted' : 'denied',
            'ad_user_data': granted ? 'granted' : 'denied',
            'ad_personalization': granted ? 'granted' : 'denied',
            'analytics_storage': granted ? 'granted' : 'denied',
            'personalization_storage': granted ? 'granted' : 'denied'
        });
    }

    // Styles
    var styles = `
    .pc-banner {
      position: fixed;
      bottom: 0;
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
      box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    }
    .pc-banner-text {
      flex: 1;
      min-width: 300px;
    }
    .pc-banner-text a {
      color: #60a5fa;
      text-decoration: underline;
    }
    .pc-banner-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .pc-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s;
    }
    .pc-btn-accept {
      background: #2563eb;
      color: #fff;
    }
    .pc-btn-accept:hover {
      background: #1d4ed8;
    }
    .pc-btn-reject {
      background: transparent;
      color: #9ca3af;
      border: 1px solid #374151;
    }
    .pc-btn-reject:hover {
      background: #374151;
      color: #fff;
    }
    @media (max-width: 640px) {
      .pc-banner {
        flex-direction: column;
        text-align: center;
      }
      .pc-banner-text {
        min-width: auto;
      }
    }
  `;

    // Inject styles
    var styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Create banner
    var banner = document.createElement('div');
    banner.className = 'pc-banner';
    banner.innerHTML = `
    <div class="pc-banner-text">
      We use cookies to enhance your experience and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.
      <a href="/privacy" target="_blank">Learn more</a>
    </div>
    <div class="pc-banner-buttons">
      <button class="pc-btn pc-btn-reject" id="pc-reject">Reject All</button>
      <button class="pc-btn pc-btn-accept" id="pc-accept">Accept All</button>
    </div>
  `;

    document.body.appendChild(banner);

    // Handle consent
    function saveConsent(type) {
        var granted = type === 'accept';
        var consent = {
            type: type,
            timestamp: new Date().toISOString(),
            necessary: true,
            analytics: granted,
            marketing: granted,
            preferences: granted
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

        // Update Google Consent Mode
        updateGoogleConsent(granted);

        // Remove banner
        banner.remove();

        // Dispatch event for other tools
        window.dispatchEvent(new CustomEvent('privacychecker:consent', { detail: consent }));
    }

    document.getElementById('pc-accept').onclick = function () { saveConsent('accept'); };
    document.getElementById('pc-reject').onclick = function () { saveConsent('reject'); };
})();
