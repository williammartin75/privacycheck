import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'privacy-by-design-implementation')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Privacy by Design isn&apos;t a buzzword — it&apos;s a legal requirement under GDPR Article 25.
                It means building privacy protections into your systems from the start, not bolting them on
                after launch. Here are the 7 foundational principles and how to apply them in practice.
            </p>

            <h2>The 7 Foundational Principles</h2>
            <p>
                Originally developed by Dr. Ann Cavoukian (former Information and Privacy Commissioner of Ontario),
                these principles are now embedded in GDPR:
            </p>

            <h3>1. Proactive, Not Reactive</h3>
            <p>
                Anticipate and prevent privacy issues before they occur. Don&apos;t wait for breaches or complaints.
            </p>
            <ul>
                <li>Conduct <a href="/blog/data-protection-impact-assessment-guide">DPIAs</a> before launching new features</li>
                <li>Review third-party integrations before adding them</li>
                <li>Set up <a href="/blog/compliance-monitoring-drift-detection">automated monitoring</a> to catch regressions</li>
            </ul>

            <h3>2. Privacy as the Default</h3>
            <p>
                Users shouldn&apos;t have to take action to protect their privacy. The most private option
                should be the default setting.
            </p>
            <ul>
                <li>Marketing opt-in should be unchecked by default</li>
                <li><a href="/blog/cookie-consent-banner-guide">Cookie consent</a> should default to &quot;denied&quot;</li>
                <li>User profiles should be private by default</li>
                <li>Data sharing should require explicit opt-in</li>
            </ul>

            <h3>3. Privacy Embedded into Design</h3>
            <p>
                Privacy should be an integral part of the system architecture, not an add-on.
            </p>
            <ul>
                <li>Database schemas should support data minimization and retention policies</li>
                <li>APIs should return only necessary data fields</li>
                <li>Frontend forms should only request required information</li>
                <li><a href="/blog/website-security-headers-guide">Security headers</a> should be part of the deployment pipeline</li>
            </ul>

            <h3>4. Full Functionality (Positive-Sum)</h3>
            <p>
                Privacy and functionality aren&apos;t mutually exclusive. Use <a href="/blog/cookie-free-analytics-alternatives">cookie-free analytics</a> to
                get visitor insights without privacy trade-offs. Implement privacy-preserving alternatives
                rather than simply removing features.
            </p>

            <h3>5. End-to-End Security</h3>
            <p>
                Protect data throughout its entire lifecycle: collection, storage, processing, and deletion.
            </p>
            <ul>
                <li>Encrypt data at rest and in transit (HTTPS is mandatory)</li>
                <li>Implement <a href="/blog/website-security-headers-guide">security headers</a> (CSP, HSTS, etc.)</li>
                <li>Configure <a href="/blog/spf-dkim-dmarc-email-deliverability">email authentication</a> (SPF, DKIM, DMARC)</li>
                <li>Audit <a href="/blog/third-party-scripts-supply-chain-security">third-party dependencies</a> regularly</li>
                <li>Have a <a href="/blog/data-breach-response-plan">breach response plan</a> ready</li>
            </ul>

            <h3>6. Visibility and Transparency</h3>
            <p>
                Be open about your data practices. Users and regulators should be able to verify your claims.
            </p>
            <ul>
                <li>Maintain a clear, accurate <a href="/blog/privacy-policy-generator-vs-custom">privacy policy</a></li>
                <li>Provide real-time privacy controls (consent preferences, data download, deletion)</li>
                <li>Publish your <a href="/blog/vendor-risk-assessment-gdpr">vendor registry</a></li>
                <li>Consider displaying <a href="/blog/website-trust-signals-conversion">trust signals</a> like privacy badges</li>
            </ul>

            <h3>7. Respect for User Privacy</h3>
            <p>
                Keep the user at the center. Make privacy controls easy to find and use.
                Avoid <a href="/blog/dark-patterns-detection">dark patterns</a> that manipulate privacy choices.
            </p>

            <h2>Implementation Checklist for Developers</h2>
            <table>
                <thead>
                    <tr><th>Phase</th><th>Action</th><th>Tool / Standard</th></tr>
                </thead>
                <tbody>
                    <tr><td>Planning</td><td>Conduct DPIA for new features</td><td>DPIA template</td></tr>
                    <tr><td>Planning</td><td>Define data minimization requirements</td><td>Data mapping document</td></tr>
                    <tr><td>Development</td><td>Implement consent-first tracking</td><td>CMP integration</td></tr>
                    <tr><td>Development</td><td>Add data retention and deletion logic</td><td>Automated purge jobs</td></tr>
                    <tr><td>Development</td><td>Implement security headers</td><td>CSP, HSTS, X-Frame-Options</td></tr>
                    <tr><td>Testing</td><td>Verify consent flows work correctly</td><td>PrivacyChecker scan</td></tr>
                    <tr><td>Testing</td><td>Check for data leaks in client-side code</td><td>Browser DevTools</td></tr>
                    <tr><td>Deployment</td><td>Configure HTTPS and security headers</td><td>Server configuration</td></tr>
                    <tr><td>Operations</td><td>Set up continuous compliance monitoring</td><td>PrivacyChecker Pro+</td></tr>
                    <tr><td>Operations</td><td>Schedule regular privacy reviews</td><td>Quarterly DPIA updates</td></tr>
                </tbody>
            </table>

            <p>
                Start by understanding your current privacy posture.
                <a href="/">Run a free PrivacyChecker scan</a> to identify gaps between your implementation
                and Privacy by Design principles.
            </p>
        </ArticleLayout>
    );
}
