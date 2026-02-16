import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'find-cookies-on-your-website')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Most websites set cookies they don&apos;t know about. Third-party scripts like
                Google Analytics, Facebook Pixel, and chat widgets install tracking cookies automatically. The fastest way
                to find every cookie is to use a <a href="/">free cookie scanner</a> — it identifies, categorizes, and
                lists all cookies in under 60 seconds.
            </p>

            <h2>Why Don&apos;t I Know What Cookies My Website Uses?</h2>
            <p>
                When you add a script, plugin, or third-party service to your website, it often sets cookies without
                explicit documentation. A typical business website with Google Analytics, a chat widget, and social
                media buttons can easily have <strong>15-30 cookies</strong> — most of which the site owner never
                intentionally added.
            </p>
            <p>
                Under GDPR, you are responsible for <strong>every cookie set on your website</strong>, including those
                from third-party scripts. Not knowing what cookies exist is not a defense against a fine.
            </p>

            <h2>How to Scan Your Website for Cookies</h2>

            <h3>Method 1: Automated Cookie Scanner (Recommended)</h3>
            <p>
                The fastest and most reliable method is using an automated scanner like <a href="/">PrivacyChecker</a>:
            </p>
            <ol>
                <li>Enter your website URL at <a href="/">privacychecker.pro</a></li>
                <li>The scanner loads your page in a real browser and captures every cookie that gets set</li>
                <li>Each cookie is categorized as essential, analytics, marketing, or functional</li>
                <li>You get a full report showing cookie name, domain, expiry, purpose, and category</li>
            </ol>
            <p>This takes under 60 seconds and catches cookies that manual methods miss.</p>

            <h3>Method 2: Browser Developer Tools</h3>
            <p>For a manual check on individual pages:</p>
            <ol>
                <li>Open your website in Chrome or Firefox</li>
                <li>Press <code>F12</code> to open Developer Tools</li>
                <li>Go to the <strong>Application</strong> tab (Chrome) or <strong>Storage</strong> tab (Firefox)</li>
                <li>Click <strong>Cookies</strong> in the left sidebar</li>
                <li>You&apos;ll see all cookies with their name, value, domain, path, and expiry</li>
            </ol>
            <p>
                <strong>Limitation:</strong> This only shows cookies on the current page. Different pages may set different
                cookies (e.g., checkout pages, login pages, blog pages with embedded videos).
            </p>

            <h3>Method 3: JavaScript Console</h3>
            <p>For a quick list, open the browser console (<code>F12</code> → Console tab) and type:</p>
            <pre><code>document.cookie.split(&apos;;&apos;).forEach(c =&gt; console.log(c.trim()));</code></pre>
            <p>
                <strong>Limitation:</strong> This only shows first-party cookies. HttpOnly cookies and third-party cookies
                won&apos;t appear in this list.
            </p>

            <h2>The Most Common Cookies You&apos;ll Find</h2>
            <table>
                <thead>
                    <tr><th>Cookie</th><th>Source</th><th>Category</th><th>Consent Required?</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>_ga</code>, <code>_gid</code></td><td>Google Analytics</td><td>Analytics</td><td>Yes</td></tr>
                    <tr><td><code>_fbp</code>, <code>_fbc</code></td><td>Facebook/Meta Pixel</td><td>Marketing</td><td>Yes</td></tr>
                    <tr><td><code>_gcl_au</code></td><td>Google Ads</td><td>Marketing</td><td>Yes</td></tr>
                    <tr><td><code>NID</code>, <code>1P_JAR</code></td><td>Google (various)</td><td>Marketing</td><td>Yes</td></tr>
                    <tr><td><code>__cf_bm</code></td><td>Cloudflare</td><td>Essential (bot detection)</td><td>No</td></tr>
                    <tr><td><code>JSESSIONID</code></td><td>Your server</td><td>Essential (session)</td><td>No</td></tr>
                    <tr><td><code>_hjSessionUser</code></td><td>Hotjar</td><td>Analytics</td><td>Yes</td></tr>
                    <tr><td><code>intercom-id-*</code></td><td>Intercom chat</td><td>Functional</td><td>Yes</td></tr>
                    <tr><td><code>__stripe_mid</code></td><td>Stripe</td><td>Essential (payment)</td><td>No</td></tr>
                    <tr><td><code>hubspotutk</code></td><td>HubSpot</td><td>Marketing</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h2>What to Do After Finding Your Cookies</h2>
            <ol>
                <li><strong>Categorize each cookie</strong> as essential, analytics, marketing, or functional</li>
                <li><strong>Remove unnecessary cookies</strong> — if you don&apos;t actively use a tool, remove its script</li>
                <li><strong>Update your cookie policy</strong> — list every cookie with its purpose and duration</li>
                <li><strong>Configure your consent banner</strong> to block non-essential cookies until consent is given</li>
                <li><strong>Test that blocking works</strong> — after rejecting cookies, re-scan to verify they don&apos;t load</li>
            </ol>
            <p>
                For a complete guide on implementing a compliant banner, see our
                <a href="/blog/cookie-consent-banner-guide">Cookie Consent Banner guide</a>.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>How many cookies does a typical website have?</h3>
            <p>
                A typical business website has between <strong>10 and 40 cookies</strong>. E-commerce sites often have 30-50+ due to
                payment processors, retargeting pixels, and product recommendation engines. Simple blogs may have 5-15.
            </p>

            <h3>Can I have a website with zero cookies?</h3>
            <p>
                Yes, but it&apos;s unusual. A static HTML website with no analytics, no forms, and no third-party scripts
                can operate without any cookies. If you need analytics, <a href="/blog/cookie-free-analytics-alternatives">cookie-free
                    alternatives</a> like Plausible or Umami provide traffic data without setting any cookies.
            </p>

            <h3>Do I need to list cookies in my privacy policy?</h3>
            <p>
                Yes. Under GDPR and the ePrivacy Directive, you must declare all non-essential cookies, their purposes,
                retention period, and whether they share data with third parties. A <a href="/blog/privacy-policy-generator-vs-custom">privacy
                    policy generator</a> may help, but verify it captures all your actual cookies.
            </p>
        </ArticleLayout>
    );
}
