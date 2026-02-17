import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'age-verification-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                2026 is the year of children&apos;s privacy enforcement. Regulators worldwide are making age verification and child protection
                their top priority. The UK Online Safety Act, strengthened COPPA rules, and GDPR enforcement actions are forcing websites to
                rethink how they handle minors&apos; data. This guide covers every major framework and practical implementation options.
            </p>

            <h2>Age of Digital Consent by Country</h2>
            <p>
                GDPR sets the baseline at 16 but allows member states to lower it to 13. Here&apos;s the current landscape:
            </p>
            <table>
                <thead>
                    <tr><th>Age</th><th>Countries</th></tr>
                </thead>
                <tbody>
                    <tr><td>13</td><td>Belgium, Czech Republic, Denmark, Estonia, Finland, Latvia, Malta, Portugal, Sweden, UK</td></tr>
                    <tr><td>14</td><td>Austria, Bulgaria, Cyprus, Italy, Lithuania, Romania, Spain</td></tr>
                    <tr><td>15</td><td>France, Greece, Slovenia</td></tr>
                    <tr><td>16</td><td>Germany, Hungary, Ireland, Luxembourg, Netherlands, Poland, Slovakia, Croatia</td></tr>
                    <tr><td>13 (COPPA)</td><td>United States</td></tr>
                    <tr><td>Various</td><td>Brazil (12-18), Canada (province-dependent), Australia (16 proposed)</td></tr>
                </tbody>
            </table>

            <h2>Three Legal Frameworks You Must Know</h2>

            <h2>1. GDPR — Parental Consent for Children&apos;s Data</h2>
            <p>
                Under GDPR Article 8, processing children&apos;s data based on consent requires &quot;verifiable&quot; parental consent for children
                below the applicable age. The controller must make &quot;reasonable efforts&quot; to verify that consent is given by the parent.
            </p>
            <ul>
                <li><strong>When it applies:</strong> Only when the lawful basis is consent. Legitimate interest or contract performance may not require parental consent.</li>
                <li><strong>What&apos;s required:</strong> &quot;Reasonable efforts&quot; to verify parental consent, considering available technology.</li>
                <li><strong>Privacy notices:</strong> Must be written in clear, child-friendly language.</li>
                <li><strong>Data minimization:</strong> Especially important — collect only what is strictly necessary.</li>
            </ul>

            <h2>2. COPPA — Children Under 13 in the US</h2>
            <p>
                The Children&apos;s Online Privacy Protection Act applies to websites and apps directed at children under 13, or that
                have actual knowledge of collecting data from children under 13.
            </p>
            <ul>
                <li><strong>Verifiable parental consent:</strong> Required before collecting, using, or disclosing children&apos;s data.</li>
                <li><strong>Approved methods:</strong> Signed consent forms, credit card verification, video/phone calls, government ID checks, knowledge-based questions.</li>
                <li><strong>Privacy policy:</strong> Must include a specific children&apos;s privacy section.</li>
                <li><strong>Data retention:</strong> Keep children&apos;s data only as long as reasonably necessary.</li>
                <li><strong>Parental access:</strong> Parents must be able to review and delete their child&apos;s data.</li>
            </ul>
            <p>
                <strong>Fines:</strong> The FTC has issued fines up to $520 million (Epic Games, 2022) and $170 million (YouTube/Google, 2019) for COPPA violations.
            </p>

            <h2>3. UK Online Safety Act — Age Assurance Requirements</h2>
            <p>
                The UK Online Safety Act 2023 requires platforms likely to be accessed by children to implement &quot;proportionate&quot;
                age assurance measures. Ofcom&apos;s guidance specifies a tiered approach:
            </p>
            <ul>
                <li><strong>Tier 1 (low risk):</strong> Self-declaration (age gate checkboxes)</li>
                <li><strong>Tier 2 (medium risk):</strong> Age estimation (AI-based facial analysis) or third-party verification</li>
                <li><strong>Tier 3 (high risk — adult content):</strong> Hard age verification (ID documents, credit card, digital identity)</li>
            </ul>

            <h2>Age Verification Technologies Compared</h2>
            <table>
                <thead>
                    <tr><th>Method</th><th>Accuracy</th><th>Privacy Impact</th><th>User Friction</th><th>Best For</th></tr>
                </thead>
                <tbody>
                    <tr><td>Self-declaration checkbox</td><td>Low</td><td>None</td><td>None</td><td>Low-risk, GDPR contexts</td></tr>
                    <tr><td>Date of birth input</td><td>Low</td><td>Minimal</td><td>Low</td><td>General age gating</td></tr>
                    <tr><td>Credit card verification</td><td>High</td><td>Moderate</td><td>High</td><td>COPPA, e-commerce</td></tr>
                    <tr><td>AI facial age estimation</td><td>Moderate-High</td><td>High</td><td>Moderate</td><td>UK OSA Tier 2</td></tr>
                    <tr><td>ID document upload</td><td>Very High</td><td>Very High</td><td>Very High</td><td>Adult content, gambling</td></tr>
                    <tr><td>Digital identity wallet</td><td>Very High</td><td>Low</td><td>Moderate</td><td>EU eIDAS 2.0 (emerging)</td></tr>
                    <tr><td>Third-party age service</td><td>High</td><td>Moderate</td><td>Moderate</td><td>Scalable solutions</td></tr>
                </tbody>
            </table>

            <h2>Implementation Best Practices</h2>
            <ul>
                <li><strong>Proportionality:</strong> Match the verification method to the risk. A blog doesn&apos;t need ID checks; an adult content site does.</li>
                <li><strong>Privacy by design:</strong> Age verification itself collects personal data — minimize what you collect and delete after verification.</li>
                <li><strong>Don&apos;t create new risks:</strong> Storing ID documents or biometric data creates a larger attack surface. Use privacy-preserving methods or third-party services that don&apos;t share the actual data with you.</li>
                <li><strong>Accessibility:</strong> Offer multiple verification methods. Not everyone has a credit card or smartphone camera.</li>
                <li><strong>Transparency:</strong> Explain why you&apos;re asking and what happens with the verification data in your <a href="/blog/gdpr-privacy-policy-template">privacy policy</a>.</li>
            </ul>

            <h2>What to Do If Your Site Might Attract Children</h2>
            <ul>
                <li>Audit your audience — check analytics for potential underage visitors</li>
                <li>Determine which laws apply based on your audience geography</li>
                <li>Implement appropriate age gating before collecting any data</li>
                <li>Create a child-friendly privacy notice if you allow under-16 access</li>
                <li>Implement parental consent mechanisms if required</li>
                <li>Review third-party services for <a href="/blog/coppa-children-privacy-website">COPPA compliance</a></li>
                <li>Set up data retention limits specifically for children&apos;s data</li>
                <li>Train your team on handling children&apos;s data requests</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Start by checking if your website collects data that could relate to children. <a href="/">PrivacyChecker</a> scans your site for
                trackers, cookies, and third-party scripts that collect data without age-appropriate consent. If your site uses <a href="/blog/dark-patterns-detection">dark patterns</a> that
                could manipulate minors, our scanner will flag them.
            </p>
        </ArticleLayout>
    );
}
