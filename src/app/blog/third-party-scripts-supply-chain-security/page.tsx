import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'third-party-scripts-supply-chain-security')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Every external script on your website is a potential attack vector. The 2024 Polyfill.io incident compromised
                over 100,000 websites when the domain was acquired by a malicious actor who injected malware into a widely-used
                JavaScript library. Supply chain attacks are the fastest-growing threat to web security.
            </p>

            <h2>What Is a Supply Chain Attack?</h2>
            <p>
                A supply chain attack targets the third-party code your website depends on, rather than your website directly.
                When an attacker compromises a library, CDN, or service that your site uses, every website
                loading that resource becomes a victim.
            </p>

            <h2>Notable Supply Chain Attacks</h2>
            <table>
                <thead>
                    <tr><th>Incident</th><th>Year</th><th>Impact</th></tr>
                </thead>
                <tbody>
                    <tr><td>Polyfill.io</td><td>2024</td><td>100,000+ websites served malicious redirects</td></tr>
                    <tr><td>UA-Parser-JS</td><td>2021</td><td>NPM package hijacked to install crypto miners</td></tr>
                    <tr><td>Codecov</td><td>2021</td><td>CI/CD tool backdoored to steal credentials</td></tr>
                    <tr><td>Magecart</td><td>2018-now</td><td>Payment card skimmers injected via third-party scripts on e-commerce sites</td></tr>
                    <tr><td>Event-Stream</td><td>2018</td><td>NPM package compromised to steal bitcoin wallets</td></tr>
                </tbody>
            </table>

            <h2>Common Third-Party Risks on Websites</h2>
            <ul>
                <li><strong>Analytics scripts</strong> (Google Analytics, Hotjar, Mixpanel) — transmit user behavior data</li>
                <li><strong>Advertising pixels</strong> (Facebook, Google Ads, LinkedIn) — track users across sites</li>
                <li><strong>Chat widgets</strong> (Intercom, Crisp, Tawk.to) — have full page access</li>
                <li><strong>Payment processors</strong> (Stripe, PayPal embeds) — handle sensitive financial data</li>
                <li><strong>CDN-hosted libraries</strong> (jQuery, Bootstrap, Font Awesome) — could be compromised at the CDN</li>
                <li><strong>Social embeds</strong> (YouTube, Twitter, Instagram) — set cookies and track users</li>
            </ul>

            <h2>How to Protect Your Website</h2>

            <h3>1. Audit Your Dependencies</h3>
            <p>
                First, know what&apos;s on your site. Run a <a href="/">PrivacyChecker scan</a> to identify all external scripts,
                their origins, and what data they access. Many website owners are surprised by the number of third-party
                scripts they didn&apos;t knowingly add — often injected by CMS plugins, themes, or tag managers.
            </p>

            <h3>2. Implement Subresource Integrity (SRI)</h3>
            <p>SRI ensures that external scripts haven&apos;t been tampered with by verifying a cryptographic hash:</p>
            <pre><code>{`<script src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous"></script>`}</code></pre>
            <p>If the file changes (even one character), the browser blocks it. Generate SRI hashes at <code>srihash.org</code>.</p>

            <h3>3. Use Content Security Policy</h3>
            <p>
                CSP limits which domains can serve scripts to your page. See our
                <a href="/blog/website-security-headers-guide"> security headers guide</a> for implementation details.
            </p>

            <h3>4. Self-Host Critical Libraries</h3>
            <p>
                Instead of loading jQuery or other libraries from public CDNs, download and host them on your own server.
                This eliminates the risk of CDN compromise and improves loading performance.
            </p>

            <h3>5. Monitor for Changes</h3>
            <p>
                Set up continuous monitoring to detect when third-party scripts change.
                <a href="/blog/compliance-monitoring-drift-detection"> PrivacyChecker&apos;s drift detection</a> alerts you
                when external scripts are modified, added, or removed — so you can verify the changes before they affect
                your visitors.
            </p>

            <h2>GDPR Implications</h2>
            <p>
                Under GDPR, you are responsible for the data processing done by your third-party scripts, even if you didn&apos;t
                write them. If a compromised script steals visitor data from your site, <strong>you</strong> are liable.
                This makes <a href="/blog/vendor-risk-assessment-gdpr">vendor risk assessment</a> a compliance requirement,
                not just a security best practice.
            </p>

            <h2>Action Checklist</h2>
            <table>
                <thead>
                    <tr><th>Action</th><th>Difficulty</th><th>Impact</th></tr>
                </thead>
                <tbody>
                    <tr><td>Audit all third-party scripts</td><td>Easy</td><td>High — know your attack surface</td></tr>
                    <tr><td>Add SRI to external scripts</td><td>Easy</td><td>High — prevents tampered code</td></tr>
                    <tr><td>Implement CSP</td><td>Medium</td><td>High — blocks unauthorized scripts</td></tr>
                    <tr><td>Self-host critical libraries</td><td>Easy</td><td>Medium — eliminates CDN risk</td></tr>
                    <tr><td>Remove unused scripts</td><td>Easy</td><td>High — reduces attack surface and improves performance</td></tr>
                    <tr><td>Set up continuous monitoring</td><td>Easy</td><td>High — catches changes before they cause damage</td></tr>
                </tbody>
            </table>

            <p>
                Start with a <a href="/">free PrivacyChecker scan</a> to see every third-party script on your website,
                categorized by type and risk level. Pro+ includes supply chain security monitoring with alerts.
            </p>
        </ArticleLayout>
    );
}
