import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'data-breach-response-plan')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                When a data breach happens, you have exactly 72 hours to notify your supervisory authority under GDPR.
                That clock starts the moment you &quot;become aware&quot; of the breach — not when you finish
                investigating it. Without a prepared response plan, those 72 hours disappear fast.
            </p>

            <h2>What Counts as a Data Breach?</h2>
            <p>
                A personal data breach is any security incident that leads to unauthorized access, loss, destruction,
                or disclosure of personal data. This includes:
            </p>
            <ul>
                <li><strong>Cyber attacks</strong>: Ransomware, SQL injection, credential stuffing</li>
                <li><strong>Accidental disclosure</strong>: Sending data to the wrong recipient, misconfigured cloud storage</li>
                <li><strong>Lost devices</strong>: Unencrypted laptops, phones, or USB drives with personal data</li>
                <li><strong>Insider threats</strong>: Employees accessing data beyond their authorization</li>
                <li><strong>Third-party breaches</strong>: A <a href="/blog/vendor-risk-assessment-gdpr">vendor or processor</a> suffers a breach affecting your data</li>
                <li><strong>Website compromises</strong>: <a href="/blog/third-party-scripts-supply-chain-security">Supply chain attacks</a> that inject malicious scripts</li>
            </ul>

            <h2>The 72-Hour Timeline</h2>
            <table>
                <thead>
                    <tr><th>Time</th><th>Action</th><th>Responsibility</th></tr>
                </thead>
                <tbody>
                    <tr><td>Hour 0</td><td>Breach detected and confirmed</td><td>IT / Security team</td></tr>
                    <tr><td>Hours 0-4</td><td>Activate response team, contain the breach</td><td>Incident Commander</td></tr>
                    <tr><td>Hours 4-12</td><td>Assess scope: what data, how many people, what risk</td><td>Security + Legal</td></tr>
                    <tr><td>Hours 12-24</td><td>Determine notification obligations</td><td>DPO / Legal</td></tr>
                    <tr><td>Hours 24-48</td><td>Prepare notification to supervisory authority</td><td>DPO / Legal</td></tr>
                    <tr><td>Hours 48-72</td><td>Submit notification, begin individual notifications if needed</td><td>DPO</td></tr>
                    <tr><td>Post-72h</td><td>Continue investigation, update notification if needed</td><td>Full team</td></tr>
                </tbody>
            </table>

            <h2>What to Report to the Supervisory Authority</h2>
            <p>GDPR Article 33 requires the notification to include:</p>
            <ol>
                <li>Nature of the breach (type, categories and approximate number of data subjects affected)</li>
                <li>Name and contact details of the DPO or contact point</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken or proposed to address the breach and mitigate effects</li>
            </ol>

            <h2>When to Notify Individuals</h2>
            <p>
                You must also notify affected individuals directly (GDPR Article 34) when the breach is
                &quot;likely to result in a high risk to their rights and freedoms.&quot; This includes:
            </p>
            <ul>
                <li>Financial data exposure (payment cards, bank details)</li>
                <li>Login credentials compromised</li>
                <li>Health or sensitive data disclosed</li>
                <li>Identity theft risk (combined name + address + date of birth)</li>
            </ul>

            <h2>Building Your Response Plan</h2>

            <h3>1. Establish the Response Team</h3>
            <ul>
                <li><strong>Incident Commander</strong>: Overall coordination</li>
                <li><strong>IT/Security Lead</strong>: Technical investigation and containment</li>
                <li><strong>DPO/Privacy Lead</strong>: Regulatory assessment and notifications</li>
                <li><strong>Legal Counsel</strong>: Legal exposure and communication review</li>
                <li><strong>Communications</strong>: Customer and media communications</li>
                <li><strong>Management</strong>: Decision-making authority</li>
            </ul>

            <h3>2. Create Playbooks</h3>
            <p>Pre-written playbooks for common scenarios save critical hours:</p>
            <ul>
                <li>Ransomware attack playbook</li>
                <li>Website compromise playbook</li>
                <li>Credential leak playbook</li>
                <li>Third-party vendor breach playbook</li>
                <li>Accidental data disclosure playbook</li>
            </ul>

            <h3>3. Prepare Templates</h3>
            <ul>
                <li>Supervisory authority notification form (most DPAs provide online portals)</li>
                <li>Individual notification email template</li>
                <li>Internal communication template</li>
                <li>Media statement template (for high-profile breaches)</li>
            </ul>

            <h3>4. Practice</h3>
            <p>
                Run tabletop exercises at least annually. Simulate a breach scenario and walk through
                the response process. Time how long each step takes and identify bottlenecks.
            </p>

            <h2>Prevention Is Better Than Response</h2>
            <p>
                Most website breaches exploit known vulnerabilities. Proactive measures include:
            </p>
            <ul>
                <li>Implement <a href="/blog/website-security-headers-guide">security headers</a> to prevent common attacks</li>
                <li>Audit <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a> for supply chain risks</li>
                <li>Configure <a href="/blog/spf-dkim-dmarc-email-deliverability">email authentication</a> to prevent phishing</li>
                <li>Set up <a href="/blog/compliance-monitoring-drift-detection">continuous monitoring</a> to detect changes</li>
                <li>Minimize data collection to reduce breach impact</li>
            </ul>

            <p>
                <a href="/">Run a free PrivacyChecker scan</a> to identify security vulnerabilities on your website
                before attackers do. Prevention costs a fraction of breach response.
            </p>
        </ArticleLayout>
    );
}
