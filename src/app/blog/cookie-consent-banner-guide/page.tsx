import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cookie-consent-banner-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Cookie consent banners are one of the most visible — and most frequently violated — privacy requirements on the web.
                Getting them wrong can lead to GDPR fines, user trust issues, and legal action from privacy advocates.
                This guide covers everything you need to implement a compliant, user-friendly consent banner.
            </p>

            <h2>Why Cookie Consent Matters</h2>
            <p>
                Under GDPR and the ePrivacy Directive, you must obtain informed, specific, and freely given consent
                before placing non-essential cookies on a visitor&apos;s device. &quot;Non-essential&quot; includes analytics cookies (Google Analytics),
                advertising cookies (Facebook Pixel), and any third-party tracking scripts.
            </p>
            <p>
                Enforcement is increasing: In 2024 alone, regulators issued over €100M in fines for cookie violations.
                The French CNIL fined Google €150M and Facebook €60M specifically for making it harder to reject cookies than to accept them.
            </p>

            <h2>What Makes a Banner Compliant?</h2>
            <table>
                <thead>
                    <tr><th>Requirement</th><th>Compliant</th><th>Non-Compliant</th></tr>
                </thead>
                <tbody>
                    <tr><td>Reject option</td><td>&quot;Accept All&quot; and &quot;Reject All&quot; buttons at the same level</td><td>Reject buried in settings or absent</td></tr>
                    <tr><td>Pre-selection</td><td>No cookies pre-checked</td><td>Analytics or marketing pre-checked</td></tr>
                    <tr><td>Cookie wall</td><td>Site accessible without consent</td><td>Blocking access until consent given</td></tr>
                    <tr><td>Forced consent</td><td>Content accessible with essential cookies only</td><td>&quot;Accept cookies or leave&quot;</td></tr>
                    <tr><td>Withdraw consent</td><td>Easy to change preferences anytime</td><td>No way to revoke after accepting</td></tr>
                    <tr><td>Information</td><td>Clear categories and purposes</td><td>Vague &quot;we use cookies to improve experience&quot;</td></tr>
                </tbody>
            </table>

            <h2>The 5 Categories of Cookies</h2>
            <h3>1. Strictly Necessary (No consent needed)</h3>
            <p>Cookies required for the website to function: session cookies, authentication tokens, shopping cart cookies, CSRF protection, load balancing.</p>

            <h3>2. Functional (Consent required)</h3>
            <p>Cookies that enhance functionality but aren&apos;t essential: language preferences, user interface customization, chat widget state.</p>

            <h3>3. Analytics (Consent required)</h3>
            <p>Cookies that measure website performance: Google Analytics, Hotjar, Plausible (even privacy-friendly analytics may require consent depending on configuration).</p>

            <h3>4. Marketing/Advertising (Consent required)</h3>
            <p>Cookies used for targeted advertising: Facebook Pixel, Google Ads, LinkedIn Insight Tag, retargeting cookies.</p>

            <h3>5. Third-Party/Social (Consent required)</h3>
            <p>Cookies set by embedded content: YouTube embeds, social media widgets, embedded maps, comment systems.</p>

            <h2>Implementation Best Practices</h2>

            <h3>Technical Architecture</h3>
            <ol>
                <li>
                    <strong>Block scripts before consent</strong>: Use <code>type=&quot;text/plain&quot;</code> for tracking scripts
                    and change them to <code>type=&quot;text/javascript&quot;</code> after consent
                </li>
                <li>
                    <strong>Load essential scripts normally</strong>: Don&apos;t block scripts that are strictly necessary
                </li>
                <li>
                    <strong>Listen for consent events</strong>: Fire analytics only after the user opts in
                </li>
                <li>
                    <strong>Support Google Consent Mode v2</strong>: Required for Google Ads remarketing since March 2024.
                    Use the <a href="/docs/consent-mode">Consent Mode documentation</a> for implementation details
                </li>
            </ol>

            <h3>Design Guidelines</h3>
            <ul>
                <li>Place the banner at the bottom or center of the page — avoid top banners that look like ads</li>
                <li>&quot;Accept&quot; and &quot;Reject&quot; buttons must have equal visual weight (same size, color prominence)</li>
                <li>Use clear language: &quot;Accept All Cookies&quot; / &quot;Reject Non-Essential&quot; / &quot;Manage Preferences&quot;</li>
                <li>Show a brief explanation of each cookie category</li>
                <li>Provide a link to your full <a href="/blog/gdpr-compliance-checklist-2026">cookie/privacy policy</a></li>
            </ul>

            <h2>Common Mistakes</h2>
            <ol>
                <li>
                    <strong>Dark patterns in consent</strong>: Making &quot;Accept&quot; a bright button and &quot;Reject&quot; a tiny text link.
                    This is explicitly cited by CNIL and ICO as non-compliant. See our guide on <a href="/blog/dark-patterns-detection">dark patterns</a>.
                </li>
                <li>
                    <strong>Loading trackers before consent</strong>: Google Analytics firing on page load before the banner appears.
                    This is the most common technical violation.
                </li>
                <li>
                    <strong>No audit of actual cookies</strong>: Installing a consent banner without scanning what cookies your site actually sets.
                    Many CMS plugins and themes add cookies you don&apos;t know about.
                </li>
                <li>
                    <strong>Not recording consent</strong>: You must be able to demonstrate that a user gave consent.
                    Store the timestamp, version, and choices made.
                </li>
                <li>
                    <strong>Ignoring non-EU visitors</strong>: Even if CCPA uses opt-out, many other countries
                    (Brazil&apos;s LGPD, South Korea&apos;s PIPA) also require opt-in consent.
                </li>
            </ol>

            <h2>Google Consent Mode v2</h2>
            <p>
                Since March 2024, Google requires Consent Mode v2 for any website using Google Ads remarketing or personalization for EEA users.
                Consent Mode signals whether the user has granted consent for analytics and ad cookies.
            </p>
            <ul>
                <li><code>analytics_storage</code>: Controls Google Analytics cookies</li>
                <li><code>ad_storage</code>: Controls Google Ads cookies</li>
                <li><code>ad_user_data</code>: Controls sending user data to Google for ads</li>
                <li><code>ad_personalization</code>: Controls ad personalization features</li>
            </ul>

            <h2>Quick Start with PrivacyChecker</h2>
            <p>
                PrivacyChecker Pro includes a ready-to-use Cookie Banner Widget that handles consent management,
                Google Consent Mode v2, granular category control, and proof-of-consent recording — all with a single line of code.
            </p>
            <p>
                Start with a <a href="/">free scan</a> to see what cookies and trackers your website currently loads,
                then upgrade to Pro for the widget and step-by-step fix guides.
            </p>
        </ArticleLayout>
    );
}
