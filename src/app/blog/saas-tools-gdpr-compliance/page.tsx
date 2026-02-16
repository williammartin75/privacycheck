import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'saas-tools-gdpr-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Most popular SaaS tools — Hotjar, Mailchimp, HubSpot, Intercom, Zendesk —
                process personal data and require GDPR compliance measures. Whether they&apos;re &quot;GDPR compliant&quot; depends
                on <strong>how you configure them</strong>, not just whether the vendor claims compliance. Here&apos;s what
                you need to check for each tool.
            </p>

            <h2>Why &quot;GDPR Compliant&quot; Doesn&apos;t Mean What You Think</h2>
            <p>
                When a SaaS vendor says they&apos;re &quot;GDPR compliant,&quot; they mean <strong>their platform supports GDPR
                    compliance</strong> — not that using their tool automatically makes <em>you</em> compliant. Under GDPR,
                <strong>you</strong> are the data controller. The vendor is your data processor. You&apos;re responsible for:
            </p>
            <ul>
                <li>Having a valid <strong>Data Processing Agreement (DPA)</strong> with every vendor</li>
                <li>Getting <strong>user consent</strong> before the tool loads (if it sets cookies or tracks behavior)</li>
                <li>Disclosing the tool in your <strong>privacy policy</strong></li>
                <li>Ensuring <strong>cross-border data transfers</strong> have adequate safeguards</li>
                <li>Responding to <strong>data subject requests</strong> (access, deletion) across all vendors</li>
            </ul>

            <h2>Tool-by-Tool GDPR Compliance Guide</h2>

            <h3>Hotjar — Session Recording &amp; Heatmaps</h3>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Status</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPA available?</td><td>Yes</td><td>Sign it in Settings &gt; Account &gt; DPA</td></tr>
                    <tr><td>Data location</td><td>EU (AWS Ireland) by default</td><td>Verify in account settings</td></tr>
                    <tr><td>Cookie consent needed?</td><td>Yes — sets tracking cookies</td><td>Load Hotjar only AFTER consent</td></tr>
                    <tr><td>Records personal data?</td><td>Yes — IP, session recordings, form inputs</td><td>Enable IP anonymization, suppress sensitive fields</td></tr>
                    <tr><td>Consent Mode support?</td><td>Yes (v2 compatible)</td><td>Configure via <a href="/blog/google-consent-mode-v2-setup">Consent Mode V2</a></td></tr>
                </tbody>
            </table>
            <p>
                <strong>Key risk:</strong> Hotjar session recordings can capture <strong>personal data typed into forms</strong>
                (names, emails, passwords). You MUST enable the &quot;Suppress all text&quot; option or manually tag sensitive
                elements with <code>data-hj-suppress</code>.
            </p>

            <h3>Mailchimp — Email Marketing</h3>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Status</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPA available?</td><td>Yes (Standard Contractual Clauses included)</td><td>Accepted automatically in ToS since 2021</td></tr>
                    <tr><td>Data location</td><td>US (Intuit servers)</td><td>SCCs cover EU→US transfers under new DPF</td></tr>
                    <tr><td>Cookie consent needed?</td><td>Yes — embedded forms set cookies</td><td>Use custom forms or load after consent</td></tr>
                    <tr><td>Double opt-in?</td><td>Supported but not default</td><td>Enable double opt-in for EU lists</td></tr>
                    <tr><td>Data deletion?</td><td>Supports GDPR delete requests</td><td>Process via Mailchimp API or manually</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Key risk:</strong> Mailchimp transfers data to the <strong>US</strong>. While now covered by the
                EU-US Data Privacy Framework, some DPAs still scrutinize US transfers. Always have SCCs in place as a fallback.
                See our <a href="/blog/cross-border-data-transfers-schrems">cross-border transfers guide</a>.
            </p>

            <h3>HubSpot — CRM &amp; Marketing Automation</h3>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Status</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPA available?</td><td>Yes</td><td>Sign in Settings &gt; Account Defaults &gt; Security</td></tr>
                    <tr><td>Data location</td><td>US, EU (Germany), or Australia — you choose</td><td>Select EU datacenter for EU customers</td></tr>
                    <tr><td>Cookie consent needed?</td><td>Yes — HubSpot tracking code sets cookies</td><td>Use HubSpot&apos;s cookie banner or your CMP</td></tr>
                    <tr><td>Consent tracking?</td><td>Built-in consent management</td><td>Enable GDPR features in Settings &gt; Privacy</td></tr>
                    <tr><td>Data portability?</td><td>Full export available</td><td>Available via Settings &gt; Import/Export</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Key risk:</strong> HubSpot&apos;s tracking code loads <strong>before consent</strong> by default.
                You must configure it to respect your consent banner — either through HubSpot&apos;s built-in cookie
                policy tool or by conditionally loading the script via your
                <a href="/blog/consent-management-platform-comparison">CMP</a>.
            </p>

            <h3>Intercom — Live Chat &amp; Support</h3>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Status</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPA available?</td><td>Yes</td><td>Request via Intercom support or legal portal</td></tr>
                    <tr><td>Data location</td><td>US and EU (you can request EU hosting)</td><td>Request EU-only hosting for EU users</td></tr>
                    <tr><td>Cookie consent needed?</td><td>Yes — sets session and identity cookies</td><td>Load Intercom widget only after consent</td></tr>
                    <tr><td>AI features?</td><td>Fin AI agent processes conversation data</td><td>Disclose AI use in privacy policy per <a href="/blog/eu-ai-act-website-compliance">EU AI Act</a></td></tr>
                    <tr><td>Data deletion?</td><td>Supported via API and dashboard</td><td>Automate with DSAR workflow</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Key risk:</strong> Intercom&apos;s <strong>AI features (Fin)</strong> process user conversations, which
                may trigger EU AI Act transparency obligations. You must disclose AI-powered support in your privacy
                policy and provide a way for users to reach a human agent.
            </p>

            <h3>Zendesk — Customer Support</h3>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>Status</th><th>Action Required</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPA available?</td><td>Yes (comprehensive)</td><td>Included in Enterprise agreement; request for other tiers</td></tr>
                    <tr><td>Data location</td><td>US, EU, Australia, Japan</td><td>Enable EU data locality for EU customers</td></tr>
                    <tr><td>Cookie consent needed?</td><td>Yes — widget sets cookies</td><td>Load Web Widget conditionally</td></tr>
                    <tr><td>Sub-processors?</td><td>Published list at zendesk.com/trust</td><td>Review and monitor for changes</td></tr>
                    <tr><td>Encryption</td><td>In-transit and at-rest</td><td>Enable Advanced Encryption for sensitive data</td></tr>
                </tbody>
            </table>

            <h2>Complete GDPR Compliance Checklist for SaaS Tools</h2>
            <ol>
                <li><strong>Sign a DPA</strong> with every vendor that processes personal data</li>
                <li><strong>Don&apos;t load tracking scripts before consent</strong> — use your CMP to conditionally load them</li>
                <li><strong>List every tool in your privacy policy</strong> with purpose, data processed, and legal basis</li>
                <li><strong>Choose EU data centers</strong> when available (HubSpot, Zendesk, Intercom all offer this)</li>
                <li><strong>Enable data anonymization</strong> features (IP anonymization in Hotjar, GA4)</li>
                <li><strong>Map your data flows</strong> — know exactly where each vendor sends your users&apos; data</li>
                <li><strong>Test with <a href="/">PrivacyChecker</a></strong> — scan your site to detect which third-party scripts load, when they set cookies, and whether they fire before consent</li>
                <li><strong>Audit regularly</strong> — vendors change sub-processors and data practices. Set quarterly reviews</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Do I need consent to use Hotjar?</h3>
            <p>
                <strong>Yes.</strong> Hotjar sets tracking cookies and records user behavior, which constitutes personal data
                processing under GDPR. You must obtain consent <strong>before</strong> loading the Hotjar script.
            </p>

            <h3>Is Mailchimp legal to use in Europe?</h3>
            <p>
                <strong>Yes</strong>, provided you have SCCs or rely on the EU-US Data Privacy Framework for transfers.
                Enable double opt-in for EU subscribers, and always use Mailchimp&apos;s GDPR-compliant signup forms.
            </p>

            <h3>How do I check which SaaS tools my website loads?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. It detects all third-party scripts,
                cookies, and trackers — including tools you may have forgotten about. You might be surprised
                by how many services load on your pages.
            </p>
        </ArticleLayout>
    );
}
