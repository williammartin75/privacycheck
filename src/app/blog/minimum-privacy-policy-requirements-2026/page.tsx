import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'minimum-privacy-policy-requirements-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>TL;DR:</strong> Even if your website collects no personal information (PII), doesn&apos;t
                require login, and only uses anonymous feedback forms or essential anti-spam cookies, you still
                need a privacy policy in 2026. Here&apos;s exactly what&apos;s required and what you can skip.
            </p>

            <h2>Do You Need a Privacy Policy If You Don&apos;t Collect PII?</h2>
            <p>
                <strong>Yes.</strong> If your website is accessible to users in the EU, California, Brazil, Canada,
                or most other jurisdictions with privacy laws, you need a privacy policy — even if you think you
                collect nothing.
            </p>
            <p>
                Here&apos;s why: your web server automatically logs IP addresses. Your hosting provider processes
                data on your behalf. If you use <em>any</em> cookies — even essential ones for anti-spam protection —
                you&apos;re processing data. Under GDPR, an IP address is personal data (Court of Justice ruling
                C-582/14, Breyer v Germany).
            </p>

            <h2>The Minimum Privacy Policy for a Simple Website</h2>
            <p>
                If your website has no login, no analytics, no tracking, and only uses essential cookies
                (like anti-spam or session cookies), here&apos;s the minimum your privacy policy must cover:
            </p>

            <h3>1. Who You Are</h3>
            <p>
                State your identity as the data controller: company name (or your name if personal), address,
                and a contact email. This is required by GDPR Article 13(1)(a).
            </p>

            <h3>2. What Data Is Collected Automatically</h3>
            <p>Even &quot;simple&quot; websites collect data through:</p>
            <ul>
                <li><strong>Server logs:</strong> IP address, browser type, operating system, referrer URL, timestamp</li>
                <li><strong>Essential cookies:</strong> session ID, CSRF tokens, anti-spam cookies</li>
                <li><strong>Hosting provider:</strong> your hosting company processes this data on your behalf</li>
            </ul>
            <p>
                List these even if you never look at the logs. Your hosting provider (Vercel, Netlify, Cloudflare,
                AWS, etc.) stores them.
            </p>

            <h3>3. Why You Collect It (Legal Basis)</h3>
            <table>
                <thead>
                    <tr><th>Data</th><th>Purpose</th><th>Legal Basis</th></tr>
                </thead>
                <tbody>
                    <tr><td>IP address (server logs)</td><td>Website functionality &amp; security</td><td>Legitimate interest</td></tr>
                    <tr><td>Anti-spam cookies</td><td>Preventing bot abuse</td><td>Legitimate interest</td></tr>
                    <tr><td>Session cookies</td><td>Website functionality</td><td>Strictly necessary (no consent needed)</td></tr>
                    <tr><td>Anonymous feedback form</td><td>Improving the website</td><td>Legitimate interest</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Key point:</strong> Essential anti-spam cookies and session cookies do <strong>not</strong> require
                consent under the ePrivacy Directive — they are &quot;strictly necessary&quot; for the service.
                You do <em>not</em> need a cookie consent banner for these alone.
            </p>

            <h3>4. Who Has Access to the Data</h3>
            <p>List your data processors, even for a minimal site:</p>
            <ul>
                <li>Hosting provider (e.g., Vercel, Netlify, Cloudflare, Hetzner)</li>
                <li>CDN provider (if separate from hosting)</li>
                <li>Email provider (if using a contact form that sends email)</li>
                <li>Anti-spam service (e.g., reCAPTCHA, hCaptcha, Cloudflare Turnstile)</li>
            </ul>
            <p>
                <strong>Warning about reCAPTCHA:</strong> Google reCAPTCHA sets tracking cookies and sends data
                to Google servers. If you use it, it&apos;s no longer &quot;essential only&quot; — you may need
                a cookie consent banner. Consider privacy-friendly alternatives like{' '}
                <a href="https://www.hcaptcha.com/">hCaptcha</a> or Cloudflare Turnstile.
            </p>

            <h3>5. Where Data Is Stored</h3>
            <p>
                Disclose the country where data is processed. If your hosting is in the US (Vercel, AWS, Netlify),
                mention the transfer mechanism:
            </p>
            <ul>
                <li><strong>EU-US Data Privacy Framework (DPF)</strong> — if your provider is DPF-certified</li>
                <li><strong>Standard Contractual Clauses (SCCs)</strong> — check your provider&apos;s DPA</li>
            </ul>
            <p>
                If possible, use EU-based hosting to avoid the cross-border complexity entirely.
            </p>

            <h3>6. How Long Data Is Kept</h3>
            <table>
                <thead>
                    <tr><th>Data Type</th><th>Recommended Retention</th></tr>
                </thead>
                <tbody>
                    <tr><td>Server logs</td><td>30–90 days</td></tr>
                    <tr><td>Anti-spam cookies</td><td>Session or up to 24 hours</td></tr>
                    <tr><td>Anonymous feedback</td><td>As long as useful, no PII involved</td></tr>
                    <tr><td>Contact form submissions</td><td>Until inquiry resolved + 30 days</td></tr>
                </tbody>
            </table>

            <h3>7. User Rights</h3>
            <p>
                Even for minimal data collection, you must list GDPR rights: access, rectification, erasure,
                restriction, portability, objection, and the right to complain to a supervisory authority.
                Provide an email address for exercising these rights.
            </p>

            <h2>Do You Need a Cookie Consent Banner?</h2>
            <p>
                <strong>Not always.</strong> If your website ONLY uses strictly necessary cookies (session, CSRF, anti-spam),
                you do NOT need a cookie consent banner. The ePrivacy Directive exempts cookies that are
                &quot;strictly necessary for the provision of an information society service explicitly
                requested by the subscriber or user.&quot;
            </p>
            <p>However, you DO need a banner if you use any of these:</p>
            <ul>
                <li>Google Analytics (even GA4 with anonymized IP)</li>
                <li>Google Fonts loaded from Google servers</li>
                <li>Facebook Pixel or any ad tracker</li>
                <li>YouTube embeds (sets cookies)</li>
                <li>Google reCAPTCHA (sets tracking cookies)</li>
                <li>Hotjar, Clarity, or any session recording tool</li>
                <li>Social media sharing buttons that load external scripts</li>
            </ul>
            <p>
                <strong>Not sure what cookies your site sets?</strong> Use{' '}
                <a href="/">PrivacyChecker</a> to scan your website and see every cookie, tracker, and
                third-party script loading on your pages.
            </p>

            <h2>Anonymous Feedback Forms — What Counts as &quot;Anonymous&quot;?</h2>
            <p>
                If your feedback form truly collects no PII — no name, no email, no account ID — the
                responses themselves may not be personal data. But be careful:
            </p>
            <ul>
                <li>Your server still logs the IP address of the person submitting feedback</li>
                <li>If combined with other data (timestamp + IP), it could become identifiable</li>
                <li>Free-text fields may contain personal data voluntarily entered by users</li>
            </ul>
            <p>
                <strong>Best practice:</strong> Mention in your privacy policy that anonymous feedback is
                collected, that you don&apos;t intentionally link it to individuals, and specify how long
                you retain it.
            </p>

            <h2>Essential Anti-Spam Cookies — What&apos;s Allowed Without Consent?</h2>
            <p>
                Anti-spam cookies fall under the &quot;strictly necessary&quot; exemption if they:
            </p>
            <ul>
                <li>Protect forms from bot submissions</li>
                <li>Are required for the website to function as intended</li>
                <li>Don&apos;t track users across sites or sessions</li>
                <li>Don&apos;t share data with third-party advertising networks</li>
            </ul>
            <p>
                Examples of compliant anti-spam cookies: Cloudflare Turnstile tokens, custom CSRF tokens,
                honeypot field identifiers. Examples that are NOT exempt: Google reCAPTCHA (sends data to Google),
                any cookie that persists beyond the session for tracking purposes.
            </p>

            <h2>Privacy Policy Requirements by Region</h2>
            <table>
                <thead>
                    <tr><th>Region</th><th>Law</th><th>Privacy Policy Required?</th><th>Cookie Banner Required?</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU / EEA</td><td>GDPR + ePrivacy</td><td>Yes, always</td><td>Only for non-essential cookies</td></tr>
                    <tr><td>UK</td><td>UK GDPR + PECR</td><td>Yes, always</td><td>Only for non-essential cookies</td></tr>
                    <tr><td>California</td><td>CCPA / CPRA</td><td>Yes, if collecting data from CA residents</td><td>Not required, but &quot;Do Not Sell&quot; link is</td></tr>
                    <tr><td>Brazil</td><td>LGPD</td><td>Yes</td><td>Recommended</td></tr>
                    <tr><td>Canada</td><td>PIPEDA</td><td>Yes</td><td>Implied consent for essential cookies</td></tr>
                    <tr><td>Global (no local law)</td><td>Best practice</td><td>Strongly recommended</td><td>Not legally required</td></tr>
                </tbody>
            </table>

            <h2>Minimum Privacy Policy Template for No-PII Websites</h2>
            <p>
                Here&apos;s a stripped-down structure for a website that collects no personal information
                beyond server logs and essential cookies:
            </p>
            <ol>
                <li><strong>Who we are:</strong> Company name, address, contact email</li>
                <li><strong>What we collect:</strong> Server logs (IP, browser, timestamp), essential cookies (session, anti-spam)</li>
                <li><strong>Why:</strong> Website functionality and security (legitimate interest)</li>
                <li><strong>Third parties:</strong> Hosting provider name and location</li>
                <li><strong>Retention:</strong> Server logs deleted after 30-90 days</li>
                <li><strong>Your rights:</strong> Access, erasure, objection — contact [email]</li>
                <li><strong>Complaints:</strong> Right to complain to your local Data Protection Authority</li>
                <li><strong>Cookie details:</strong> List of essential cookies with name, purpose, and expiration</li>
            </ol>
            <p>
                This covers the minimum legal requirements. For a more comprehensive policy, see our{' '}
                <a href="/blog/gdpr-privacy-policy-template">GDPR privacy policy template guide</a>.
            </p>

            <h2>Common Mistakes on &quot;Simple&quot; Websites</h2>
            <ul>
                <li><strong>Using Google Fonts from Google CDN:</strong> Sends visitor IPs to Google — use self-hosted fonts instead</li>
                <li><strong>Embedding YouTube videos:</strong> Sets tracking cookies without consent</li>
                <li><strong>Using Google reCAPTCHA:</strong> Not &quot;essential only&quot; — sends data to Google for risk analysis</li>
                <li><strong>No privacy policy at all:</strong> Even a one-page site needs one if accessible in the EU</li>
                <li><strong>Assuming &quot;anonymous&quot; means no obligations:</strong> Server logs with IP addresses are personal data</li>
            </ul>
            <p>
                <a href="/">Scan your website with PrivacyChecker</a> to catch these issues before a
                regulator does. Our scanner checks for all common privacy violations in under 60 seconds.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Do I need a privacy policy if my website has no login and no forms?</h3>
            <p>
                Yes. Your web server collects IP addresses automatically, and your hosting provider processes
                that data. Under GDPR, IP addresses are personal data. You need a privacy policy disclosing
                this, even if your site is purely informational with zero user interaction.
            </p>

            <h3>Are anti-spam cookies exempt from consent requirements?</h3>
            <p>
                Yes, if they are strictly necessary. Cookies used solely to prevent bot abuse on forms (CSRF tokens,
                honeypot cookies, Cloudflare Turnstile tokens) are exempt under the ePrivacy Directive.
                However, Google reCAPTCHA is NOT exempt because it sends data to Google for risk analysis beyond
                your website.
            </p>

            <h3>What is the minimum privacy policy for a global website in 2026?</h3>
            <p>
                At minimum: identify yourself, list what data is collected (including server logs), state the
                legal basis, name your hosting provider, specify retention periods, and list user rights. If your
                website is accessible in the EU, follow GDPR requirements. If accessible in California, add
                CCPA disclosures. Use <a href="/">PrivacyChecker</a> to find all data collection happening
                on your site.
            </p>

            <h3>Can I collect anonymous feedback without GDPR obligations?</h3>
            <p>
                If feedback is truly anonymous (no name, no email, no account link), the feedback content itself
                may not be personal data. But your server still logs the submitter&apos;s IP address, which IS
                personal data. You still need a privacy policy covering the server log collection.
            </p>
        </ArticleLayout>
    );
}
