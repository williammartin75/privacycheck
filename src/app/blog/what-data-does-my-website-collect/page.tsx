import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'what-data-does-my-website-collect')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Your website almost certainly collects more data than you think. Between
                cookies, analytics scripts, embedded fonts, social widgets, and third-party tools, a typical website
                collects <strong>15–40 data points</strong> per visitor — often without the site owner&apos;s knowledge.
            </p>

            <h2>The Data You Know About vs. The Data You Don&apos;t</h2>

            <h3>Data You Probably Know About</h3>
            <ul>
                <li>Contact form submissions (name, email, message)</li>
                <li>Account registration data</li>
                <li>Payment information</li>
                <li>Newsletter signups</li>
            </ul>

            <h3>Data You Probably Don&apos;t Know About</h3>
            <ul>
                <li><strong>IP addresses</strong> — logged by your web server, analytics, and most third-party scripts</li>
                <li><strong>Browser fingerprint</strong> — screen size, fonts, GPU, timezone (see our <a href="/blog/browser-fingerprinting-privacy">fingerprinting guide</a>)</li>
                <li><strong>Mouse movements</strong> — if you use Hotjar, FullStory, or similar tools</li>
                <li><strong>Typed text in forms</strong> — some tools record keystrokes in real-time, even unsubmitted data</li>
                <li><strong>Cross-site browsing history</strong> — via third-party cookies from ad networks</li>
                <li><strong>Social media profiles</strong> — when you embed Facebook Like buttons or LinkedIn badges</li>
            </ul>

            <h2>Every Data Point Your Website Can Collect</h2>
            <table>
                <thead>
                    <tr><th>Category</th><th>Data Points</th><th>Collected By</th><th>GDPR Consent?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Identity</td><td>Name, email, phone, address</td><td>Forms, account creation</td><td>Legal basis required</td></tr>
                    <tr><td>Network</td><td>IP address, ISP, connection type</td><td>Server logs, analytics, CDNs</td><td>Yes</td></tr>
                    <tr><td>Device</td><td>OS, browser, screen size, language</td><td>User-Agent, JavaScript APIs</td><td>If used for tracking</td></tr>
                    <tr><td>Location</td><td>Country, city, GPS coordinates</td><td>IP geolocation, GPS API</td><td>Yes</td></tr>
                    <tr><td>Behavior</td><td>Pages visited, clicks, scroll, time on page</td><td>Analytics tools</td><td>Yes for most tools</td></tr>
                    <tr><td>Cookies</td><td>Session IDs, preferences, tracking tokens</td><td>Your site + third parties</td><td>Yes for non-essential</td></tr>
                    <tr><td>Storage</td><td>LocalStorage, SessionStorage, IndexedDB</td><td>JavaScript</td><td>Yes if personal data</td></tr>
                    <tr><td>Graphics</td><td>Canvas fingerprint, WebGL renderer</td><td>Fingerprinting scripts</td><td>Yes</td></tr>
                    <tr><td>Financial</td><td>Card details, transactions</td><td>Payment processors</td><td>Contract performance</td></tr>
                    <tr><td>Social</td><td>Profile data, likes</td><td>Social login, embedded widgets</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h2>How to Audit Your Website&apos;s Data Collection</h2>

            <h3>Method 1: Automated Scan (Fastest)</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website in 60 seconds. It detects all cookies,
                third-party scripts, tracking pixels, fingerprinting techniques, security headers, data transfer
                locations, exposed email addresses, and storage usage.
            </p>

            <h3>Method 2: Browser DevTools (Manual)</h3>
            <ol>
                <li>Open your website in Chrome and press <code>F12</code></li>
                <li><strong>Application → Cookies:</strong> See all cookies set</li>
                <li><strong>Application → Local Storage:</strong> See stored data</li>
                <li><strong>Network tab:</strong> See every request your page makes</li>
            </ol>

            <h2>The Most Common Hidden Data Collectors</h2>

            <h3>Google Fonts</h3>
            <p>
                Loading fonts from <code>fonts.googleapis.com</code> sends every visitor&apos;s IP address to Google.
                A German court fined a website owner <strong>€100 per visitor</strong>.
                <strong>Fix:</strong> Self-host your fonts.
            </p>

            <h3>YouTube Embeds</h3>
            <p>
                Standard YouTube embeds set tracking cookies before the user clicks play.
                <strong>Fix:</strong> Use <code>youtube-nocookie.com</code> or load after consent.
            </p>

            <h3>Google reCAPTCHA</h3>
            <p>
                reCAPTCHA v3 runs on every page, collecting behavior data.
                <strong>Fix:</strong> Use hCaptcha or Cloudflare Turnstile instead.
            </p>

            <h3>Social Media Buttons</h3>
            <p>
                Facebook Like buttons and Twitter share buttons track visitors without clicks.
                <strong>Fix:</strong> Use two-click solutions that load scripts only after interaction.
            </p>

            <h3>WordPress Plugins</h3>
            <p>
                Many <a href="/blog/wordpress-gdpr-compliance-guide">WordPress plugins</a> load external scripts
                without disclosing it. <strong>Fix:</strong> Audit every plugin for external requests.
            </p>

            <h2>What to Do After You Find Out</h2>
            <ol>
                <li><strong>Remove unnecessary tracking</strong> — if you don&apos;t need it, delete it</li>
                <li><strong>Block non-essential scripts until consent</strong> — use your <a href="/blog/consent-management-platform-comparison">CMP</a></li>
                <li><strong>Update your privacy policy</strong> — list every tool and data type</li>
                <li><strong>Switch to privacy-friendly alternatives</strong> — <a href="/blog/cookie-free-analytics-alternatives">cookie-free analytics</a></li>
                <li><strong>Self-host what you can</strong> — fonts, icons, JS libraries</li>
                <li><strong>Monitor for drift</strong> — <a href="/blog/compliance-monitoring-drift-detection">compliance drift</a> happens when team members add tools</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Does my website collect data even without Google Analytics?</h3>
            <p>
                <strong>Yes.</strong> Server logs capture IP addresses and user agents. Embedded fonts, CDNs, and
                any third-party resource also collect data.
            </p>

            <h3>Is collecting IP addresses GDPR-regulated?</h3>
            <p>
                <strong>Yes.</strong> The CJEU ruled that IP addresses are personal data when the operator can
                reasonably link them to an individual.
            </p>

            <h3>What&apos;s the fastest way to find out what my website collects?</h3>
            <p>
                <a href="/">Scan with PrivacyChecker</a> — 60 seconds for a complete report of all data collection
                on your site, including hidden trackers, cookies, and security issues.
            </p>
        </ArticleLayout>
    );
}
