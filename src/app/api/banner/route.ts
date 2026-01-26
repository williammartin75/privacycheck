import { NextRequest, NextResponse } from 'next/server';

// Generate personalized cookie banner script for Pro users
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('id');
    const primaryColor = searchParams.get('color') || '2563eb';
    const position = searchParams.get('position') || 'bottom';
    const privacyUrl = searchParams.get('privacy') || '/privacy';

    const script = `
(function() {
  'use strict';
  
  var STORAGE_KEY = 'privacychecker_consent';
  var SITE_ID = '${siteId || 'default'}';
  
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
      We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
      <a href="${privacyUrl}" target="_blank">Learn more</a>
    </div>
    <div class="pc-banner-buttons">
      <button class="pc-btn pc-btn-reject" id="pc-reject">Reject All</button>
      <button class="pc-btn pc-btn-accept" id="pc-accept">Accept All</button>
    </div>
  \`;
  
  document.body.appendChild(banner);
  
  function saveConsent(type) {
    var consent = {
      siteId: SITE_ID,
      type: type,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: type === 'accept',
      marketing: type === 'accept',
      preferences: type === 'accept'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    banner.remove();
    window.dispatchEvent(new CustomEvent('privacychecker:consent', { detail: consent }));
  }
  
  document.getElementById('pc-accept').onclick = function() { saveConsent('accept'); };
  document.getElementById('pc-reject').onclick = function() { saveConsent('reject'); };
})();
`;

    return new NextResponse(script, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
