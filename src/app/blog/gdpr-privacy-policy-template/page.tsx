import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'gdpr-privacy-policy-template')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> A GDPR-compliant privacy policy must disclose what data you collect, why,
                who you share it with, where it&apos;s stored, and what rights users have. Below is a section-by-section
                guide with a checklist of exactly what regulators look for when they audit your policy.
            </p>

            <h2>Why Your Privacy Policy Matters More Than Ever</h2>
            <p>
                In 2025 alone, data protection authorities issued fines for <strong>incomplete or misleading privacy
                    policies</strong> in over 120 cases. The most common violations:
            </p>
            <ul>
                <li>Not listing all third-party data processors</li>
                <li>Missing or vague information about data retention periods</li>
                <li>No mention of cross-border data transfers</li>
                <li>Failing to explain users&apos; rights clearly</li>
                <li>Using legal jargon instead of plain language</li>
            </ul>
            <p>
                Your privacy policy isn&apos;t just a legal document — it&apos;s a
                <a href="/blog/website-trust-signals-conversion">trust signal</a> that directly affects conversions.
            </p>

            <h2>The 12 Sections Every GDPR Privacy Policy Must Include</h2>

            <h3>1. Identity and Contact Details</h3>
            <p>
                <strong>GDPR Articles 13(1)(a) and 14(1)(a)</strong> — You must state who you are:
            </p>
            <ul>
                <li>Company name and legal entity type</li>
                <li>Registered address</li>
                <li>Contact email for privacy inquiries</li>
                <li>DPO contact details (if you have one)</li>
            </ul>

            <h3>2. What Data You Collect</h3>
            <p>
                <strong>Article 13(1)(d)</strong> — List every category of personal data:
            </p>
            <ul>
                <li><strong>Identity data:</strong> name, email, phone number</li>
                <li><strong>Technical data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage data:</strong> pages visited, time on site, click patterns</li>
                <li><strong>Cookie data:</strong> tracking cookies, session cookies, preference cookies</li>
                <li><strong>Payment data:</strong> if applicable, specify what you store vs. what your payment processor handles</li>
                <li><strong>Communication data:</strong> emails, support tickets, chat messages</li>
            </ul>
            <p>
                <strong>Tip:</strong> Use <a href="/">PrivacyChecker</a> to scan your website and discover <strong>all</strong> data
                collection happening on your site — including third-party trackers you didn&apos;t know about.
            </p>

            <h3>3. How You Collect Data</h3>
            <p>
                <strong>Article 14</strong> — Explain collection methods:
            </p>
            <ul>
                <li>Directly from the user (forms, account creation, purchases)</li>
                <li>Automatically (cookies, analytics scripts, server logs)</li>
                <li>From third parties (advertising partners, social media logins, data brokers)</li>
            </ul>

            <h3>4. Legal Basis for Processing</h3>
            <p>
                <strong>Article 13(1)(c)</strong> — For EACH type of processing, state the legal basis:
            </p>
            <table>
                <thead>
                    <tr><th>Processing Activity</th><th>Typical Legal Basis</th></tr>
                </thead>
                <tbody>
                    <tr><td>Essential cookies</td><td>Legitimate interest (site functionality)</td></tr>
                    <tr><td>Analytics (GA4, Hotjar)</td><td>Consent</td></tr>
                    <tr><td>Marketing emails</td><td>Consent</td></tr>
                    <tr><td>Fraud prevention</td><td>Legitimate interest</td></tr>
                    <tr><td>Order fulfillment</td><td>Contract performance</td></tr>
                    <tr><td>Legal obligations</td><td>Legal obligation (tax records, etc.)</td></tr>
                    <tr><td>AI chatbots</td><td>Consent + <a href="/blog/ai-privacy-policy-requirements">AI Act disclosure</a></td></tr>
                </tbody>
            </table>

            <h3>5. Who You Share Data With</h3>
            <p>
                <strong>Article 13(1)(e)</strong> — List categories of recipients:
            </p>
            <ul>
                <li>Analytics providers (e.g., Google Analytics, Hotjar)</li>
                <li>Email marketing platforms (e.g., Mailchimp, Brevo)</li>
                <li>Payment processors (e.g., Stripe, PayPal)</li>
                <li>Hosting providers (e.g., Vercel, AWS, Hetzner)</li>
                <li>Customer support tools (e.g., Intercom, Zendesk)</li>
                <li>Advertising networks (e.g., Google Ads, Meta)</li>
            </ul>
            <p>
                Scan your site with <a href="/">PrivacyChecker</a> to find all
                <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a> loading
                on your pages — these are all potential data recipients.
            </p>

            <h3>6. Cross-Border Data Transfers</h3>
            <p>
                <strong>Article 13(1)(f)</strong> — If data leaves the EU/EEA, disclose:
            </p>
            <ul>
                <li>Which countries data is transferred to</li>
                <li>Transfer mechanism (adequacy decision, SCCs, DPF, BCRs)</li>
                <li>How users can obtain a copy of the safeguards</li>
            </ul>
            <p>
                See our <a href="/blog/cross-border-data-transfers-schrems">cross-border transfer guide</a> for details.
            </p>

            <h3>7. Data Retention Periods</h3>
            <p>
                <strong>Article 13(2)(a)</strong> — Specify how long you keep each type of data:
            </p>
            <table>
                <thead>
                    <tr><th>Data Type</th><th>Typical Retention</th></tr>
                </thead>
                <tbody>
                    <tr><td>Account data</td><td>Duration of account + 30 days after deletion</td></tr>
                    <tr><td>Analytics data</td><td>14–26 months (GA4 default: 14 months)</td></tr>
                    <tr><td>Marketing consent records</td><td>Duration of consent + 3 years</td></tr>
                    <tr><td>Transaction records</td><td>7 years (legal obligation — tax)</td></tr>
                    <tr><td>Support tickets</td><td>2 years after resolution</td></tr>
                    <tr><td>Server logs</td><td>30–90 days</td></tr>
                </tbody>
            </table>

            <h3>8. User Rights</h3>
            <p>
                <strong>Articles 15–22</strong> — You MUST explain these rights:
            </p>
            <ol>
                <li><strong>Right of access</strong> (Article 15) — Obtain a copy of their data</li>
                <li><strong>Right to rectification</strong> (Article 16) — Correct inaccurate data</li>
                <li><strong>Right to erasure</strong> (Article 17) — Request deletion</li>
                <li><strong>Right to restrict processing</strong> (Article 18)</li>
                <li><strong>Right to data portability</strong> (Article 20) — Download in machine-readable format</li>
                <li><strong>Right to object</strong> (Article 21) — Object to legitimate interest processing</li>
                <li><strong>Right not to be subject to automated decisions</strong> (Article 22)</li>
            </ol>
            <p>Provide a clear way to exercise these rights (email, form, or dedicated portal).</p>

            <h3>9. Cookie Policy</h3>
            <p>
                Link to or include a detailed <a href="/blog/cookie-consent-banner-guide">cookie policy</a> listing:
            </p>
            <ul>
                <li>Each cookie name, purpose, provider, type, and expiration</li>
                <li>How to manage or withdraw cookie consent</li>
                <li>Whether you use <a href="/blog/browser-fingerprinting-privacy">browser fingerprinting</a></li>
            </ul>

            <h3>10. Automated Decision-Making &amp; AI</h3>
            <p>
                <strong>Article 13(2)(f)</strong> — If you use AI or automated decision-making:
            </p>
            <ul>
                <li>Disclose the existence of automated processing</li>
                <li>Explain the logic involved (in meaningful terms)</li>
                <li>State the significance and consequences for the user</li>
                <li>Reference <a href="/blog/eu-ai-act-website-compliance">EU AI Act obligations</a> if applicable</li>
            </ul>

            <h3>11. Right to Withdraw Consent</h3>
            <p>
                <strong>Article 13(2)(c)</strong> — Explain that consent can be withdrawn at any time,
                and how to do it (e.g., cookie settings, unsubscribe link, account settings).
            </p>

            <h3>12. Right to Complain</h3>
            <p>
                <strong>Article 13(2)(d)</strong> — Inform users of their right to lodge a complaint with their
                national Data Protection Authority. Link to the relevant DPA website.
            </p>

            <h2>Privacy Policy Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>Check</th><th>Required By</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>Company identity and contact details</td><td>Art. 13(1)(a)</td><td>Required</td></tr>
                    <tr><td>DPO contact (if applicable)</td><td>Art. 13(1)(b)</td><td>If DPO appointed</td></tr>
                    <tr><td>Categories of data collected</td><td>Art. 13(1)(d)</td><td>Required</td></tr>
                    <tr><td>Legal basis for each processing activity</td><td>Art. 13(1)(c)</td><td>Required</td></tr>
                    <tr><td>Recipients / categories of recipients</td><td>Art. 13(1)(e)</td><td>Required</td></tr>
                    <tr><td>Cross-border transfers &amp; safeguards</td><td>Art. 13(1)(f)</td><td>If applicable</td></tr>
                    <tr><td>Retention periods</td><td>Art. 13(2)(a)</td><td>Required</td></tr>
                    <tr><td>All 7 data subject rights listed</td><td>Art. 13(2)(b-f)</td><td>Required</td></tr>
                    <tr><td>Right to withdraw consent</td><td>Art. 13(2)(c)</td><td>Required</td></tr>
                    <tr><td>Right to complain to DPA</td><td>Art. 13(2)(d)</td><td>Required</td></tr>
                    <tr><td>Automated decision-making &amp; profiling</td><td>Art. 13(2)(f)</td><td>If applicable</td></tr>
                    <tr><td>Cookie policy (detailed)</td><td>ePrivacy + GDPR</td><td>Required</td></tr>
                    <tr><td>Written in plain language</td><td>Art. 12(1)</td><td>Required</td></tr>
                    <tr><td>Easily accessible from every page</td><td>Best practice</td><td>Recommended</td></tr>
                    <tr><td>Last updated date visible</td><td>Best practice</td><td>Recommended</td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>Can I use a privacy policy generator?</h3>
            <p>
                Generators are a starting point but rarely cover all GDPR requirements. See our comparison of
                <a href="/blog/privacy-policy-generator-vs-custom">generators vs custom policies</a>. At minimum,
                customize the generated policy to list your actual third-party vendors and specific data practices.
            </p>

            <h3>How often should I update my privacy policy?</h3>
            <p>
                Review it <strong>quarterly</strong> and update whenever you add a new tool, change a data processor,
                or modify data collection practices. Use <a href="/">PrivacyChecker</a> to detect when new
                third-party scripts appear on your site — each one may require a policy update.
            </p>

            <h3>Does my privacy policy need to be in multiple languages?</h3>
            <p>
                If you target users in specific countries, you should provide the policy in their language. GDPR Article 12
                requires information to be provided in a <strong>concise, transparent, and easily understandable</strong> manner.
            </p>

            <h3>How do I know if my current policy is compliant?</h3>
            <p>
                <a href="/">PrivacyChecker</a> analyzes your privacy policy and flags missing sections, vague language,
                and undisclosed third-party data processors. Scan your site for a complete compliance report.
            </p>
        </ArticleLayout>
    );
}
