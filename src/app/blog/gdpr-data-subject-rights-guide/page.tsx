import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'gdpr-data-subject-rights-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                GDPR grants individuals eight fundamental rights over their personal data. For businesses, handling these requests
                correctly is not optional — failure to respond within deadlines or applying rights incorrectly has triggered
                significant fines across Europe. This guide covers every right, with practical workflows for handling requests.
            </p>

            <h2>The 8 Data Subject Rights Under GDPR</h2>
            <table>
                <thead>
                    <tr><th>Right</th><th>GDPR Article</th><th>Response Deadline</th><th>Can You Charge?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Right of access</td><td>Art. 15</td><td>1 month</td><td>Free (first copy)</td></tr>
                    <tr><td>Right to rectification</td><td>Art. 16</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Right to erasure</td><td>Art. 17</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Right to restriction</td><td>Art. 18</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Right to data portability</td><td>Art. 20</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Right to object</td><td>Art. 21</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Automated decision rights</td><td>Art. 22</td><td>1 month</td><td>Free</td></tr>
                    <tr><td>Right to withdraw consent</td><td>Art. 7(3)</td><td>Immediately</td><td>Free</td></tr>
                </tbody>
            </table>

            <h2>1. Right of Access (Article 15) — DSAR</h2>
            <p>
                The most common request. Data subjects can ask you to confirm whether you process their data and, if so,
                receive a copy of all personal data along with information about your processing.
            </p>
            <p>You must provide:</p>
            <ul>
                <li>A copy of all personal data you hold about them</li>
                <li>The purposes of processing</li>
                <li>Categories of data concerned</li>
                <li>Recipients or categories of recipients</li>
                <li>Retention periods</li>
                <li>The source of data (if not collected directly)</li>
                <li>Whether automated decision-making is used</li>
                <li>Information about international transfers</li>
            </ul>
            <p>
                <strong>Format:</strong> Provide data in a commonly used electronic format (JSON, CSV, PDF). If the request was made electronically,
                respond electronically unless they request otherwise.
            </p>

            <h2>2. Right to Rectification (Article 16)</h2>
            <p>
                Data subjects can request correction of inaccurate data or completion of incomplete data.
                This is straightforward: verify the claim and update your records.
            </p>
            <ul>
                <li>Verify identity before making changes</li>
                <li>Update data across all systems (including backups and processors)</li>
                <li>Notify third parties you&apos;ve shared the data with (Art. 19)</li>
                <li>Confirm the rectification to the requester</li>
            </ul>

            <h2>3. Right to Erasure — &quot;Right to Be Forgotten&quot; (Article 17)</h2>
            <p>
                Perhaps the most well-known right. Data subjects can request deletion when:
            </p>
            <ul>
                <li>Data is no longer necessary for the original purpose</li>
                <li>They withdraw consent (and no other legal basis applies)</li>
                <li>They object to processing under Art. 21</li>
                <li>Data was unlawfully processed</li>
                <li>Data must be erased for legal compliance</li>
                <li>Data was collected from a child</li>
            </ul>
            <p><strong>Exceptions</strong> — you can refuse erasure when data is needed for:</p>
            <ul>
                <li>Freedom of expression and information</li>
                <li>Legal obligations (tax records, employment law)</li>
                <li>Public health purposes</li>
                <li>Archiving in the public interest, research, or statistics</li>
                <li>Establishment, exercise, or defense of legal claims</li>
            </ul>
            <p>
                <strong>Important:</strong> If you&apos;ve made the data public, you must take &quot;reasonable steps&quot; to inform other controllers processing
                the data that the data subject has requested erasure.
            </p>

            <h2>4. Right to Restriction of Processing (Article 18)</h2>
            <p>
                A less common but important right. The data subject can request that you stop processing (but not delete) their data when:
            </p>
            <ul>
                <li>They contest the accuracy of data (while you verify)</li>
                <li>Processing is unlawful but they prefer restriction over erasure</li>
                <li>You no longer need the data but they need it for legal claims</li>
                <li>They have objected under Art. 21 (while you verify legitimate grounds)</li>
            </ul>
            <p>During restriction, you can store the data but cannot process it without consent (except for legal claims, protecting rights, or important public interest).</p>

            <h2>5. Right to Data Portability (Article 20)</h2>
            <p>
                Data subjects can request their data in a structured, commonly used, machine-readable format and transmit it to another controller.
                This applies only when:
            </p>
            <ul>
                <li>Processing is based on consent or contract</li>
                <li>Processing is carried out by automated means</li>
            </ul>
            <p>
                <strong>What to provide:</strong> Only data the subject actively provided (form submissions, profile data, usage data) — not your derived insights or analytics.
                Use JSON or CSV format. Where technically feasible, transmit directly to the new controller.
            </p>

            <h2>6. Right to Object (Article 21)</h2>
            <p>
                Data subjects can object to processing based on legitimate interest (Art. 6(1)(f)) or public interest (Art. 6(1)(e)).
                You must stop processing unless you demonstrate &quot;compelling legitimate grounds&quot; that override the data subject&apos;s interests.
            </p>
            <p>
                <strong>Direct marketing:</strong> The right to object to direct marketing is absolute — there are no exceptions. You must stop immediately.
            </p>

            <h2>7. Automated Decision-Making Rights (Article 22)</h2>
            <p>
                Data subjects have the right not to be subject to decisions based solely on automated processing that produce legal
                or similarly significant effects. When you must use automated decisions, ensure you provide:
            </p>
            <ul>
                <li>The right to obtain human intervention</li>
                <li>The right to express their point of view</li>
                <li>The right to contest the decision</li>
                <li>Meaningful information about the logic involved</li>
            </ul>

            <h2>DSAR Handling Workflow</h2>
            <p>Follow this step-by-step process for every data subject request:</p>
            <ul>
                <li><strong>Step 1: Receive and log.</strong> Record the request date, type, and communication channel. Start the 30-day clock.</li>
                <li><strong>Step 2: Verify identity.</strong> Request sufficient information to confirm the requester&apos;s identity. Don&apos;t over-collect — ask only what&apos;s proportionate.</li>
                <li><strong>Step 3: Assess scope.</strong> Determine which right is being exercised, what data is involved, and whether any exemptions apply.</li>
                <li><strong>Step 4: Search all systems.</strong> Check databases, email, CRM, analytics, backups, and processors. Don&apos;t forget data held by third-party tools.</li>
                <li><strong>Step 5: Fulfill or refuse.</strong> Compile the response, apply exemptions if applicable, and document your reasoning.</li>
                <li><strong>Step 6: Respond within 30 days.</strong> If you need an extension (up to 2 additional months), notify the requester within the first month.</li>
                <li><strong>Step 7: Notify processors.</strong> If data was rectified, erased, or restricted, inform all recipients (Art. 19).</li>
                <li><strong>Step 8: Document everything.</strong> Maintain a log of all requests and responses for accountability (Art. 5(2)).</li>
            </ul>

            <h2>Common Mistakes to Avoid</h2>
            <ul>
                <li><strong>Ignoring requests:</strong> Silence is not a valid response. Failure to respond is a direct GDPR violation.</li>
                <li><strong>Missing deadlines:</strong> The 30-day clock starts when you receive the request, not when you verify identity.</li>
                <li><strong>Over-collecting for verification:</strong> Don&apos;t ask for ID documents when an email confirmation suffices.</li>
                <li><strong>Forgetting processors:</strong> You must cascade erasure/rectification requests to all third-party processors.</li>
                <li><strong>Blanket refusals:</strong> Each request must be assessed individually. Blanket policies are not acceptable.</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Make sure your website provides clear mechanisms for exercising data subject rights. Your <a href="/blog/gdpr-privacy-policy-template">privacy policy</a> must
                list all rights and how to exercise them. <a href="/">PrivacyChecker</a> audits your privacy policy for missing rights disclosures
                and checks that your contact mechanisms are accessible and functional.
            </p>
        </ArticleLayout>
    );
}
