import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'core-web-vitals-privacy-impact')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Every third-party script on your website degrades performance. Google&apos;s Core Web Vitals —
                LCP, INP, and CLS — directly affect your search rankings, and privacy-related elements like consent
                banners and trackers are major contributors to poor scores. Here&apos;s how to optimize both.
            </p>

            <h2>How Privacy Features Affect Core Web Vitals</h2>
            <table>
                <thead>
                    <tr><th>Element</th><th>Metric Affected</th><th>Typical Impact</th></tr>
                </thead>
                <tbody>
                    <tr><td>Consent banner (CMP)</td><td>CLS, LCP</td><td>+0.05-0.3 CLS, +200-800ms LCP</td></tr>
                    <tr><td>Google Analytics 4</td><td>LCP</td><td>+100-300ms LCP</td></tr>
                    <tr><td>Facebook Pixel</td><td>LCP, INP</td><td>+150-400ms LCP</td></tr>
                    <tr><td>Chat widgets (Intercom, Crisp)</td><td>LCP, CLS</td><td>+300-1000ms LCP, +0.1-0.2 CLS</td></tr>
                    <tr><td>Hotjar/FullStory</td><td>INP</td><td>+50-200ms INP due to DOM mutation observers</td></tr>
                    <tr><td>Multiple ad trackers</td><td>LCP, INP</td><td>+500-2000ms LCP total</td></tr>
                    <tr><td>Cookie-free analytics</td><td>LCP</td><td>+5-20ms LCP (&lt;1KB script)</td></tr>
                </tbody>
            </table>

            <h2>Core Web Vitals Thresholds</h2>
            <table>
                <thead>
                    <tr><th>Metric</th><th>Good</th><th>Needs Improvement</th><th>Poor</th></tr>
                </thead>
                <tbody>
                    <tr><td>LCP (Largest Contentful Paint)</td><td>&lt;2.5s</td><td>2.5-4.0s</td><td>&gt;4.0s</td></tr>
                    <tr><td>INP (Interaction to Next Paint)</td><td>&lt;200ms</td><td>200-500ms</td><td>&gt;500ms</td></tr>
                    <tr><td>CLS (Cumulative Layout Shift)</td><td>&lt;0.1</td><td>0.1-0.25</td><td>&gt;0.25</td></tr>
                </tbody>
            </table>

            <h2>Optimization Strategies</h2>

            <h3>1. Optimize Your Consent Banner</h3>
            <ul>
                <li><strong>Reserve space with CSS</strong>: Prevent CLS by reserving the banner height before it loads</li>
                <li><strong>Load CMP asynchronously</strong>: Use <code>async</code> or <code>defer</code> for the CMP script</li>
                <li><strong>Choose a lightweight CMP</strong>: Compare <a href="/blog/consent-management-platform-comparison">CMP performance</a> — some are 3x heavier than others</li>
                <li><strong>Inline critical CSS</strong>: Include banner styles in the initial HTML to prevent FOUC</li>
            </ul>

            <h3>2. Lazy-Load Non-Essential Scripts</h3>
            <ul>
                <li><strong>Chat widgets</strong>: Load only after user scrolls or clicks a trigger button</li>
                <li><strong>Session replay</strong>: Load after initial page interaction</li>
                <li><strong>Social embeds</strong>: Use facade pattern (static placeholder → load on click)</li>
                <li><strong>Marketing pixels</strong>: Defer loading until after consent and LCP</li>
            </ul>

            <h3>3. Reduce Third-Party Script Count</h3>
            <ul>
                <li>Audit all scripts with <a href="/">PrivacyChecker</a> to identify every third-party dependency</li>
                <li>Remove <a href="/blog/reduce-saas-costs-hidden-tools">duplicate and unused tools</a></li>
                <li>Switch to <a href="/blog/cookie-free-analytics-alternatives">cookie-free analytics</a> (1KB vs 90KB for GA4)</li>
                <li>Self-host fonts instead of loading from Google Fonts CDN</li>
            </ul>

            <h3>4. Use Resource Hints</h3>
            <pre><code>{`<!-- Preconnect to critical third-party origins -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://www.google-analytics.com">

<!-- Preload critical resources -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>`}</code></pre>

            <h3>5. Implement Script Loading Priority</h3>
            <pre><code>{`<!-- Priority 1: Critical (inline or sync) -->
<script>/* Consent defaults */</script>

<!-- Priority 2: High (async, preloaded) -->
<script async src="/cmp.js"></script>

<!-- Priority 3: Medium (async, after LCP) -->
<script async src="/analytics.js"></script>

<!-- Priority 4: Low (lazy, on interaction) -->
<script>
document.addEventListener('scroll', () => {
  loadChatWidget();
}, { once: true });
</script>`}</code></pre>

            <h2>Measuring Impact</h2>
            <ol>
                <li><strong>PageSpeed Insights</strong>: Check CWV scores with and without third-party scripts</li>
                <li><strong>Chrome DevTools Performance tab</strong>: Identify script-level bottlenecks</li>
                <li><strong>WebPageTest</strong>: Waterfall view shows exactly when each script loads</li>
                <li><strong>Chrome UX Report</strong>: Real-user data from the field (via Search Console)</li>
            </ol>

            <p>
                <a href="/">Scan your site with PrivacyChecker</a> to get a complete inventory of third-party
                scripts impacting your performance and privacy. Fewer scripts = faster pages = better rankings.
            </p>
        </ArticleLayout>
    );
}
