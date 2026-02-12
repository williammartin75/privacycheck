import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'compliance-monitoring-drift-detection')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                You ran a privacy audit last month and everything was green. Today, a new tracker appeared on your homepage,
                your consent banner disappeared after a WordPress update, and a developer added a chat widget that loads
                before consent. Compliance drift is real — and it&apos;s the number one reason previously-compliant websites
                end up facing regulatory action.
            </p>

            <h2>What Is Compliance Drift?</h2>
            <p>
                Compliance drift occurs when changes to your website — intentional or not — cause it to fall out of compliance
                with privacy regulations. Unlike a one-time issue you can fix permanently, drift is continuous.
                Every code deploy, plugin update, or marketing change can introduce new compliance gaps.
            </p>

            <h2>Common Causes of Drift</h2>
            <table>
                <thead>
                    <tr><th>Cause</th><th>Example</th><th>Impact</th></tr>
                </thead>
                <tbody>
                    <tr><td>CMS/Plugin updates</td><td>WordPress update removes consent banner</td><td>No cookie consent → GDPR violation</td></tr>
                    <tr><td>Marketing additions</td><td>New Facebook Pixel added via tag manager</td><td>Tracker fires before consent</td></tr>
                    <tr><td>Developer changes</td><td>New chat widget added without consent integration</td><td>Data collection without consent</td></tr>
                    <tr><td>Third-party changes</td><td>Analytics provider adds new cookies</td><td>Undeclared cookies</td></tr>
                    <tr><td>DNS misconfiguration</td><td>SPF record broken after domain migration</td><td>Email authentication failure</td></tr>
                    <tr><td>SSL certificate expiry</td><td>Auto-renewal fails silently</td><td>HTTPS downgrade, security warning</td></tr>
                    <tr><td>Policy changes</td><td>New data processing not reflected in privacy policy</td><td>Incomplete disclosure</td></tr>
                </tbody>
            </table>

            <h2>Real-World Drift Scenarios</h2>

            <h3>Scenario 1: The Silent Tracker</h3>
            <p>
                A marketing team member adds a LinkedIn Insight Tag via Google Tag Manager.
                The tag fires on every page load, before the consent banner. Nobody in engineering knows about it.
                Three months later, a privacy activist files a complaint with the CNIL.
            </p>

            <h3>Scenario 2: The Plugin Update</h3>
            <p>
                A WordPress plugin update modifies the consent banner&apos;s behavior.
                The &quot;Reject All&quot; button is now hidden behind &quot;Manage Preferences.&quot;
                This violates CNIL guidelines. The site owner doesn&apos;t notice for weeks.
            </p>

            <h3>Scenario 3: The Vendor Pivot</h3>
            <p>
                Your analytics provider is acquired by an ad-tech company.
                They add new cookies and data sharing without changing the script URL.
                Your cookie declaration is now inaccurate, but nothing on your end technically changed.
            </p>

            <h2>How to Detect Drift</h2>

            <h3>Automated Monitoring</h3>
            <p>
                The only reliable way to catch drift is automated, scheduled scanning.
                Manual audits are too infrequent — a monthly check means 30 days of potential non-compliance.
            </p>
            <ul>
                <li><strong>Daily scans</strong>: PrivacyChecker Pro+ runs daily automated scans and compares them to your baseline</li>
                <li><strong>Change detection</strong>: Alerts when new scripts, cookies, or headers are added or removed</li>
                <li><strong>Score tracking</strong>: Track your <a href="/blog/website-privacy-score-meaning">privacy score</a> over time to spot regressions</li>
                <li><strong>DNS monitoring</strong>: Detect changes to SPF, DKIM, DMARC, and other DNS records</li>
            </ul>

            <h3>What to Monitor</h3>
            <table>
                <thead>
                    <tr><th>Area</th><th>What to Watch</th><th>Frequency</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookies & trackers</td><td>New cookies, changed purposes, removed consent checks</td><td>Daily</td></tr>
                    <tr><td>Consent banner</td><td>Presence, functionality, dark pattern changes</td><td>Daily</td></tr>
                    <tr><td>Third-party scripts</td><td>New scripts, removed scripts, changed script content</td><td>Daily</td></tr>
                    <tr><td>Security headers</td><td>Missing or modified headers</td><td>Weekly</td></tr>
                    <tr><td>DNS records</td><td>SPF, DKIM, DMARC changes or expiry</td><td>Weekly</td></tr>
                    <tr><td>SSL certificate</td><td>Expiration date, certificate changes</td><td>Daily</td></tr>
                    <tr><td>Privacy policy</td><td>Content changes, missing sections</td><td>Monthly</td></tr>
                </tbody>
            </table>

            <h2>Building a Compliance Monitoring Program</h2>
            <ol>
                <li>
                    <strong>Establish a baseline</strong>: Run a comprehensive <a href="/blog/how-to-audit-website-privacy">privacy audit</a> and
                    document your current compliance state
                </li>
                <li>
                    <strong>Set up automated scanning</strong>: Schedule daily or weekly scans that compare against your baseline
                </li>
                <li>
                    <strong>Define alerts</strong>: Configure notifications for critical changes — new trackers, missing consent,
                    security header removals
                </li>
                <li>
                    <strong>Assign ownership</strong>: Designate a team member (DPO, privacy champion, or engineering lead)
                    to review and act on alerts
                </li>
                <li>
                    <strong>Create a change process</strong>: Require privacy review for any changes that add
                    third-party scripts or modify data collection
                </li>
                <li>
                    <strong>Document everything</strong>: Maintain a log of changes, reviews, and remediation actions for
                    accountability under GDPR Article 5(2)
                </li>
            </ol>

            <h2>Cost of Not Monitoring</h2>
            <p>
                Regulatory fines aside, undetected drift leads to:
            </p>
            <ul>
                <li><strong>Accumulating violations</strong>: Issues compound over time, making remediation harder</li>
                <li><strong>Loss of trust</strong>: Users who discover tracking they didn&apos;t consent to will leave</li>
                <li><strong>Incident response delays</strong>: You can&apos;t fix what you don&apos;t know is broken</li>
                <li><strong>Audit failures</strong>: External audits become expensive when baseline documentation is outdated</li>
            </ul>

            <h2>Get Started</h2>
            <p>
                <a href="/">PrivacyChecker Pro+</a> includes continuous compliance monitoring with daily automated scans,
                change detection, score history, and instant alerts. Start with a free scan to establish your baseline,
                then upgrade to Pro+ for ongoing monitoring.
            </p>
        </ArticleLayout>
    );
}
