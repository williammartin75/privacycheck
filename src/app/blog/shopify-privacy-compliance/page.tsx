import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'shopify-privacy-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Shopify handles hosting and payments, but privacy compliance is <strong>your</strong> responsibility.
                Your store collects names, emails, addresses, payment data, and browsing behavior — all regulated
                under GDPR, CCPA, and other privacy laws. Here&apos;s how to make your Shopify store compliant.
            </p>

            <h2>Shopify&apos;s Built-In Privacy Features</h2>
            <p>Shopify provides some compliance tools out of the box, but they&apos;re not sufficient alone:</p>
            <table>
                <thead>
                    <tr><th>Feature</th><th>What Shopify Provides</th><th>What You Still Need</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie banner</td><td>Basic cookie notice (EU only)</td><td>Full CMP with reject option and granular consent</td></tr>
                    <tr><td>Customer data requests</td><td>Data export and deletion tools</td><td>Process for handling requests within 30 days</td></tr>
                    <tr><td>Privacy policy</td><td>Template generator</td><td>Customization for your specific data practices</td></tr>
                    <tr><td>HTTPS</td><td>Automatic SSL</td><td>Security headers (CSP, HSTS, etc.)</td></tr>
                    <tr><td>Payment security</td><td>PCI DSS Level 1 compliance</td><td>Disclosure in privacy policy</td></tr>
                </tbody>
            </table>

            <h2>Top Shopify Compliance Issues</h2>

            <h3>1. Third-Party App Tracking</h3>
            <p>
                The average Shopify store has 6-10 apps installed, and each can add its own tracking scripts.
                Common offenders include review apps (Loox, Judge.me), upsell tools (ReConvert), and
                marketing apps (Privy, Klaviyo). These often load <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a> that
                set cookies before consent.
            </p>

            <h3>2. Shopify Analytics and Marketing</h3>
            <p>
                Shopify&apos;s built-in analytics and the Facebook/Meta pixel integration load tracking
                by default. You need to ensure these respect consent state, especially for EU customers.
            </p>

            <h3>3. Email Marketing Pre-Consent</h3>
            <p>
                Many Shopify stores pre-check the &quot;Email me with news and offers&quot; checkbox at checkout.
                Under GDPR, marketing consent must be opt-in (unchecked by default). Under CCPA, customers must
                be able to opt out of data sales.
            </p>

            <h3>4. Guest Checkout Data</h3>
            <p>
                Even guest checkout collects personal data. You must disclose what data is collected, why,
                how long it&apos;s retained, and who it&apos;s shared with.
            </p>

            <h2>Step-by-Step Compliance Checklist</h2>
            <ol>
                <li>
                    <strong>Install a proper CMP</strong>: Replace Shopify&apos;s basic cookie notice with a full
                    Consent Management Platform (Cookiebot, Consentmo, or Pandectes)
                </li>
                <li>
                    <strong>Audit installed apps</strong>: Review every app for tracking scripts. Remove unused apps
                    and disable unnecessary tracking in active ones
                </li>
                <li>
                    <strong>Configure checkout consent</strong>: Settings → Checkout → uncheck pre-selected marketing
                    options. Add a consent checkbox for marketing emails
                </li>
                <li>
                    <strong>Update privacy policy</strong>: List all apps and services that process customer data.
                    Include <a href="/blog/vendor-risk-assessment-gdpr">vendor information</a> for each
                </li>
                <li>
                    <strong>Set up customer data handling</strong>: Configure Shopify&apos;s customer privacy tools
                    (Settings → Customer Privacy) and establish a process for data subject requests
                </li>
                <li>
                    <strong>Add security headers</strong>: Use the Shopify app &quot;Booster: Page Speed Optimizer&quot;
                    or configure custom headers through a proxy (Cloudflare)
                </li>
                <li>
                    <strong>Configure <a href="/blog/spf-dkim-dmarc-email-deliverability">email authentication</a></strong>:
                    Set up SPF, DKIM, and DMARC for your store&apos;s domain
                </li>
            </ol>

            <h2>Recommended Shopify Privacy Apps</h2>
            <table>
                <thead>
                    <tr><th>App</th><th>Purpose</th><th>Price</th></tr>
                </thead>
                <tbody>
                    <tr><td>Consentmo GDPR Compliance</td><td>Cookie consent + privacy policy</td><td>Free - $9/mo</td></tr>
                    <tr><td>Pandectes GDPR Compliance</td><td>Full compliance suite</td><td>Free - $29/mo</td></tr>
                    <tr><td>GDPR/CCPA Cookie Manager</td><td>Cookie banner with scanning</td><td>Free - $15/mo</td></tr>
                    <tr><td>Donkey Privacy</td><td>Customer data requests automation</td><td>Free - $9/mo</td></tr>
                </tbody>
            </table>

            <h2>CCPA-Specific Requirements</h2>
            <p>If you sell to California residents:</p>
            <ul>
                <li>Add a &quot;Do Not Sell My Personal Information&quot; link in your footer</li>
                <li>Provide a way for customers to opt out of data sharing with third parties</li>
                <li>Disclose all categories of personal information sold or shared</li>
                <li>Include a toll-free number or email for privacy requests</li>
            </ul>

            <p>
                <a href="/">Run a free PrivacyChecker scan</a> on your Shopify store to see exactly which
                trackers, cookies, and third-party services are running — including those added by apps
                you may have forgotten about.
            </p>
        </ArticleLayout>
    );
}
