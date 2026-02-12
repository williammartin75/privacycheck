import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'data-protection-impact-assessment-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                A Data Protection Impact Assessment (DPIA) is a formal process to evaluate the privacy risks
                of data processing activities. Under GDPR Article 35, it&apos;s mandatory for high-risk processing —
                and regulators have fined companies for failing to conduct one when required.
            </p>

            <h2>When Is a DPIA Mandatory?</h2>
            <p>A DPIA is required when processing is &quot;likely to result in a high risk&quot; to individuals. The EDPB and national DPAs have clarified this includes:</p>
            <table>
                <thead>
                    <tr><th>Scenario</th><th>Example</th><th>DPIA Required?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Large-scale profiling</td><td>Behavioral analytics on thousands of users</td><td>Yes</td></tr>
                    <tr><td>Systematic monitoring</td><td>Employee surveillance, CCTV in public areas</td><td>Yes</td></tr>
                    <tr><td>Sensitive data processing</td><td>Health data, biometric data, political opinions</td><td>Yes</td></tr>
                    <tr><td>Automated decision-making</td><td>Credit scoring, AI-based content moderation</td><td>Yes</td></tr>
                    <tr><td>Large-scale data combination</td><td>Merging datasets from different sources</td><td>Yes</td></tr>
                    <tr><td>New technologies</td><td>AI chatbots, facial recognition, IoT devices</td><td>Yes</td></tr>
                    <tr><td>Children&apos;s data</td><td>Education platforms, kids apps</td><td>Yes</td></tr>
                    <tr><td>Standard website analytics</td><td>Basic page view tracking</td><td>Usually not</td></tr>
                    <tr><td>Employee payroll</td><td>Standard HR processing</td><td>Usually not</td></tr>
                </tbody>
            </table>

            <h2>The DPIA Process (7 Steps)</h2>

            <h3>Step 1: Describe the Processing</h3>
            <ul>
                <li>What personal data is collected?</li>
                <li>How is data collected (forms, cookies, API, etc.)?</li>
                <li>What is the purpose of processing?</li>
                <li>Who has access to the data?</li>
                <li>How long is data retained?</li>
                <li>Where is data stored and transferred?</li>
            </ul>

            <h3>Step 2: Assess Necessity and Proportionality</h3>
            <ul>
                <li>Is the processing necessary for the stated purpose?</li>
                <li>Could the same goal be achieved with less data?</li>
                <li>What is the legal basis (consent, legitimate interest, contract)?</li>
                <li>Are data subjects adequately informed?</li>
            </ul>

            <h3>Step 3: Identify Risks to Individuals</h3>
            <p>Consider risks from the <em>data subject&apos;s</em> perspective:</p>
            <ul>
                <li><strong>Identity theft or fraud</strong> from data breaches</li>
                <li><strong>Discrimination</strong> from automated profiling</li>
                <li><strong>Financial loss</strong> from payment data exposure</li>
                <li><strong>Reputational damage</strong> from sensitive data disclosure</li>
                <li><strong>Loss of control</strong> over personal information</li>
            </ul>

            <h3>Step 4: Evaluate Risk Likelihood and Severity</h3>
            <table>
                <thead>
                    <tr><th></th><th>Low Severity</th><th>Medium Severity</th><th>High Severity</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>High Likelihood</strong></td><td>Medium Risk</td><td>High Risk</td><td>Very High Risk</td></tr>
                    <tr><td><strong>Medium Likelihood</strong></td><td>Low Risk</td><td>Medium Risk</td><td>High Risk</td></tr>
                    <tr><td><strong>Low Likelihood</strong></td><td>Low Risk</td><td>Low Risk</td><td>Medium Risk</td></tr>
                </tbody>
            </table>

            <h3>Step 5: Identify Mitigation Measures</h3>
            <ul>
                <li><strong>Technical measures</strong>: Encryption, pseudonymization, access controls, <a href="/blog/website-security-headers-guide">security headers</a></li>
                <li><strong>Organizational measures</strong>: Staff training, data handling procedures, vendor contracts</li>
                <li><strong>Privacy-enhancing technologies</strong>: Data minimization, anonymization, <a href="/blog/cookie-free-analytics-alternatives">cookie-free analytics</a></li>
                <li><strong>Consent mechanisms</strong>: Compliant <a href="/blog/cookie-consent-banner-guide">consent banners</a>, granular opt-in</li>
            </ul>

            <h3>Step 6: Document and Sign Off</h3>
            <p>Your DPIA document should include:</p>
            <ul>
                <li>Description of processing operations and purposes</li>
                <li>Assessment of necessity and proportionality</li>
                <li>Risk assessment with likelihood and severity ratings</li>
                <li>Mitigation measures and their effectiveness</li>
                <li>Residual risk assessment after mitigation</li>
                <li>DPO opinion (if you have one)</li>
                <li>Sign-off by the data controller</li>
            </ul>

            <h3>Step 7: Review and Update</h3>
            <p>
                DPIAs aren&apos;t one-time documents. Review when processing changes, when new risks emerge,
                or at minimum every 2-3 years. Set up <a href="/blog/compliance-monitoring-drift-detection">compliance monitoring</a> to
                catch changes that could affect your DPIA findings.
            </p>

            <h2>Consequences of Skipping a DPIA</h2>
            <ul>
                <li>Fines up to €10 million or 2% of annual turnover (GDPR Article 83(4))</li>
                <li>Processing orders from supervisory authorities to halt the processing</li>
                <li>Liability for damages if individuals are harmed</li>
                <li>Reputational damage and loss of customer trust</li>
            </ul>

            <p>
                Start by understanding what data your website collects. <a href="/">Run a free PrivacyChecker scan</a> to
                get a complete inventory of cookies, trackers, and third-party data flows — essential input
                for any DPIA.
            </p>
        </ArticleLayout>
    );
}
