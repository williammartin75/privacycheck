import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'google-analytics-4-gdpr-legal')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Google Analytics 4 (GA4) is <strong>conditionally legal</strong> in most EU countries as of 2026,
                but only if you obtain valid opt-in consent before loading the tracking script and use IP anonymization.
                Several DPAs initially ruled Google Analytics (Universal Analytics) illegal, but the EU-US Data Privacy
                Framework adopted in July 2023 has largely resolved the data transfer issue for GA4 — though consent for
                cookies remains strictly required.
            </p>

            <h2>What Happened: The Google Analytics GDPR Timeline</h2>
            <table>
                <thead>
                    <tr><th>Date</th><th>Event</th><th>Impact</th></tr>
                </thead>
                <tbody>
                    <tr><td>July 2020</td><td>Schrems II ruling invalidates Privacy Shield</td><td>All US data transfers questioned</td></tr>
                    <tr><td>Jan 2022</td><td>Austrian DPA rules Google Analytics illegal</td><td>First EU DPA to ban GA</td></tr>
                    <tr><td>Feb 2022</td><td>French CNIL rules Google Analytics illegal</td><td>Gave sites 1 month to comply</td></tr>
                    <tr><td>Jun 2022</td><td>Italian Garante rules Google Analytics illegal</td><td>90-day compliance deadline</td></tr>
                    <tr><td>Jul 2023</td><td>EU-US Data Privacy Framework adopted</td><td>Provides legal basis for US data transfers</td></tr>
                    <tr><td>Jul 2023</td><td>Google sunsets Universal Analytics → GA4</td><td>GA4 has improved privacy controls</td></tr>
                    <tr><td>2024-2025</td><td>DPAs update guidance recognizing DPF</td><td>GA4 with consent is generally accepted</td></tr>
                    <tr><td>2026</td><td>EU Commission proposes one-click cookie reject</td><td>Consent enforcement intensifies</td></tr>
                </tbody>
            </table>

            <h2>Is Google Analytics 4 Legal in the EU Right Now?</h2>
            <p>
                <strong>Yes, but with conditions.</strong> The EU-US Data Privacy Framework provides a legal mechanism for
                transferring data to certified US companies, including Google. However, two critical requirements remain:
            </p>
            <ol>
                <li><strong>You must obtain consent before loading GA4.</strong> GA4 sets cookies (<code>_ga</code>, <code>_gid</code>)
                    that are classified as non-essential under the ePrivacy Directive. Loading GA4 before the user clicks &quot;Accept&quot;
                    is a violation regardless of the data transfer question.</li>
                <li><strong>You must disclose GA4 in your privacy policy and cookie notice.</strong> Users must know what
                    data is collected, where it goes, and how long it&apos;s retained.</li>
            </ol>

            <h2>Google Analytics GDPR Status by Country</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>DPA</th><th>Status (2026)</th><th>Notes</th></tr>
                </thead>
                <tbody>
                    <tr><td>France</td><td>CNIL</td><td>Legal with consent + DPF</td><td>CNIL provides detailed GA4 guidance</td></tr>
                    <tr><td>Austria</td><td>DSB</td><td>Legal with consent + DPF</td><td>Original ban was pre-DPF</td></tr>
                    <tr><td>Italy</td><td>Garante</td><td>Legal with consent + DPF</td><td>Requires IP anonymization</td></tr>
                    <tr><td>Germany</td><td>State DPAs</td><td>Legal with consent + DPF</td><td>Some DPAs still recommend alternatives</td></tr>
                    <tr><td>Netherlands</td><td>AP</td><td>Legal with consent + DPF</td><td>Strict enforcement on consent timing</td></tr>
                    <tr><td>Denmark</td><td>Datatilsynet</td><td>Legal with consent + DPF</td><td>Previously issued correction orders</td></tr>
                    <tr><td>Norway</td><td>Datatilsynet</td><td>Legal with consent + DPF</td><td>Follows EU guidance</td></tr>
                    <tr><td>Sweden</td><td>IMY</td><td>Legal with consent + DPF</td><td>Fined companies for GA without consent</td></tr>
                    <tr><td>Finland</td><td>Ombudsman</td><td>Legal with consent + DPF</td><td>Emphasizes transparency</td></tr>
                </tbody>
            </table>

            <h2>How to Use GA4 Compliantly in 2026</h2>
            <ol>
                <li><strong>Get consent first:</strong> Configure your <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> to
                    block GA4 until the user accepts analytics cookies</li>
                <li><strong>Enable IP anonymization:</strong> GA4 includes this by default, but verify it&apos;s active in your configuration</li>
                <li><strong>Set up <a href="/blog/google-consent-mode-v2-setup">Google Consent Mode V2</a>:</strong> This sends
                    cookieless pings when users decline consent, preserving aggregate data without violating GDPR</li>
                <li><strong>Configure data retention:</strong> Set the shortest retention period (2 months) in GA4 settings</li>
                <li><strong>Disable data sharing:</strong> Turn off &quot;Google signals&quot; and advertising features unless needed</li>
                <li><strong>Sign a DPA:</strong> Accept Google&apos;s Data Processing Amendment in your GA4 admin settings</li>
                <li><strong>Update your privacy policy:</strong> Disclose GA4 usage, cookie names, data exported to US, and retention periods</li>
            </ol>

            <h2>What If the EU-US Data Privacy Framework Fails?</h2>
            <p>
                Privacy activist Max Schrems has challenged the DPF through NOYB.eu. If the Court of Justice
                rules against it (a &quot;Schrems III&quot; scenario), websites would need to either:
            </p>
            <ul>
                <li>Stop using GA4 entirely</li>
                <li>Switch to a <a href="/blog/cookie-free-analytics-alternatives">privacy-first analytics alternative</a> that processes data within the EU</li>
                <li>Implement Standard Contractual Clauses with supplementary measures</li>
            </ul>

            <h2>Privacy-Friendly Alternatives to Google Analytics</h2>
            <table>
                <thead>
                    <tr><th>Tool</th><th>Cookie-Free?</th><th>EU Data Storage?</th><th>Consent Required?</th><th>Pricing</th></tr>
                </thead>
                <tbody>
                    <tr><td>Plausible</td><td>Yes</td><td>Yes (EU-only)</td><td>No</td><td>From €9/mo</td></tr>
                    <tr><td>Fathom</td><td>Yes</td><td>Yes (EU option)</td><td>No</td><td>From $14/mo</td></tr>
                    <tr><td>Umami</td><td>Yes</td><td>Self-hosted</td><td>No</td><td>Free (open-source)</td></tr>
                    <tr><td>Matomo</td><td>Configurable</td><td>Self-hosted or EU cloud</td><td>Depends on config</td><td>Free self-hosted / from €19/mo cloud</td></tr>
                    <tr><td>Simple Analytics</td><td>Yes</td><td>Yes (EU-only)</td><td>No</td><td>From €9/mo</td></tr>
                </tbody>
            </table>
            <p>
                For a detailed comparison, see our <a href="/blog/cookie-free-analytics-alternatives">Cookie-Free Analytics guide</a>.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Is Google Analytics banned in Europe?</h3>
            <p>
                No, not anymore. Google Analytics was effectively banned by several DPAs in 2022 due to the lack of a legal
                framework for EU-US data transfers. Since the adoption of the EU-US Data Privacy Framework in July 2023,
                GA4 can be used legally — <strong>but only with proper cookie consent</strong>. The consent requirement is
                separate from the data transfer question and remains strictly enforced.
            </p>

            <h3>Do I need consent for GA4 if I enable IP anonymization?</h3>
            <p>
                Yes. IP anonymization addresses data protection concerns about identifiable data, but it does <strong>not</strong> remove
                the need for cookie consent. GA4 sets cookies (<code>_ga</code>, <code>_gid</code>) on the user&apos;s device, which
                requires opt-in consent under the ePrivacy Directive regardless of what happens to the IP address.
            </p>

            <h3>Can I use Google Analytics without a cookie banner?</h3>
            <p>
                No — not if EU visitors can access your website. The only way to track EU visitors without consent is to use
                a <a href="/blog/cookie-free-analytics-alternatives">cookieless analytics tool</a> that doesn&apos;t set cookies and processes data
                exclusively in the EU.
            </p>

            <h3>How do I check if GA4 loads before consent on my site?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. It detects whether tracking scripts (including GA4)
                fire before the user interacts with the consent banner. You can also check manually by opening your site
                in an incognito window and inspecting cookies before clicking anything.
            </p>
        </ArticleLayout>
    );
}
