import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'webflow-gdpr-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Webflow gives you full control over your website&apos;s design and code — but that flexibility means GDPR compliance
                is entirely in your hands. Unlike platforms with built-in consent solutions, Webflow requires you to implement
                privacy compliance from scratch. This guide covers everything you need to do.
            </p>

            <h2>Is Webflow GDPR Compliant?</h2>
            <p>
                <strong>Webflow as a platform is GDPR-ready</strong> — they offer a DPA, process data lawfully, and have security measures in place.
                However, <strong>your Webflow site is not compliant by default:</strong>
            </p>
            <ul>
                <li>No built-in cookie consent banner</li>
                <li>No privacy policy template or page</li>
                <li>Forms collect data without explicit consent mechanisms</li>
                <li>Third-party scripts load without consent management</li>
                <li>Default hosting may route through US servers</li>
            </ul>

            <h2>Webflow GDPR Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>Requirement</th><th>Webflow Solution</th><th>Difficulty</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie consent banner</td><td>Third-party CMP (code injection)</td><td>Medium</td></tr>
                    <tr><td>Privacy policy page</td><td>Create CMS or static page</td><td>Easy</td></tr>
                    <tr><td>Form consent</td><td>Add checkbox fields</td><td>Easy</td></tr>
                    <tr><td>Third-party script management</td><td>Conditional loading via CMP</td><td>Medium</td></tr>
                    <tr><td>EU data hosting</td><td>Project settings → Hosting</td><td>Easy</td></tr>
                    <tr><td>DPA with Webflow</td><td>Request from Webflow</td><td>Easy</td></tr>
                    <tr><td>SSL/HTTPS</td><td>Enabled by default</td><td>Done ✓</td></tr>
                </tbody>
            </table>

            <h2>Step 1: Add a Cookie Consent Solution</h2>
            <p>
                Since Webflow has no built-in cookie banner, you need a third-party <a href="/blog/consent-management-platform-comparison">consent management platform</a>.
                Here are the best options for Webflow:
            </p>
            <table>
                <thead>
                    <tr><th>CMP</th><th>Free Tier</th><th>Webflow Integration</th><th>IAB TCF 2.2</th></tr>
                </thead>
                <tbody>
                    <tr><td>CookieYes</td><td>Yes (100 pages)</td><td>Code injection</td><td>Yes</td></tr>
                    <tr><td>Cookiebot</td><td>Yes (1 domain, 50 pages)</td><td>Code injection + auto-scan</td><td>Yes</td></tr>
                    <tr><td>Iubenda</td><td>Yes (limited)</td><td>Code injection</td><td>Yes</td></tr>
                    <tr><td>Osano</td><td>Yes</td><td>Code injection</td><td>No</td></tr>
                    <tr><td>Finsweet Cookie Consent</td><td>Yes (free)</td><td>Native Webflow component</td><td>No</td></tr>
                </tbody>
            </table>
            <p>Integration steps:</p>
            <ul>
                <li>Sign up for your chosen CMP and configure consent categories</li>
                <li>Copy the CMP script tag</li>
                <li>In Webflow: <strong>Project Settings → Custom Code → Head Code</strong></li>
                <li>Paste the script in the Head section</li>
                <li>Configure the CMP to block non-essential scripts until consent</li>
                <li>Test that cookies are not set before consent</li>
            </ul>

            <h2>Step 2: Configure EU Hosting</h2>
            <p>
                Webflow hosts sites on AWS infrastructure. To minimize cross-border transfer concerns:
            </p>
            <ul>
                <li>Check your project&apos;s hosting region in <strong>Project Settings → Hosting</strong></li>
                <li>If available, select EU-based hosting (AWS Frankfurt or Ireland)</li>
                <li>Even with EU hosting, Webflow as a US company still requires data transfer documentation</li>
                <li>Document this in your privacy policy and consider a <a href="/blog/transfer-impact-assessment-template">Transfer Impact Assessment</a></li>
            </ul>

            <h2>Step 3: Create a Privacy Policy</h2>
            <p>Create a dedicated privacy policy page. Include Webflow-specific disclosures:</p>
            <ul>
                <li>Webflow as your website hosting provider (data processor)</li>
                <li>Webflow&apos;s form submission data storage</li>
                <li>Webflow Analytics (if enabled)</li>
                <li>Any CMS-stored personal data</li>
                <li>All third-party integrations and their data practices</li>
                <li>Cross-border data transfers to Webflow&apos;s US infrastructure</li>
            </ul>
            <p>See our full <a href="/blog/gdpr-privacy-policy-template">GDPR privacy policy template</a> for all required sections.</p>

            <h2>Step 4: Manage Third-Party Scripts</h2>
            <p>
                Webflow makes it easy to add custom code, which means third-party scripts often fly under the radar.
                Audit all scripts and conditionally load them after consent:
            </p>
            <ul>
                <li><strong>Google Analytics / GA4:</strong> Load only after analytics consent. Use your CMP&apos;s script blocking feature.</li>
                <li><strong>Meta Pixel:</strong> Load only after marketing consent.</li>
                <li><strong>Google Fonts:</strong> Webflow loads Google Fonts from Google&apos;s servers by default. Consider self-hosting to avoid data transfers.</li>
                <li><strong>YouTube/Vimeo embeds:</strong> Use privacy-enhanced modes or lazy-load after consent.</li>
                <li><strong>Hotjar/FullStory:</strong> Requires analytics consent.</li>
            </ul>

            <h2>Step 5: Handle Form Data</h2>
            <p>Webflow forms collect data and store it in your Webflow dashboard. For GDPR compliance:</p>
            <ul>
                <li>Add a required consent checkbox to every form</li>
                <li>Link to your privacy policy from the form</li>
                <li>Be specific about what the data will be used for</li>
                <li>Implement double opt-in for newsletter signups (via Mailchimp, Sendinblue, etc.)</li>
                <li>Set up a process to handle <a href="/blog/gdpr-data-subject-rights-guide">data deletion requests</a></li>
                <li>Regularly purge old form submissions you no longer need</li>
            </ul>

            <h2>Step 6: Sign the DPA</h2>
            <p>
                Webflow offers a Data Processing Addendum (DPA). Since Webflow acts as your data processor:
            </p>
            <ul>
                <li>Access the DPA through Webflow&apos;s legal page or contact support</li>
                <li>The DPA covers Webflow&apos;s processing of personal data on your behalf</li>
                <li>Keep a signed copy for your records</li>
                <li>Also sign DPAs with any third-party tools connected to your Webflow site</li>
            </ul>

            <h2>Webflow-Specific Privacy Pitfalls</h2>
            <ul>
                <li><strong>Google Fonts transfer:</strong> A German court fined a website operator €100 for loading Google Fonts dynamically. Self-host fonts to be safe.</li>
                <li><strong>Webflow Analytics vs. Google Analytics:</strong> Webflow&apos;s built-in analytics are less invasive than GA4 but still require consent notification.</li>
                <li><strong>Webflow CMS and personal data:</strong> If your CMS collections store personal data (customer testimonials with names, team pages with bios), treat this data under GDPR.</li>
                <li><strong>Form notification emails:</strong> Form submissions sent to your email are a separate data processing activity — document it.</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                After implementing these changes, verify your Webflow site is compliant. <a href="/">PrivacyChecker</a> scans
                your Webflow website for GDPR issues including <a href="/blog/do-you-need-a-cookie-banner">cookie consent</a>, privacy policy completeness,
                <a href="/blog/website-security-headers-guide">security headers</a>, and third-party trackers.
                Run a free scan to check your status.
            </p>
        </ArticleLayout>
    );
}
