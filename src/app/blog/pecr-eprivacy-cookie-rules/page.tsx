import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'pecr-eprivacy-cookie-rules')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Most people think GDPR governs cookies, but it doesn&apos;t — not directly. The actual cookie
                rules come from the ePrivacy Directive (2002/58/EC) and its national implementations, like the UK&apos;s
                PECR. Understanding this distinction is critical for compliance, because ePrivacy rules apply
                <strong> regardless</strong> of whether you process personal data.
            </p>

            <h2>ePrivacy vs GDPR: Key Differences</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>ePrivacy / PECR</th><th>GDPR</th></tr>
                </thead>
                <tbody>
                    <tr><td>Scope</td><td>Electronic communications (cookies, email, trackers)</td><td>All personal data processing</td></tr>
                    <tr><td>Applies to</td><td>Any terminal equipment storage/access</td><td>Personal data only</td></tr>
                    <tr><td>Consent standard</td><td>Prior informed consent for non-essential cookies</td><td>Freely given, specific, informed, unambiguous</td></tr>
                    <tr><td>Controller vs user</td><td>Whoever sets the cookie</td><td>Whoever determines processing purpose</td></tr>
                    <tr><td>Exemptions</td><td>Strictly necessary cookies</td><td>Multiple legal bases available</td></tr>
                    <tr><td>Enforcement</td><td>National authorities (e.g., ICO, CNIL)</td><td>National DPAs + EDPB</td></tr>
                </tbody>
            </table>

            <h2>What ePrivacy/PECR Actually Requires</h2>

            <h3>Consent Before Setting Cookies</h3>
            <p>
                You must obtain consent before setting any cookie or similar technology on a user&apos;s device,
                <strong>unless</strong> the cookie is strictly necessary for the service the user requested.
            </p>

            <h3>Strictly Necessary Exemption</h3>
            <p>The following cookies do NOT require consent:</p>
            <ul>
                <li>Session cookies for shopping carts</li>
                <li>Authentication cookies (login state)</li>
                <li>Security cookies (CSRF tokens)</li>
                <li>Load balancing cookies</li>
                <li>User interface customization cookies (language preference)</li>
                <li>Cookie consent preference cookies</li>
            </ul>

            <h3>Cookies That Always Require Consent</h3>
            <ul>
                <li>Analytics cookies (Google Analytics, Hotjar, etc.)</li>
                <li>Advertising and retargeting cookies</li>
                <li>Social media tracking pixels</li>
                <li>A/B testing cookies</li>
                <li>Personalization cookies (beyond basic preferences)</li>
                <li>Third-party embedded content cookies</li>
            </ul>

            <h2>National Implementations</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>Law</th><th>Authority</th><th>Notable Requirement</th></tr>
                </thead>
                <tbody>
                    <tr><td>UK</td><td>PECR 2003</td><td>ICO</td><td>Consent must be &quot;informed&quot; — explain each cookie category</td></tr>
                    <tr><td>France</td><td>Loi Informatique</td><td>CNIL</td><td>&quot;Refuse All&quot; must be as easy as &quot;Accept All&quot;</td></tr>
                    <tr><td>Germany</td><td>TDDDG (formerly TTDSG)</td><td>BfDI / State DPAs</td><td>Applies to all teleservices, not just websites</td></tr>
                    <tr><td>Italy</td><td>Cookie Guidelines 2021</td><td>Garante</td><td>Must re-ask consent every 6 months even if previously given</td></tr>
                    <tr><td>Spain</td><td>LSSI</td><td>AEPD</td><td>&quot;Cookie wall&quot; approach is prohibited</td></tr>
                    <tr><td>Netherlands</td><td>Telecommunicatiewet</td><td>AP</td><td>Analytics require consent (no legitimate interest exemption)</td></tr>
                </tbody>
            </table>

            <h2>The Upcoming ePrivacy Regulation</h2>
            <p>
                The EU has been working on an ePrivacy Regulation to replace the 2002 Directive. When adopted,
                it will become directly applicable without national transposition. Key expected changes:
            </p>
            <ul>
                <li>Browser-level consent settings may satisfy website consent requirements</li>
                <li>Metadata protection (location data, traffic data)</li>
                <li>Harmonized rules across all EU member states</li>
                <li>Higher fines aligned with GDPR (up to €20M / 4% turnover)</li>
            </ul>

            <h2>Common Compliance Mistakes</h2>
            <ul>
                <li><strong>Relying on &quot;legitimate interest&quot; for analytics cookies</strong>: ePrivacy doesn&apos;t
                    have a legitimate interest exception — consent is required</li>
                <li><strong>Cookie walls</strong>: Blocking content until cookies are accepted is prohibited in most jurisdictions</li>
                <li><strong>Assuming &quot;necessary&quot; broadly</strong>: Analytics are not &quot;strictly necessary&quot;
                    for the service the user requested</li>
                <li><strong>Missing &quot;Reject All&quot; button</strong>: <a href="/blog/dark-patterns-detection">Dark patterns</a> in
                    consent flows are heavily scrutinized</li>
                <li><strong>Ignoring non-cookie technologies</strong>: ePrivacy also covers local storage, fingerprinting,
                    and tracking pixels</li>
            </ul>

            <p>
                <a href="/">Scan your website with PrivacyChecker</a> to identify all cookies and tracking
                technologies, and verify your <a href="/blog/cookie-consent-banner-guide">consent banner</a> meets
                ePrivacy requirements in your target markets.
            </p>
        </ArticleLayout>
    );
}
