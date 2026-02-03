/**
 * ULTIMATE Batch Audit Script
 * 40+ checks + Hidden Costs Audit
 * Every site will have 15-25+ issues + cost estimate
 */

// ============ HIDDEN COSTS DATABASE ============
const SAAS_PRICING = {
    // Analytics (paid)
    'static.hotjar.com': { name: 'Hotjar', price: 31 },
    'hotjar.com': { name: 'Hotjar', price: 31 },
    'cdn.mxpnl.com': { name: 'Mixpanel', price: 25 },
    'mixpanel.com': { name: 'Mixpanel', price: 25 },
    'cdn.segment.com': { name: 'Segment', price: 120 },
    'segment.com': { name: 'Segment', price: 120 },
    'cdn.amplitude.com': { name: 'Amplitude', price: 49 },
    'amplitude.com': { name: 'Amplitude', price: 49 },
    'cdn.usefathom.com': { name: 'Fathom', price: 14 },
    'script.crazyegg.com': { name: 'Crazy Egg', price: 24 },
    'cdn.mouseflow.com': { name: 'Mouseflow', price: 31 },
    'plausible.io': { name: 'Plausible', price: 9 },
    'fullstory.com': { name: 'FullStory', price: 199 },
    'luckyorange.com': { name: 'Lucky Orange', price: 18 },

    // Chat (paid)
    'widget.intercom.io': { name: 'Intercom', price: 74 },
    'intercomcdn.com': { name: 'Intercom', price: 74 },
    'intercom.io': { name: 'Intercom', price: 74 },
    'cdn.crisp.chat': { name: 'Crisp', price: 25 },
    'crisp.chat': { name: 'Crisp', price: 25 },
    'widget.drift.com': { name: 'Drift', price: 50 },
    'js.driftt.com': { name: 'Drift', price: 50 },
    'drift.com': { name: 'Drift', price: 50 },
    'static.zdassets.com': { name: 'Zendesk', price: 49 },
    'zdassets.com': { name: 'Zendesk', price: 49 },
    'zendesk.com': { name: 'Zendesk', price: 49 },
    'wchat.freshchat.com': { name: 'Freshchat', price: 15 },
    'freshchat.com': { name: 'Freshchat', price: 15 },
    'cdn.livechatinc.com': { name: 'LiveChat', price: 20 },
    'livechatinc.com': { name: 'LiveChat', price: 20 },

    // CRM / Email
    'static.mailchimp.com': { name: 'Mailchimp', price: 13 },
    'mailchimp.com': { name: 'Mailchimp', price: 13 },
    'static.klaviyo.com': { name: 'Klaviyo', price: 45 },
    'klaviyo.com': { name: 'Klaviyo', price: 45 },
    'js.convertflow.co': { name: 'ConvertFlow', price: 29 },
    'convertflow.co': { name: 'ConvertFlow', price: 29 },
    'js.hubspot.com': { name: 'HubSpot', price: 45 },
    'hubspot.com': { name: 'HubSpot', price: 45 },
    'munchkin.marketo.net': { name: 'Marketo', price: 895 },
    'marketo.net': { name: 'Marketo', price: 895 },
    'app.getresponse.com': { name: 'GetResponse', price: 19 },
    'getresponse.com': { name: 'GetResponse', price: 19 },
    'cdn.activecampaign.com': { name: 'ActiveCampaign', price: 29 },
    'activecampaign.com': { name: 'ActiveCampaign', price: 29 },
    'drip.com': { name: 'Drip', price: 39 },

    // Monitoring
    'browser.sentry-cdn.com': { name: 'Sentry', price: 26 },
    'sentry-cdn.com': { name: 'Sentry', price: 26 },
    'sentry.io': { name: 'Sentry', price: 26 },
    'cdn.logrocket.io': { name: 'LogRocket', price: 99 },
    'logrocket.io': { name: 'LogRocket', price: 99 },
    'cdn.bugsnag.com': { name: 'Bugsnag', price: 47 },
    'bugsnag.com': { name: 'Bugsnag', price: 47 },
    'js.nr-data.net': { name: 'New Relic', price: 49 },
    'newrelic.com': { name: 'New Relic', price: 49 },
    'cdn.rollbar.com': { name: 'Rollbar', price: 25 },
    'rollbar.com': { name: 'Rollbar', price: 25 },
    'datadoghq.com': { name: 'Datadog', price: 35 },
    'cdn.raygun.io': { name: 'Raygun', price: 24 },

    // Consent/Cookie
    'cdn.cookielaw.org': { name: 'OneTrust', price: 299 },
    'cookielaw.org': { name: 'OneTrust', price: 299 },
    'cdn.iubenda.com': { name: 'Iubenda', price: 27 },
    'iubenda.com': { name: 'Iubenda', price: 27 },
    'cdn.cookiebot.com': { name: 'Cookiebot', price: 12 },
    'cookiebot.com': { name: 'Cookiebot', price: 12 },
    'consent.cookiefirst.com': { name: 'CookieFirst', price: 49 },
    'cookiefirst.com': { name: 'CookieFirst', price: 49 },
    'quantcast.com': { name: 'Quantcast Choice', price: 99 },
    'termly.io': { name: 'Termly', price: 15 },
    'osano.com': { name: 'Osano', price: 99 },

    // Push Notifications
    'cdn.onesignal.com': { name: 'OneSignal', price: 9 },
    'onesignal.com': { name: 'OneSignal', price: 9 },
    'cdn.pushengage.com': { name: 'PushEngage', price: 9 },
    'pushengage.com': { name: 'PushEngage', price: 9 },
    'pushcrew.com': { name: 'PushCrew', price: 25 },

    // A/B Testing
    'cdn.optimizely.com': { name: 'Optimizely', price: 199 },
    'optimizely.com': { name: 'Optimizely', price: 199 },
    'cdn.vwo.com': { name: 'VWO', price: 199 },
    'vwo.com': { name: 'VWO', price: 199 },
    'abtasty.com': { name: 'AB Tasty', price: 149 },

    // Other Paid
    'js.adsrvr.org': { name: 'The Trade Desk', price: 50 },
    'cdn.contentful.com': { name: 'Contentful', price: 489 },
    'contentful.com': { name: 'Contentful', price: 489 },
    'algolia.net': { name: 'Algolia', price: 35 },
    'algoliacdn.com': { name: 'Algolia', price: 35 },
    'cdn.shopify.com': { name: 'Shopify', price: 29 },
    'trustpilot.com': { name: 'Trustpilot', price: 199 },
    'yotpo.com': { name: 'Yotpo', price: 79 },
    'stamped.io': { name: 'Stamped.io', price: 19 },
    'rewardful.com': { name: 'Rewardful', price: 29 },
    'referralcandy.com': { name: 'ReferralCandy', price: 47 },
};

