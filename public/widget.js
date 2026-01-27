/**
 * PrivacyChecker.pro Cookie Banner Widget
 * A GDPR-compliant cookie consent banner with Google Consent Mode v2 support
 * 
 * Usage: <script src="https://privacychecker.pro/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 */
(function () {
    'use strict';

    const CONSENT_KEY = 'pc_consent';
    const API_BASE = 'https://privacychecker.pro';

    // Get widget ID from script tag
    const scriptTag = document.currentScript || document.querySelector('script[data-widget-id]');
    const widgetId = scriptTag?.getAttribute('data-widget-id');

    if (!widgetId) {
        console.error('[PrivacyChecker] Missing data-widget-id attribute');
        return;
    }

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
            @media (max-width: 640px) {
                #pc-banner { padding: 16px; }
                #pc-banner-inner { flex-direction: column; text-align: center; }
                #pc-banner-buttons { justify-content: center; width: 100%; }
            }
        `;
        document.head.appendChild(style);

        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'pc-banner';
        banner.innerHTML = `
            <div id="pc-banner-inner">
                <div id="pc-banner-content">
                    <div id="pc-banner-title">${escapeHtml(config.banner_title || 'We use cookies')}</div>
                    <div id="pc-banner-text">${escapeHtml(config.banner_text || 'This website uses cookies.')}</div>
                    ${config.privacy_policy_url ? `<a href="${escapeHtml(config.privacy_policy_url)}" target="_blank" class="pc-privacy-link">Privacy Policy</a>` : ''}
                </div>
                <div id="pc-banner-buttons">
                    <button class="pc-btn pc-btn-accept" id="pc-accept">${escapeHtml(config.accept_text || 'Accept All')}</button>
                    <button class="pc-btn pc-btn-reject" id="pc-reject">${escapeHtml(config.reject_text || 'Reject All')}</button>
                    <button class="pc-btn pc-btn-preferences" id="pc-prefs-toggle">${escapeHtml(config.preferences_text || 'Preferences')}</button>
                </div>
            </div>
            <div id="pc-preferences">
                ${categories.map(cat => `
                    <div class="pc-category">
                        <div class="pc-category-info">
                            <div class="pc-category-name">${escapeHtml(cat.name)}</div>
                            <div class="pc-category-desc">${escapeHtml(cat.description || '')}</div>
                        </div>
                        <div class="pc-toggle ${cat.required ? 'active disabled' : ''}" data-category="${escapeHtml(cat.id)}" ${cat.required ? 'data-required="true"' : ''}></div>
                    </div>
                `).join('')}
                <button class="pc-btn pc-btn-accept" id="pc-save" style="margin-top: 16px;">${escapeHtml(config.save_preferences_text || 'Save Preferences')}</button>
            </div>
        `;
        document.body.appendChild(banner);

        // Event handlers
        document.getElementById('pc-accept').addEventListener('click', () => {
            const consent = {};
            categories.forEach(cat => consent[cat.id] = true);
            saveAndApply(consent);
        });

        document.getElementById('pc-reject').addEventListener('click', () => {
            const consent = {};
            categories.forEach(cat => consent[cat.id] = cat.required);
            saveAndApply(consent);
        });

        document.getElementById('pc-prefs-toggle').addEventListener('click', () => {
            document.getElementById('pc-preferences').classList.toggle('active');
        });

        document.getElementById('pc-save').addEventListener('click', () => {
            const consent = {};
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

        // Dispatch custom event for other scripts
        window.dispatchEvent(new CustomEvent('pc:consent', { detail: consent }));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
