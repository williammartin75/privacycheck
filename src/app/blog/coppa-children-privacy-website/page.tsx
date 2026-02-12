import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'coppa-children-privacy-website')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                If children under 13 can access your website — even accidentally — you may be subject to COPPA
                (Children&apos;s Online Privacy Protection Act). This US federal law carries fines of up to $50,120
                per violation, and the FTC has been aggressively enforcing it against websites, apps, and
                advertising networks.
            </p>

            <h2>Who Must Comply with COPPA?</h2>
            <table>
                <thead>
                    <tr><th>You Must Comply If:</th><th>Example</th></tr>
                </thead>
                <tbody>
                    <tr><td>Your site is directed at children under 13</td><td>Kids games, educational platforms, children&apos;s content</td></tr>
                    <tr><td>You have actual knowledge of collecting data from children</td><td>User profile indicates age under 13</td></tr>
                    <tr><td>Your site enables children to publicly share personal information</td><td>Social features, comments, user profiles</td></tr>
                    <tr><td>You use third-party services that collect children&apos;s data</td><td>Analytics, ads, or social plugins on a kids&apos; site</td></tr>
                </tbody>
            </table>

            <h2>What COPPA Requires</h2>
            <ol>
                <li><strong>Privacy policy specifically for children&apos;s data</strong>: Must describe what information is collected, how it&apos;s used, and disclosure practices</li>
                <li><strong>Verifiable parental consent (VPC)</strong>: Before collecting personal information from children, you must obtain verifiable parental consent</li>
                <li><strong>Parental access rights</strong>: Parents must be able to review, modify, and delete their child&apos;s data</li>
                <li><strong>Data minimization</strong>: Only collect data reasonably necessary for the activity</li>
                <li><strong>Security</strong>: Maintain reasonable procedures to protect children&apos;s data</li>
                <li><strong>Data retention limits</strong>: Only retain data as long as necessary for its purpose</li>
            </ol>

            <h2>Verifiable Parental Consent Methods</h2>
            <p>The FTC accepts several methods for obtaining VPC:</p>
            <table>
                <thead>
                    <tr><th>Method</th><th>How It Works</th><th>Strength</th></tr>
                </thead>
                <tbody>
                    <tr><td>Signed consent form</td><td>Parent signs and returns by mail/fax/email scan</td><td>Strong</td></tr>
                    <tr><td>Credit card transaction</td><td>Charge a small amount to verify card ownership</td><td>Strong</td></tr>
                    <tr><td>Government ID</td><td>Parent provides and ID is verified</td><td>Strong</td></tr>
                    <tr><td>Video call</td><td>Live verification with parent</td><td>Strong</td></tr>
                    <tr><td>Knowledge-based questions</td><td>Questions only a parent would answer</td><td>Moderate</td></tr>
                    <tr><td>Email Plus</td><td>Email confirmation + follow-up verification step</td><td>Moderate (limited uses)</td></tr>
                </tbody>
            </table>

            <h2>Common COPPA Violations</h2>
            <ul>
                <li><strong>Tracking cookies on kids&apos; sites</strong>: <a href="/blog/cookie-consent-banner-guide">Analytics and advertising cookies</a> that collect persistent identifiers are &quot;personal information&quot; under COPPA</li>
                <li><strong>Third-party ad networks</strong>: Running behavioral ads on children&apos;s content violates COPPA unless parental consent is obtained</li>
                <li><strong>Social features without VPC</strong>: Chat, comments, or user profiles that allow children to disclose personal information</li>
                <li><strong>YouTube embeds</strong>: Standard YouTube embeds set tracking cookies — use youtube-nocookie.com instead</li>
                <li><strong>Failing to update privacy policy</strong>: COPPA requires specific disclosures that generic <a href="/blog/privacy-policy-generator-vs-custom">privacy policy generators</a> often miss</li>
            </ul>

            <h2>COPPA Beyond the US</h2>
            <p>Other jurisdictions have similar children&apos;s privacy rules:</p>
            <table>
                <thead>
                    <tr><th>Jurisdiction</th><th>Law</th><th>Age Threshold</th><th>Key Requirement</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU (GDPR)</td><td>Article 8</td><td>16 (member states can lower to 13)</td><td>Parental consent for information society services</td></tr>
                    <tr><td>UK</td><td>Age Appropriate Design Code</td><td>18</td><td>Best interests of the child must be primary consideration</td></tr>
                    <tr><td>California</td><td>CPRA / CAADCA</td><td>16 (for data sales)</td><td>DPIA required for services likely used by children</td></tr>
                    <tr><td>China</td><td>PIPL</td><td>14</td><td>Separate consent and impact assessment required</td></tr>
                </tbody>
            </table>

            <h2>Audit Your Site for Children&apos;s Data</h2>
            <p>
                Even if your site isn&apos;t aimed at children, third-party scripts on your pages may collect data
                from minors who visit. <a href="/">Run a PrivacyChecker scan</a> to identify every tracker and
                cookie on your site, then assess whether any could capture children&apos;s data.
            </p>
        </ArticleLayout>
    );
}
