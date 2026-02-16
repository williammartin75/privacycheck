import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'website-privacy-checklist-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Use this 30-point checklist to verify your website&apos;s privacy compliance
                in 2026. It covers GDPR, ePrivacy, cookies, consent banners, security headers, third-party scripts,
                and the latest EU AI Act requirements. Run a free scan with <a href="/">PrivacyChecker</a> to
                automate most of these checks.
            </p>

            <h2>Cookie &amp; Consent Compliance</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Check</th><th>Why It Matters</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Cookie consent banner is present</td><td>Required under ePrivacy Directive for EU visitors</td><td></td></tr>
                    <tr><td>2</td><td>No cookies are set before consent</td><td>Pre-consent cookies violate GDPR — <a href="/blog/biggest-gdpr-fines-2025-2026">fines up to €20M</a></td><td></td></tr>
                    <tr><td>3</td><td>Banner has a clear &quot;Reject All&quot; button</td><td>Required by CNIL, EDPB, and most EU DPAs</td><td></td></tr>
                    <tr><td>4</td><td>Reject is as easy as Accept (no dark patterns)</td><td><a href="/blog/dark-patterns-detection">Dark patterns</a> are explicitly illegal under DSA</td><td></td></tr>
                    <tr><td>5</td><td>Cookies are categorized (essential, analytics, marketing)</td><td>Users must be able to accept specific categories</td><td></td></tr>
                    <tr><td>6</td><td>Consent Mode V2 is implemented</td><td>Required for Google Ads in EEA since March 2024 — <a href="/blog/google-consent-mode-v2-setup">setup guide</a></td><td></td></tr>
                    <tr><td>7</td><td>Cookie policy lists all cookies with purposes and durations</td><td>Transparency requirement under GDPR Art. 13</td><td></td></tr>
                </tbody>
            </table>

            <h2>Privacy Policy</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Check</th><th>Why It Matters</th></tr>
                </thead>
                <tbody>
                    <tr><td>8</td><td>Privacy policy is accessible from every page</td><td>GDPR Art. 12 requires easy access</td></tr>
                    <tr><td>9</td><td>Policy lists all data processing purposes</td><td>GDPR Art. 13(1)(c)</td></tr>
                    <tr><td>10</td><td>Legal basis stated for each processing activity</td><td>GDPR Art. 13(1)(c)</td></tr>
                    <tr><td>11</td><td>Third-party processors are disclosed</td><td>GDPR Art. 13(1)(e-f)</td></tr>
                    <tr><td>12</td><td>Data retention periods are specified</td><td>GDPR Art. 13(2)(a)</td></tr>
                    <tr><td>13</td><td>Data subject rights are listed (access, erasure, portability)</td><td>GDPR Art. 13(2)(b-d)</td></tr>
                    <tr><td>14</td><td>Contact information for DPO or privacy contact</td><td>GDPR Art. 13(1)(a-b)</td></tr>
                    <tr><td>15</td><td>Cross-border transfers are disclosed with safeguards</td><td>GDPR Art. 13(1)(f), Chapter V</td></tr>
                </tbody>
            </table>

            <h2>Security</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Check</th><th>Why It Matters</th></tr>
                </thead>
                <tbody>
                    <tr><td>16</td><td>HTTPS enabled with valid SSL certificate</td><td>Basic requirement — insecure sites get browser warnings</td></tr>
                    <tr><td>17</td><td><a href="/blog/website-security-headers-guide">Security headers</a> configured (CSP, X-Frame-Options, HSTS)</td><td>Prevents XSS, clickjacking, and data injection</td></tr>
                    <tr><td>18</td><td><a href="/blog/spf-dkim-dmarc-email-deliverability">SPF, DKIM &amp; DMARC</a> configured for email</td><td>Prevents email spoofing and phishing</td></tr>
                    <tr><td>19</td><td>Domain not on any blacklists</td><td>Blacklisted domains trigger spam filters and lose trust</td></tr>
                    <tr><td>20</td><td>SSL certificate is not expiring soon</td><td>Expired certs cause trust warnings and service disruptions</td></tr>
                </tbody>
            </table>

            <h2>Third-Party Scripts &amp; Trackers</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Check</th><th>Why It Matters</th></tr>
                </thead>
                <tbody>
                    <tr><td>21</td><td>All <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a> are inventoried</td><td>Hidden trackers are a major GDPR compliance risk</td></tr>
                    <tr><td>22</td><td>Analytics scripts load only after consent</td><td>GA4, Meta Pixel must wait for opt-in</td></tr>
                    <tr><td>23</td><td><a href="/blog/google-analytics-4-gdpr-legal">Google Analytics</a> configured with IP anonymization</td><td>Required by most EU DPAs</td></tr>
                    <tr><td>24</td><td>No unknown or suspicious external connections</td><td>Malicious scripts can exfiltrate user data</td></tr>
                    <tr><td>25</td><td>External scripts use SRI (Subresource Integrity)</td><td>Prevents supply chain attacks via tampered CDN files</td></tr>
                </tbody>
            </table>

            <h2>AI &amp; Emerging Requirements</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Check</th><th>Why It Matters</th></tr>
                </thead>
                <tbody>
                    <tr><td>26</td><td>AI usage disclosed in privacy policy</td><td>EU AI Act transparency obligation (effective Aug 2025)</td></tr>
                    <tr><td>27</td><td>AI-generated content is labelled</td><td>Required under EU AI Act Art. 50</td></tr>
                    <tr><td>28</td><td><a href="/blog/eaa-2025-accessibility-requirements">Accessibility</a> meets WCAG 2.1 AA</td><td>European Accessibility Act applies from June 2025</td></tr>
                    <tr><td>29</td><td><a href="/blog/core-web-vitals-privacy-impact">Core Web Vitals</a> pass (LCP, FID, CLS)</td><td>Google ranking factor + third-party scripts impact</td></tr>
                    <tr><td>30</td><td>Automated compliance monitoring is active</td><td><a href="/blog/compliance-monitoring-drift-detection">Compliance drifts</a> — a one-time audit is not enough</td></tr>
                </tbody>
            </table>

            <h2>How to Use This Checklist</h2>
            <ol>
                <li><strong>Scan first:</strong> Run a free <a href="/">PrivacyChecker</a> scan to automatically check items 1-25</li>
                <li><strong>Fix critical issues:</strong> No-consent cookies and missing privacy policies are the highest-risk violations</li>
                <li><strong>Document compliance:</strong> Keep evidence of your checks for accountability (GDPR Art. 5(2))</li>
                <li><strong>Re-scan monthly:</strong> Websites change — new plugins, scripts, and updates can introduce new compliance gaps</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>How often should I check my website&apos;s privacy compliance?</h3>
            <p>
                At minimum, <strong>monthly</strong>. Every time you add a new plugin, script, or third-party integration,
                your compliance posture changes. Automated monitoring tools like <a href="/">PrivacyChecker</a> can
                alert you to new issues as they appear.
            </p>

            <h3>What&apos;s the fastest way to check all 30 items?</h3>
            <p>
                A <a href="/">PrivacyChecker</a> scan automatically verifies most technical checks (cookies, headers,
                scripts, SSL) in under 60 seconds. The remaining items (privacy policy content, AI disclosure) require
                manual review against the checklist above.
            </p>

            <h3>My website passed all checks. Am I fully GDPR compliant?</h3>
            <p>
                This checklist covers <strong>website-side</strong> compliance. Full GDPR compliance also includes
                organizational measures: staff training, data processing records, DPAs with vendors, DSAR procedures,
                and breach response plans.
            </p>
        </ArticleLayout>
    );
}
