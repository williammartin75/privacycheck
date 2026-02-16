import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'saas-gdpr-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> SaaS companies must comply with GDPR if they process personal data of EU residents —
                regardless of where the company is based. Key requirements include a Data Processing Agreement (DPA) with
                every customer, a sub-processor list, data retention policies, and the ability to fulfil data subject
                access requests (DSARs) within 30 days.
            </p>

            <h2>Why GDPR Hits SaaS Companies Harder</h2>
            <p>
                SaaS products are, by nature, <strong>data processors</strong>. Your customers (the data controllers) trust you
                with their users&apos; personal data. This creates a chain of responsibility that GDPR strictly regulates.
                A single compliance failure in your SaaS can expose <strong>every customer</strong> to regulatory risk.
            </p>
            <ul>
                <li>You process data on behalf of thousands of controllers</li>
                <li>You likely use sub-processors (AWS, Stripe, Mailgun) that also handle personal data</li>
                <li>You store data across regions, triggering cross-border transfer rules</li>
                <li>Enterprise customers <strong>require</strong> GDPR compliance before signing contracts</li>
            </ul>

            <h2>The SaaS GDPR Compliance Checklist</h2>

            <h3>1. Data Processing Agreement (DPA)</h3>
            <p>
                Every SaaS company must provide a DPA to customers. This is legally required under GDPR Article 28.
                Your DPA must include:
            </p>
            <ul>
                <li>Subject matter and duration of processing</li>
                <li>Nature and purpose of processing</li>
                <li>Types of personal data processed</li>
                <li>Obligations and rights of the controller</li>
                <li>Sub-processor engagement terms</li>
                <li>Data deletion or return upon contract termination</li>
                <li>Audit rights for the controller</li>
            </ul>
            <p>
                <strong>Tip:</strong> Publish your DPA publicly on your website (like Notion, Slack, and Stripe do).
                This removes friction from the sales process.
            </p>

            <h3>2. Sub-Processor List</h3>
            <p>
                You must maintain and publish a list of all third-party services that process personal data on your behalf.
                Under GDPR, you must notify customers <strong>before</strong> adding a new sub-processor and give them the
                right to object.
            </p>
            <table>
                <thead>
                    <tr><th>Sub-Processor</th><th>Purpose</th><th>Data Location</th><th>DPA Available?</th></tr>
                </thead>
                <tbody>
                    <tr><td>AWS</td><td>Infrastructure / hosting</td><td>EU (Frankfurt)</td><td>Yes</td></tr>
                    <tr><td>Stripe</td><td>Payment processing</td><td>US (DPF certified)</td><td>Yes</td></tr>
                    <tr><td>Mailgun / SendGrid</td><td>Email delivery</td><td>US (DPF certified)</td><td>Yes</td></tr>
                    <tr><td>Sentry</td><td>Error tracking</td><td>US (DPF certified)</td><td>Yes</td></tr>
                    <tr><td>Intercom / Crisp</td><td>Customer support</td><td>US / EU</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h3>3. Data Retention Policy</h3>
            <p>
                GDPR requires that personal data is not kept longer than necessary. As a SaaS company, you need clear
                retention schedules:
            </p>
            <ul>
                <li><strong>Active accounts:</strong> Data retained while the account is active</li>
                <li><strong>Deleted accounts:</strong> Personal data purged within 30 days of deletion request</li>
                <li><strong>Backups:</strong> Personal data in backups must be purged within 90 days</li>
                <li><strong>Logs:</strong> Server logs containing IP addresses should be rotated every 30-90 days</li>
                <li><strong>Analytics:</strong> Aggregate only — delete individual-level tracking data after 14 days</li>
            </ul>

            <h3>4. Data Subject Access Requests (DSARs)</h3>
            <p>
                You must respond to DSARs within <strong>30 days</strong>. As a data processor, your customer (the controller)
                is typically the one who receives the request, but you must have the technical capability to:
            </p>
            <ul>
                <li><strong>Export</strong> all personal data for a given user (JSON/CSV format)</li>
                <li><strong>Delete</strong> all personal data for a given user (right to erasure)</li>
                <li><strong>Rectify</strong> incorrect data upon request</li>
                <li><strong>Restrict processing</strong> of specific data points</li>
            </ul>

            <h3>5. Security Measures</h3>
            <p>
                GDPR Article 32 requires &quot;appropriate technical and organizational measures.&quot; For SaaS,
                this typically means:
            </p>
            <ul>
                <li>Encryption at rest (AES-256) and in transit (TLS 1.2+)</li>
                <li>Access controls with role-based permissions</li>
                <li>Regular security audits and penetration testing</li>
                <li>Incident response plan with 72-hour breach notification</li>
                <li><a href="/blog/website-security-headers-guide">Proper security headers</a> on your web application</li>
                <li>SOC 2 or ISO 27001 certification (highly recommended for enterprise sales)</li>
            </ul>

            <h3>6. Privacy by Design</h3>
            <p>
                New features must be built with <a href="/blog/privacy-by-design-implementation">Privacy by Design</a> principles.
                This means data minimization (only collect what you need), purpose limitation, and privacy-friendly defaults.
            </p>

            <h3>7. Cookie and Tracking Compliance</h3>
            <p>
                Your SaaS website and dashboard must comply with cookie rules. Use <a href="/">PrivacyChecker</a> to
                scan your site and verify that no tracking scripts fire before consent. Check your
                <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> implementation.
            </p>

            <h2>GDPR Compliance as a Sales Advantage</h2>
            <p>
                Enterprise customers in the EU <strong>will not buy</strong> SaaS products without verifiable GDPR compliance.
                Having a public DPA, sub-processor list, and security certifications removes sales friction and
                builds trust. Companies like Notion, Linear, and Vercel prominently display their compliance status.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Does GDPR apply to my SaaS if I&apos;m based outside the EU?</h3>
            <p>
                <strong>Yes.</strong> GDPR applies to any company that processes personal data of EU residents,
                regardless of where the company is incorporated. If you have EU customers, you must comply.
            </p>

            <h3>What&apos;s the difference between a data controller and a data processor?</h3>
            <p>
                The <strong>controller</strong> decides why and how data is processed (your customer).
                The <strong>processor</strong> processes data on behalf of the controller (your SaaS).
                Both have separate obligations under GDPR.
            </p>

            <h3>What are the penalties for SaaS GDPR non-compliance?</h3>
            <p>
                Up to <strong>€20 million or 4% of global annual revenue</strong>, whichever is higher.
                Beyond fines, non-compliance can result in enforcement orders, public reprimands, and — most
                critically for SaaS — loss of enterprise customers. See our
                <a href="/blog/biggest-gdpr-fines-2025-2026">GDPR fines analysis</a> for real examples.
            </p>
        </ArticleLayout>
    );
}
