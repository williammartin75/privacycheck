import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'spf-dkim-dmarc-email-deliverability')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Since February 2024, Gmail and Yahoo require senders to authenticate their emails with SPF, DKIM, and DMARC.
                Without proper configuration, your emails — including transactional ones like password resets and invoices — will
                land in spam or be rejected entirely. Here&apos;s how to fix it in 10 minutes.
            </p>

            <h2>What Are SPF, DKIM, and DMARC?</h2>
            <table>
                <thead>
                    <tr><th>Record</th><th>What It Does</th><th>Analogy</th></tr>
                </thead>
                <tbody>
                    <tr><td>SPF</td><td>Lists which servers are allowed to send email for your domain</td><td>A guest list for your mailbox</td></tr>
                    <tr><td>DKIM</td><td>Adds a digital signature to verify the email wasn&apos;t tampered with</td><td>A wax seal on a letter</td></tr>
                    <tr><td>DMARC</td><td>Tells receivers what to do if SPF or DKIM fails, and where to send reports</td><td>Instructions for the bouncer</td></tr>
                </tbody>
            </table>

            <h2>Step 1: Configure SPF</h2>
            <p>SPF is a DNS TXT record that lists authorized sending servers. Add this to your domain&apos;s DNS:</p>
            <pre><code>example.com  TXT  &quot;v=spf1 ip4:YOUR_SERVER_IP include:_spf.google.com ~all&quot;</code></pre>
            <p>Key rules:</p>
            <ul>
                <li>Only one SPF record per domain (multiple records = failure)</li>
                <li>Use <code>include:</code> for third-party senders (Google Workspace, Mailchimp, SendGrid)</li>
                <li>Use <code>~all</code> (softfail) during testing, switch to <code>-all</code> (hardfail) in production</li>
                <li>Maximum 10 DNS lookups — too many <code>include:</code> statements will break SPF</li>
            </ul>

            <h3>Common SPF for Popular Services</h3>
            <table>
                <thead>
                    <tr><th>Service</th><th>SPF Include</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google Workspace</td><td><code>include:_spf.google.com</code></td></tr>
                    <tr><td>Microsoft 365</td><td><code>include:spf.protection.outlook.com</code></td></tr>
                    <tr><td>Mailchimp</td><td><code>include:servers.mcsv.net</code></td></tr>
                    <tr><td>SendGrid</td><td><code>include:sendgrid.net</code></td></tr>
                    <tr><td>Amazon SES</td><td><code>include:amazonses.com</code></td></tr>
                </tbody>
            </table>

            <h2>Step 2: Set Up DKIM</h2>
            <p>
                DKIM adds a cryptographic signature to your outgoing emails. The receiving server verifies this signature
                using a public key published in your DNS.
            </p>
            <p>DKIM requires two things:</p>
            <ol>
                <li><strong>A private key</strong> on your mail server that signs outgoing emails</li>
                <li><strong>A DNS TXT record</strong> with the public key that receivers use to verify</li>
            </ol>
            <p>The DNS record looks like:</p>
            <pre><code>mail._domainkey.example.com  TXT  &quot;v=DKIM1; k=rsa; p=MIIBIjANBg...your_public_key...&quot;</code></pre>
            <p>If you use a hosted email service (Google Workspace, Microsoft 365), they provide the DKIM keys — you just need to add the DNS records.</p>

            <h2>Step 3: Enable DMARC</h2>
            <p>DMARC tells receiving servers what to do when SPF or DKIM checks fail:</p>
            <pre><code>_dmarc.example.com  TXT  &quot;v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com; pct=100&quot;</code></pre>
            <p>DMARC policies:</p>
            <table>
                <thead>
                    <tr><th>Policy</th><th>Action</th><th>When to Use</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>p=none</code></td><td>Monitor only, no action</td><td>Start here — collect reports first</td></tr>
                    <tr><td><code>p=quarantine</code></td><td>Send to spam</td><td>After verifying SPF/DKIM work</td></tr>
                    <tr><td><code>p=reject</code></td><td>Block the email entirely</td><td>Full protection once confident</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Recommended approach</strong>: Start with <code>p=none</code> for 2 weeks to monitor reports,
                then move to <code>p=quarantine</code>, and finally <code>p=reject</code>.
            </p>

            <h2>Step 4: Verify Your Configuration</h2>
            <p>After setting up all three records, verify them:</p>
            <ul>
                <li>Run a <a href="/">PrivacyChecker scan</a> — our Email Deliverability module grades your SPF, DKIM, and DMARC (A-F)</li>
                <li>Send a test email to a Gmail account and check the headers for &quot;PASS&quot; status</li>
                <li>Use <code>dig TXT example.com</code> to verify DNS records are published</li>
            </ul>

            <h2>Gmail and Yahoo Requirements (2024+)</h2>
            <p>Since February 2024, bulk senders (5,000+ emails/day) must:</p>
            <ul>
                <li>Authenticate with SPF <strong>and</strong> DKIM</li>
                <li>Have a DMARC policy published (even <code>p=none</code>)</li>
                <li>Include one-click unsubscribe (List-Unsubscribe header)</li>
                <li>Keep spam complaint rates below 0.3%</li>
                <li>Use TLS encryption for email transmission</li>
            </ul>
            <p>Even small senders benefit from proper authentication — it improves deliverability for everyone.</p>

            <h2>Troubleshooting</h2>
            <table>
                <thead>
                    <tr><th>Problem</th><th>Likely Cause</th><th>Fix</th></tr>
                </thead>
                <tbody>
                    <tr><td>SPF fails</td><td>Missing <code>include:</code> for a sending service</td><td>Add the service&apos;s SPF include</td></tr>
                    <tr><td>DKIM fails</td><td>DNS record not propagated or key mismatch</td><td>Wait 24-48h for propagation, verify key</td></tr>
                    <tr><td>DMARC fails</td><td>SPF and DKIM both failing, or domain alignment issue</td><td>Fix SPF/DKIM first, check alignment</td></tr>
                    <tr><td>Emails still in spam</td><td>IP reputation, content issues, or missing PTR record</td><td>Check IP blacklists, improve content</td></tr>
                </tbody>
            </table>

            <h2>Your Email Grade</h2>
            <p>
                <a href="/">PrivacyChecker</a> grades your email authentication setup from A to F and provides specific
                fix recommendations. A properly configured domain should achieve at least a B grade. Most websites we
                scan start at D or F — fixing SPF, DKIM, and DMARC typically takes under 10 minutes and has an immediate impact.
            </p>
        </ArticleLayout>
    );
}
