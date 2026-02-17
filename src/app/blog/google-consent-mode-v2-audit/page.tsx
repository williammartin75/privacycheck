import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'google-consent-mode-v2-audit')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Google Consent Mode v2 is now <strong>mandatory</strong> for any website
                using Google Ads, Analytics, or any Google marketing tag in the EU. Since March 2024, websites without
                a properly configured Consent Mode v2 setup lose remarketing audiences, conversion tracking, and
                campaign optimization data. Here&apos;s how to audit and fix your implementation.
            </p>

            <h2>What Is Google Consent Mode v2?</h2>
            <p>
                Consent Mode v2 is Google&apos;s framework for adjusting how Google tags behave based on a
                user&apos;s cookie consent choices. When a user rejects cookies, Google tags still fire — but in a
                &quot;cookieless&quot; mode that uses modeled data instead of actual tracking.
            </p>
            <p>
                The key difference from v1: <strong>two new consent signals</strong> were added:
            </p>
            <table>
                <thead>
                    <tr><th>Signal</th><th>What It Controls</th><th>New in v2</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>ad_storage</code></td><td>Advertising cookies (Google Ads, Floodlight)</td><td>No (v1)</td></tr>
                    <tr><td><code>analytics_storage</code></td><td>Analytics cookies (GA4)</td><td>No (v1)</td></tr>
                    <tr><td><code>ad_user_data</code></td><td>Whether user data can be sent to Google for advertising</td><td><strong>Yes</strong></td></tr>
                    <tr><td><code>ad_personalization</code></td><td>Whether personalized ads can be shown</td><td><strong>Yes</strong></td></tr>
                </tbody>
            </table>

            <h2>Why It Matters: What Happens Without It</h2>
            <ul>
                <li><strong>No remarketing audiences</strong> — Google Ads can&apos;t build audience lists for retargeting</li>
                <li><strong>No conversion tracking</strong> — Conversions from EU users won&apos;t be attributed correctly</li>
                <li><strong>Campaign performance drops</strong> — Smart Bidding loses signal data, CPAs increase</li>
                <li><strong>Compliance risk</strong> — Without proper consent signal forwarding, you may be violating GDPR and the DMA (Digital Markets Act)</li>
            </ul>

            <h2>Audit Checklist: Is Your Setup Correct?</h2>
            <p>Use this checklist to verify your Consent Mode v2 implementation:</p>

            <h3>1. Check if Consent Mode is Active</h3>
            <p>
                Open Chrome DevTools → Console → Type <code>dataLayer</code> and press Enter.
                Look for a <code>consent</code> event with <code>default</code> command. You should see all four
                signals set:
            </p>
            <ul>
                <li><code>ad_storage: &apos;denied&apos;</code></li>
                <li><code>analytics_storage: &apos;denied&apos;</code></li>
                <li><code>ad_user_data: &apos;denied&apos;</code> ← <strong>Must exist for v2</strong></li>
                <li><code>ad_personalization: &apos;denied&apos;</code> ← <strong>Must exist for v2</strong></li>
            </ul>

            <h3>2. Check the Default State</h3>
            <p>
                The default consent state should be <code>denied</code> for all signals <strong>before</strong> the
                user interacts with the banner. If any signal defaults to <code>granted</code>, you&apos;re setting
                cookies before consent — a GDPR violation.
            </p>

            <h3>3. Verify Consent Update on Accept</h3>
            <p>
                Click &quot;Accept All&quot; on your cookie banner, then check <code>dataLayer</code> again.
                You should see a <code>consent</code> event with <code>update</code> command, changing all signals
                to <code>granted</code>.
            </p>

            <h3>4. Check the &quot;Reject&quot; Path</h3>
            <p>
                Clear cookies, reload the page, and click &quot;Reject&quot;. All signals should remain
                <code>denied</code>. Crucially: <strong>no Google cookies should be set</strong>. Check the
                Application → Cookies tab in DevTools.
            </p>

            <h3>5. Verify in Google Tag Assistant</h3>
            <p>
                Install the <strong>Google Tag Assistant Companion</strong> Chrome extension. Navigate to your
                site and check:
            </p>
            <ul>
                <li>All four consent types appear in the Consent tab</li>
                <li>The &quot;Consent Mode&quot; indicator shows &quot;Active&quot;</li>
                <li>No warnings about missing <code>ad_user_data</code> or <code>ad_personalization</code></li>
            </ul>

            <h3>6. Check Google Ads Diagnostics</h3>
            <p>
                In your Google Ads account: Tools → Diagnostics → Consent Mode. Google shows whether your
                tags are properly sending consent signals. Look for the green checkmark on all four parameters.
            </p>

            <h2>Compatible CMP Platforms</h2>
            <p>
                These Consent Management Platforms support Consent Mode v2 natively:
            </p>
            <table>
                <thead>
                    <tr><th>CMP</th><th>Built-in v2 Support</th><th>Free Tier</th><th>Google CMP Partner</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookiebot (Usercentrics)</td><td>Yes</td><td>Yes (1 domain)</td><td>Yes</td></tr>
                    <tr><td>CookieYes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Complianz</td><td>Yes</td><td>Yes (WordPress)</td><td>Yes</td></tr>
                    <tr><td>Axeptio</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>OneTrust</td><td>Yes</td><td>No</td><td>Yes</td></tr>
                    <tr><td>Termly</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Tarteaucitron</td><td>Partial (manual config)</td><td>Yes (open source)</td><td>No</td></tr>
                </tbody>
            </table>

            <h2>Common Mistakes</h2>
            <ol>
                <li><strong>Missing <code>ad_user_data</code> / <code>ad_personalization</code></strong> — This means you&apos;re still on v1. Update your CMP or GTM configuration</li>
                <li><strong>Consent default set to &apos;granted&apos;</strong> — Illegal under GDPR. Must default to &apos;denied&apos; in EEA countries</li>
                <li><strong>Google tags firing before consent script</strong> — If your gtag.js loads before the CMP banner, cookies are set before consent</li>
                <li><strong>No region-specific settings</strong> — Consent Mode supports <code>region</code> parameter. Set &apos;denied&apos; default only for EEA, UK, and other regulated regions</li>
                <li><strong>Not testing the reject path</strong> — Most sites only test &quot;Accept All&quot;. The reject path is where GDPR violations hide</li>
            </ol>

            <h2>How PrivacyChecker Helps</h2>
            <p>
                <a href="/">PrivacyChecker</a> automatically detects whether your website has Google Consent Mode v2
                configured correctly. Our scanner checks:
            </p>
            <ul>
                <li>Presence of all four consent signals in the default consent state</li>
                <li>Whether cookies are set before consent is granted</li>
                <li>Whether the cookie banner has a functional reject button</li>
                <li>Third-party scripts loading before consent (dark patterns)</li>
                <li>Google tag compliance with current DMA requirements</li>
            </ul>
            <p>
                <a href="/">Run a free scan</a> to check your Consent Mode v2 setup in under 60 seconds.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Is Consent Mode v2 mandatory?</h3>
            <p>
                <strong>Yes</strong>, for any website serving EU users and using Google Ads, GA4, or any Google marketing
                product. Since March 2024, Google requires Consent Mode v2 to maintain full advertising functionality.
                Without it, you lose remarketing, conversion tracking, and audience data for EU users.
            </p>

            <h3>Does Consent Mode v2 make my site GDPR compliant?</h3>
            <p>
                <strong>Not by itself.</strong> Consent Mode is a technical framework that helps Google tags respect
                consent choices. But you still need a <strong>compliant cookie banner</strong> (with clear accept/reject
                options), a valid <strong>privacy policy</strong>, and proper consent records. Use
                <a href="/">PrivacyChecker</a> for a full compliance audit.
            </p>

            <h3>Can I use Google Analytics without Consent Mode?</h3>
            <p>
                Technically yes, but in the EU this creates significant legal risk. Without Consent Mode, GA4 sets
                cookies regardless of consent status, which violates the ePrivacy Directive. Several DPAs (Austria,
                France, Italy) have already ruled against GA4 use without proper consent mechanisms.
            </p>
        </ArticleLayout>
    );
}
