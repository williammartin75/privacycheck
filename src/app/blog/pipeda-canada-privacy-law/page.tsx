import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'pipeda-canada-privacy-law')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> PIPEDA (Personal Information Protection and Electronic Documents Act) is
                Canada&apos;s federal privacy law governing how private-sector organizations collect, use, and disclose
                personal information. If your website has Canadian users, you likely need to comply — even if your business
                is based outside Canada.
            </p>

            <h2>What Is PIPEDA?</h2>
            <p>
                PIPEDA has been in force since <strong>2000</strong> and applies to all commercial activity across Canada, except in
                provinces that have enacted &quot;substantially similar&quot; legislation (Quebec, Alberta, and British Columbia
                have their own laws). In practice, PIPEDA still applies to inter-provincial and international data flows,
                meaning most websites serving Canadians must comply.
            </p>
            <p>
                The law is enforced by the <strong>Office of the Privacy Commissioner of Canada (OPC)</strong>. Unlike GDPR,
                the OPC has historically relied on recommendations rather than massive fines — but this is changing with
                the proposed <strong>Consumer Privacy Protection Act (CPPA)</strong>, expected to replace PIPEDA with
                GDPR-level enforcement powers.
            </p>

            <h2>PIPEDA vs GDPR: Key Differences</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>GDPR (EU)</th><th>PIPEDA (Canada)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Effective Date</td><td>May 2018</td><td>January 2001 (updated 2015, 2018)</td></tr>
                    <tr><td>Scope</td><td>EU residents&apos; data, anywhere processed</td><td>Commercial activity in Canada + data of persons in Canada</td></tr>
                    <tr><td>Legal Framework</td><td>Regulation (directly applicable)</td><td>Federal act + 10 Fair Information Principles</td></tr>
                    <tr><td>Consent Model</td><td>Opt-in for most processing</td><td>&quot;Meaningful consent&quot; — can be express or implied depending on sensitivity</td></tr>
                    <tr><td>Cookies</td><td>Prior consent required (ePrivacy + GDPR)</td><td>Consent required for tracking cookies; implied consent may suffice for functional cookies</td></tr>
                    <tr><td>DPO Required?</td><td>In specific cases (large-scale, public authorities)</td><td>Must designate a &quot;Privacy Officer&quot; responsible for compliance</td></tr>
                    <tr><td>Breach Notification</td><td>72 hours to DPA</td><td>&quot;As soon as feasible&quot; to OPC and affected individuals</td></tr>
                    <tr><td>Fines</td><td>Up to €20M or 4% of global revenue</td><td>Up to CAD $100K per violation (CPPA proposes up to 5% of revenue)</td></tr>
                    <tr><td>Enforcement</td><td>National DPAs (CNIL, ICO, etc.)</td><td>Office of the Privacy Commissioner of Canada (OPC)</td></tr>
                    <tr><td>Cross-Border Transfers</td><td>Adequacy decisions, SCCs, BCRs</td><td>Allowed if comparable protection; must inform individuals</td></tr>
                    <tr><td>Right to Erasure</td><td>Yes (&quot;Right to be Forgotten&quot;)</td><td>Limited — can request correction, not full erasure</td></tr>
                    <tr><td>Data Portability</td><td>Yes</td><td>Not currently, but CPPA will add this right</td></tr>
                    <tr><td>Private Right of Action</td><td>Yes</td><td>Yes — individuals can sue after OPC finding</td></tr>
                </tbody>
            </table>

            <h2>PIPEDA&apos;s 10 Fair Information Principles</h2>
            <p>
                PIPEDA is built around <strong>10 principles</strong> that form the core of Canadian privacy law. Every website
                handling Canadian user data must follow them:
            </p>
            <ol>
                <li><strong>Accountability:</strong> Designate a Privacy Officer responsible for compliance</li>
                <li><strong>Identifying Purposes:</strong> State WHY you collect data before or at the time of collection</li>
                <li><strong>Consent:</strong> Obtain meaningful consent — express for sensitive data, implied for non-sensitive</li>
                <li><strong>Limiting Collection:</strong> Only collect data necessary for stated purposes (data minimization)</li>
                <li><strong>Limiting Use, Disclosure, and Retention:</strong> Don&apos;t use data beyond original purpose; delete when no longer needed</li>
                <li><strong>Accuracy:</strong> Keep personal information accurate and up to date</li>
                <li><strong>Safeguards:</strong> Protect data with appropriate security measures</li>
                <li><strong>Openness:</strong> Make privacy policies and practices publicly available</li>
                <li><strong>Individual Access:</strong> Allow individuals to access and challenge their data</li>
                <li><strong>Challenging Compliance:</strong> Provide a mechanism for complaints and inquiries</li>
            </ol>

            <h2>Cookie Consent Under PIPEDA</h2>
            <p>
                Unlike GDPR&apos;s strict opt-in requirement, PIPEDA uses a <strong>contextual consent model</strong>:
            </p>
            <ul>
                <li><strong>Essential cookies:</strong> No consent required (session management, security, load balancing)</li>
                <li><strong>Analytics cookies:</strong> <strong>Implied consent</strong> may be acceptable if you clearly disclose their use and provide an opt-out mechanism</li>
                <li><strong>Marketing/tracking cookies:</strong> <strong>Express consent</strong> required — especially for cross-site tracking, profiling, or sharing data with third parties</li>
                <li><strong>Sensitive data:</strong> Always <strong>express consent</strong> — health, financial, or precise location data</li>
            </ul>
            <p>
                The OPC has clarified that burying consent in long privacy policies is <strong>not meaningful consent</strong>. Your
                <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> should be clear, specific, and easy to understand.
            </p>

            <h2>Mandatory Breach Notification (PIPEDA&apos;s DORS)</h2>
            <p>
                Since November 2018, PIPEDA&apos;s <strong>Digital Privacy Act</strong> amendments require organizations to:
            </p>
            <ol>
                <li><strong>Report</strong> breaches involving a &quot;real risk of significant harm&quot; to the OPC</li>
                <li><strong>Notify</strong> affected individuals as soon as feasible</li>
                <li><strong>Keep records</strong> of ALL breaches (even minor ones) for the OPC to inspect</li>
            </ol>
            <p>
                Failure to report can result in fines up to <strong>CAD $100,000</strong> per violation. See our
                <a href="/blog/data-breach-response-plan">data breach response guide</a> for a step-by-step plan.
            </p>

            <h2>The Future: CPPA (Bill C-27)</h2>
            <p>
                Canada is modernizing PIPEDA with the <strong>Consumer Privacy Protection Act (CPPA)</strong>, part of
                Bill C-27. Key changes include:
            </p>
            <ul>
                <li><strong>Fines up to 5% of global revenue</strong> or CAD $25 million (whichever is greater)</li>
                <li><strong>Algorithmic transparency:</strong> Right to an explanation of automated decisions</li>
                <li><strong>Data portability:</strong> Right to transfer data between organizations</li>
                <li><strong>Right to deletion:</strong> Explicit right to erasure (similar to GDPR)</li>
                <li><strong>Private right of action:</strong> Individuals can sue directly without an OPC finding first</li>
                <li><strong>New Data Protection Tribunal:</strong> Dedicated enforcement body with binding powers</li>
            </ul>

            <h2>PIPEDA Compliance Checklist for Websites</h2>
            <ol>
                <li><strong>Designate a Privacy Officer</strong> and display their contact information on your website</li>
                <li><strong>Publish a clear privacy policy</strong> stating what data you collect, why, and who you share it with</li>
                <li><strong>Implement a cookie consent banner</strong> with at minimum opt-out for analytics and express consent for tracking</li>
                <li><strong>Enable data access requests</strong> — provide a way for users to request, correct, or delete their data</li>
                <li><strong>Secure personal data</strong> with encryption, access controls, and security headers</li>
                <li><strong>Document all data breaches</strong> and report those with real risk of significant harm</li>
                <li><strong>Map third-party data flows</strong> — know which vendors receive Canadian user data</li>
                <li><strong>Review cross-border transfers</strong> — ensure comparable protection when data leaves Canada</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Does PIPEDA apply if my business is not in Canada?</h3>
            <p>
                <strong>Yes.</strong> If you collect data from individuals in Canada through commercial activity,
                PIPEDA applies — regardless of where your business is based. This is similar to GDPR&apos;s extraterritorial reach.
            </p>

            <h3>What about Quebec&apos;s Law 25?</h3>
            <p>
                Quebec&apos;s <strong>Law 25 (formerly Bill 64)</strong> is a provincial privacy law that is substantially similar to PIPEDA
                but with stricter requirements. It includes <strong>mandatory privacy impact assessments</strong>, a <strong>privacy-by-default
                    requirement</strong>, and fines up to <strong>CAD $25 million or 4% of worldwide turnover</strong>. If you
                serve Quebec residents, you must comply with Law 25 in addition to PIPEDA for cross-border aspects.
            </p>

            <h3>Do I need a cookie banner for Canadian visitors?</h3>
            <p>
                For tracking and marketing cookies, <strong>yes</strong>. The OPC expects meaningful consent for non-essential cookies.
                Use our <a href="/blog/do-you-need-a-cookie-banner">cookie banner decision guide</a> to check requirements by country.
            </p>

            <h3>How do I check if my website is PIPEDA compliant?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. It detects cookies, trackers, consent banner
                implementation, privacy policy gaps, security headers, and third-party data transfers —
                all of which are relevant for PIPEDA compliance.
            </p>
        </ArticleLayout>
    );
}
