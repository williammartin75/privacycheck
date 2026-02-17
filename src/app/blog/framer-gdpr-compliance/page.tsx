import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'framer-gdpr-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Framer is quickly becoming the go-to tool for designers building production websites. Its built-in analytics
                are privacy-friendly and cookie-free — a major advantage. But that doesn&apos;t mean your Framer site is automatically
                GDPR compliant. This guide covers what you need to configure and what you can skip.
            </p>

            <h2>Framer&apos;s Privacy Advantage</h2>
            <p>
                Unlike most website builders, Framer&apos;s built-in analytics do not use cookies. They rely on
                privacy-friendly, aggregated metrics. This means:
            </p>
            <ul>
                <li>No cookie consent needed for Framer&apos;s own analytics</li>
                <li>No personal data collection from page view tracking</li>
                <li>Potentially no cookie banner needed if you use <em>only</em> Framer&apos;s built-in tools</li>
            </ul>
            <p>
                <strong>However:</strong> The moment you add any third-party script (Google Analytics, Meta Pixel, Hotjar, etc.),
                you need a full cookie consent solution.
            </p>

            <h2>Do You Need a Cookie Banner on Your Framer Site?</h2>
            <table>
                <thead>
                    <tr><th>Scenario</th><th>Cookie Banner Needed?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Framer only (no third-party scripts)</td><td>Likely not (for cookies) — but still need privacy policy</td></tr>
                    <tr><td>Framer + Google Analytics</td><td>Yes</td></tr>
                    <tr><td>Framer + Meta Pixel / LinkedIn</td><td>Yes</td></tr>
                    <tr><td>Framer + YouTube / Vimeo embeds</td><td>Yes</td></tr>
                    <tr><td>Framer + Stripe payments</td><td>Mention in privacy policy; Stripe is essential</td></tr>
                    <tr><td>Framer + Calendly / Typeform embeds</td><td>Yes (if they set cookies)</td></tr>
                </tbody>
            </table>

            <h2>Framer GDPR Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>Requirement</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie-free analytics</td><td>Built-in ✓</td><td>No action needed</td></tr>
                    <tr><td>HTTPS/SSL</td><td>Enabled ✓</td><td>No action needed</td></tr>
                    <tr><td>Cookie consent banner</td><td>Not built-in</td><td>Add via custom code (if using third-party scripts)</td></tr>
                    <tr><td>Privacy policy page</td><td>Not included</td><td>Create a privacy policy page</td></tr>
                    <tr><td>Form consent</td><td>Not included</td><td>Add consent checkboxes to forms</td></tr>
                    <tr><td>Third-party script management</td><td>Manual</td><td>Conditionally load via CMP</td></tr>
                    <tr><td>Data hosting location</td><td>AWS (varies)</td><td>Document in privacy policy</td></tr>
                </tbody>
            </table>

            <h2>Step 1: Create a Privacy Policy</h2>
            <p>
                Every website needs a privacy policy, even if you don&apos;t use cookies. Create a new page in Framer
                and include these Framer-specific disclosures:
            </p>
            <ul>
                <li>Framer as your hosting provider</li>
                <li>Framer&apos;s built-in analytics (even though cookie-free, it processes aggregated visitor data)</li>
                <li>Server logs (IP addresses are collected in access logs)</li>
                <li>Any forms and what data they collect</li>
                <li>All third-party services embedded on your site</li>
                <li>Where data is stored and international transfers</li>
            </ul>
            <p>Use our <a href="/blog/gdpr-privacy-policy-template">GDPR privacy policy template</a> as a foundation.</p>

            <h2>Step 2: Add Cookie Consent (If Needed)</h2>
            <p>
                If you use any third-party scripts, add a <a href="/blog/consent-management-platform-comparison">consent management platform</a>:
            </p>
            <ul>
                <li>Go to <strong>Site Settings → Custom Code → Head</strong></li>
                <li>Add your CMP&apos;s script (CookieYes, Iubenda, or Cookiebot)</li>
                <li>Configure the CMP to block third-party scripts until consent</li>
                <li>Set up consent categories: Essential, Analytics, Marketing</li>
                <li>Test that non-essential cookies are not set before consent</li>
            </ul>

            <h2>Step 3: Configure Forms</h2>
            <p>
                Framer forms collect data that is processed and stored. For GDPR compliance:
            </p>
            <ul>
                <li>Add a consent checkbox with clear text explaining data usage</li>
                <li>Link to your privacy policy from the form</li>
                <li>Never pre-check consent boxes</li>
                <li>If using Framer&apos;s native form handling, the data is stored in your Framer dashboard</li>
                <li>If connecting to external services (Zapier, Airtable, Notion), document these in your privacy policy</li>
            </ul>

            <h2>Step 4: Manage Third-Party Integrations</h2>
            <p>Common Framer integrations and their privacy implications:</p>
            <table>
                <thead>
                    <tr><th>Integration</th><th>Privacy Impact</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google Fonts</td><td>IP sent to Google</td><td>Self-host or accept risk (disclose)</td></tr>
                    <tr><td>Google Analytics</td><td>Full tracking</td><td>Cookie consent + <a href="/blog/google-analytics-4-gdpr-legal">GA4 config</a></td></tr>
                    <tr><td>Lottie animations</td><td>CDN requests</td><td>Minimal impact; mention in policy</td></tr>
                    <tr><td>Intercom/Crisp</td><td>Full tracking</td><td>Cookie consent required</td></tr>
                    <tr><td>Cal.com/Calendly</td><td>Embedded cookies</td><td>Two-click solution or consent</td></tr>
                    <tr><td>Stripe</td><td>Payment data</td><td>Essential; no consent needed</td></tr>
                </tbody>
            </table>

            <h2>Step 5: Handle Data Requests</h2>
            <p>
                Set up a process for <a href="/blog/gdpr-data-subject-rights-guide">data subject access requests</a>:
            </p>
            <ul>
                <li>Provide a contact email or form for privacy requests in your policy</li>
                <li>Form submission data: export from Framer dashboard</li>
                <li>Connected services: coordinate deletion across all tools</li>
                <li>Respond within 30 days</li>
            </ul>

            <h2>When Framer Is Enough (No Cookie Banner)</h2>
            <p>
                If your Framer site meets <em>all</em> of these criteria, you may not need a cookie consent banner:
            </p>
            <ul>
                <li>No third-party analytics (only Framer&apos;s built-in)</li>
                <li>No marketing pixels or ad trackers</li>
                <li>No embedded YouTube, Vimeo, or social media</li>
                <li>No third-party chat widgets</li>
                <li>Self-hosted fonts (or no custom fonts)</li>
                <li>Only essential Stripe for payments</li>
            </ul>
            <p>
                You still need a privacy policy even in this scenario, because your server processes IP addresses and Framer collects aggregated analytics.
            </p>

            <h2>Next Steps</h2>
            <p>
                Verify your Framer site&apos;s privacy compliance. <a href="/">PrivacyChecker</a> scans your site for cookies, trackers,
                <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a>, and privacy policy gaps — regardless
                of what platform it&apos;s built on. Run a free scan to see your status.
            </p>
        </ArticleLayout>
    );
}
