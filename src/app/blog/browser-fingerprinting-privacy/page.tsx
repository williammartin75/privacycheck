import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'browser-fingerprinting-privacy')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Browser fingerprinting collects device characteristics (screen size, fonts,
                WebGL renderer, timezone, etc.) to create a unique identifier — without using cookies. Under GDPR,
                fingerprinting is considered <strong>personal data processing</strong> and requires explicit consent,
                just like cookies. Most website owners don&apos;t realize they&apos;re doing it through third-party scripts.
            </p>

            <h2>What Is Browser Fingerprinting?</h2>
            <p>
                Browser fingerprinting is a tracking technique that identifies users by collecting a combination of
                device and browser attributes. Unlike cookies (which store data on the user&apos;s device), fingerprinting
                works entirely server-side, making it <strong>invisible to users</strong> and impossible to delete.
            </p>
            <p>
                A single attribute (like screen resolution) isn&apos;t unique. But when you combine 20+ attributes,
                the resulting fingerprint is unique for <strong>over 95% of browsers</strong>, according to research by
                the Electronic Frontier Foundation (EFF).
            </p>

            <h2>What Data Does Fingerprinting Collect?</h2>
            <table>
                <thead>
                    <tr><th>Category</th><th>Data Points</th><th>Uniqueness</th></tr>
                </thead>
                <tbody>
                    <tr><td>Browser</td><td>User-Agent string, installed plugins, Do Not Track setting, language preferences</td><td>Medium</td></tr>
                    <tr><td>Screen</td><td>Resolution, color depth, device pixel ratio, viewport size</td><td>Medium</td></tr>
                    <tr><td>Graphics</td><td>WebGL renderer, GPU vendor, canvas fingerprint (drawing a hidden image)</td><td>High</td></tr>
                    <tr><td>Audio</td><td>AudioContext fingerprint (processing audio signals)</td><td>High</td></tr>
                    <tr><td>System</td><td>Timezone, installed fonts, OS version, CPU cores, available memory</td><td>High</td></tr>
                    <tr><td>Network</td><td>IP address, connection type, WebRTC local IPs</td><td>Very High</td></tr>
                    <tr><td>Behavior</td><td>Typing patterns, mouse movements, touch gestures, scroll behavior</td><td>Very High</td></tr>
                </tbody>
            </table>

            <h2>Canvas Fingerprinting: The Most Common Technique</h2>
            <p>
                Canvas fingerprinting works by instructing the browser to draw a hidden image using the HTML5 Canvas API.
                Because different devices render the same drawing instructions slightly differently (due to GPU, drivers,
                font rendering, and anti-aliasing), the resulting pixel data creates a <strong>unique hash</strong>.
            </p>
            <p>
                This technique is used by many popular third-party scripts — often without the website
                owner&apos;s knowledge. Our <a href="/blog/third-party-scripts-supply-chain-security">supply chain audit</a> can
                help you identify which scripts on your site use canvas fingerprinting.
            </p>

            <h2>Who Uses Fingerprinting?</h2>
            <ul>
                <li><strong>Ad networks:</strong> To track users across sites without cookies (especially after cookie consent rejections)</li>
                <li><strong>Fraud prevention:</strong> Banks and payment processors use fingerprinting to detect bot attacks and account takeovers</li>
                <li><strong>Analytics platforms:</strong> Some &quot;cookie-free&quot; analytics tools use fingerprinting as a substitute</li>
                <li><strong>CAPTCHAs:</strong> Services like reCAPTCHA collect fingerprint data to distinguish humans from bots</li>
                <li><strong>DRM systems:</strong> Streaming services use fingerprinting to enforce device limits</li>
            </ul>

            <h2>Is Browser Fingerprinting Legal Under GDPR?</h2>
            <p>
                <strong>Yes, but only with consent.</strong> The legal framework is clear:
            </p>
            <ul>
                <li>
                    <strong>ePrivacy Directive (Article 5.3):</strong> Any access to information stored on a user&apos;s device
                    (which fingerprinting does via JavaScript APIs like Canvas, WebGL, AudioContext) requires prior consent,
                    unless strictly necessary for the service
                </li>
                <li>
                    <strong>GDPR (Article 4):</strong> A browser fingerprint that can single out an individual is
                    <strong>personal data</strong>, even without a name or email. Recital 30 explicitly mentions
                    &quot;online identifiers such as device fingerprints&quot;
                </li>
                <li>
                    <strong>GDPR (Article 6):</strong> Processing requires a legal basis — for fingerprinting used in
                    tracking/advertising, the only viable legal basis is <strong>explicit consent</strong>
                </li>
            </ul>

            <h3>What Regulators Have Said</h3>
            <ul>
                <li><strong>CNIL (France, 2020):</strong> Fined a company for using canvas fingerprinting without consent, calling it &quot;equivalent to a cookie&quot;</li>
                <li><strong>ICO (UK):</strong> States that fingerprinting falls under PECR and requires consent, just like cookies</li>
                <li><strong>EDPB (2024 Guidelines):</strong> Confirmed that browser fingerprinting is covered by both the ePrivacy Directive and GDPR</li>
                <li><strong>Belgian DPA:</strong> Has explicitly listed device fingerprinting as a technology requiring prior consent under cookie regulations</li>
            </ul>

            <h2>Fingerprinting vs Cookies: Why Fingerprinting Is Worse for Privacy</h2>
            <table>
                <thead>
                    <tr><th>Feature</th><th>Cookies</th><th>Browser Fingerprinting</th></tr>
                </thead>
                <tbody>
                    <tr><td>Visibility to user</td><td>Visible in browser settings</td><td>Invisible — no user-facing control</td></tr>
                    <tr><td>User can delete</td><td>Yes</td><td>No — cannot be cleared</td></tr>
                    <tr><td>Blocked by browser</td><td>Yes (incognito, settings)</td><td>Partially (only advanced browsers resist)</td></tr>
                    <tr><td>Survives cookie clearing</td><td>No</td><td>Yes — persists across sessions</td></tr>
                    <tr><td>Cross-device</td><td>No (device-specific)</td><td>No (device-specific but more persistent)</td></tr>
                    <tr><td>Legal status (GDPR)</td><td>Regulated — consent required</td><td>Regulated — consent required</td></tr>
                    <tr><td>Detection difficulty</td><td>Easy to audit</td><td>Requires JavaScript analysis</td></tr>
                </tbody>
            </table>

            <h2>How PrivacyChecker Detects Fingerprinting</h2>
            <p>
                PrivacyChecker&apos;s scanner analyzes the JavaScript loaded on your pages and detects common fingerprinting techniques:
            </p>
            <ul>
                <li><strong>Canvas fingerprinting:</strong> Detects calls to <code>toDataURL()</code>, <code>getImageData()</code>, and hidden canvas elements</li>
                <li><strong>WebGL fingerprinting:</strong> Identifies WebGL renderer and vendor queries via <code>getParameter()</code></li>
                <li><strong>AudioContext fingerprinting:</strong> Detects <code>AudioContext</code> and <code>OfflineAudioContext</code> abuse patterns</li>
                <li><strong>Font enumeration:</strong> Identifies scripts that probe for installed fonts via width measurement techniques</li>
                <li><strong>Known fingerprinting libraries:</strong> Detects FingerprintJS, ClientJS, and other common libraries</li>
                <li><strong>Third-party script analysis:</strong> Cross-references third-party domains with known fingerprinting providers</li>
            </ul>

            <h2>How to Stop Fingerprinting on Your Website</h2>
            <ol>
                <li>
                    <strong>Audit your third-party scripts:</strong> Use <a href="/">PrivacyChecker</a> to scan your site.
                    Many fingerprinting scripts come embedded in analytics, ad, or fraud-detection tools you may
                    have installed unknowingly
                </li>
                <li>
                    <strong>Add fingerprinting to your consent banner:</strong> If you legitimately use fingerprinting
                    (e.g., for fraud prevention), declare it in your cookie/consent banner and require opt-in consent
                </li>
                <li>
                    <strong>Use Content Security Policy:</strong> Implement a strict <a href="/blog/website-security-headers-guide">CSP header</a> to
                    control which third-party scripts can execute on your pages
                </li>
                <li>
                    <strong>Replace fingerprinting analytics:</strong> Switch to <a href="/blog/cookie-free-analytics-alternatives">privacy-friendly analytics</a> that
                    don&apos;t rely on fingerprinting or cookies
                </li>
                <li>
                    <strong>Review vendor DPAs:</strong> If a vendor uses fingerprinting, ensure they have a
                    <a href="/blog/vendor-risk-assessment-gdpr">Data Processing Agreement</a> that covers this
                </li>
                <li>
                    <strong>Add the Permissions-Policy header:</strong> Use the <code>Permissions-Policy</code> header to
                    disable browser APIs like <code>camera</code>, <code>microphone</code>, <code>geolocation</code>,
                    and <code>interest-cohort</code> that fingerprinting scripts exploit
                </li>
            </ol>

            <h2>The Exception: Fraud Prevention</h2>
            <p>
                Fingerprinting for <strong>fraud prevention</strong> may have a legal basis under GDPR&apos;s
                &quot;legitimate interest&quot; (Article 6(1)(f)) — but only if:
            </p>
            <ul>
                <li>The processing is <strong>strictly necessary</strong> for fraud detection (not marketing)</li>
                <li>You&apos;ve conducted a <strong>Legitimate Interest Assessment (LIA)</strong></li>
                <li>You disclose it in your <strong>privacy policy</strong></li>
                <li>The data is <strong>not shared</strong> with third parties for advertising purposes</li>
                <li>You implement <strong>data minimization</strong> — only collect what&apos;s needed for fraud detection</li>
            </ul>

            <h2>Frequently Asked Questions</h2>

            <h3>Does incognito mode prevent fingerprinting?</h3>
            <p>
                <strong>No.</strong> Incognito mode only prevents cookie storage and browsing history recording.
                Your browser fingerprint remains the same in incognito mode because it&apos;s based on device
                characteristics, not stored data. Only browsers with <strong>anti-fingerprinting protections</strong> (like
                Tor, Brave, and Firefox with enhanced protection) actively resist fingerprinting.
            </p>

            <h3>Is FingerprintJS legal to use on my website?</h3>
            <p>
                FingerprintJS (and similar libraries) are legal tools, but using them for tracking or identification
                <strong>requires GDPR consent</strong>. Their &quot;Pro&quot; version is specifically designed for fraud detection
                and may qualify under legitimate interest — but you must still disclose it and conduct a LIA.
            </p>

            <h3>Does PrivacyChecker detect fingerprinting scripts?</h3>
            <p>
                <strong>Yes.</strong> <a href="/">PrivacyChecker</a> scans your website for fingerprinting techniques
                including canvas, WebGL, AudioContext, and known fingerprinting libraries. It flags them as compliance
                issues if no consent mechanism is detected.
            </p>

            <h3>Can Google Analytics fingerprint users?</h3>
            <p>
                Google Analytics 4 does not use traditional fingerprinting, but it collects enough signals (IP address,
                user agent, screen resolution, language) that some DPAs consider it <strong>equivalent to
                    profiling</strong>. Check our <a href="/blog/google-analytics-4-gdpr-legal">GA4 legality guide</a> for
                the latest status by country.
            </p>
        </ArticleLayout>
    );
}
