import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cross-border-data-transfers-schrems')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                If your website uses Google Analytics, Cloudflare, Stripe, or any US-based service, you&apos;re
                transferring personal data across borders. The Schrems II ruling invalidated the EU-US Privacy Shield,
                and the new EU-US Data Privacy Framework (DPF) has specific requirements. Here&apos;s what you need
                to know.
            </p>

            <h2>Current Legal Landscape (2026)</h2>
            <table>
                <thead>
                    <tr><th>Transfer Mechanism</th><th>Status</th><th>When to Use</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU-US Data Privacy Framework</td><td>Active (since July 2023)</td><td>For US companies certified under the DPF</td></tr>
                    <tr><td>Standard Contractual Clauses (SCCs)</td><td>Active (2021 version)</td><td>For any non-adequate country (universal fallback)</td></tr>
                    <tr><td>Binding Corporate Rules</td><td>Active</td><td>For intra-group transfers in multinationals</td></tr>
                    <tr><td>Adequacy decisions</td><td>Active for specific countries</td><td>Transfers to countries deemed adequate by EU Commission</td></tr>
                    <tr><td>Derogations (Article 49)</td><td>Limited use</td><td>Occasional, non-repetitive transfers with explicit consent</td></tr>
                </tbody>
            </table>

            <h2>EU-US Data Privacy Framework</h2>
            <p>
                The DPF allows transfers to US companies that have self-certified with the US Department of Commerce.
                Key points:
            </p>
            <ul>
                <li><strong>Check certification</strong>: Verify your US vendor is DPF-certified at <a href="https://www.dataprivacyframework.gov" target="_blank" rel="noopener noreferrer">dataprivacyframework.gov</a></li>
                <li><strong>Not permanent</strong>: The DPF may face a &quot;Schrems III&quot; challenge. Max Schrems&apos; NOYB organization has already signaled concerns</li>
                <li><strong>Limited scope</strong>: Only covers companies that actively certify — many smaller US vendors may not be certified</li>
            </ul>

            <h2>Standard Contractual Clauses (SCCs)</h2>
            <p>
                SCCs are the most widely used transfer mechanism. The 2021 version introduced a modular approach:
            </p>
            <table>
                <thead>
                    <tr><th>Module</th><th>Scenario</th><th>Example</th></tr>
                </thead>
                <tbody>
                    <tr><td>Module 1</td><td>Controller to Controller</td><td>Sharing customer data with a US partner</td></tr>
                    <tr><td>Module 2</td><td>Controller to Processor</td><td>Using AWS, Google Cloud, or Cloudflare</td></tr>
                    <tr><td>Module 3</td><td>Processor to Processor</td><td>Your processor uses a sub-processor outside EU</td></tr>
                    <tr><td>Module 4</td><td>Processor to Controller</td><td>Rare — data returns to a non-EU controller</td></tr>
                </tbody>
            </table>

            <h3>Transfer Impact Assessment (TIA)</h3>
            <p>
                Since Schrems II, you must conduct a Transfer Impact Assessment before relying on SCCs.
                This evaluates whether the recipient country&apos;s laws provide &quot;essentially equivalent&quot;
                protection to EU law. For US transfers with DPF certification, this is simplified.
            </p>

            <h2>Adequate Countries</h2>
            <p>
                The EU Commission has recognized the following countries as providing adequate data protection.
                No additional transfer mechanism is needed:
            </p>
            <ul>
                <li>Andorra, Argentina, Canada (commercial), Faroe Islands, Guernsey</li>
                <li>Israel, Isle of Man, Japan, Jersey, New Zealand</li>
                <li>Republic of Korea, Switzerland, United Kingdom, Uruguay</li>
                <li>United States (only for DPF-certified organizations)</li>
            </ul>

            <h2>Practical Steps for Website Owners</h2>
            <ol>
                <li>
                    <strong>Map your data flows</strong>: Identify all services that receive personal data from your
                    website. <a href="/">PrivacyChecker</a> automatically discovers <a href="/blog/third-party-scripts-supply-chain-security">third-party services</a> on your site
                </li>
                <li>
                    <strong>Check vendor locations</strong>: Determine where each vendor stores and processes data
                </li>
                <li>
                    <strong>Verify transfer mechanisms</strong>: For each non-EU vendor, confirm they have DPF certification
                    or that you have SCCs in place
                </li>
                <li>
                    <strong>Conduct TIAs</strong>: Document your assessment of each transfer&apos;s risk
                </li>
                <li>
                    <strong>Update privacy policy</strong>: Disclose the specific transfer mechanisms you rely on
                    (see our <a href="/blog/privacy-policy-generator-vs-custom">privacy policy guide</a>)
                </li>
                <li>
                    <strong>Consider EU alternatives</strong>: Where possible, use EU-based services to avoid
                    transfer complexity entirely
                </li>
            </ol>

            <h2>Risk of Non-Compliance</h2>
            <p>
                Fines for illegal data transfers are among the highest under GDPR. Meta was fined €1.2 billion
                in 2023 for transferring EU user data to the US without adequate safeguards. While website owners
                face proportionally smaller fines, the legal risk is real — especially as privacy activists
                file systematic complaints.
            </p>

            <p>
                <a href="/">Scan your website for free</a> to discover all third-party services and their data
                locations, then assess your transfer compliance.
            </p>
        </ArticleLayout>
    );
}
