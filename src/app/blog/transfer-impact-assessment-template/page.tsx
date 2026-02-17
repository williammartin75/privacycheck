import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'transfer-impact-assessment-template')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Since the Schrems II ruling invalidated the EU-US Privacy Shield, every organization transferring personal data
                outside the EU/EEA using Standard Contractual Clauses (SCCs) must conduct a Transfer Impact Assessment (TIA).
                This guide provides a practical, step-by-step template you can follow immediately.
            </p>

            <h2>What Is a Transfer Impact Assessment?</h2>
            <p>
                A TIA evaluates whether the legal framework of the destination country provides &quot;essentially equivalent&quot;
                protection to EU law. It&apos;s required by the EDPB&apos;s post-Schrems II recommendations (Recommendations 01/2020)
                and is a condition for valid SCCs.
            </p>
            <p>Without a documented TIA, your SCCs are not valid, and the transfer is unlawful.</p>

            <h2>When You Need a TIA</h2>
            <ul>
                <li>Using SCCs (Standard Contractual Clauses) for data transfers</li>
                <li>Relying on Binding Corporate Rules (BCRs)</li>
                <li>Using Article 49 derogations for non-occasional transfers</li>
                <li>Transferring to a country without an EU adequacy decision</li>
            </ul>
            <p><strong>When you don&apos;t need a TIA:</strong> Transfers to countries with an EU adequacy decision (UK, Japan, South Korea, Canada for PIPEDA-covered entities, Israel, Switzerland, etc.) or transfers to US companies certified under the EU-US Data Privacy Framework.</p>

            <h2>6-Step TIA Template</h2>

            <h2>Step 1: Map the Transfer</h2>
            <p>Document the specifics of your data transfer:</p>
            <table>
                <thead>
                    <tr><th>Element</th><th>Document</th></tr>
                </thead>
                <tbody>
                    <tr><td>Data exporter</td><td>Your organization name, role (controller/processor)</td></tr>
                    <tr><td>Data importer</td><td>Recipient name, country, role</td></tr>
                    <tr><td>Categories of data</td><td>What personal data is transferred</td></tr>
                    <tr><td>Categories of data subjects</td><td>Customers, employees, prospects, etc.</td></tr>
                    <tr><td>Purpose of transfer</td><td>Why the data is sent</td></tr>
                    <tr><td>Transfer mechanism</td><td>SCCs, BCRs, or derogation</td></tr>
                    <tr><td>Onward transfers</td><td>Does the importer transfer data further?</td></tr>
                </tbody>
            </table>

            <h2>Step 2: Identify the Transfer Mechanism</h2>
            <p>Confirm which GDPR Article 46 mechanism you&apos;re using:</p>
            <ul>
                <li><strong>New SCCs (June 2021):</strong> The European Commission&apos;s standard contractual clauses. Make sure you&apos;re using the current version — old SCCs expired in December 2022.</li>
                <li><strong>BCRs:</strong> For intra-group transfers within multinational organizations. Require DPA approval.</li>
                <li><strong>Codes of Conduct / Certifications:</strong> Sector-specific approved mechanisms.</li>
            </ul>

            <h2>Step 3: Assess Third-Country Laws</h2>
            <p>This is the core of the TIA. Evaluate whether the destination country&apos;s laws undermine the protections in your SCCs:</p>
            <ul>
                <li><strong>Government surveillance laws:</strong> Can authorities compel the importer to disclose data? Under what conditions?</li>
                <li><strong>Access without judicial oversight:</strong> Can intelligence agencies access data without a court order?</li>
                <li><strong>Bulk collection:</strong> Does the country engage in mass/indiscriminate surveillance?</li>
                <li><strong>Effective remedies:</strong> Can EU data subjects challenge government access in that country&apos;s courts?</li>
                <li><strong>Independent oversight:</strong> Is there an independent authority supervising government surveillance?</li>
            </ul>
            <p>For US transfers: assess FISA 702, Executive Order 12333, and the protections introduced by Executive Order 14086 (which underpins the EU-US DPF).</p>

            <h2>Step 4: Evaluate Whether Protections Are Essentially Equivalent</h2>
            <p>
                Compare the third-country framework against EU standards. Consider:
            </p>
            <ul>
                <li>Is government access limited to what is necessary and proportionate?</li>
                <li>Are there clear, precise, and accessible rules governing access?</li>
                <li>Is independent oversight effective and functioning?</li>
                <li>Are effective legal remedies available to EU data subjects?</li>
            </ul>
            <p>
                <strong>If protections are not equivalent:</strong> You must identify supplementary measures (Step 5) or suspend the transfer.
            </p>

            <h2>Step 5: Implement Supplementary Measures</h2>
            <p>If the legal assessment reveals gaps, consider these supplementary measures:</p>
            <table>
                <thead>
                    <tr><th>Type</th><th>Measure</th><th>Effectiveness</th></tr>
                </thead>
                <tbody>
                    <tr><td>Technical</td><td>End-to-end encryption (where importer has no key)</td><td>Strong</td></tr>
                    <tr><td>Technical</td><td>Pseudonymization before transfer</td><td>Strong</td></tr>
                    <tr><td>Technical</td><td>Split processing (no single party has full data)</td><td>Strong</td></tr>
                    <tr><td>Contractual</td><td>Transparency reporting obligations</td><td>Moderate</td></tr>
                    <tr><td>Contractual</td><td>Importer commits to challenge government requests</td><td>Moderate</td></tr>
                    <tr><td>Contractual</td><td>Warrant canary clauses</td><td>Limited</td></tr>
                    <tr><td>Organizational</td><td>Strict access controls and audit rights</td><td>Moderate</td></tr>
                    <tr><td>Organizational</td><td>Internal policies to resist unlawful requests</td><td>Limited</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Important:</strong> If the importer needs to access data in the clear (e.g., a SaaS provider processing data), encryption alone won&apos;t
                prevent government access. You may need additional contractual and organizational measures — or consider EU-based alternatives.
            </p>

            <h2>Step 6: Document, Review, and Monitor</h2>
            <ul>
                <li>Document your entire assessment in writing</li>
                <li>Include the analysis, conclusions, and supplementary measures</li>
                <li>Set a review date (at least annually)</li>
                <li>Monitor legislative changes in the destination country</li>
                <li>Be prepared to suspend transfers if circumstances change</li>
                <li>Keep the TIA available for your supervisory authority</li>
            </ul>

            <h2>Quick Reference: Common Transfer Destinations</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>TIA Required?</th><th>Key Consideration</th></tr>
                </thead>
                <tbody>
                    <tr><td>US (DPF-certified)</td><td>No</td><td>Adequacy decision covers</td></tr>
                    <tr><td>US (non-DPF)</td><td>Yes</td><td>FISA 702, EO 14086 remedies</td></tr>
                    <tr><td>UK</td><td>No</td><td>Adequacy (review due 2025)</td></tr>
                    <tr><td>India</td><td>Yes</td><td>New DPDPA; government access breadth</td></tr>
                    <tr><td>China</td><td>Yes</td><td>Broad government access; localization requirements</td></tr>
                    <tr><td>Australia</td><td>Yes</td><td>Encryption access laws (TOLA Act)</td></tr>
                    <tr><td>Brazil</td><td>Yes</td><td>LGPD provides moderate protection</td></tr>
                    <tr><td>Japan</td><td>No</td><td>Adequacy decision</td></tr>
                </tbody>
            </table>

            <h2>Next Steps</h2>
            <p>
                Start by identifying all your <a href="/blog/cross-border-data-transfers-schrems">cross-border data transfers</a>. <a href="/">PrivacyChecker</a> detects
                <a href="/blog/what-data-does-my-website-collect"> third-party services</a> loading on your website that transfer data internationally —
                including analytics, CDNs, fonts, and embedded content. Run a free scan to map your data flows.
            </p>
        </ArticleLayout>
    );
}
