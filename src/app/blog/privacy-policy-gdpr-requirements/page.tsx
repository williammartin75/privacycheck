import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'privacy-policy-gdpr-requirements')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Every website that processes personal data needs a privacy
                policy. This covers <strong>virtually every website</strong> &mdash; because even logging
                an IP address counts as data processing. Here are all the mandatory disclosures and a
                step-by-step guide.
            </p>

            <h2>Why Is a Privacy Policy Mandatory?</h2>
            <p>
                The GDPR requires in <strong>Articles 13 and 14</strong> that every data controller
                informs data subjects about the processing of their personal data. This information
                obligation is typically fulfilled through a privacy policy on the website.
            </p>
            <p>
                <strong>Important:</strong> A missing or incomplete privacy policy is not only a GDPR
                violation (fines up to &euro;20 million), but also a <strong>competition law violation</strong>
                in many EU countries. Competitors can take legal action against you.
            </p>

            <h2>The 12 Mandatory Disclosures Under Art. 13 GDPR</h2>
            <p>
                Every privacy policy must include the following information:
            </p>
            <table>
                <thead>
                    <tr><th>#</th><th>Required Disclosure</th><th>Legal Basis</th><th>Example</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Name and contact details of the controller</td><td>Art. 13(1)(a)</td><td>Company name, address, email, phone</td></tr>
                    <tr><td>2</td><td>DPO contact details (if applicable)</td><td>Art. 13(1)(b)</td><td>privacy@company.com</td></tr>
                    <tr><td>3</td><td>Purposes of data processing</td><td>Art. 13(1)(c)</td><td>Website analytics, contact form, newsletter</td></tr>
                    <tr><td>4</td><td>Legal basis for each purpose</td><td>Art. 13(1)(c)</td><td>Art. 6(1)(a) consent, Art. 6(1)(f) legitimate interest</td></tr>
                    <tr><td>5</td><td>Legitimate interest (if applicable)</td><td>Art. 13(1)(d)</td><td>Website optimization, fraud prevention</td></tr>
                    <tr><td>6</td><td>Recipients of the data</td><td>Art. 13(1)(e)</td><td>Hosting provider, payment processor, Google</td></tr>
                    <tr><td>7</td><td>Third-country transfers</td><td>Art. 13(1)(f)</td><td>Transfer to the US via EU-US DPF</td></tr>
                    <tr><td>8</td><td>Retention periods</td><td>Art. 13(2)(a)</td><td>Log files: 30 days, customer data: 10 years</td></tr>
                    <tr><td>9</td><td>Data subject rights</td><td>Art. 13(2)(b)</td><td>Access, deletion, rectification, objection</td></tr>
                    <tr><td>10</td><td>Right to withdraw consent</td><td>Art. 13(2)(c)</td><td>Withdrawal possible at any time</td></tr>
                    <tr><td>11</td><td>Right to lodge a complaint with a DPA</td><td>Art. 13(2)(d)</td><td>Relevant supervisory authority</td></tr>
                    <tr><td>12</td><td>Automated decision-making / profiling</td><td>Art. 13(2)(f)</td><td>If AI-based decisions are made</td></tr>
                </tbody>
            </table>

            <h2>Additional Disclosures for Common Website Features</h2>

            <h3>Hosting and Server Logs</h3>
            <p>
                Every web server records technical data on each request (IP address, browser, operating
                system, timestamp). This is a <strong>mandatory disclosure</strong> in your privacy
                policy, even if the data is only stored briefly.
            </p>

            <h3>Contact Forms</h3>
            <p>
                If your website has a contact form, you must state: what data is collected, on what
                legal basis, how long it is stored, and who has access.
            </p>

            <h3>Google Analytics / Tracking Services</h3>
            <ul>
                <li>Name of the service and provider</li>
                <li>Type of data collected (cookie IDs, IP address, page views)</li>
                <li>Legal basis: <strong>Consent</strong> (Art. 6(1)(a))</li>
                <li>Note on IP anonymization (if enabled)</li>
                <li>Note on Google Consent Mode v2</li>
                <li>Note on the EU-US Data Privacy Framework</li>
                <li>Opt-out option (browser plugin)</li>
            </ul>

            <h3>Newsletter and Email Marketing</h3>
            <ul>
                <li>Describe the double opt-in process</li>
                <li>Name the email service provider (e.g., Mailchimp, Brevo)</li>
                <li>Disclose tracking in emails (e.g., open rates)</li>
                <li>Unsubscribe option in every email</li>
            </ul>

            <h3>Social Media Plugins</h3>
            <ul>
                <li>Which networks are embedded (Facebook, Instagram, LinkedIn)</li>
                <li>Whether a 2-click solution or Shariff is used</li>
                <li>Note on data sharing with the platform operator</li>
            </ul>

            <h2>When Do You Need a Data Protection Officer?</h2>
            <p>
                Under <strong>Art. 37 GDPR</strong> and national laws, a DPO is required when:
            </p>
            <ul>
                <li>Your core activity involves <strong>large-scale processing</strong> of personal data</li>
                <li>You process <strong>special categories of data</strong> (health, biometric, genetic data)</li>
                <li>You need to carry out a <strong>Data Protection Impact Assessment (DPIA)</strong></li>
                <li>In Germany: at least <strong>20 employees</strong> regularly process personal data (&sect; 38 BDSG)</li>
            </ul>

            <h2>Common Privacy Policy Mistakes</h2>
            <table>
                <thead>
                    <tr><th>Mistake</th><th>Why It&apos;s a Problem</th><th>Fix</th></tr>
                </thead>
                <tbody>
                    <tr><td>Copy-paste from the internet</td><td>Doesn&apos;t match your actual data processing</td><td>Customize or use a generator</td></tr>
                    <tr><td>Outdated legal references</td><td>Citing Privacy Shield instead of EU-US DPF</td><td>Update regularly</td></tr>
                    <tr><td>Missing services</td><td>New plugin/tool not covered</td><td>Review after every website change</td></tr>
                    <tr><td>Wrong language</td><td>Must be in the language of the target audience</td><td>Provide localized versions</td></tr>
                    <tr><td>Not accessible</td><td>Must be reachable from every page</td><td>Add link in footer on every page</td></tr>
                    <tr><td>No legal notice linked</td><td>Legal notice (Impressum) and privacy policy are separate obligations</td><td>Link both in the footer</td></tr>
                </tbody>
            </table>

            <h2>Privacy Policy Checklist</h2>
            <ol>
                <li>All 12 mandatory disclosures under Art. 13 GDPR included?</li>
                <li>All services and tools listed?</li>
                <li>Legal basis stated for each processing purpose?</li>
                <li>Current third-country transfer rules (EU-US DPF) mentioned?</li>
                <li>Data subject rights fully listed?</li>
                <li>Controller&apos;s contact details correct?</li>
                <li>DPO named (if required)?</li>
                <li>Retention periods stated for all data categories?</li>
                <li>Accessible from every page (max. 2 clicks)?</li>
                <li>Regular review scheduled (at least quarterly)?</li>
            </ol>

            <h2>Automated Checks with PrivacyChecker</h2>
            <p>
                Our free <a href="/">GDPR website scanner</a> automatically detects whether your website
                has a privacy policy and checks its key components. The scan also verifies whether all
                embedded third-party services are mentioned in your privacy policy.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Is a privacy policy generator sufficient?</h3>
            <p>
                A privacy policy generator (e.g., from Termly, iubenda, or eRecht24) is a good
                <strong>starting point</strong>, but not a guarantee of completeness. You must always
                adapt the generated text to your actual data processing activities and update it regularly.
            </p>

            <h3>What happens if my privacy policy is incomplete?</h3>
            <p>
                An incomplete privacy policy can result in a <strong>DPA fine</strong> (up to &euro;20
                million), a <strong>competition law injunction</strong> from competitors, or a
                <strong>compensation claim</strong> from affected users.
            </p>

            <h3>Does the privacy policy need to be in the local language?</h3>
            <p>
                If your website targets users in a specific country, the privacy policy should be available
                in that country&apos;s language. For international websites, a multilingual version is
                recommended. This requirement stems from the GDPR&apos;s transparency principle: information
                must be provided in <strong>clear and plain language</strong>.
            </p>
        </ArticleLayout>
    );
}
