import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'german-cookie-law-ttdsg-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Yes, a cookie banner is mandatory in Germany if your website
                uses non-essential cookies. This applies to virtually every site running Google Analytics,
                marketing pixels, or social media embeds. Here&apos;s exactly what you need to know about
                Germany&apos;s TTDSG and GDPR cookie requirements.
            </p>

            <h2>The Legal Framework: GDPR, TTDSG, and ePrivacy</h2>
            <p>
                Cookie consent obligations in Germany arise from the interplay of three laws:
            </p>
            <table>
                <thead>
                    <tr><th>Law</th><th>What It Regulates</th><th>Cookie Relevance</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>GDPR</strong> (EU)</td><td>Processing of personal data</td><td>Legal basis for data processing, consent requirements</td></tr>
                    <tr><td><strong>TTDSG</strong> (&sect; 25)</td><td>Access to terminal equipment</td><td>Consent for cookies and similar technologies</td></tr>
                    <tr><td><strong>ePrivacy Directive</strong> (EU)</td><td>Confidentiality of electronic communications</td><td>Foundation for national cookie laws like the TTDSG</td></tr>
                </tbody>
            </table>
            <p>
                Since <strong>December 1, 2021</strong>, Germany&apos;s Telecommunications Telemedia Data Protection Act
                (TTDSG) is in force. <strong>&sect; 25 TTDSG</strong> states: Storing information on the user&apos;s
                device (= setting cookies) or accessing already stored information (= reading cookies) generally
                requires the <strong>user&apos;s consent</strong>.
            </p>

            <h2>When Is a Cookie Banner Required?</h2>
            <p>The answer depends on the type of cookies used:</p>
            <table>
                <thead>
                    <tr><th>Cookie Type</th><th>Example</th><th>Consent Required?</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>Strictly necessary</strong></td><td>Session ID, shopping cart, language setting</td><td>No</td></tr>
                    <tr><td><strong>Analytics/Statistics</strong></td><td>Google Analytics, Matomo (with cookies)</td><td>Yes</td></tr>
                    <tr><td><strong>Marketing/Tracking</strong></td><td>Facebook Pixel, Google Ads, Criteo</td><td>Yes</td></tr>
                    <tr><td><strong>Personalization</strong></td><td>A/B testing, content recommendations</td><td>Yes</td></tr>
                    <tr><td><strong>Social Media</strong></td><td>YouTube embed, Instagram feed, Like buttons</td><td>Yes</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Bottom line:</strong> If your website <em>only</em> uses strictly necessary cookies
                (which is rare), you theoretically don&apos;t need a cookie banner. But as soon as you use
                Google Analytics, social media plugins, or marketing tools, a cookie consent banner is
                <strong>legally required</strong>.
            </p>

            <h2>Mandatory Elements of a Cookie Banner</h2>
            <p>
                A legally compliant cookie banner in Germany must include:
            </p>
            <ol>
                <li><strong>Clear information:</strong> Which cookies are used and for what purpose?</li>
                <li><strong>Genuine choice:</strong> Equal buttons for &quot;Accept&quot; and &quot;Reject&quot;</li>
                <li><strong>Granular settings:</strong> Option to select individual cookie categories</li>
                <li><strong>Revocation:</strong> Ability to change or withdraw consent at any time</li>
                <li><strong>Privacy policy link:</strong> Full information as required by Art. 13 GDPR</li>
            </ol>

            <h2>Common Cookie Banner Mistakes</h2>

            <h3>Dark Patterns &mdash; Prohibited Design Tricks</h3>
            <p>
                German data protection authorities and the European Data Protection Board (EDPB) have
                issued clear guidelines against manipulative cookie banner designs:
            </p>
            <table>
                <thead>
                    <tr><th>Dark Pattern</th><th>Description</th><th>Illegal?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Color contrast</td><td>&quot;Accept&quot; in bright green, &quot;Reject&quot; in light gray</td><td>Yes</td></tr>
                    <tr><td>Hidden rejection</td><td>Reject only via &quot;Settings&quot; &rarr; sub-page</td><td>Yes</td></tr>
                    <tr><td>Cookie wall</td><td>Website only usable after clicking &quot;Accept&quot;</td><td>Yes</td></tr>
                    <tr><td>Nudging</td><td>&quot;Are you sure?&quot; dialog when rejecting</td><td>Yes</td></tr>
                    <tr><td>Pre-checked boxes</td><td>Cookie categories already enabled</td><td>Yes (since BGH Planet49 ruling)</td></tr>
                </tbody>
            </table>

            <h3>Technical Mistakes</h3>
            <ul>
                <li><strong>Cookies before consent:</strong> Tracking cookies set before the user clicks &quot;Accept&quot;</li>
                <li><strong>Banner bypass:</strong> Trackers load despite rejection</li>
                <li><strong>Missing documentation:</strong> No logging of consent records</li>
                <li><strong>Consent expiration:</strong> Consent not periodically renewed (recommendation: every 12 months)</li>
            </ul>

            <h2>Key Rulings and Enforcement</h2>
            <table>
                <thead>
                    <tr><th>Year</th><th>Authority/Court</th><th>Decision</th><th>Fine</th></tr>
                </thead>
                <tbody>
                    <tr><td>2020</td><td>BGH (Federal Court)</td><td>Planet49: Pre-checked checkboxes are not valid consent</td><td>&mdash;</td></tr>
                    <tr><td>2022</td><td>LG Munich I</td><td>Google Fonts via CDN = GDPR violation</td><td>&euro;100/view</td></tr>
                    <tr><td>2022</td><td>DSK</td><td>Guidance on telemedia: Clear cookie banner requirements</td><td>&mdash;</td></tr>
                    <tr><td>2023</td><td>Noyb</td><td>Mass complaints against cookie banners on German sites</td><td>Ongoing</td></tr>
                    <tr><td>2024</td><td>BfDI</td><td>Increased enforcement at federal agencies</td><td>Ongoing</td></tr>
                </tbody>
            </table>

            <h2>Recommended Cookie Banner Solutions</h2>
            <table>
                <thead>
                    <tr><th>Solution</th><th>Type</th><th>Google Consent Mode v2</th><th>Price</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookiebot</td><td>Cloud (SaaS)</td><td>Yes</td><td>from &euro;9/month</td></tr>
                    <tr><td>Usercentrics</td><td>Cloud (SaaS)</td><td>Yes</td><td>from &euro;49/month</td></tr>
                    <tr><td>Borlabs Cookie</td><td>WordPress Plugin</td><td>Yes</td><td>from &euro;39/year</td></tr>
                    <tr><td>Klaro!</td><td>Open Source (Self-hosted)</td><td>Manual</td><td>Free</td></tr>
                    <tr><td>CIVIC Cookie Control</td><td>Cloud/Self-hosted</td><td>Manual</td><td>from &pound;39/year</td></tr>
                </tbody>
            </table>

            <h2>Checklist: GDPR-Compliant Cookie Banner</h2>
            <ol>
                <li>Equal buttons for &quot;Accept&quot; and &quot;Reject&quot; &mdash; same size, same contrast</li>
                <li>No pre-checked checkboxes</li>
                <li>No cookies set before consent</li>
                <li>Individual cookie categories selectable</li>
                <li>Revocation option permanently accessible</li>
                <li>Link to privacy policy in the banner</li>
                <li>Consent records documented and stored</li>
                <li>Google Consent Mode v2 implemented (for Google services)</li>
                <li>Cookie banner tested regularly &mdash; especially after CMS updates</li>
                <li>Run a free <a href="/">GDPR scan with PrivacyChecker</a></li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Do I need a cookie banner if I don&apos;t set any cookies?</h3>
            <p>
                If your website truly sets <strong>no</strong> cookies and uses no similar tracking
                technologies (fingerprinting, localStorage for tracking), then no. But this is extremely
                rare in practice. Even embedded YouTube videos or social media buttons set cookies.
            </p>

            <h3>Is a simple &quot;This website uses cookies&quot; notice enough?</h3>
            <p>
                <strong>No.</strong> Since the German Federal Court&apos;s Planet49 ruling (2020), it is
                clear: A simple notice without a genuine choice is <strong>not valid consent</strong>.
                Users must be able to actively accept or reject cookies.
            </p>

            <h3>What is the difference between GDPR and TTDSG for cookies?</h3>
            <p>
                The <strong>TTDSG (&sect; 25)</strong> governs the technical access to the user&apos;s
                device (setting/reading cookies). The <strong>GDPR</strong> governs the subsequent
                processing of personal data collected via those cookies. In practice, both laws must
                be complied with simultaneously.
            </p>
        </ArticleLayout>
    );
}
