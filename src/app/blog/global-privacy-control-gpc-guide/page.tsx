import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'global-privacy-control-gpc-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Global Privacy Control (GPC) is a browser-level signal that tells websites a user does not want their personal information
                sold or shared. Multiple US state laws now legally require honoring it, and the EU is watching closely.
                If you&apos;re not detecting and respecting GPC, you may already be violating the law.
            </p>

            <h2>What Is Global Privacy Control?</h2>
            <p>
                GPC is a technical specification (developed by the GPC consortium) that adds a single signal to web requests.
                When enabled, the browser sends <code>Sec-GPC: 1</code> in HTTP headers and sets <code>navigator.globalPrivacyControl = true</code> in JavaScript.
            </p>
            <p>
                It&apos;s the successor to the failed &quot;Do Not Track&quot; (DNT) header. Unlike DNT, GPC has legal backing — multiple US state laws
                explicitly require businesses to treat it as a valid opt-out request.
            </p>

            <h2>Which Laws Require Honoring GPC?</h2>
            <table>
                <thead>
                    <tr><th>Jurisdiction</th><th>Law</th><th>GPC Requirement</th><th>Effective</th></tr>
                </thead>
                <tbody>
                    <tr><td>California</td><td>CCPA/CPRA</td><td>Must honor as opt-out of sale/sharing</td><td>Jan 2023</td></tr>
                    <tr><td>Colorado</td><td>CPA</td><td>Must honor as universal opt-out</td><td>Jul 2024</td></tr>
                    <tr><td>Connecticut</td><td>CTDPA</td><td>Must honor as opt-out signal</td><td>Jan 2025</td></tr>
                    <tr><td>Texas</td><td>TDPSA</td><td>Must honor universal opt-out mechanisms</td><td>Jul 2024</td></tr>
                    <tr><td>Montana</td><td>MCDPA</td><td>Must honor opt-out preference signals</td><td>Oct 2024</td></tr>
                    <tr><td>Oregon</td><td>OCPA</td><td>Must honor opt-out preference signals</td><td>Jul 2024</td></tr>
                    <tr><td>Delaware</td><td>DPDPA</td><td>Must honor universal opt-out</td><td>Jan 2025</td></tr>
                    <tr><td>New Jersey</td><td>NJDPA</td><td>Must honor opt-out signals</td><td>Jan 2025</td></tr>
                    <tr><td>EU/EEA</td><td>GDPR/ePrivacy</td><td>Not required yet, but being evaluated</td><td>TBD</td></tr>
                </tbody>
            </table>

            <h2>Who Needs to Implement GPC?</h2>
            <p>
                Any business that falls under the above state laws and engages in:
            </p>
            <ul>
                <li>Selling personal information (including ad-supported business models)</li>
                <li>Sharing personal information for cross-context behavioral advertising</li>
                <li>Targeted advertising based on user behavior across sites</li>
                <li>Profiling consumers for decisions with legal or significant effects</li>
            </ul>
            <p>
                <strong>If you run Google Analytics, Meta Pixel, LinkedIn Insight Tag, or any advertising tracker,
                    you likely need to honor GPC.</strong>
            </p>

            <h2>How to Detect the GPC Signal</h2>
            <p>GPC is transmitted via two channels:</p>

            <h2>JavaScript Detection</h2>
            <p>Check the GPC signal in the browser:</p>
            <ul>
                <li><code>navigator.globalPrivacyControl</code> — returns <code>true</code> if GPC is enabled, <code>false</code> or <code>undefined</code> otherwise</li>
            </ul>
            <p>Example implementation pattern:</p>
            <ul>
                <li>Check <code>navigator.globalPrivacyControl === true</code> before loading any tracking scripts</li>
                <li>If GPC is enabled, suppress advertising and cross-site tracking cookies</li>
                <li>Still allow essential cookies and first-party analytics if not sharing data</li>
            </ul>

            <h2>HTTP Header Detection</h2>
            <p>
                The browser sends the header <code>Sec-GPC: 1</code> with every request. Your server can check this header
                to suppress tracking before any JavaScript executes.
            </p>
            <ul>
                <li>Check for the <code>Sec-GPC</code> header in your middleware or server-side code</li>
                <li>If present and set to <code>1</code>, treat as an opt-out of sale/sharing</li>
                <li>This is the most reliable method — works even if JavaScript is blocked</li>
            </ul>

            <h2>What to Do When GPC Is Detected</h2>
            <ul>
                <li><strong>Do not</strong> load advertising trackers (Meta Pixel, Google Ads, LinkedIn Insight Tag)</li>
                <li><strong>Do not</strong> share data with third parties for behavioral advertising</li>
                <li><strong>Do not</strong> set cross-site tracking cookies</li>
                <li><strong>Do</strong> allow essential cookies (session, cart, security)</li>
                <li><strong>Do</strong> allow first-party analytics (if not sharing data with third parties)</li>
                <li><strong>Do</strong> suppress the &quot;sale/sharing&quot; category in your <a href="/blog/consent-management-platform-comparison">CMP</a></li>
                <li><strong>Do</strong> log the GPC signal for compliance records</li>
            </ul>

            <h2>Which Browsers Support GPC?</h2>
            <table>
                <thead>
                    <tr><th>Browser</th><th>GPC Support</th><th>Default Setting</th></tr>
                </thead>
                <tbody>
                    <tr><td>Firefox</td><td>Yes (built-in)</td><td>Off (user enables in settings)</td></tr>
                    <tr><td>Brave</td><td>Yes (built-in)</td><td>On by default</td></tr>
                    <tr><td>DuckDuckGo</td><td>Yes (built-in)</td><td>On by default</td></tr>
                    <tr><td>Chrome</td><td>Via extensions</td><td>Not built-in</td></tr>
                    <tr><td>Safari</td><td>No native support</td><td>N/A</td></tr>
                    <tr><td>Edge</td><td>Via extensions</td><td>Not built-in</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Brave sends GPC with every request by default</strong>, meaning a significant portion of privacy-conscious users
                are already transmitting the signal. As more states mandate GPC, browser adoption will increase.
            </p>

            <h2>GPC vs. &quot;Do Not Track&quot; (DNT)</h2>
            <table>
                <thead>
                    <tr><th>Feature</th><th>Do Not Track (DNT)</th><th>Global Privacy Control (GPC)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Legal backing</td><td>None (voluntary)</td><td>Required by 8+ US state laws</td></tr>
                    <tr><td>Industry adoption</td><td>Widely ignored</td><td>Growing rapidly</td></tr>
                    <tr><td>Specificity</td><td>Vague (&quot;do not track me&quot;)</td><td>Specific (&quot;do not sell/share&quot;)</td></tr>
                    <tr><td>Enforcement</td><td>None</td><td>FTC + state AGs actively enforcing</td></tr>
                    <tr><td>Status</td><td>Deprecated by W3C</td><td>Active specification</td></tr>
                </tbody>
            </table>

            <h2>Common Mistakes</h2>
            <ul>
                <li><strong>Ignoring it:</strong> Some businesses assume GPC isn&apos;t enforced. Sephora was fined $1.2 million by the California AG partly for not honoring GPC.</li>
                <li><strong>Overriding with cookie banner:</strong> If a user accepts cookies via your banner but has GPC enabled, GPC takes precedence for sale/sharing in California.</li>
                <li><strong>Treating it as &quot;opt-out of everything&quot;:</strong> GPC specifically relates to sale/sharing, not all processing. First-party analytics may continue.</li>
                <li><strong>Not logging it:</strong> Record when GPC is detected and how you responded for compliance documentation.</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Check whether your website detects and respects GPC. <a href="/">PrivacyChecker</a> tests your
                site&apos;s response to the GPC signal and identifies <a href="/blog/third-party-scripts-supply-chain-security">third-party scripts</a> that may be
                sharing data in violation of user preferences. Run a free scan to see your current status.
            </p>
        </ArticleLayout>
    );
}
