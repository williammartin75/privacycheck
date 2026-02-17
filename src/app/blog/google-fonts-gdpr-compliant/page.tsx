import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'google-fonts-gdpr-compliant')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Loading Google Fonts from Google&apos;s servers (<code>fonts.googleapis.com</code>)
                transfers the user&apos;s IP address to Google in the US, which multiple EU courts have ruled
                is a <strong>GDPR violation</strong>. The fix is simple: self-host your fonts. Here&apos;s exactly how.
            </p>

            <h2>The Legal Problem with Google Fonts</h2>
            <p>
                When your website loads fonts from <code>fonts.googleapis.com</code>, every visitor&apos;s browser
                makes a request to Google&apos;s CDN. This request transmits the user&apos;s <strong>IP address</strong> to
                Google&apos;s servers in the United States — without the user&apos;s consent.
            </p>
            <p>
                Under GDPR, an IP address is <strong>personal data</strong> (Article 4). Sending it to a US company
                constitutes a <strong>third-country data transfer</strong> (Chapter V) that requires either:
            </p>
            <ul>
                <li>An adequacy decision (the EU-US Data Privacy Framework covers Google)</li>
                <li>Standard Contractual Clauses (SCCs)</li>
                <li><strong>Or explicit consent</strong> from the user</li>
            </ul>

            <h2>Court Rulings Against Google Fonts</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>Court/DPA</th><th>Date</th><th>Ruling</th><th>Fine/Damages</th></tr>
                </thead>
                <tbody>
                    <tr><td>Germany</td><td>LG München I</td><td>Jan 2022</td><td>Google Fonts via CDN violates GDPR — IP transfer without consent</td><td>€100 per user</td></tr>
                    <tr><td>Austria</td><td>DSB</td><td>Apr 2022</td><td>Confirmed Google Fonts CDN is non-compliant</td><td>Warning</td></tr>
                    <tr><td>France</td><td>CNIL</td><td>2022</td><td>Flagged Google Fonts CDN in enforcement actions against multiple sites</td><td>Various</td></tr>
                    <tr><td>Italy</td><td>Garante</td><td>2023</td><td>Included Google Fonts in cookie/tracker audits, required consent</td><td>Warning</td></tr>
                    <tr><td>Netherlands</td><td>AP</td><td>2023</td><td>Guidance: external font loading requires consent mechanism</td><td>—</td></tr>
                </tbody>
            </table>
            <p>
                The landmark <strong>Munich ruling (LG München I, 3 O 17493/20)</strong> established that loading
                Google Fonts from Google&apos;s CDN is a GDPR violation because: (1) the IP transfer is not
                &quot;strictly necessary&quot; for the website to function, and (2) self-hosting is a readily
                available alternative.
            </p>

            <h2>How to Fix It: Self-Host Google Fonts</h2>
            <p>
                Self-hosting means downloading the font files and serving them from your own server. No requests
                are made to Google, so no IP address is transferred.
            </p>

            <h3>Method 1: Using google-webfonts-helper</h3>
            <ol>
                <li>Go to <strong>gwfh.mranftl.com/fonts</strong> (Google Webfonts Helper)</li>
                <li>Search for your font (e.g., &quot;Inter&quot;, &quot;Roboto&quot;, &quot;Open Sans&quot;)</li>
                <li>Select the styles you need (Regular, Bold, Italic, etc.)</li>
                <li>Choose &quot;Modern Browsers&quot; for WOFF2 format (smallest file size)</li>
                <li>Download the zip file and copy the CSS snippet</li>
                <li>Upload the font files to your server (e.g., <code>/fonts/</code> directory)</li>
                <li>Replace the Google Fonts <code>&lt;link&gt;</code> tag with the local CSS</li>
            </ol>

            <h3>Method 2: Using Next.js (next/font)</h3>
            <p>
                If you use Next.js, the <code>next/font</code> module automatically self-hosts Google Fonts at build time:
            </p>
            <pre><code>{`import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Fonts are downloaded at build time
// Served from your domain — zero requests to Google`}</code></pre>

            <h3>Method 3: Manual Download</h3>
            <ol>
                <li>Visit <code>fonts.google.com</code> and select your font</li>
                <li>Download the font family</li>
                <li>Convert to WOFF2 format using a tool like <strong>CloudConvert</strong> or <strong>Font Squirrel</strong></li>
                <li>Add <code>@font-face</code> declarations in your CSS pointing to local files</li>
            </ol>

            <h3>Example: Self-Hosted @font-face CSS</h3>
            <pre><code>{`@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-v13-latin-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/fonts/inter-v13-latin-700.woff2') format('woff2');
}`}</code></pre>

            <h2>How to Check if Your Site Uses Google Fonts CDN</h2>
            <ol>
                <li><strong>Quick check:</strong> View your page source (Ctrl+U) and search for <code>fonts.googleapis.com</code> or <code>fonts.gstatic.com</code></li>
                <li><strong>DevTools:</strong> Open Network tab → filter by <code>fonts.g</code> → if you see requests, you&apos;re loading from Google</li>
                <li><strong>Automated:</strong> Run a <a href="/">PrivacyChecker scan</a> — our scanner detects Google Fonts CDN usage and flags it as a third-party data transfer issue</li>
            </ol>

            <h2>But Wait: The EU-US Data Privacy Framework</h2>
            <p>
                Since July 2023, the <strong>EU-US Data Privacy Framework (DPF)</strong> provides an adequacy
                decision for data transfers to certified US companies. Google is DPF-certified, which technically
                provides a legal basis for the IP transfer.
            </p>
            <p>
                <strong>However:</strong>
            </p>
            <ul>
                <li>The DPF could be invalidated (like Privacy Shield was in Schrems II)</li>
                <li>Some DPAs still recommend self-hosting as the <strong>safer approach</strong></li>
                <li>Self-hosting is <strong>faster</strong> (no DNS lookup, no additional connection) — it&apos;s a performance win too</li>
                <li>Self-hosting gives you <strong>full control</strong> over font loading behavior and caching</li>
            </ul>
            <p>
                <strong>Recommendation:</strong> Self-host regardless. It&apos;s a 10-minute fix that eliminates
                legal risk entirely, improves performance, and future-proofs against regulatory changes.
            </p>

            <h2>Other External Resources to Check</h2>
            <p>
                Google Fonts is the most common external resource issue, but check these too:
            </p>
            <table>
                <thead>
                    <tr><th>Resource</th><th>Domain</th><th>Same problem?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Google Fonts</td><td><code>fonts.googleapis.com</code></td><td>Yes — self-host</td></tr>
                    <tr><td>Font Awesome CDN</td><td><code>cdnjs.cloudflare.com</code></td><td>Yes — self-host or use SVGs</td></tr>
                    <tr><td>Bootstrap CDN</td><td><code>cdn.jsdelivr.net</code></td><td>Yes — self-host</td></tr>
                    <tr><td>jQuery CDN</td><td><code>code.jquery.com</code></td><td>Yes — self-host</td></tr>
                    <tr><td>Gravatar</td><td><code>gravatar.com</code></td><td>Yes — IP transfer to Automattic</td></tr>
                    <tr><td>YouTube embeds</td><td><code>youtube.com</code></td><td>Yes — use youtube-nocookie.com or consent</td></tr>
                    <tr><td>Google Maps embeds</td><td><code>maps.google.com</code></td><td>Yes — requires consent or alternative</td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>Was my site fined for using Google Fonts?</h3>
            <p>
                Individual sites typically receive a <strong>warning or cease-and-desist</strong> first. However, in
                Germany, there have been cases of automated GDPR claims where individuals systematically visited
                websites using Google Fonts CDN and demanded €100 per page view. Some German courts have upheld these claims.
            </p>

            <h3>Does self-hosting fonts affect performance?</h3>
            <p>
                <strong>Self-hosting is actually faster.</strong> Loading from <code>fonts.googleapis.com</code>
                requires a DNS lookup + connection to Google&apos;s servers. Self-hosted fonts load from your existing
                domain and benefit from your CDN cache. Google&apos;s own Core Web Vitals documentation recommends
                self-hosting for optimal LCP scores.
            </p>

            <h3>Can I use Google Fonts if I add a cookie consent banner?</h3>
            <p>
                Technically yes — if fonts only load <strong>after</strong> explicit consent. But this means your
                website renders with fallback fonts until consent is given, causing a visible layout shift. Self-hosting
                is the practical solution.
            </p>
        </ArticleLayout>
    );
}
