import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'wordpress-gdpr-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                WordPress powers over 43% of all websites on the internet. Unfortunately, its plugin ecosystem
                and default settings create privacy compliance gaps that most site owners don&apos;t even know about.
                Here&apos;s how to make your WordPress site fully GDPR-compliant.
            </p>

            <h2>Common WordPress Privacy Issues</h2>
            <table>
                <thead>
                    <tr><th>Issue</th><th>How It Happens</th><th>GDPR Risk</th></tr>
                </thead>
                <tbody>
                    <tr><td>Gravatars load from external servers</td><td>WordPress default for comments</td><td>Data sent to Automattic servers without consent</td></tr>
                    <tr><td>Google Fonts loaded externally</td><td>Many themes load from fonts.googleapis.com</td><td>IP addresses sent to Google (§2.2 ruling, 2022)</td></tr>
                    <tr><td>Embedded YouTube/Vimeo videos</td><td>Standard embeds load trackers immediately</td><td>Cookies set before consent</td></tr>
                    <tr><td>Contact form data stored indefinitely</td><td>Default behavior of most form plugins</td><td>No data retention policy</td></tr>
                    <tr><td>Plugin analytics and tracking</td><td>Jetpack, WooCommerce, etc.</td><td>Hidden data collection</td></tr>
                    <tr><td>WordPress.com stats</td><td>Jetpack Site Stats module</td><td>Data sent to Automattic</td></tr>
                </tbody>
            </table>

            <h2>Essential Settings Changes</h2>

            <h3>1. Disable Gravatars</h3>
            <p>Go to Settings → Discussion → uncheck &quot;Show Avatars.&quot; This prevents external requests
                to Gravatar servers that transmit visitor data without consent.</p>

            <h3>2. Self-Host Google Fonts</h3>
            <p>Install the &quot;OMGF (Optimize My Google Fonts)&quot; plugin, or manually download and host
                fonts locally. After the 2022 Munich court ruling, loading Google Fonts externally without consent is
                a GDPR violation with fines starting at €100 per visitor.</p>

            <h3>3. Enable Privacy-Friendly Embeds</h3>
            <p>Use &quot;WP YouTube Lyte&quot; or &quot;GDPR-compliant YouTube Embed&quot; plugins that load
                a thumbnail placeholder instead of the full YouTube player. The actual video only loads after user click.</p>

            <h3>4. Configure WordPress Privacy Page</h3>
            <p>Go to Settings → Privacy and set your Privacy Policy page. WordPress will link to it automatically
                in login/registration forms and the site footer (theme-dependent).</p>

            <h2>Recommended Plugins</h2>
            <table>
                <thead>
                    <tr><th>Plugin</th><th>Purpose</th><th>Free/Paid</th></tr>
                </thead>
                <tbody>
                    <tr><td>Complianz</td><td>Cookie consent + privacy policy generation</td><td>Free + Premium ($45/yr)</td></tr>
                    <tr><td>CookieYes</td><td>Cookie banner with auto-scanning</td><td>Free + Premium ($89/yr)</td></tr>
                    <tr><td>OMGF</td><td>Self-host Google Fonts</td><td>Free</td></tr>
                    <tr><td>WP YouTube Lyte</td><td>GDPR-compliant YouTube embeds</td><td>Free</td></tr>
                    <tr><td>Flamingo</td><td>Contact form submissions with export/delete</td><td>Free</td></tr>
                    <tr><td>WP GDPR Compliance</td><td>Comment and form consent checkboxes</td><td>Free</td></tr>
                </tbody>
            </table>

            <h2>WooCommerce-Specific Issues</h2>
            <p>If you run WooCommerce, additional compliance steps are needed:</p>
            <ul>
                <li><strong>Order data retention</strong>: Set up automatic anonymization of old orders (WooCommerce → Settings → Accounts → Personal data retention)</li>
                <li><strong>Marketing consent</strong>: Don&apos;t pre-check the marketing opt-in checkbox at checkout</li>
                <li><strong>Payment gateways</strong>: Document all payment processor data flows in your privacy policy</li>
                <li><strong>Abandoned cart plugins</strong>: These track users without consent — ensure they respect consent state</li>
                <li><strong>Reviews</strong>: If you collect reviews, add a consent checkbox and disclose storage</li>
            </ul>

            <h2>WordPress Security Hardening</h2>
            <p>GDPR requires appropriate security measures. For WordPress:</p>
            <ul>
                <li>Add <a href="/blog/website-security-headers-guide">security headers</a> via your server config or a plugin like Headers Security Advanced & HSTS WP</li>
                <li>Install Wordfence or Sucuri for firewall protection</li>
                <li>Enable two-factor authentication for admin accounts</li>
                <li>Keep WordPress core, themes, and plugins updated</li>
                <li>Use SSL/HTTPS (Let&apos;s Encrypt is free)</li>
                <li>Limit login attempts to prevent brute force attacks</li>
            </ul>

            <h2>Audit Your WordPress Site</h2>
            <p>
                Even with the right plugins, WordPress sites accumulate compliance issues over time as
                themes update, plugins change behavior, and new content is added.
                <a href="/">Run a free PrivacyChecker scan</a> to identify all cookies, trackers, and
                third-party requests on your WordPress site — including those hidden inside plugins.
            </p>
        </ArticleLayout>
    );
}