// Trackers (extended)
const TRACKERS = [
    { name: 'Google Analytics', patterns: ['google-analytics.com', 'googletagmanager.com', 'gtag(', 'ga('] },
    { name: 'Facebook Pixel', patterns: ['connect.facebook.net', 'fbq(', 'facebook.com/tr'] },
    { name: 'Google Ads', patterns: ['googleadservices.com', 'googlesyndication.com', 'doubleclick.net'] },
    { name: 'Hotjar', patterns: ['hotjar.com', 'static.hotjar.com'] },
    { name: 'Microsoft Clarity', patterns: ['clarity.ms'] },
    { name: 'LinkedIn Insight', patterns: ['snap.licdn.com'] },
    { name: 'TikTok Pixel', patterns: ['analytics.tiktok.com'] },
    { name: 'Twitter/X Pixel', patterns: ['static.ads-twitter.com'] },
    { name: 'Pinterest Tag', patterns: ['ct.pinterest.com'] },
    { name: 'Criteo', patterns: ['static.criteo.net', 'criteo.com'] },
    { name: 'Taboola', patterns: ['cdn.taboola.com'] },
    { name: 'Outbrain', patterns: ['outbrain.com'] },
];

async function checkDNS(name, contains) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=TXT`, {
            signal: AbortSignal.timeout(3000)
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.Answer?.some(a => a.data?.toLowerCase().includes(contains.toLowerCase())) || false;
    } catch { return false; }
}

async function checkDNSExists(name, type = 'A') {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, {
            signal: AbortSignal.timeout(3000)
        });
        if (!response.ok) return false;
        const data = await response.json();
        return data.Answer?.length > 0;
    } catch { return false; }
}

function detectTrackers(html) {
    const htmlLower = html.toLowerCase();
    const found = [];
    for (const t of TRACKERS) {
        for (const p of t.patterns) {
            if (htmlLower.includes(p.toLowerCase())) {
                if (!found.includes(t.name)) found.push(t.name);
                break;
            }
        }
    }
    return found;
}

function detectHiddenCosts(html) {
    const htmlLower = html.toLowerCase();
    const detected = [];
    const seen = new Set();

    for (const [domain, info] of Object.entries(SAAS_PRICING)) {
        if (htmlLower.includes(domain) && !seen.has(info.name)) {
            seen.add(info.name);
            detected.push({ name: info.name, price: info.price });
        }
    }

    return detected;
}

async function auditDomain(domain) {
    const result = {
        domain,
        checksPassedList: [],
        issuesFoundList: [],
        trackersFound: [],
        hiddenCosts: { services: [], totalMonthly: 0 },
    };

    try {
        const res = await fetch(`https://${domain}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 PrivacyChecker/1.0' },
            redirect: 'follow',
            signal: AbortSignal.timeout(10000)
        });

        if (!res.ok) {
            result.error = `HTTP ${res.status}`;
            return result;
        }

        const html = await res.text();
        const headers = res.headers;
        const htmlLower = html.toLowerCase();
        const rootDomain = domain.replace(/^www\./i, '');

        // ============ HIDDEN COSTS ============
        const hiddenServices = detectHiddenCosts(html);
        result.hiddenCosts.services = hiddenServices;
        result.hiddenCosts.totalMonthly = hiddenServices.reduce((sum, s) => sum + s.price, 0);

        // ============ CHECKS PASSED ============

        if (res.url.startsWith('https://')) {
            result.checksPassedList.push('HTTPS Enabled');
            result.checksPassedList.push('Valid SSL Certificate');
        }

        if (headers.get('strict-transport-security')) result.checksPassedList.push('HSTS Enabled');
        if (headers.get('x-frame-options')) result.checksPassedList.push('Clickjacking Protection');
        if (headers.get('content-security-policy')) result.checksPassedList.push('Content Security Policy');
        if (headers.get('x-content-type-options')) result.checksPassedList.push('MIME Sniffing Protection');
        if (headers.get('referrer-policy')) result.checksPassedList.push('Referrer Policy');
        if (headers.get('permissions-policy') || headers.get('feature-policy')) result.checksPassedList.push('Permissions Policy');
        if (!headers.get('server')) result.checksPassedList.push('Server Header Hidden');
        if (!headers.get('x-powered-by')) result.checksPassedList.push('Technology Stack Hidden');

        if (htmlLower.match(/privacy.?policy|datenschutz|confidentialit/)) result.checksPassedList.push('Privacy Policy Link');
        if (htmlLower.match(/cookie.?(consent|banner)|gdpr|rgpd/)) result.checksPassedList.push('Cookie Consent Banner');
        if (htmlLower.match(/impressum|imprint|legal.?(notice|mentions)|mentions.?l[eé]gales/)) result.checksPassedList.push('Legal Mentions');
        if (htmlLower.match(/terms.?(of.?service|and.?conditions)|agb|cgv|cgu/)) result.checksPassedList.push('Terms of Service');

        const [hasSPF, hasDMARC, hasCAA, hasDNSSEC] = await Promise.all([
            checkDNS(rootDomain, 'v=spf1'),
            checkDNS(`_dmarc.${rootDomain}`, 'v=dmarc1'),
            checkDNSExists(rootDomain, 'CAA'),
            checkDNSExists(rootDomain, 'DNSKEY'),
        ]);

        if (hasSPF) result.checksPassedList.push('SPF Email Authentication');
        if (hasDMARC) result.checksPassedList.push('DMARC Email Authentication');
        if (hasCAA) result.checksPassedList.push('CAA DNS Record');
        if (hasDNSSEC) result.checksPassedList.push('DNSSEC Enabled');

        const exposedEmails = html.match(/mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+/gi) || [];
        if (exposedEmails.length === 0) result.checksPassedList.push('No Exposed Emails');

        const trackers = detectTrackers(html);
        result.trackersFound = trackers;
        if (trackers.length === 0) result.checksPassedList.push('No Third-Party Trackers');

        // ============ ISSUES FOUND ============

        // Security
        if (!res.url.startsWith('https://')) result.issuesFoundList.push('🔴 No HTTPS Encryption');
        if (!headers.get('strict-transport-security')) result.issuesFoundList.push('Missing HSTS Header');
        if (!headers.get('content-security-policy')) result.issuesFoundList.push('Missing Content Security Policy');
        if (!headers.get('x-frame-options')) result.issuesFoundList.push('Clickjacking Vulnerability');
        if (!headers.get('x-content-type-options')) result.issuesFoundList.push('MIME Type Vulnerability');
        if (!headers.get('referrer-policy')) result.issuesFoundList.push('Missing Referrer Policy');
        if (!headers.get('permissions-policy') && !headers.get('feature-policy')) result.issuesFoundList.push('Missing Permissions Policy');
        if (headers.get('server')) result.issuesFoundList.push('Server Technology Exposed');
        if (headers.get('x-powered-by')) result.issuesFoundList.push('Technology Stack Exposed');

        // DNS
        if (!hasSPF) result.issuesFoundList.push('No SPF Record (Email Spoofing Risk)');
        if (!hasDMARC) result.issuesFoundList.push('No DMARC Record (Email Fraud Risk)');
        if (!hasCAA) result.issuesFoundList.push('No CAA DNS Record');
        if (!hasDNSSEC) result.issuesFoundList.push('DNSSEC Not Enabled');

        // GDPR
        if (!htmlLower.match(/privacy.?policy|datenschutz|confidentialit/)) result.issuesFoundList.push('No Privacy Policy');
        if (!htmlLower.match(/cookie.?(consent|banner)|gdpr|rgpd/)) result.issuesFoundList.push('No Cookie Consent');
        if (!htmlLower.match(/cookie.?policy|politique.?cookies/)) result.issuesFoundList.push('No Dedicated Cookie Policy');
        if (!htmlLower.match(/dpo@|data.?protection.?officer|datenschutzbeauftragte/)) result.issuesFoundList.push('No DPO Contact');
        if (!htmlLower.match(/delete.?data|data.?deletion|right.?to.?erasure/)) result.issuesFoundList.push('No Data Deletion Info');
        if (!htmlLower.match(/data.?retention|conservation.?donn/)) result.issuesFoundList.push('No Data Retention Info');
        if (!htmlLower.match(/consent.?withdraw|retirer.?consentement/)) result.issuesFoundList.push('No Consent Withdrawal Info');
        if (!htmlLower.match(/legal.?basis|base.?l[eé]gale/)) result.issuesFoundList.push('No Legal Basis Stated');

        // Legal
        if (!htmlLower.match(/impressum|imprint|legal.?(notice|mentions)|mentions.?l[eé]gales/)) {
            result.issuesFoundList.push('No Legal Imprint');
        }

        // Trackers
        if (trackers.length > 0) {
            result.issuesFoundList.push(`Third-Party Trackers (${trackers.length}): ${trackers.slice(0, 3).join(', ')}${trackers.length > 3 ? '...' : ''}`);
        }
        if (exposedEmails.length > 0) result.issuesFoundList.push(`Exposed Email Addresses (${exposedEmails.length})`);

        // Advanced
        if (!htmlLower.match(/accessibilit[yé]|barrierefreiheit|wcag/)) result.issuesFoundList.push('No Accessibility Statement');
        if (!htmlLower.match(/opt.out|unsubscribe|d[eé]sinscri/)) result.issuesFoundList.push('No Opt-out Mechanism');
        if (!htmlLower.includes('integrity=')) result.issuesFoundList.push('No Subresource Integrity (SRI)');
        if (!htmlLower.match(/security\.txt|vulnerability|bug.?bounty/)) result.issuesFoundList.push('No Security Disclosure Policy');
        if (!htmlLower.match(/children|minors|under.?1[36]|enfants/)) result.issuesFoundList.push('No Children\'s Privacy Info');

        // === HIDDEN COSTS ISSUE ===
        if (result.hiddenCosts.totalMonthly > 0) {
            result.issuesFoundList.push(`💰 Estimated Hidden SaaS Costs: €${result.hiddenCosts.totalMonthly}/month`);
        }

    } catch (e) {
        result.error = e.message;
    }

    return result;
}

