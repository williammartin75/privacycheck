import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'block-ai-crawlers-website')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> To block AI crawlers like GPTBot, ChatGPT-User, ClaudeBot, and others
                from scraping your website, add specific rules to your <code>robots.txt</code> file and use HTTP
                headers for fine-grained control. Here&apos;s the complete list of AI user agents and how to block
                (or allow) each one.
            </p>

            <h2>Why Block (or Allow) AI Crawlers?</h2>
            <p>
                AI companies like OpenAI, Anthropic, Google, and others send crawlers to scrape website content
                for training their language models. Unlike search engine bots (which index your pages for search
                results), AI crawlers use your content to <strong>build commercial products</strong> — often without
                compensation or attribution.
            </p>
            <table>
                <thead>
                    <tr><th>Reason to block</th><th>Reason to allow</th></tr>
                </thead>
                <tbody>
                    <tr><td>Protect proprietary content from being used in AI training</td><td>Get cited in AI answers (ChatGPT, Perplexity, etc.)</td></tr>
                    <tr><td>Reduce server load from aggressive crawling</td><td>Increase brand visibility through AI-generated recommendations</td></tr>
                    <tr><td>Copyright and licensing concerns</td><td>Drive referral traffic from AI tools that link to sources</td></tr>
                    <tr><td>Competitive advantage — don&apos;t feed competitor AI models</td><td>Participate in AI Search (Google AI Overview, Bing Chat)</td></tr>
                </tbody>
            </table>

            <h2>Complete List of AI Crawlers (2026)</h2>
            <table>
                <thead>
                    <tr><th>User Agent</th><th>Company</th><th>Purpose</th><th>Respects robots.txt</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>GPTBot</code></td><td>OpenAI</td><td>Training data for GPT models</td><td>Yes</td></tr>
                    <tr><td><code>ChatGPT-User</code></td><td>OpenAI</td><td>Real-time browsing (ChatGPT with browsing)</td><td>Yes</td></tr>
                    <tr><td><code>OAI-SearchBot</code></td><td>OpenAI</td><td>SearchGPT / ChatGPT Search</td><td>Yes</td></tr>
                    <tr><td><code>ClaudeBot</code></td><td>Anthropic</td><td>Training data for Claude</td><td>Yes</td></tr>
                    <tr><td><code>anthropic-ai</code></td><td>Anthropic</td><td>Web browsing for Claude</td><td>Yes</td></tr>
                    <tr><td><code>Google-Extended</code></td><td>Google</td><td>Training Gemini / Bard</td><td>Yes</td></tr>
                    <tr><td><code>Googlebot</code></td><td>Google</td><td>Search indexing + AI Overview</td><td>Yes (don&apos;t block)</td></tr>
                    <tr><td><code>PerplexityBot</code></td><td>Perplexity AI</td><td>AI search engine</td><td>Yes</td></tr>
                    <tr><td><code>Applebot-Extended</code></td><td>Apple</td><td>Apple Intelligence / Siri</td><td>Yes</td></tr>
                    <tr><td><code>Bytespider</code></td><td>ByteDance</td><td>TikTok AI training</td><td>Partially</td></tr>
                    <tr><td><code>CCBot</code></td><td>Common Crawl</td><td>Open dataset (used by many AI labs)</td><td>Yes</td></tr>
                    <tr><td><code>FacebookBot</code></td><td>Meta</td><td>AI training for Llama</td><td>Yes</td></tr>
                    <tr><td><code>meta-externalagent</code></td><td>Meta</td><td>Meta AI browsing</td><td>Yes</td></tr>
                    <tr><td><code>cohere-ai</code></td><td>Cohere</td><td>Enterprise AI training</td><td>Yes</td></tr>
                    <tr><td><code>Diffbot</code></td><td>Diffbot</td><td>Web data extraction for AI</td><td>Partially</td></tr>
                </tbody>
            </table>

            <h2>Option 1: Block All AI Crawlers via robots.txt</h2>
            <p>
                Add this to your <code>robots.txt</code> file (usually at <code>yoursite.com/robots.txt</code>):
            </p>
            <pre><code>{`# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

User-agent: cohere-ai
Disallow: /

User-agent: Diffbot
Disallow: /`}</code></pre>

            <h2>Option 2: Block Training, Allow AI Search</h2>
            <p>
                If you <strong>want</strong> to appear in AI search results (ChatGPT Search, Perplexity, Google AI
                Overview) but <strong>don&apos;t want</strong> your content used for training, use this selective
                configuration:
            </p>
            <pre><code>{`# Block AI TRAINING crawlers
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: FacebookBot
Disallow: /

# ALLOW AI search/browsing bots (so you appear in AI answers)
User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /`}</code></pre>

            <h2>Option 3: HTTP Headers (More Control)</h2>
            <p>
                For page-level control, use the <code>X-Robots-Tag</code> HTTP header. This is useful when you want
                to block AI crawlers from specific pages (like premium content) while allowing them on others.
            </p>
            <p>
                In your server config (Nginx example):
            </p>
            <pre><code>{`# Block GPTBot from premium content
location /premium/ {
    add_header X-Robots-Tag "noai, noimageai" always;
}`}</code></pre>
            <p>
                Google also supports the <code>nosnippet</code> and <code>max-snippet:0</code> meta tags to prevent
                content from appearing in AI Overviews:
            </p>
            <pre><code>{`<meta name="robots" content="max-snippet:0">`}</code></pre>

            <h2>How to Verify Your Blocks Are Working</h2>
            <ol>
                <li><strong>Test robots.txt:</strong> Visit <code>yoursite.com/robots.txt</code> and verify the rules are present</li>
                <li><strong>Use Google Search Console:</strong> The robots.txt tester shows whether specific user agents are blocked</li>
                <li><strong>Check server logs:</strong> Search for AI bot user agents in your access logs to see if they&apos;re still crawling</li>
                <li><strong>Use PrivacyChecker:</strong> Our <a href="/">scanner</a> checks your robots.txt configuration and flags AI crawlers that aren&apos;t blocked (or that are allowed)</li>
            </ol>

            <h2>The Copyright Angle</h2>
            <p>
                As of 2026, several legal precedents affect AI crawling:
            </p>
            <ul>
                <li><strong>EU AI Act (2024):</strong> Requires AI providers to document training data sources and respect copyright opt-outs</li>
                <li><strong>EU Copyright Directive (Article 4):</strong> Text and data mining for commercial AI requires an opt-out mechanism — robots.txt is the de facto standard</li>
                <li><strong>NYT v. OpenAI (US, 2024):</strong> Established that large-scale scraping for AI training can constitute copyright infringement</li>
                <li><strong>TDM Reservation Protocol:</strong> Some publishers use the <code>tdm-reservation: 1</code> header to explicitly reserve text/data mining rights</li>
            </ul>

            <h2>Frequently Asked Questions</h2>

            <h3>Does blocking GPTBot prevent my site from appearing in ChatGPT?</h3>
            <p>
                <strong>Not exactly.</strong> Blocking <code>GPTBot</code> prevents OpenAI from using your content
                for <strong>training future models</strong>. But <code>ChatGPT-User</code> is a separate bot used for
                real-time browsing — if you allow <code>ChatGPT-User</code>, your content can still appear when users
                ask ChatGPT to browse the web.
            </p>

            <h3>Will blocking AI crawlers hurt my Google SEO ranking?</h3>
            <p>
                <strong>No.</strong> Blocking <code>Google-Extended</code> only prevents Google from using your
                content for Gemini/AI training. It does <strong>not</strong> affect <code>Googlebot</code> (the
                search index crawler). Your search rankings are unaffected. However, blocking <code>Googlebot</code>
                will remove you from search results entirely — never block <code>Googlebot</code>.
            </p>

            <h3>Is robots.txt legally binding?</h3>
            <p>
                <strong>Not directly</strong>, but it&apos;s increasingly recognized in court. The EU Copyright
                Directive recognizes robots.txt as a valid machine-readable opt-out. OpenAI, Anthropic, and Google
                have all publicly committed to respecting robots.txt. Ignoring a robots.txt block could strengthen
                a copyright infringement claim.
            </p>
        </ArticleLayout>
    );
}
