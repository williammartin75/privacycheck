import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'wix-gdpr-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Wix websites are <strong>not GDPR compliant by default</strong>.
                While Wix provides tools to help with compliance (cookie banner, privacy policy generator, DPA),
                you must manually configure them. Out of the box, a Wix site sets tracking cookies without consent,
                loads third-party scripts, and uses a generic privacy policy. Here&apos;s how to fix it.
            </p>

            <h2>Why Wix Sites Have GDPR Issues</h2>
            <p>
                Wix powers over <strong>200 million websites</strong> worldwide. But most Wix site owners don&apos;t
                realize their sites have compliance gaps:
            </p>
            <ul>
                <li><strong>Wix Analytics</strong> tracks visitors automatically — no consent asked</li>
                <li><strong>Third-party apps</strong> from the Wix App Market often set cookies without disclosure</li>
                <li><strong>Wix&apos;s built-in cookie banner</strong> is disabled by default</li>
                <li><strong>Contact forms</strong> don&apos;t include consent checkboxes by default</li>
                <li><strong>Google Fonts</strong> load externally (transmitting IP addresses to Google)</li>
                <li><strong>Social media widgets</strong> track visitors without consent</li>
            </ul>

            <h2>Step-by-Step: Making Your Wix Site GDPR Compliant</h2>

            <h3>Step 1: Enable the Wix Cookie Banner</h3>
            <ol>
                <li>Go to <strong>Settings → Privacy &amp; Cookies</strong> in your Wix dashboard</li>
                <li>Enable the <strong>Cookie Consent Banner</strong></li>
                <li>Set it to <strong>&quot;Prior Consent&quot;</strong> mode (blocks cookies until accepted)</li>
                <li>Customize categories: Essential, Analytics, Marketing, Functional</li>
                <li>Ensure &quot;Accept&quot; and &quot;Reject&quot; buttons are <strong>equally prominent</strong> (avoid <a href="/blog/dark-patterns-detection">dark patterns</a>)</li>
            </ol>
            <p>
                <strong>Important:</strong> Wix&apos;s built-in banner is basic. For full compliance,
                consider a third-party <a href="/blog/consent-management-platform-comparison">CMP like Cookiebot or Iubenda</a> which
                integrates with Wix and offers more granular control.
            </p>

            <h3>Step 2: Add a Privacy Policy</h3>
            <p>
                Wix offers a privacy policy generator, but it&apos;s generic. You need to customize it:
            </p>
            <ul>
                <li>List all Wix apps you use (each one is a data processor)</li>
                <li>Specify what data your forms collect</li>
                <li>Mention Wix as a data processor (data stored on Wix/AWS servers)</li>
                <li>Include all <a href="/blog/gdpr-privacy-policy-template">12 required GDPR sections</a></li>
            </ul>
            <p>
                Add a link to your privacy policy in the footer of every page.
            </p>

            <h3>Step 3: Configure Contact Forms</h3>
            <ul>
                <li>Add an <strong>unchecked consent checkbox</strong> to every form</li>
                <li>Text example: &quot;I consent to the processing of my data as described in the <a href="/privacy">Privacy Policy</a>&quot;</li>
                <li>Don&apos;t pre-check the box — this violates GDPR</li>
                <li>Store consent records (Wix Automations can help timestamp submissions)</li>
            </ul>

            <h3>Step 4: Handle Wix Apps &amp; Third-Party Integrations</h3>
            <p>Each Wix app that processes visitor data needs attention:</p>
            <table>
                <thead>
                    <tr><th>Common Wix App</th><th>GDPR Issue</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>Wix Analytics</td><td>Tracks without consent</td><td>Enable cookie banner; link Analytics to consent</td></tr>
                    <tr><td>Wix Chat</td><td>Sets session cookies</td><td>Load only after consent or classify as essential</td></tr>
                    <tr><td>Wix Stores</td><td>Payment data processing</td><td>Use Wix Payments (PCI compliant); update privacy policy</td></tr>
                    <tr><td>Facebook Pixel</td><td>Cross-site tracking</td><td>Load only after marketing consent</td></tr>
                    <tr><td>Google Analytics</td><td>Data transfer to US</td><td>Consent required; consider <a href="/blog/cookie-free-analytics-alternatives">alternatives</a></td></tr>
                    <tr><td>Mailchimp</td><td>US data transfer</td><td>Sign DPA; enable double opt-in</td></tr>
                    <tr><td>Instagram Feed</td><td>Sets Meta tracking cookies</td><td>Load after consent or use static images</td></tr>
                </tbody>
            </table>

            <h3>Step 5: Sign Wix&apos;s DPA</h3>
            <p>
                Wix acts as your <strong>data processor</strong>. GDPR requires a Data Processing Agreement:
            </p>
            <ol>
                <li>Go to <strong>Wix&apos;s DPA page</strong> (wix.com/about/privacy-dpa-users)</li>
                <li>Review and sign the agreement</li>
                <li>Keep a copy for your records</li>
            </ol>

            <h3>Step 6: Address Cross-Border Data Transfers</h3>
            <p>
                Wix stores data on <strong>AWS servers in the US and EU</strong>. For EU users:
            </p>
            <ul>
                <li>Wix relies on Standard Contractual Clauses for EU→US transfers</li>
                <li>Disclose this in your privacy policy</li>
                <li>Check if your Wix apps also transfer data — each app may have its own data center</li>
                <li>See our <a href="/blog/cross-border-data-transfers-schrems">cross-border transfer guide</a></li>
            </ul>

            <h3>Step 7: Set Up Email Marketing Compliance</h3>
            <ul>
                <li>Use Wix&apos;s built-in email marketing with <strong>double opt-in</strong> enabled</li>
                <li>Include an unsubscribe link in every email</li>
                <li>Keep consent records with timestamps</li>
                <li>Set up <a href="/blog/spf-dkim-dmarc-email-deliverability">SPF, DKIM, and DMARC</a> for your custom domain</li>
            </ul>

            <h3>Step 8: Enable HTTPS</h3>
            <p>
                Wix provides free SSL certificates. Verify it&apos;s active:
            </p>
            <ul>
                <li>Go to <strong>Settings → Custom Domains</strong></li>
                <li>Ensure SSL is enabled (green lock icon)</li>
                <li>Check for <a href="/blog/website-security-headers-guide">mixed content</a> issues</li>
            </ul>

            <h2>Wix GDPR Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>Check</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie consent banner enabled (Prior Consent mode)</td><td>Required</td></tr>
                    <tr><td>Privacy policy published and linked in footer</td><td>Required</td></tr>
                    <tr><td>Consent checkbox on all forms (unchecked by default)</td><td>Required</td></tr>
                    <tr><td>Wix DPA signed</td><td>Required</td></tr>
                    <tr><td>All Wix apps listed in privacy policy</td><td>Required</td></tr>
                    <tr><td>Google Analytics loaded only after consent</td><td>Required</td></tr>
                    <tr><td>Facebook Pixel loaded only after consent</td><td>If used</td></tr>
                    <tr><td>Double opt-in for email marketing</td><td>Recommended</td></tr>
                    <tr><td>SSL/HTTPS enabled</td><td>Required</td></tr>
                    <tr><td>Data subject request process documented</td><td>Required</td></tr>
                    <tr><td>Cross-border transfers disclosed</td><td>Required</td></tr>
                    <tr><td>Self-hosted fonts (no external Google Fonts)</td><td>Recommended</td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>Is Wix GDPR compliant out of the box?</h3>
            <p>
                <strong>No.</strong> Wix provides the <em>tools</em> for compliance, but you must configure them.
                The cookie banner is disabled by default, forms lack consent checkboxes, and the generic privacy
                policy doesn&apos;t cover your specific data practices.
            </p>

            <h3>Do I need a cookie banner on my Wix site?</h3>
            <p>
                <strong>Yes</strong> if you have EU visitors. Even without Google Analytics, Wix itself sets cookies
                for analytics and functionality. Use our <a href="/blog/do-you-need-a-cookie-banner">cookie banner decision guide</a>.
            </p>

            <h3>Can Wix handle data deletion requests?</h3>
            <p>
                Partially. Wix allows you to delete contacts from the CRM, but data in third-party apps,
                email marketing lists, and analytics must be handled separately.
            </p>

            <h3>How do I check if my Wix site is actually compliant?</h3>
            <p>
                <a href="/">Scan your Wix site with PrivacyChecker</a>. It detects cookies, trackers, consent
                issues, missing privacy policy sections, and security headers — giving you a clear report
                of what needs fixing.
            </p>
        </ArticleLayout>
    );
}
