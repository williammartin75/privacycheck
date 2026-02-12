import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'google-consent-mode-v2-setup')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Since March 2024, Google requires Consent Mode V2 for any website running Google Ads or Analytics
                in the European Economic Area. Without it, your remarketing audiences shrink, conversion data becomes
                unreliable, and your ad campaigns lose effectiveness. Here&apos;s how to set it up correctly.
            </p>

            <h2>What Is Google Consent Mode V2?</h2>
            <p>
                Consent Mode is a Google API that adjusts how Google tags (Analytics, Ads, Floodlight) behave based
                on user consent. When a user declines cookies, instead of losing all data, Consent Mode sends
                &quot;consent pings&quot; — cookieless signals that Google uses for conversion modeling.
            </p>
            <p>V2 introduces two new required parameters:</p>
            <ul>
                <li><strong>ad_user_data</strong>: Controls whether user data can be sent to Google for advertising</li>
                <li><strong>ad_personalization</strong>: Controls whether personalized advertising is allowed</li>
            </ul>
            <p>Combined with the existing V1 parameters:</p>
            <ul>
                <li><strong>analytics_storage</strong>: Controls Google Analytics cookies</li>
                <li><strong>ad_storage</strong>: Controls Google Ads cookies</li>
            </ul>

            <h2>Why It Matters</h2>
            <table>
                <thead>
                    <tr><th>Without Consent Mode</th><th>With Consent Mode V2</th></tr>
                </thead>
                <tbody>
                    <tr><td>No data from users who decline cookies</td><td>Modeled conversions from cookieless pings</td></tr>
                    <tr><td>Remarketing audiences shrink 30-70%</td><td>Audience recovery through modeling</td></tr>
                    <tr><td>Conversion data gaps in EU markets</td><td>Up to 70% conversion recovery via modeling</td></tr>
                    <tr><td>Risk of losing Google Ads features</td><td>Full access to all Google Ads features</td></tr>
                </tbody>
            </table>

            <h2>Implementation Methods</h2>

            <h3>Method 1: Google Tag Manager (Recommended)</h3>
            <ol>
                <li>
                    <strong>Enable Consent Overview</strong>: In GTM, go to Admin → Container Settings → enable
                    &quot;Enable consent overview&quot;
                </li>
                <li>
                    <strong>Set default consent state</strong>: Add a Consent Initialization tag that sets all four
                    parameters to &quot;denied&quot; by default for EEA visitors
                </li>
                <li>
                    <strong>Connect your CMP</strong>: Your <a href="/blog/consent-management-platform-comparison">Consent Management Platform</a> should
                    fire an update command when the user grants consent
                </li>
                <li>
                    <strong>Verify with Tag Assistant</strong>: Check that consent states change correctly when
                    users accept or reject
                </li>
            </ol>

            <h3>Method 2: Manual Implementation (gtag.js)</h3>
            <pre><code>{`<!-- Set defaults BEFORE loading gtag.js -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Default: deny everything for EEA
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500   // ms to wait for CMP
});
</script>

<!-- Load gtag.js AFTER consent defaults -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXX"></script>

<!-- When user consents, update: -->
<script>
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted',
  'analytics_storage': 'granted'
});
</script>`}</code></pre>

            <h2>CMP Integration</h2>
            <p>
                Your <a href="/blog/cookie-consent-banner-guide">consent banner</a> must communicate with Consent Mode.
                Most major CMPs support this natively:
            </p>
            <table>
                <thead>
                    <tr><th>CMP</th><th>V2 Support</th><th>Setup</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookiebot</td><td>Native</td><td>Automatic when GTM template is used</td></tr>
                    <tr><td>OneTrust</td><td>Native</td><td>Enable in cookie compliance settings</td></tr>
                    <tr><td>Iubenda</td><td>Native</td><td>Automatic with TC string support</td></tr>
                    <tr><td>Didomi</td><td>Native</td><td>Built-in Google Consent Mode integration</td></tr>
                    <tr><td>Osano</td><td>Native</td><td>Enable in platform settings</td></tr>
                </tbody>
            </table>

            <h2>Testing and Verification</h2>
            <ol>
                <li><strong>Google Tag Assistant</strong>: Check consent state changes in real-time</li>
                <li><strong>Chrome DevTools</strong>: Monitor Network tab for consent parameters in Google requests</li>
                <li><strong>Google Analytics Debug View</strong>: Verify events arrive with correct consent status</li>
                <li><strong>PrivacyChecker</strong>: <a href="/">Scan your site</a> to verify Google tags respect consent state</li>
            </ol>

            <h2>Common Mistakes</h2>
            <ul>
                <li><strong>Loading gtag.js before setting defaults</strong>: The consent default must execute BEFORE the Google tag loads</li>
                <li><strong>Missing ad_user_data or ad_personalization</strong>: V2 requires all four parameters — missing two means V1 only</li>
                <li><strong>Not setting wait_for_update</strong>: Without it, tags may fire before the CMP loads</li>
                <li><strong>Granting by default for EU users</strong>: Violates GDPR — default must be &quot;denied&quot; in EEA</li>
                <li><strong>Not testing reject flow</strong>: Verify that declining cookies actually sets parameters to &quot;denied&quot;</li>
            </ul>

            <p>
                <a href="/">Run a PrivacyChecker scan</a> to verify your Consent Mode V2 implementation
                and ensure Google tags behave correctly with and without consent.
            </p>
        </ArticleLayout>
    );
}
