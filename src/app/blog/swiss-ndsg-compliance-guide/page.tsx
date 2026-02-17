import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'swiss-ndsg-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Switzerland&apos;s revised Federal Act on Data Protection (nDSG/revDSG)
                came into force on <strong>September 1, 2023</strong>. It aligns Swiss privacy law with GDPR but has
                key differences: no requirement to appoint a DPO, <strong>criminal liability for individuals</strong>
                (not companies), and no mandatory data breach notification to data subjects. Here&apos;s what you need
                to know for compliance.
            </p>

            <h2>What Is the nDSG?</h2>
            <p>
                The nDSG (neues Datenschutzgesetz) is Switzerland&apos;s modernized data protection law, replacing
                the original 1992 Federal Act on Data Protection (DSG). The revision was driven by two factors:
            </p>
            <ul>
                <li><strong>EU adequacy:</strong> Switzerland needed to maintain its &quot;adequate&quot; status under GDPR Article 45 for seamless EU-Swiss data transfers</li>
                <li><strong>Modernization:</strong> The 1992 law predated smartphones, cloud computing, and big data — it was fundamentally outdated</li>
            </ul>
            <p>
                The nDSG applies to any processing of personal data of <strong>natural persons</strong> (legal entities
                are no longer covered, unlike the old DSG). It applies to companies located in Switzerland <strong>and</strong>
                foreign companies whose data processing has effects in Switzerland.
            </p>

            <h2>nDSG vs GDPR: Key Differences</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Swiss nDSG</th><th>EU GDPR</th></tr>
                </thead>
                <tbody>
                    <tr><td>Scope</td><td>Natural persons only</td><td>Natural persons only</td></tr>
                    <tr><td>DPO requirement</td><td><strong>Not mandatory</strong> (voluntary &quot;Data Protection Advisor&quot;)</td><td>Mandatory for public bodies, large-scale processing</td></tr>
                    <tr><td>Legal basis for processing</td><td>No need for explicit legal basis for private sector (good faith principle)</td><td>Must have one of 6 legal bases (Art. 6)</td></tr>
                    <tr><td>Consent</td><td>Required only for sensitive data, profiling, cross-border transfers</td><td>Required for many processing activities</td></tr>
                    <tr><td>Data breach notification</td><td>Report to FDPIC &quot;as soon as possible&quot; — <strong>no fixed deadline</strong></td><td>72 hours to DPA</td></tr>
                    <tr><td>Notify data subjects</td><td>Only if necessary for their protection or if FDPIC requires it</td><td>Required if high risk</td></tr>
                    <tr><td>Fines</td><td><strong>Up to CHF 250,000 — against individuals</strong> (not companies)</td><td>Up to €20M or 4% of revenue — against companies</td></tr>
                    <tr><td>DPIA</td><td>Required for high-risk processing (similar to GDPR)</td><td>Required for high-risk processing</td></tr>
                    <tr><td>Records of processing</td><td>Required (exemption for SMEs &lt;250 employees with low-risk processing)</td><td>Required (exemption for &lt;250 employees)</td></tr>
                    <tr><td>Cross-border transfers</td><td>Adequacy list maintained by Federal Council (largely mirrors EU)</td><td>Adequacy decisions by European Commission</td></tr>
                    <tr><td>Supervisory authority</td><td>FDPIC (Federal Data Protection and Information Commissioner)</td><td>National DPAs (CNIL, ICO, BfDI, etc.)</td></tr>
                </tbody>
            </table>

            <h2>Critical Difference: Criminal Liability</h2>
            <p>
                Unlike GDPR, the nDSG imposes <strong>criminal penalties on individuals</strong>, not companies.
                This means:
            </p>
            <ul>
                <li>The <strong>person responsible</strong> for the violation (CEO, CISO, DPO, project manager) can be personally fined up to CHF 250,000</li>
                <li>Violations are prosecuted by cantonal prosecution authorities, not the FDPIC</li>
                <li>The FDPIC can investigate and issue recommendations but <strong>cannot impose fines directly</strong></li>
                <li>Criminal sanctions require <strong>intentional</strong> violations (not mere negligence, except for duty of care violations)</li>
            </ul>
            <p>
                Sanctionable offenses include: failure to provide information to data subjects, failure to report
                data breaches, unauthorized cross-border transfers, failure to comply with minimum data security
                requirements, and failure to appoint a representative in Switzerland (when required).
            </p>

            <h2>nDSG Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Update privacy policy to include all nDSG-required information (identity of controller, purpose, recipients, cross-border transfers, retention periods, data subject rights)</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Implement &quot;Privacy by Design&quot; and &quot;Privacy by Default&quot; (Art. 7) — data minimization, purpose limitation, default privacy settings</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Create Records of Processing Activities (Art. 12) — unless SME exemption applies</td><td>Critical</td></tr>
                    <tr><td>4</td><td>Conduct Data Protection Impact Assessment for high-risk processing (Art. 22)</td><td>High</td></tr>
                    <tr><td>5</td><td>Review cross-border data transfers — ensure adequate country or appropriate safeguards (SCCs, BCRs)</td><td>High</td></tr>
                    <tr><td>6</td><td>Implement data breach notification process to FDPIC (Art. 24)</td><td>High</td></tr>
                    <tr><td>7</td><td>Update website cookie consent for Swiss users — consent required for non-essential cookies under the Telecommunications Act (FMG)</td><td>High</td></tr>
                    <tr><td>8</td><td>Ensure data subject rights mechanisms: access, rectification, deletion, data portability (Art. 25-29)</td><td>High</td></tr>
                    <tr><td>9</td><td>Appoint a representative in Switzerland if you&apos;re a foreign controller with regular processing of Swiss data (Art. 14)</td><td>Medium</td></tr>
                    <tr><td>10</td><td>Consider appointing a voluntary Data Protection Advisor (Art. 10) — provides benefits for DPIA consultation</td><td>Medium</td></tr>
                </tbody>
            </table>

            <h2>Website-Specific Requirements</h2>
            <ul>
                <li><strong>Privacy policy:</strong> Must be available in the language(s) your Swiss visitors use (German, French, Italian, English). Must identify the controller, processing purposes, recipients, and cross-border transfers</li>
                <li><strong>Cookie consent:</strong> While the nDSG itself doesn&apos;t require cookie consent, the Swiss Telecommunications Act (FMG Art. 45c) requires informing users about cookies and offering a way to refuse — similar to ePrivacy but less strict than GDPR. In practice, most Swiss sites implement GDPR-style consent banners</li>
                <li><strong>Third-party scripts:</strong> Any data transfer to foreign recipients (Google Analytics, Meta Pixel, etc.) must be disclosed and adequacy/safeguards must be in place</li>
                <li><strong>Security measures:</strong> Implement appropriate technical and organizational measures (encryption, access controls, logging)</li>
            </ul>

            <h2>Cross-Border Data Transfers</h2>
            <p>
                The nDSG mirrors GDPR&apos;s approach to cross-border transfers. The Federal Council maintains an
                <strong>adequacy list</strong> of countries with adequate data protection. For transfers to
                non-adequate countries, you need:
            </p>
            <ul>
                <li>Standard Contractual Clauses (SCCs) — the FDPIC accepts EU SCCs </li>
                <li>Binding Corporate Rules (BCRs)</li>
                <li>Explicit consent from the data subject</li>
                <li>Necessity for contract performance</li>
            </ul>
            <p>
                <strong>Key note:</strong> The US is <strong>not</strong> on Switzerland&apos;s adequacy list (unlike
                the EU-US DPF). However, the Swiss-US Data Privacy Framework was approved in September 2024,
                covering certified US companies.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Does the nDSG apply to my company if I&apos;m based in the EU?</h3>
            <p>
                <strong>Yes</strong>, if your data processing has &quot;effects in Switzerland&quot; — i.e., you
                target Swiss customers, have Swiss users, or process data of Swiss residents. You may also need to
                appoint a <strong>representative in Switzerland</strong> (Art. 14) if you regularly process personal
                data of Swiss persons on a large scale.
            </p>

            <h3>Do I need a DPO under the nDSG?</h3>
            <p>
                <strong>No</strong>, unlike GDPR, a Data Protection Advisor (the nDSG equivalent of a DPO) is
                <strong>voluntary</strong>. However, appointing one provides advantages: you can consult them instead
                of the FDPIC for DPIAs, and it demonstrates good faith compliance efforts.
            </p>

            <h3>How do I check if my website complies with the nDSG?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. Our tool checks for privacy policy
                completeness, cookie consent implementation, third-party data transfers, security headers, and
                more — covering both GDPR and nDSG requirements in one scan.
            </p>
        </ArticleLayout>
    );
}
