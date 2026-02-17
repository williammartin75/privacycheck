import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'squarespace-gdpr-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Squarespace powers over 4 million websites worldwide, but most Squarespace sites are not GDPR compliant out of the box.
                While Squarespace offers built-in privacy tools, they require manual configuration. This guide walks you through every step
                to make your Squarespace website fully GDPR compliant.
            </p>

            <h2>Is Squarespace GDPR Compliant by Default?</h2>
            <p>
                <strong>No.</strong> Squarespace provides the tools for GDPR compliance, but the default configuration does not meet requirements.
                Specifically, the default setup:
            </p>
            <ul>
                <li>Does not block non-essential cookies before consent</li>
                <li>Does not include a cookie consent banner</li>
                <li>Does not include a GDPR-compliant privacy policy</li>
                <li>Loads Squarespace Analytics by default (which sets cookies)</li>
                <li>Does not collect explicit consent on forms</li>
            </ul>

            <h2>Squarespace GDPR Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>Requirement</th><th>Where in Squarespace</th><th>Default State</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie consent banner</td><td>Settings → Cookie &amp; Visitor Data</td><td>Disabled</td></tr>
                    <tr><td>Privacy policy page</td><td>Pages → Add page</td><td>Not created</td></tr>
                    <tr><td>Form consent checkboxes</td><td>Form block settings</td><td>Not enabled</td></tr>
                    <tr><td>Analytics consent</td><td>Cookie banner + Analytics settings</td><td>Tracks by default</td></tr>
                    <tr><td>Data Processing Agreement</td><td>Part of Squarespace ToS</td><td>Auto-accepted</td></tr>
                    <tr><td>SSL/HTTPS</td><td>Settings → SSL</td><td>Enabled ✓</td></tr>
                </tbody>
            </table>

            <h2>Step 1: Enable and Configure the Cookie Banner</h2>
            <p>Squarespace has a built-in cookie banner. Enable it:</p>
            <ul>
                <li>Go to <strong>Settings → Cookie &amp; Visitor Data → Cookie Banner</strong></li>
                <li>Toggle the cookie banner <strong>ON</strong></li>
                <li>Set the banner type to <strong>&quot;Opt-in&quot;</strong> (not &quot;Informational&quot;)</li>
                <li>Customize the message to explain what cookies you use and why</li>
                <li>Add a link to your privacy policy page</li>
                <li>Include both <strong>Accept</strong> and <strong>Decline</strong> buttons</li>
            </ul>
            <p>
                <strong>Important:</strong> Squarespace&apos;s built-in banner is basic. For EU visitors, consider a third-party CMP for granular consent categories
                (Analytics, Marketing, Functional). Options include CookieYes, Iubenda, and Cookiebot — all integrate via code injection.
            </p>

            <h2>Step 2: Create a Privacy Policy Page</h2>
            <p>Every Squarespace site needs a <a href="/blog/gdpr-privacy-policy-template">GDPR-compliant privacy policy</a>. Your policy must include:</p>
            <ul>
                <li>Your identity and contact information (controller details)</li>
                <li>What personal data you collect (names, emails, IP addresses, cookies)</li>
                <li>Why you collect it (legal basis for each type of processing)</li>
                <li>Who you share it with (Squarespace, Google, payment processors)</li>
                <li>How long you keep it (specific retention periods)</li>
                <li>Data subject rights and how to exercise them</li>
                <li>International transfers (data goes to Squarespace US servers)</li>
                <li>Cookie information (types, purposes, duration)</li>
            </ul>
            <p>Add the privacy policy link to your site footer (Squarespace: Navigation → Footer).</p>

            <h2>Step 3: Handle Squarespace Analytics</h2>
            <p>
                Squarespace Analytics tracks page views, referrers, geography, and device information. It sets cookies
                and should be covered by your <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a>.
            </p>
            <ul>
                <li>When using the built-in cookie banner with opt-in mode, Squarespace will suppress its own analytics cookies until consent</li>
                <li>If you also use Google Analytics, add the GA tracking code via <strong>Settings → Advanced → Code Injection</strong></li>
                <li>Consider privacy-friendly alternatives like <a href="/blog/privacy-friendly-analytics-tools">Plausible or Umami</a> that don&apos;t require cookies</li>
            </ul>

            <h2>Step 4: Configure Form Consent</h2>
            <p>
                Every Squarespace form that collects personal data (contact forms, newsletter signups, order forms) needs explicit consent:
            </p>
            <ul>
                <li>Add a checkbox field to every form</li>
                <li>Label it clearly: &quot;I agree to the processing of my data as described in the Privacy Policy&quot;</li>
                <li>Link to your privacy policy in the label</li>
                <li>Make the checkbox required (do not pre-check it)</li>
                <li>For newsletter signups, include a double opt-in confirmation email</li>
            </ul>

            <h2>Step 5: Address Data Transfers</h2>
            <p>
                Squarespace is a US company. Data is processed and stored on servers in the United States.
                This means your visitors&apos; data is transferred outside the EU.
            </p>
            <ul>
                <li>Squarespace relies on Standard Contractual Clauses (SCCs) for EU-US transfers</li>
                <li>This is documented in Squarespace&apos;s DPA (part of their Terms of Service)</li>
                <li>Disclose the transfer in your privacy policy</li>
                <li>Consider a <a href="/blog/transfer-impact-assessment-template">Transfer Impact Assessment</a> for thorough documentation</li>
            </ul>

            <h2>Step 6: Manage Third-Party Integrations</h2>
            <p>
                Common Squarespace integrations that create additional GDPR obligations:
            </p>
            <table>
                <thead>
                    <tr><th>Integration</th><th>Data Collected</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google Analytics</td><td>IP, behavior, device</td><td>Cookie consent + <a href="/blog/google-analytics-4-gdpr-legal">GA4 privacy settings</a></td></tr>
                    <tr><td>Mailchimp</td><td>Email, name</td><td>Double opt-in, DPA with Mailchimp</td></tr>
                    <tr><td>Stripe/PayPal</td><td>Payment data</td><td>Already GDPR compliant; mention in policy</td></tr>
                    <tr><td>Google Maps embed</td><td>IP, location</td><td>Cookie consent before loading</td></tr>
                    <tr><td>YouTube embed</td><td>IP, viewing data</td><td>Use youtube-nocookie.com domain</td></tr>
                    <tr><td>Social media buttons</td><td>IP, browsing data</td><td>Use share links instead of embedded buttons</td></tr>
                </tbody>
            </table>

            <h2>Step 7: Handle Data Subject Requests</h2>
            <p>
                You must be able to respond to <a href="/blog/gdpr-data-subject-rights-guide">data subject access requests (DSARs)</a> within 30 days.
                For Squarespace:
            </p>
            <ul>
                <li>Form submissions are stored in the Forms panel — export and share when requested</li>
                <li>Commerce data is in the Commerce panel — can be exported</li>
                <li>Analytics data is aggregated and cannot be linked to individuals</li>
                <li>For erasure requests, delete form submissions and customer records manually</li>
                <li>Create a DSAR process document for your team</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                After configuring your Squarespace site, verify your compliance is correct. <a href="/">PrivacyChecker</a> scans your Squarespace
                website for GDPR issues including cookie consent, privacy policy completeness, security headers, and third-party trackers.
                Run a <a href="/blog/free-gdpr-compliance-checker">free scan</a> to see your current compliance status.
            </p>
        </ArticleLayout>
    );
}
