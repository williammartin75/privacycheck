import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cookie-banner-requirements-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Cookie banner requirements vary significantly by country. The EU
                requires opt-in consent before setting non-essential cookies. The UK follows similar rules under
                PECR. The US has no federal cookie law, but California (CCPA) requires opt-out disclosures.
                Brazil (LGPD) requires consent. Getting cookie compliance wrong is one of the most common reasons
                for GDPR fines.
            </p>

            <h2>Cookie Banner Requirements at a Glance</h2>
            <table>
                <thead>
                    <tr><th>Country/Region</th><th>Law</th><th>Consent Model</th><th>Pre-checked Boxes</th><th>Reject Button Required</th><th>Max Fine</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU (all members)</td><td>GDPR + ePrivacy</td><td>Opt-in</td><td>Illegal</td><td>Yes (must be equal)</td><td>€20M / 4% turnover</td></tr>
                    <tr><td>United Kingdom</td><td>UK GDPR + PECR</td><td>Opt-in</td><td>Illegal</td><td>Yes</td><td>£17.5M / 4% turnover</td></tr>
                    <tr><td>United States</td><td>No federal law</td><td>Varies by state</td><td>Allowed (federally)</td><td>No</td><td>Varies</td></tr>
                    <tr><td>California (US)</td><td>CCPA/CPRA</td><td>Opt-out</td><td>N/A</td><td>No (opt-out link)</td><td>$7,500/violation</td></tr>
                    <tr><td>Brazil</td><td>LGPD</td><td>Opt-in</td><td>Illegal</td><td>Recommended</td><td>2% revenue (max R$50M)</td></tr>
                    <tr><td>Canada</td><td>PIPEDA</td><td>Implied/Express</td><td>Context-dependent</td><td>Recommended</td><td>CAD $100K</td></tr>
                    <tr><td>Australia</td><td>Privacy Act</td><td>Notice-based</td><td>Allowed</td><td>No</td><td>AUD $50M</td></tr>
                    <tr><td>Japan</td><td>APPI</td><td>Opt-out</td><td>Allowed</td><td>No</td><td>¥100M</td></tr>
                    <tr><td>South Korea</td><td>PIPA</td><td>Opt-in</td><td>Illegal</td><td>Yes</td><td>3% revenue</td></tr>
                    <tr><td>India</td><td>DPDPA 2023</td><td>Opt-in (consent)</td><td>Illegal</td><td>Yes</td><td>₹250 crore</td></tr>
                </tbody>
            </table>

            <h2>European Union: The Strictest Requirements</h2>
            <p>
                EU cookie law is governed by two regulations working together: the <strong>ePrivacy Directive</strong> (cookie-specific)
                and the <strong>GDPR</strong> (general data processing). Together, they create the world&apos;s strictest
                cookie consent regime.
            </p>

            <h3>What EU Law Requires</h3>
            <ul>
                <li><strong>Prior consent:</strong> You must obtain consent <em>before</em> setting any non-essential cookies. No cookies can fire on page load except strictly necessary ones</li>
                <li><strong>Granular choice:</strong> Users must be able to accept or reject cookies by category (analytics, marketing, functional)</li>
                <li><strong>Equal prominence:</strong> &quot;Accept All&quot; and &quot;Reject All&quot; buttons must be equally visible. The CJEU ruled in 2024 that hiding &quot;Reject&quot; behind a settings layer is non-compliant</li>
                <li><strong>No dark patterns:</strong> You cannot use larger fonts, brighter colors, or emotional language to nudge users toward acceptance</li>
                <li><strong>Easy withdrawal:</strong> Users must be able to change their preferences at any time, just as easily as they gave consent</li>
                <li><strong>Cookie wall ban:</strong> You cannot deny access to your website if users reject cookies (with very limited exceptions)</li>
            </ul>

            <h3>EU Cookie Banner Enforcement Examples</h3>
            <table>
                <thead>
                    <tr><th>Company</th><th>Fine</th><th>Violation</th><th>DPA</th><th>Year</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google</td><td>€150M</td><td>No easy reject option on cookies</td><td>CNIL (France)</td><td>2022</td></tr>
                    <tr><td>Facebook</td><td>€60M</td><td>No easy reject option on cookies</td><td>CNIL (France)</td><td>2022</td></tr>
                    <tr><td>TikTok</td><td>€5M</td><td>Cookie consent not GDPR-compliant</td><td>CNIL (France)</td><td>2023</td></tr>
                    <tr><td>Microsoft (Bing)</td><td>€60M</td><td>Cookies deposited without valid consent</td><td>CNIL (France)</td><td>2022</td></tr>
                    <tr><td>Criteo</td><td>€40M</td><td>No valid consent for advertising cookies</td><td>CNIL (France)</td><td>2023</td></tr>
                </tbody>
            </table>

            <h2>United Kingdom: Post-Brexit Rules</h2>
            <p>
                After Brexit, the UK retained the GDPR as the &quot;UK GDPR&quot; and cookie rules are governed by
                <strong>PECR</strong> (Privacy and Electronic Communications Regulations). The requirements are
                almost identical to the EU:
            </p>
            <ul>
                <li><strong>Opt-in consent required</strong> for all non-essential cookies</li>
                <li><strong>Strictly necessary cookies exempt</strong> (session IDs, shopping cart, security tokens)</li>
                <li>ICO (Information Commissioner&apos;s Office) enforces compliance</li>
                <li>Maximum fine: <strong>£17.5 million or 4% of global annual turnover</strong></li>
                <li>ICO published updated guidance in 2024 emphasizing the &quot;Reject All&quot; button requirement</li>
            </ul>
            <p>
                <strong>Key difference from EU:</strong> The UK is considering a &quot;legitimate interest&quot; exception
                for analytics cookies under the Data Protection and Digital Information Bill. This could make the
                UK slightly more lenient than the EU for basic analytics. As of 2026, this has not yet been enacted.
            </p>

            <h2>United States: A Patchwork of State Laws</h2>
            <p>
                The US has no federal cookie consent law. However, several states have enacted comprehensive privacy
                laws that affect cookie practices:
            </p>

            <h3>California (CCPA/CPRA)</h3>
            <ul>
                <li><strong>Model:</strong> Opt-out (not opt-in)</li>
                <li>You must provide a &quot;Do Not Sell or Share My Personal Information&quot; link</li>
                <li>Must honor Global Privacy Control (GPC) browser signals</li>
                <li>No cookie banner required per se, but disclosure of cookie-based tracking is mandatory</li>
                <li>Fine: up to <strong>$7,500 per intentional violation</strong></li>
            </ul>

            <h3>Other US States With Cookie-Relevant Laws</h3>
            <table>
                <thead>
                    <tr><th>State</th><th>Law</th><th>Effective</th><th>Cookie Relevance</th></tr>
                </thead>
                <tbody>
                    <tr><td>Virginia</td><td>VCDPA</td><td>2023</td><td>Opt-out for targeted ads and profiling</td></tr>
                    <tr><td>Colorado</td><td>CPA</td><td>2023</td><td>Universal opt-out mechanism required</td></tr>
                    <tr><td>Connecticut</td><td>CTDPA</td><td>2023</td><td>Opt-out for sale and targeted ads</td></tr>
                    <tr><td>Texas</td><td>TDPSA</td><td>2024</td><td>Opt-out mechanism for data sales</td></tr>
                    <tr><td>Oregon</td><td>OCPA</td><td>2024</td><td>Universal opt-out signal recognition</td></tr>
                </tbody>
            </table>

            <h2>Brazil (LGPD)</h2>
            <p>
                Brazil&apos;s LGPD follows an <strong>opt-in consent model</strong> for cookies, similar to the EU:
            </p>
            <ul>
                <li>Consent must be &quot;free, informed, and unambiguous&quot;</li>
                <li>Users must be able to revoke consent at any time</li>
                <li>The ANPD (national authority) published cookie-specific guidance in 2024</li>
                <li>Maximum fine: <strong>2% of revenue, capped at R$50 million per violation</strong></li>
                <li>Enforcement has increased significantly in 2025-2026</li>
            </ul>
            <p>
                Read our detailed comparison: <a href="/blog/lgpd-vs-gdpr-brazil">LGPD vs GDPR: Brazil&apos;s Data Protection Law Explained</a>
            </p>

            <h2>What Cookies Are &quot;Strictly Necessary&quot;?</h2>
            <p>
                Strictly necessary cookies are exempt from consent requirements across all jurisdictions. But the
                definition is narrow:
            </p>
            <table>
                <thead>
                    <tr><th>Cookie Type</th><th>Strictly Necessary?</th><th>Needs Consent?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Session ID / authentication</td><td>Yes</td><td>No</td></tr>
                    <tr><td>Shopping cart</td><td>Yes</td><td>No</td></tr>
                    <tr><td>CSRF tokens</td><td>Yes</td><td>No</td></tr>
                    <tr><td>Cookie consent preference</td><td>Yes</td><td>No</td></tr>
                    <tr><td>Load balancer cookies</td><td>Yes</td><td>No</td></tr>
                    <tr><td>Google Analytics</td><td>No</td><td>Yes</td></tr>
                    <tr><td>Facebook Pixel</td><td>No</td><td>Yes</td></tr>
                    <tr><td>Advertising / retargeting</td><td>No</td><td>Yes</td></tr>
                    <tr><td>Social media embeds</td><td>No</td><td>Yes</td></tr>
                    <tr><td>A/B testing tools</td><td>No</td><td>Yes</td></tr>
                    <tr><td>Hotjar / session recording</td><td>No</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h2>How to Build a Compliant Cookie Banner</h2>

            <h3>Minimum Requirements (Works Globally)</h3>
            <ol>
                <li><strong>Block all non-essential cookies by default</strong> — no scripts fire until consent is given</li>
                <li><strong>Show a clear banner</strong> explaining what cookies you use and why</li>
                <li><strong>Provide Accept All and Reject All buttons</strong> with equal prominence</li>
                <li><strong>Allow granular control</strong> — let users choose cookie categories</li>
                <li><strong>Remember the choice</strong> — don&apos;t re-ask on every page load</li>
                <li><strong>Allow withdrawal</strong> — provide a way to change preferences (footer link or icon)</li>
                <li><strong>Log consent</strong> — keep records of when consent was given, by whom, and for what</li>
            </ol>

            <h3>Technical Implementation</h3>
            <p>
                The most reliable approach is a Consent Management Platform (CMP) that handles blocking, categorization,
                and consent logging. See our <a href="/blog/consent-management-platform-comparison">CMP Comparison Guide</a> for options.
            </p>
            <p>
                If implementing manually, the key is to ensure <strong>Google Consent Mode v2</strong> is properly
                configured. This allows Google Analytics and Google Ads to respect user consent choices. See our
                <a href="/blog/google-consent-mode-v2-setup">Google Consent Mode v2 Setup Guide</a>.
            </p>

            <h2>Check Your Cookie Compliance</h2>
            <p>
                <a href="/">PrivacyChecker</a> scans your website and identifies cookie compliance issues
                automatically. The scan detects:
            </p>
            <ul>
                <li>Cookies that fire before consent (pre-consent violations)</li>
                <li>Missing or misconfigured cookie banners</li>
                <li>Third-party trackers loading without user permission</li>
                <li>Google Analytics and advertising cookies compliance</li>
                <li>Missing Consent Mode v2 implementation</li>
            </ul>

            <h2>Frequently Asked Questions</h2>

            <h3>Do I need a cookie banner if I only use essential cookies?</h3>
            <p>
                If your website only uses strictly necessary cookies (session, security, preferences), you do
                <strong>not</strong> need a consent banner in most jurisdictions. However, you should still
                provide a cookie policy explaining what cookies you use. Most websites use at least some analytics
                or marketing tools that require consent.
            </p>

            <h3>Can I use a cookie wall to deny access?</h3>
            <p>
                In the EU, cookie walls are generally not allowed. The EDPB has stated that consent is not freely
                given if the user has no real choice. Some DPAs allow limited exceptions (e.g., if a free
                ad-supported version is available alongside a paid ad-free version), but the safest approach is
                to never use cookie walls.
            </p>

            <h3>How often should I re-ask for consent?</h3>
            <p>
                There is no legally mandated period, but best practice is to re-ask every <strong>6 to 12 months</strong>.
                You must also re-ask whenever you add new cookie categories or change the purposes of existing cookies.
                The CNIL recommends re-obtaining consent every 13 months maximum.
            </p>

            <h3>Do cookie banners hurt my SEO?</h3>
            <p>
                Google has stated that cookie consent banners do not negatively impact SEO if implemented correctly.
                Avoid interstitials that block the main content on mobile — use a bottom or top bar instead of a
                full-screen overlay.
            </p>
        </ArticleLayout>
    );
}
