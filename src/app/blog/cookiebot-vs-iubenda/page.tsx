import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cookiebot-vs-iubenda')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Cookiebot and Iubenda are Europe&apos;s two most popular consent management solutions for small to
                medium businesses. Both offer cookie consent, but take different approaches. Here&apos;s how they
                compare to help you make the right choice.
            </p>

            <h2>Head-to-Head Comparison</h2>
            <table>
                <thead>
                    <tr><th>Feature</th><th>Cookiebot</th><th>Iubenda</th></tr>
                </thead>
                <tbody>
                    <tr><td>Headquarters</td><td>Denmark (Cybot)</td><td>Italy (Bologna)</td></tr>
                    <tr><td>Starting price</td><td>Free / $14/mo</td><td>$27/year per site</td></tr>
                    <tr><td>Privacy policy generator</td><td>No</td><td>Yes — modular builder</td></tr>
                    <tr><td>Cookie policy generator</td><td>No (auto-generated list)</td><td>Yes — full document</td></tr>
                    <tr><td>Terms of Service</td><td>No</td><td>Yes — generator included</td></tr>
                    <tr><td>Auto cookie scanning</td><td>Yes — monthly deep scan</td><td>Yes — on installation</td></tr>
                    <tr><td>Script blocking</td><td>Automatic + manual</td><td>Automatic + manual</td></tr>
                    <tr><td>TCF 2.2</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Google Consent Mode V2</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>CCPA support</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>LGPD support</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Consent proof storage</td><td>12 months</td><td>5 years</td></tr>
                    <tr><td>WordPress plugin</td><td>Yes (official)</td><td>Yes (official)</td></tr>
                    <tr><td>Multi-site pricing</td><td>Per domain</td><td>Site bundles available</td></tr>
                    <tr><td>Page load impact</td><td>~40ms</td><td>~35ms</td></tr>
                    <tr><td>Setup time</td><td>15-30 min</td><td>20-45 min</td></tr>
                </tbody>
            </table>

            <h2>Cookiebot&apos;s Advantages</h2>

            <h3>Superior Auto-Scanning</h3>
            <p>
                Cookiebot runs a monthly deep scan of your entire website, automatically detecting and categorizing
                new cookies. This scan is more thorough than Iubenda&apos;s initial scan, catching dynamically-loaded
                cookies and third-party scripts that only fire on specific pages.
            </p>

            <h3>Better Automatic Blocking</h3>
            <p>
                Cookiebot&apos;s auto-blocking engine is widely considered the most reliable in the industry. It
                blocks scripts before consent without requiring manual JavaScript modifications. While Iubenda
                also offers auto-blocking, Cookiebot handles edge cases (like dynamically-injected scripts) better.
            </p>

            <h3>Simpler Free Tier</h3>
            <p>
                Cookiebot&apos;s free tier is straightforward: 1 domain, 50 subpages. It includes the full
                consent banner and auto-scanning. Iubenda&apos;s free offering is more limited and pushes
                users toward paid plans quickly.
            </p>

            <h2>Iubenda&apos;s Advantages</h2>

            <h3>All-in-One Legal Suite</h3>
            <p>
                Iubenda&apos;s biggest differentiator is the integrated legal document generator. It creates
                <a href="/blog/privacy-policy-gdpr-requirements">GDPR-compliant privacy policies</a>, cookie policies,
                and terms of service — all maintained and updated as regulations change. Cookiebot doesn&apos;t
                generate any legal documents.
            </p>

            <h3>Better Consent Proof</h3>
            <p>
                Iubenda stores consent records for 5 years (vs Cookiebot&apos;s 12 months). Given that GDPR doesn&apos;t
                specify a consent record retention period but regulators can audit years back, Iubenda&apos;s longer
                retention is a clear advantage.
            </p>

            <h3>Lower Cost for Multi-Site</h3>
            <p>
                With site bundles starting at $27/year per site and discounted multi-site packages, Iubenda is
                often cheaper than Cookiebot for agencies or businesses managing 5+ websites.
            </p>

            <h2>The Verdict</h2>
            <table>
                <thead>
                    <tr><th>Scenario</th><th>Winner</th></tr>
                </thead>
                <tbody>
                    <tr><td>Just need a cookie banner</td><td>Cookiebot</td></tr>
                    <tr><td>Need privacy policy + banner</td><td>Iubenda</td></tr>
                    <tr><td>WordPress site</td><td>Tie — both excellent</td></tr>
                    <tr><td>Agency with 10+ client sites</td><td>Iubenda (pricing)</td></tr>
                    <tr><td>Best auto-blocking</td><td>Cookiebot</td></tr>
                    <tr><td>Longest consent proof</td><td>Iubenda (5 years)</td></tr>
                    <tr><td>Fastest page load</td><td>Iubenda (~35ms vs ~40ms)</td></tr>
                </tbody>
            </table>

            <p>
                After installing either CMP, verify it&apos;s working correctly with a
                <a href="/"> free PrivacyChecker scan</a>. We&apos;ll check if cookies are truly blocked before
                consent and whether the reject flow works as intended.
            </p>
        </ArticleLayout>
    );
}
