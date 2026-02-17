import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'kvkk-turkey-privacy-law-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> KVKK (Kişisel Verilerin Korunması Kanunu — Law No. 6698) is Turkey&apos;s
                data protection law, in force since <strong>April 7, 2016</strong>. It was modeled on the EU Data
                Protection Directive 95/46/EC and shares similarities with GDPR, but has significant differences in
                consent requirements, data transfer rules, and enforcement. With Turkey&apos;s EU accession ambitions,
                amendments are bringing KVKK closer to GDPR.
            </p>

            <h2>What Is KVKK?</h2>
            <p>
                KVKK is Turkey&apos;s comprehensive data protection law. It applies to all natural and legal persons
                that process personal data of individuals in Turkey —  regardless of where the data controller is located.
                The law is enforced by the <strong>KVKK Board</strong> (Kişisel Verileri Koruma Kurulu), Turkey&apos;s
                data protection authority.
            </p>

            <h2>KVKK vs GDPR: Key Differences</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Turkish KVKK</th><th>EU GDPR</th></tr>
                </thead>
                <tbody>
                    <tr><td>In force since</td><td>April 2016</td><td>May 2018</td></tr>
                    <tr><td>Based on</td><td>EU Directive 95/46/EC</td><td>Replaces Directive 95/46/EC</td></tr>
                    <tr><td>Consent standard</td><td><strong>Explicit consent</strong> is the primary legal basis</td><td>6 legal bases (consent is just one option)</td></tr>
                    <tr><td>Legitimate interest</td><td><strong>Not available</strong> as a standalone legal basis (only &quot;mandatory for legitimate interest if not outweighing fundamental rights&quot;)</td><td>Available as a standalone legal basis (Art. 6(1)(f))</td></tr>
                    <tr><td>Sensitive data categories</td><td>Includes race, ethnicity, political opinion, religion, health, biometrics, criminal records, <strong>appearance, association membership</strong></td><td>Similar but appearance and association membership not explicitly listed</td></tr>
                    <tr><td>DPO requirement</td><td>Not required — but must register with VERBIS (Data Controllers Registry)</td><td>Mandatory for public bodies and large-scale processing</td></tr>
                    <tr><td>Data breach notification</td><td>Report to KVKK Board &quot;as soon as possible&quot; (practice: within 72 hours)</td><td>72 hours to DPA</td></tr>
                    <tr><td>Cross-border transfers</td><td><strong>Very restrictive</strong> — adequate country list + explicit consent OR Board approval</td><td>Adequacy + SCCs + BCRs + other mechanisms</td></tr>
                    <tr><td>Fines</td><td>TRY 50,000 – 5,000,000 (~€1,500 – €150,000)</td><td>Up to €20M or 4% of revenue</td></tr>
                    <tr><td>Right to be forgotten</td><td>Available (Art. 7)</td><td>Available (Art. 17)</td></tr>
                    <tr><td>Data portability</td><td>Not explicitly granted</td><td>Explicitly granted (Art. 20)</td></tr>
                    <tr><td>DPIA</td><td>Not explicitly required (but recommended by KVKK Board)</td><td>Mandatory for high-risk processing</td></tr>
                </tbody>
            </table>

            <h2>2024 Amendments: Moving Closer to GDPR</h2>
            <p>
                In March 2024, Turkey amended KVKK through Law No. 7499, introducing significant GDPR-aligned changes:
            </p>
            <ul>
                <li><strong>New legal bases for processing:</strong> Added &quot;legitimate interest&quot; as a separate legal basis (similar to GDPR Art. 6(1)(f)), establishment/exercise of legal claims, and public interest</li>
                <li><strong>Relaxed cross-border transfers:</strong> Introduced adequacy decisions, appropriate safeguards (contractual clauses), and binding corporate rules as transfer mechanisms — replacing the previous ultra-restrictive system</li>
                <li><strong>Automated decision-making:</strong> New right to object to decisions made solely by automated means</li>
            </ul>

            <h2>KVKK Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Register with VERBIS (Data Controllers Registry) if required by turnover/employee thresholds</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Create a Turkish-language privacy policy (aydınlatma metni) compliant with Art. 10</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Implement explicit consent mechanisms for processing activities that rely on consent</td><td>Critical</td></tr>
                    <tr><td>4</td><td>Establish a data subject rights response process (applications must be answered within 30 days)</td><td>Critical</td></tr>
                    <tr><td>5</td><td>Create a personal data retention and destruction policy</td><td>High</td></tr>
                    <tr><td>6</td><td>Implement cookie consent for Turkish users (KVKK Board has issued guidance requiring consent)</td><td>High</td></tr>
                    <tr><td>7</td><td>Assess cross-border data transfers and implement appropriate safeguards under the 2024 amendments</td><td>High</td></tr>
                    <tr><td>8</td><td>Conduct data inventory — map all personal data processing activities</td><td>High</td></tr>
                    <tr><td>9</td><td>Implement technical and administrative security measures (Art. 12)</td><td>High</td></tr>
                    <tr><td>10</td><td>Train employees on data protection obligations</td><td>Medium</td></tr>
                </tbody>
            </table>

            <h2>Website-Specific Requirements</h2>
            <ul>
                <li><strong>Aydınlatma metni (Privacy notice):</strong> Must be in Turkish, must identify the controller, purposes, recipients, legal basis, retention periods, and data subject rights. Must be displayed <strong>before</strong> any data collection</li>
                <li><strong>Cookie consent:</strong> The KVKK Board has published cookie guidelines requiring consent for non-essential cookies, similar to EU practice. Must disclose cookie categories and purposes</li>
                <li><strong>Explicit consent for marketing:</strong> Turkish Commercial Electronic Messages Law (6563) requires explicit opt-in consent for commercial emails, SMS, and push notifications — with a maximum 3-year validity</li>
                <li><strong>Contact forms:</strong> Must include a privacy notice explaining how the data will be processed before the user submits</li>
            </ul>

            <h2>VERBIS Registration</h2>
            <p>
                VERBIS (Veri Sorumluları Sicili) is Turkey&apos;s mandatory data controller registry. Registration
                requirements depend on your organization&apos;s size:
            </p>
            <table>
                <thead>
                    <tr><th>Category</th><th>VERBIS registration required?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Companies with 50+ employees or TRY 100M+ annual turnover</td><td>Yes (mandatory)</td></tr>
                    <tr><td>Companies processing sensitive data as core activity</td><td>Yes (mandatory)</td></tr>
                    <tr><td>Foreign data controllers processing Turkish data</td><td>Yes (mandatory)</td></tr>
                    <tr><td>Small companies below thresholds</td><td>Exempt (but must still comply with KVKK)</td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>Does KVKK apply to my business if I&apos;m based in the EU?</h3>
            <p>
                <strong>Yes</strong>, if you process personal data of individuals in Turkey — for example, if your
                website targets Turkish users, accepts Turkish customers, or monitors the behavior of people in Turkey.
                You must register with VERBIS as a foreign data controller.
            </p>

            <h3>Is Turkey considered &quot;adequate&quot; under GDPR?</h3>
            <p>
                <strong>No.</strong> Turkey does not have an EU adequacy decision. Transfers from the EU to Turkey
                require Standard Contractual Clauses (SCCs) or another GDPR transfer mechanism. The 2024 KVKK amendments
                were partly motivated by improving Turkey&apos;s chances of obtaining adequacy.
            </p>

            <h3>How do I check if my website complies with KVKK?</h3>
            <p>
                <a href="/">PrivacyChecker</a> scans your website for compliance issues including cookie consent,
                privacy policy completeness, third-party data transfers, and security headers. While primarily focused
                on GDPR and CCPA, the checks cover core KVKK requirements as well — especially website-level privacy
                controls and consent mechanisms.
            </p>
        </ArticleLayout>
    );
}
