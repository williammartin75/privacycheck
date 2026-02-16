import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'do-you-need-a-cookie-banner')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> If your website uses any non-essential cookies (analytics, advertising, social media embeds)
                and is accessible to visitors in the EU, UK, or Brazil, you are legally required to display a cookie consent banner.
                If your website only uses strictly necessary cookies (session management, security, load balancing),
                no banner is required.
            </p>

            <h2>The Simple Decision Rule</h2>
            <p>
                Ask yourself two questions:
            </p>
            <ol>
                <li><strong>Does my website set any non-essential cookies?</strong> (analytics, ads, social plugins, chat widgets)</li>
                <li><strong>Can visitors from the EU, UK, or other regulated countries access my site?</strong></li>
            </ol>
            <p>
                If the answer to both is <strong>yes</strong>, you need a cookie banner. Period.
                Not sure what cookies your site uses? <a href="/blog/find-cookies-on-your-website">Scan your website to find out</a>.
            </p>

            <h2>Cookie Banner Requirements by Country</h2>

            <table>
                <thead>
                    <tr><th>Region</th><th>Law</th><th>Banner Required?</th><th>Consent Type</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU (27 countries)</td><td>GDPR + ePrivacy Directive</td><td>Yes, if non-essential cookies are used</td><td>Opt-in (prior consent)</td></tr>
                    <tr><td>UK</td><td>UK GDPR + PECR</td><td>Yes, if non-essential cookies are used</td><td>Opt-in (prior consent)</td></tr>
                    <tr><td>United States (California)</td><td>CCPA/CPRA</td><td>Yes — &quot;Do Not Sell&quot; notice required</td><td>Opt-out</td></tr>
                    <tr><td>United States (other states)</td><td>Varies (Virginia, Colorado, etc.)</td><td>Varies — several states now require notices</td><td>Opt-out</td></tr>
                    <tr><td>Canada</td><td>PIPEDA</td><td>Recommended but no specific banner mandate</td><td>Implied or express consent</td></tr>
                    <tr><td>Brazil</td><td>LGPD</td><td>Yes, if collecting personal data via cookies</td><td>Opt-in for sensitive data</td></tr>
                    <tr><td>Japan</td><td>APPI</td><td>Required for third-party sharing since 2022</td><td>Opt-in for third-party transfers</td></tr>
                    <tr><td>Australia</td><td>Privacy Act 1988</td><td>Not strictly required but recommended</td><td>Notice-based</td></tr>
                    <tr><td>South Korea</td><td>PIPA</td><td>Yes</td><td>Opt-in</td></tr>
                    <tr><td>India</td><td>DPDPA 2023</td><td>Yes, for processing personal data</td><td>Opt-in</td></tr>
                </tbody>
            </table>

            <h2>What Does a Compliant Cookie Banner Look Like?</h2>
            <p>Under EU/UK law, a compliant cookie banner must:</p>
            <ul>
                <li><strong>Appear before any non-essential cookies load</strong> — not after the page fully renders</li>
                <li>Offer an equally visible <strong>&quot;Accept All&quot;</strong> and <strong>&quot;Reject All&quot;</strong> button</li>
                <li>Allow <strong>granular choices</strong> (analytics vs. marketing vs. functional cookies separately)</li>
                <li>Not use <a href="/blog/dark-patterns-detection">dark patterns</a> (pre-checked boxes, hidden reject buttons, color manipulation)</li>
                <li>Include a link to a <strong>detailed cookie policy</strong></li>
                <li>Make it easy to <strong>withdraw consent</strong> at any time</li>
            </ul>

            <h2>When You Do NOT Need a Cookie Banner</h2>
            <p>
                You can skip the cookie banner entirely if your website <strong>only uses strictly necessary cookies</strong>. These include:
            </p>
            <ul>
                <li>Session cookies for login/authentication</li>
                <li>Shopping cart cookies on e-commerce sites</li>
                <li>Security cookies (CSRF protection)</li>
                <li>Load-balancing cookies</li>
                <li>Cookie consent preference cookies (the cookie that remembers the user&apos;s cookie choice)</li>
            </ul>
            <p>
                If you use <a href="/blog/cookie-free-analytics-alternatives">cookie-free analytics</a> like Plausible, Fathom, or
                Umami (which don&apos;t use cookies at all), you also do not need consent for analytics tracking.
            </p>

            <h2>Common Mistakes That Lead to Fines</h2>
            <ul>
                <li><strong>Cookie walls:</strong> Blocking access unless all cookies are accepted is illegal in the EU</li>
                <li><strong>Pre-checked boxes:</strong> Consent must be an affirmative action — pre-toggled switches don&apos;t count</li>
                <li><strong>Loading trackers before consent:</strong> Google Analytics or Facebook Pixel firing before the user clicks &quot;Accept&quot; is the #1 violation</li>
                <li><strong>No &quot;Reject All&quot; button:</strong> Since January 2022, the CNIL requires a reject button at the same level as accept</li>
                <li><strong>Ignoring mobile:</strong> Your consent banner must be functional and accessible on mobile devices</li>
            </ul>

            <h2>How to Check If Your Current Banner Is Compliant</h2>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. The audit specifically checks whether:
            </p>
            <ul>
                <li>A consent banner is present</li>
                <li>Non-essential cookies load before consent</li>
                <li>Both accept and reject options are available</li>
                <li>Your <a href="/blog/cookie-consent-banner-guide">cookie banner implementation</a> matches regulatory requirements</li>
            </ul>
            <p>
                If you&apos;re choosing a consent management tool, see our <a href="/blog/consent-management-platform-comparison">CMP comparison guide</a>.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Does a US-only website need a cookie banner?</h3>
            <p>
                If your website is only accessible to US visitors and does not target EU residents, GDPR does not apply.
                However, California&apos;s CCPA/CPRA requires a &quot;Do Not Sell or Share My Personal Information&quot; link if you
                handle the data of California residents. Several other states (Virginia, Colorado, Connecticut, Utah, Texas, Oregon)
                have similar requirements.
            </p>

            <h3>Do I need a cookie banner if I only use Google Analytics?</h3>
            <p>
                Yes. Google Analytics sets cookies (including <code>_ga</code>, <code>_gid</code>, and <code>_gat</code>) that track
                user behavior across sessions. Under GDPR, these are non-essential cookies and require prior opt-in consent.
                Multiple EU DPAs have confirmed this, with some even ruling that GA4 is <a href="/blog/google-analytics-4-gdpr-legal">not legal without proper consent</a>.
            </p>

            <h3>What happens if I don&apos;t have a cookie banner?</h3>
            <p>
                Regulators can fine you up to <strong>€20 million or 4% of global annual turnover</strong> under GDPR.
                In practice, fines for cookie consent violations range from €10,000 to €150,000 for small businesses,
                and from <a href="/blog/biggest-gdpr-fines-2025-2026">€90 million to €405 million</a> for large companies.
            </p>
        </ArticleLayout>
    );
}
