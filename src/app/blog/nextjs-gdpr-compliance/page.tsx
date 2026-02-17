import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'nextjs-gdpr-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Next.js gives you server components, middleware, and full-stack control — which makes GDPR compliance both more powerful
                and more complex than traditional SPAs. This guide covers Next.js-specific patterns for privacy-by-design, cookie consent,
                third-party script management, and server-side data handling.
            </p>

            <h2>Next.js Privacy Advantages</h2>
            <p>
                Next.js has architectural features that uniquely benefit privacy compliance:
            </p>
            <ul>
                <li><strong>Server Components:</strong> Process data server-side without exposing it to the client</li>
                <li><strong>Middleware:</strong> Intercept requests before they reach your app — perfect for consent enforcement</li>
                <li><strong>Script component:</strong> Conditional loading of third-party scripts with strategy control</li>
                <li><strong>Route handlers:</strong> Server-side API endpoints that keep sensitive logic off the client</li>
                <li><strong>Edge runtime:</strong> Process data closer to users for potential data residency compliance</li>
            </ul>

            <h2>GDPR Compliance Architecture for Next.js</h2>
            <p>
                The ideal Next.js privacy architecture uses a belt-and-suspenders approach: server-side enforcement via middleware
                plus client-side consent management:
            </p>
            <table>
                <thead>
                    <tr><th>Layer</th><th>What It Does</th><th>Next.js Feature</th></tr>
                </thead>
                <tbody>
                    <tr><td>Middleware</td><td>Reads consent cookie; strips tracking headers</td><td><code>middleware.ts</code></td></tr>
                    <tr><td>Server Components</td><td>Conditionally renders content based on consent</td><td>RSC</td></tr>
                    <tr><td>Client Components</td><td>Renders consent banner; manages consent state</td><td><code>&quot;use client&quot;</code></td></tr>
                    <tr><td>Script Component</td><td>Conditionally loads third-party scripts</td><td><code>next/script</code></td></tr>
                    <tr><td>Route Handlers</td><td>Processes consent changes server-side</td><td><code>app/api/</code></td></tr>
                </tbody>
            </table>

            <h2>1. Cookie Consent with Next.js Middleware</h2>
            <p>
                Next.js middleware runs before every request. Use it to read the consent cookie and enforce privacy at the edge:
            </p>
            <ul>
                <li>Create <code>middleware.ts</code> in your project root</li>
                <li>Read the consent cookie from the incoming request</li>
                <li>If no consent has been given, strip tracking-related cookies from the response</li>
                <li>Set security headers (CSP, Permissions-Policy) that block tracking by default</li>
                <li>This ensures tracking is blocked even if client-side JavaScript fails</li>
            </ul>
            <p>
                Key middleware patterns:
            </p>
            <ul>
                <li>Parse the consent cookie (JSON with categories: <code>{'{'}analytics: false, marketing: false{'}'}</code>)</li>
                <li>If analytics consent is not granted, delete GA cookies from the request</li>
                <li>If marketing consent is not granted, delete ad platform cookies</li>
                <li>Always allow essential cookies (session, CSRF, consent preference itself)</li>
            </ul>

            <h2>2. Consent Banner as a Client Component</h2>
            <p>
                The consent banner must be a client component because it needs interactivity. Best practices:
            </p>
            <ul>
                <li>Create a <code>&lt;ConsentBanner /&gt;</code> client component</li>
                <li>Store consent preferences in a cookie (not localStorage — middleware can&apos;t read localStorage)</li>
                <li>Use <code>cookies().set()</code> in a Server Action or API route for secure, HttpOnly cookies</li>
                <li>Provide granular choices: Essential (always on), Analytics, Marketing, Functional</li>
                <li>Include both &quot;Accept All&quot; and &quot;Reject All&quot; buttons at the same visual level</li>
                <li>Remember: don&apos;t pre-check any optional categories</li>
            </ul>

            <h2>3. Conditional Script Loading with next/script</h2>
            <p>
                The Next.js <code>Script</code> component supports strategies (<code>beforeInteractive</code>, <code>afterInteractive</code>, <code>lazyOnload</code>).
                Combine this with consent state:
            </p>
            <ul>
                <li>Create a client component that reads consent state</li>
                <li>Only render <code>&lt;Script&gt;</code> tags when the corresponding consent category is granted</li>
                <li>Use <code>strategy=&quot;lazyOnload&quot;</code> for non-essential scripts to improve performance</li>
                <li>When consent is revoked, remove the scripts and delete their cookies</li>
            </ul>
            <p>Common scripts to conditionally load:</p>
            <table>
                <thead>
                    <tr><th>Script</th><th>Consent Category</th><th>Strategy</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google Analytics (GA4)</td><td>Analytics</td><td>afterInteractive</td></tr>
                    <tr><td>Meta Pixel</td><td>Marketing</td><td>lazyOnload</td></tr>
                    <tr><td>Google Ads</td><td>Marketing</td><td>lazyOnload</td></tr>
                    <tr><td>Hotjar / FullStory</td><td>Analytics</td><td>lazyOnload</td></tr>
                    <tr><td>Intercom / Crisp</td><td>Functional</td><td>afterInteractive</td></tr>
                    <tr><td>Stripe.js</td><td>Essential</td><td>beforeInteractive</td></tr>
                </tbody>
            </table>

            <h2>4. Privacy-By-Design Patterns</h2>
            <p>
                Next.js&apos;s architecture naturally supports <a href="/blog/privacy-by-design-implementation">privacy by design</a> principles:
            </p>
            <ul>
                <li><strong>Data minimization:</strong> Use Server Components to process and filter data server-side. Only send the minimum necessary data to client components.</li>
                <li><strong>Purpose limitation:</strong> Use separate API routes for different purposes. Don&apos;t mix analytics and core functionality endpoints.</li>
                <li><strong>Storage limitation:</strong> Implement automatic data cleanup in your database with scheduled tasks or cron jobs.</li>
                <li><strong>Integrity:</strong> Validate all user input in Server Actions and route handlers. Use Zod schemas for type-safe validation.</li>
            </ul>

            <h2>5. Server-Side Data Subject Rights</h2>
            <p>
                Implement <a href="/blog/gdpr-data-subject-rights-guide">GDPR data subject rights</a> through API routes:
            </p>
            <ul>
                <li><strong>Right of access:</strong> Create an API route that compiles all personal data for a user and returns it as JSON or CSV</li>
                <li><strong>Right to erasure:</strong> Create a deletion endpoint that removes data from all tables and notifies third-party processors</li>
                <li><strong>Right to portability:</strong> Export user data in machine-readable format (JSON) via a dedicated endpoint</li>
                <li><strong>Consent withdrawal:</strong> Use a Server Action to clear consent preferences and trigger cookie cleanup</li>
            </ul>

            <h2>6. Security Headers via next.config.js</h2>
            <p>
                Configure <a href="/blog/website-security-headers-guide">security headers</a> in <code>next.config.js</code> to enforce privacy at the HTTP level:
            </p>
            <ul>
                <li><strong>Content-Security-Policy:</strong> Restrict which scripts and connections are allowed</li>
                <li><strong>Permissions-Policy:</strong> Disable camera, microphone, geolocation by default</li>
                <li><strong>Referrer-Policy:</strong> Set to <code>strict-origin-when-cross-origin</code> to limit referrer leakage</li>
                <li><strong>X-Content-Type-Options:</strong> <code>nosniff</code> to prevent MIME sniffing</li>
                <li><strong>Strict-Transport-Security:</strong> Enforce HTTPS</li>
            </ul>

            <h2>7. Common Next.js Privacy Pitfalls</h2>
            <ul>
                <li><strong>next/image with external domains:</strong> Each external image domain you whitelist sends user IP to that domain. Minimize external domains.</li>
                <li><strong>next/font/google:</strong> Loads fonts from Google servers at build time (safe) — <em>not</em> at runtime like a <code>&lt;link&gt;</code> tag. This is privacy-friendly.</li>
                <li><strong>Environment variables:</strong> <code>NEXT_PUBLIC_</code> variables are exposed to the client. Never put API keys or secrets in public env vars.</li>
                <li><strong>Error tracking (Sentry):</strong> Captures user data in error reports. Configure PII scrubbing and require consent for non-essential capture.</li>
                <li><strong>NextAuth.js:</strong> Sets session cookies — these are essential and don&apos;t need consent, but document them in your privacy policy.</li>
                <li><strong>ISR/SSG pages:</strong> Statically generated pages don&apos;t process personal data at generation time, but client-side scripts still do.</li>
            </ul>

            <h2>8. Recommended Libraries</h2>
            <table>
                <thead>
                    <tr><th>Purpose</th><th>Library</th><th>Why</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cookie consent</td><td>cookies-next, js-cookie</td><td>Read/write consent cookies in both server and client</td></tr>
                    <tr><td>Schema validation</td><td>Zod</td><td>Validate DSAR request data in route handlers</td></tr>
                    <tr><td>Privacy analytics</td><td>Plausible, Umami</td><td>Cookie-free, GDPR-friendly alternatives to GA</td></tr>
                    <tr><td>Email</td><td>Resend, React Email</td><td>Send DSAR confirmation emails with proper templates</td></tr>
                </tbody>
            </table>

            <h2>Next Steps</h2>
            <p>
                After implementing these patterns, test your Next.js application&apos;s privacy compliance. <a href="/">PrivacyChecker</a> scans
                your deployed site for cookies, trackers, <a href="/blog/website-security-headers-guide">security headers</a>, and
                privacy policy completeness — detecting common Next.js issues like exposed tracking scripts and missing consent management.
            </p>
        </ArticleLayout>
    );
}