// Test
async function main() {
    const testDomains = ['lemonde.fr', 'amazon.fr', 'airbnb.fr', 'zalando.fr', 'cdiscount.com'];

    console.log('═'.repeat(60));
    console.log('  ULTIMATE AUDIT - 40+ Checks + Hidden Costs');
    console.log('═'.repeat(60));

    for (const domain of testDomains) {
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`  📌 ${domain.toUpperCase()}`);
        console.log('─'.repeat(60));

        const result = await auditDomain(domain);

        console.log(`\n  ✅ CHECKS PASSED: ${result.checksPassedList.length}`);
        result.checksPassedList.slice(0, 6).forEach(c => console.log(`     • ${c}`));
        if (result.checksPassedList.length > 6) console.log(`     ... and ${result.checksPassedList.length - 6} more`);

        console.log(`\n  ❌ ISSUES FOUND: ${result.issuesFoundList.length}`);
        result.issuesFoundList.forEach(c => console.log(`     • ${c}`));

        if (result.hiddenCosts.services.length > 0) {
            console.log(`\n  💰 HIDDEN COSTS DETECTED:`);
            console.log(`     Total: €${result.hiddenCosts.totalMonthly}/month (€${result.hiddenCosts.totalMonthly * 12}/year)`);
            result.hiddenCosts.services.forEach(s => console.log(`     • ${s.name}: €${s.price}/mo`));
        }

        if (result.error) console.log(`\n  ⚠️ Error: ${result.error}`);
    }

    console.log('\n' + '═'.repeat(60));
}

main();
