import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'website-security-headers-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Security headers are HTTP response headers that instruct browsers to enable (or disable) security features.
                They&apos;re your first line of defense against XSS attacks, clickjacking, data injection, and MIME sniffing.
                Most websites are missing critical security headers — leaving their visitors vulnerable.
            </p>

            <h2>The 5 Essential Security Headers</h2>

            <h3>1. Content-Security-Policy (CSP)</h3>
            <p>
                CSP prevents Cross-Site Scripting (XSS) by specifying which sources of content are allowed to load on your page.
                It&apos;s the most powerful — and most complex — security header.
            </p>
            <pre><code>Content-Security-Policy: default-src &apos;self&apos;; script-src &apos;self&apos; https://cdn.example.com; style-src &apos;self&apos; &apos;unsafe-inline&apos;; img-src &apos;self&apos; data: https:; font-src &apos;self&apos; https://fonts.gstatic.com</code></pre>
            <p>Key directives:</p>
            <ul>
                <li><code>default-src</code>: Fallback for all resource types</li>
                <li><code>script-src</code>: Where JavaScript can load from</li>
                <li><code>style-src</code>: Where CSS can load from</li>
                <li><code>img-src</code>: Where images can load from</li>
                <li><code>connect-src</code>: Where fetch/XHR requests can go</li>
                <li><code>frame-ancestors</code>: Who can embed your site (replaces X-Frame-Options)</li>
            </ul>

            <h3>2. Strict-Transport-Security (HSTS)</h3>
            <p>Forces browsers to always use HTTPS, preventing downgrade attacks and cookie hijacking.</p>
            <pre><code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code></pre>
            <ul>
                <li><code>max-age=31536000</code>: Remember for 1 year</li>
                <li><code>includeSubDomains</code>: Apply to all subdomains</li>
                <li><code>preload</code>: Submit to browser preload lists for maximum protection</li>
            </ul>

            <h3>3. X-Frame-Options</h3>
            <p>Prevents your site from being embedded in iframes, protecting against clickjacking attacks.</p>
            <pre><code>X-Frame-Options: DENY</code></pre>
            <p>Options: <code>DENY</code> (never allow), <code>SAMEORIGIN</code> (only same domain), or use CSP&apos;s <code>frame-ancestors</code> for more control.</p>

            <h3>4. X-Content-Type-Options</h3>
            <p>Prevents browsers from MIME-sniffing — guessing the content type and potentially executing malicious files.</p>
            <pre><code>X-Content-Type-Options: nosniff</code></pre>
            <p>This is a one-liner with no configuration needed. Always include it.</p>

            <h3>5. Referrer-Policy</h3>
            <p>Controls what information is sent in the Referer header when navigating away from your site.</p>
            <pre><code>Referrer-Policy: strict-origin-when-cross-origin</code></pre>
            <p>This sends the origin (domain) for cross-origin requests but the full URL for same-origin requests — a good balance of functionality and privacy.</p>

            <h2>Additional Recommended Headers</h2>
            <table>
                <thead>
                    <tr><th>Header</th><th>Value</th><th>Purpose</th></tr>
                </thead>
                <tbody>
                    <tr><td>Permissions-Policy</td><td><code>camera=(), microphone=(), geolocation=()</code></td><td>Disable unused browser APIs</td></tr>
                    <tr><td>X-XSS-Protection</td><td><code>0</code></td><td>Disable legacy XSS filter (CSP is better)</td></tr>
                    <tr><td>Cross-Origin-Embedder-Policy</td><td><code>require-corp</code></td><td>Prevent cross-origin resource loading</td></tr>
                    <tr><td>Cross-Origin-Opener-Policy</td><td><code>same-origin</code></td><td>Isolate browsing context</td></tr>
                </tbody>
            </table>

            <h2>Implementation by Platform</h2>

            <h3>Next.js / Vercel</h3>
            <p>Add headers in <code>next.config.js</code>:</p>
            <pre><code>{`// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ],
  }];
}`}</code></pre>

            <h3>Nginx</h3>
            <pre><code>{`add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`}</code></pre>

            <h3>Apache (.htaccess)</h3>
            <pre><code>{`Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"`}</code></pre>

            <h2>Security Grade</h2>
            <p>
                <a href="/">PrivacyChecker</a> analyzes your security headers and grades your implementation.
                Most websites score D or F on their first scan. Implementing the 5 essential headers takes under 5 minutes
                and immediately improves your security posture. Our Pro plans provide specific implementation
                instructions for your platform.
            </p>
        </ArticleLayout>
    );
}
