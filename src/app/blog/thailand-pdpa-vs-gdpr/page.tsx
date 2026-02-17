import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'thailand-pdpa-vs-gdpr')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Thailand&apos;s Personal Data Protection Act (PDPA) has been fully
                enforceable since <strong>June 1, 2022</strong>. Often called &quot;Thailand&apos;s GDPR,&quot; the PDPA
                was heavily influenced by GDPR but has key differences in consent requirements, enforcement, and
                cross-border transfer rules. Fines can reach <strong>THB 5 million (~€130,000)</strong> plus criminal
                penalties of <strong>up to 1 year imprisonment</strong>.
            </p>

            <h2>What Is the PDPA?</h2>
            <p>
                The PDPA (B.E. 2562/2019) is Thailand&apos;s first comprehensive data protection law. It applies to
                any person or organization — whether based in Thailand or not — that collects, uses, or discloses
                personal data of individuals in Thailand.
            </p>
            <p>
                The law is enforced by the <strong>PDPC</strong> (Personal Data Protection Committee) and the
                <strong> Office of the Personal Data Protection Committee (OPDPC)</strong>.
            </p>

            <h2>PDPA vs GDPR: Side-by-Side Comparison</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Thailand PDPA</th><th>EU GDPR</th></tr>
                </thead>
                <tbody>
                    <tr><td>In force</td><td>June 1, 2022 (full enforcement)</td><td>May 25, 2018</td></tr>
                    <tr><td>Scope</td><td>Data of individuals in Thailand</td><td>Data of individuals in EU/EEA</td></tr>
                    <tr><td>Extraterritorial?</td><td>Yes — applies to foreign organizations targeting Thailand</td><td>Yes — applies to foreign organizations targeting EU</td></tr>
                    <tr><td>Legal bases for processing</td><td>6 bases: consent, contract, vital interests, legal obligation, public task, legitimate interest</td><td>6 bases (essentially identical)</td></tr>
                    <tr><td>Consent standard</td><td>Must be freely given, specific, informed. <strong>Must be as easy to withdraw as to give</strong></td><td>Same (Art. 7)</td></tr>
                    <tr><td>Sensitive data</td><td>Includes race, ethnicity, political opinions, religion, criminal records, health, disability, union membership, genetic data, biometric data, <strong>sexual orientation</strong></td><td>Similar categories (Art. 9)</td></tr>
                    <tr><td>DPO requirement</td><td>Required for public bodies, large-scale monitoring, large-scale sensitive data processing</td><td>Same (Art. 37)</td></tr>
                    <tr><td>Data breach notification</td><td><strong>72 hours</strong> to PDPC if risk of harm to data subjects</td><td>72 hours to DPA</td></tr>
                    <tr><td>Data subject rights</td><td>Access, rectification, deletion, restriction, portability, objection</td><td>Same plus right to not be subject to automated decisions</td></tr>
                    <tr><td>Automated decision-making</td><td><strong>Not explicitly addressed</strong></td><td>Art. 22 — right not to be subject to automated decisions</td></tr>
                    <tr><td>Cross-border transfers</td><td>Adequate protection required in receiving country (PDPC approval needed)</td><td>Adequacy decisions, SCCs, BCRs</td></tr>
                    <tr><td>Admin fines</td><td>Up to <strong>THB 5 million (~€130,000)</strong></td><td>Up to €20M or 4% of revenue</td></tr>
                    <tr><td>Criminal penalties</td><td><strong>Up to 1 year imprisonment</strong> + THB 1 million fine</td><td>None at EU level (some member states have criminal penalties)</td></tr>
                    <tr><td>Compensatory damages</td><td>Up to <strong>2x actual damages</strong> (punitive)</td><td>Actual damages only</td></tr>
                    <tr><td>Class actions</td><td>Allowed (organizations can file on behalf of data subjects)</td><td>Varies by member state</td></tr>
                </tbody>
            </table>

            <h2>Key Differences to Watch</h2>

            <h3>1. Criminal Penalties</h3>
            <p>
                Unlike GDPR, the PDPA includes <strong>criminal sanctions</strong>. Using or disclosing sensitive
                personal data without consent, or transferring data abroad in a way that causes harm, can result in:
            </p>
            <ul>
                <li><strong>Up to 6 months imprisonment</strong> for unauthorized use/disclosure of personal data</li>
                <li><strong>Up to 1 year imprisonment</strong> + THB 1 million fine for unauthorized use/disclosure of <strong>sensitive</strong> personal data, or for processing that causes harm to reputation, discriminatory treatment, or financial damage</li>
            </ul>

            <h3>2. Punitive Damages</h3>
            <p>
                Thai courts can award up to <strong>double the actual damages</strong> as punitive damages for
                intentional or grossly negligent violations — a concept not available under GDPR.
            </p>

            <h3>3. Cross-Border Transfer Complexity</h3>
            <p>
                The PDPA&apos;s cross-border transfer rules are less mature than GDPR&apos;s. As of 2026:
            </p>
            <ul>
                <li>The PDPC has <strong>not yet published</strong> a formal list of adequate countries</li>
                <li>Standard Contractual Clauses (Thai-specific) are being developed but not yet finalized</li>
                <li>In practice, most organizations rely on <strong>consent</strong> or the <strong>contract necessity</strong> exception for cross-border transfers</li>
                <li>Group companies can use binding corporate rules (BCRs) but the approval process is unclear</li>
            </ul>

            <h3>4. Consent Withdrawal Must Be Easy</h3>
            <p>
                The PDPA explicitly states that withdrawing consent must be <strong>&quot;as easy as giving
                    it&quot;</strong>. If consent was given with one click, it must be withdrawable with one click.
                Dark patterns like hiding the withdrawal option in deep menus or requiring phone calls to
                unsubscribe are explicitly prohibited.
            </p>

            <h2>PDPA Compliance Checklist for Websites</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Publish a Thai-language privacy policy covering all PDPA requirements (Sec. 23)</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Implement cookie consent with clear accept/reject options and category management</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Ensure consent withdrawal is as easy as consent giving (one-click unsubscribe)</td><td>Critical</td></tr>
                    <tr><td>4</td><td>Appoint a DPO if processing sensitive data at large scale or systematic monitoring</td><td>High</td></tr>
                    <tr><td>5</td><td>Set up 72-hour data breach notification process to PDPC</td><td>High</td></tr>
                    <tr><td>6</td><td>Implement data subject rights mechanisms (access, deletion, portability)</td><td>High</td></tr>
                    <tr><td>7</td><td>Document all processing activities and legal bases</td><td>High</td></tr>
                    <tr><td>8</td><td>Review cross-border data transfers (Google Analytics, cloud services, CDNs)</td><td>High</td></tr>
                    <tr><td>9</td><td>Implement appropriate security measures (encryption, access control, security headers)</td><td>High</td></tr>
                    <tr><td>10</td><td>Conduct DPIA for high-risk processing (not mandatory but recommended by PDPC)</td><td>Medium</td></tr>
                </tbody>
            </table>

            <h2>Enforcement Examples</h2>
            <p>
                While enforcement was initially slow after the June 2022 enforcement date, the PDPC has been
                increasingly active:
            </p>
            <ul>
                <li><strong>Telecom sector:</strong> The PDPC investigated major Thai telecom operators for data breaches and unauthorized marketing practices</li>
                <li><strong>Banking:</strong> Financial institutions have been scrutinized for sharing customer data with third-party insurers without proper consent</li>
                <li><strong>E-commerce:</strong> Online platforms have faced complaints about excessive data collection and non-compliant consent forms</li>
                <li><strong>Social media:</strong> International platforms have been notified about compliance requirements for Thai user data processing</li>
            </ul>

            <h2>Impact on International Businesses</h2>
            <p>
                If your company already complies with GDPR, you&apos;re <strong>mostly compliant</strong> with
                the PDPA. Key additional steps:
            </p>
            <ol>
                <li><strong>Thai-language privacy notice</strong> — required if targeting Thai users</li>
                <li><strong>Review cross-border transfer basis</strong> — you can&apos;t rely on SCCs yet (not published); use consent or contract necessity</li>
                <li><strong>Consent withdrawal mechanism</strong> — verify it meets the &quot;as easy as giving&quot; standard</li>
                <li><strong>Criminal risk assessment</strong> — ensure no processing exposes individuals to criminal liability</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Does the PDPA apply to my business if I&apos;m based in Europe?</h3>
            <p>
                <strong>Yes</strong>, if you offer goods/services to individuals in Thailand, monitor their behavior,
                or process their personal data. The PDPA has extraterritorial reach similar to GDPR.
            </p>

            <h3>Is Thailand considered &quot;adequate&quot; under GDPR?</h3>
            <p>
                <strong>No.</strong> Thailand does not have an EU adequacy decision. EU→Thailand transfers require
                SCCs, BCRs, or another GDPR transfer mechanism. Conversely, Thailand has not yet published its own
                adequacy list for PDPA cross-border transfers.
            </p>

            <h3>If I comply with GDPR, am I PDPA compliant?</h3>
            <p>
                <strong>Mostly</strong>, but not automatically. GDPR compliance covers about 80-90% of PDPA requirements.
                The main gaps are: Thai-language privacy notice, specific criminal liability provisions, punitive damages exposure,
                and cross-border transfer mechanisms (which are less developed under the PDPA). Scan your website with
                <a href="/">PrivacyChecker</a> to identify compliance gaps across multiple regulations.
            </p>
        </ArticleLayout>
    );
}
