import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'ai-crawlers-robots-txt')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> AI companies like OpenAI, Google, Anthropic, and Meta now crawl websites to train
                and power their AI models. You can control which AI crawlers access your content using <code>robots.txt</code>,
                but each crawler uses a different user-agent — and blocking them has trade-offs for your site&apos;s visibility in
                AI-powered search.
            </p>

            <h2>What Are AI Crawlers?</h2>
            <p>
                AI crawlers are bots that download and index web content for use in large language models (LLMs).
                Unlike traditional search engine crawlers (Googlebot, Bingbot), AI crawlers may use your content to
                <strong>train models</strong> or to <strong>generate real-time answers</strong> citing your site.
            </p>
            <table>
                <thead>
                    <tr><th>Crawler</th><th>Company</th><th>Purpose</th><th>User-Agent</th></tr>
                </thead>
                <tbody>
                    <tr><td>GPTBot</td><td>OpenAI</td><td>Training data for GPT models</td><td>GPTBot</td></tr>
                    <tr><td>ChatGPT-User</td><td>OpenAI</td><td>Real-time browsing for ChatGPT answers</td><td>ChatGPT-User</td></tr>
                    <tr><td>Google-Extended</td><td>Google</td><td>Training Gemini models</td><td>Google-Extended</td></tr>
                    <tr><td>Googlebot</td><td>Google</td><td>Search indexing + AI Overviews</td><td>Googlebot</td></tr>
                    <tr><td>ClaudeBot</td><td>Anthropic</td><td>Training Claude models</td><td>ClaudeBot / anthropic-ai</td></tr>
                    <tr><td>Meta-ExternalAgent</td><td>Meta</td><td>Training LLaMA models</td><td>Meta-ExternalAgent</td></tr>
                    <tr><td>PerplexityBot</td><td>Perplexity</td><td>Search + citation answers</td><td>PerplexityBot</td></tr>
                    <tr><td>Applebot-Extended</td><td>Apple</td><td>Apple Intelligence features</td><td>Applebot-Extended</td></tr>
                    <tr><td>Bytespider</td><td>ByteDance</td><td>Training for TikTok AI</td><td>Bytespider</td></tr>
                    <tr><td>CCBot</td><td>Common Crawl</td><td>Open dataset used by many AI companies</td><td>CCBot</td></tr>
                </tbody>
            </table>

            <h2>How to Control AI Crawlers With robots.txt</h2>
            <p>
                The <code>robots.txt</code> file at the root of your website tells crawlers which pages they can and cannot access.
                Here&apos;s how to configure it for different strategies:
            </p>

            <h3>Strategy 1: Block All AI Training Crawlers</h3>
            <p>If you want to prevent your content from being used to train AI models but still appear in search results:</p>
            <pre><code>{`# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

# Allow real-time AI search (ChatGPT browsing, Perplexity)
User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

# Allow regular search engines
User-agent: Googlebot
Allow: /`}</code></pre>

            <h3>Strategy 2: Allow Everything (Maximize AI Visibility)</h3>
            <p>
                If you <strong>want</strong> AI models to cite your content (recommended for content marketing and SEO):
            </p>
            <pre><code>{`# Welcome all crawlers
User-agent: *
Allow: /

# Explicitly welcome AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /`}</code></pre>

            <h3>Strategy 3: Selective Access (Recommended)</h3>
            <p>Allow AI browsing bots that cite your source while blocking training-only crawlers:</p>
            <pre><code>{`# Block training-only crawlers
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

# Allow citation crawlers (they link back to you)
User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /`}</code></pre>

            <h2>The Trade-Off: Training vs. Citation</h2>
            <p>
                There&apos;s a key distinction between AI crawlers that <strong>train models</strong> (GPTBot, Google-Extended)
                and those that <strong>browse in real-time</strong> to answer user questions (ChatGPT-User, PerplexityBot):
            </p>
            <table>
                <thead>
                    <tr><th>Type</th><th>Examples</th><th>Your Content Is…</th><th>You Get…</th></tr>
                </thead>
                <tbody>
                    <tr><td>Training crawlers</td><td>GPTBot, Google-Extended, CCBot</td><td>Absorbed into the model</td><td>No attribution or link</td></tr>
                    <tr><td>Citation crawlers</td><td>ChatGPT-User, PerplexityBot</td><td>Quoted with a source link</td><td>Traffic + brand visibility</td></tr>
                </tbody>
            </table>
            <p>
                <strong>TL;DR:</strong> Blocking training crawlers protects your IP. Allowing citation crawlers drives traffic.
                Most businesses should use Strategy 3 above.
            </p>

            <h2>GDPR and AI Crawling: Legal Considerations</h2>
            <p>
                Under GDPR, AI crawling raises questions about <strong>data processing purposes</strong> and
                <strong>legitimate interest</strong>. If an AI crawler processes personal data from your website
                (e.g., contact pages, team directories), this could constitute data processing under GDPR.
            </p>
            <ul>
                <li><strong>Opt-out right:</strong> Some DPAs argue that website owners should be able to opt out of AI training.
                    The <code>robots.txt</code> mechanism is currently the de facto opt-out method</li>
                <li><strong>Copyright:</strong> The EU AI Act requires AI providers to respect <code>robots.txt</code> for
                    training data collection (Article 53). Non-compliance could result in penalties</li>
                <li><strong>Transparency:</strong> Under GDPR Article 14, AI companies should inform data subjects (you)
                    about how their data is being processed</li>
            </ul>

            <h2>How to Monitor AI Crawlers on Your Site</h2>
            <p>
                Check your server logs or analytics for these user-agents. You can use <a href="/">PrivacyChecker</a> to
                scan your site and identify which third-party connections are made, including AI-related services.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Does blocking GPTBot remove my content from ChatGPT?</h3>
            <p>
                Blocking <code>GPTBot</code> prevents your content from being used in <strong>future training runs</strong>.
                Content already in the model from previous crawls remains. To also prevent ChatGPT from browsing your site
                in real-time, you must also block <code>ChatGPT-User</code> — but this means ChatGPT won&apos;t cite
                your site in its answers.
            </p>

            <h3>Does blocking Google-Extended affect my Google search rankings?</h3>
            <p>
                No. <code>Google-Extended</code> is separate from <code>Googlebot</code>. Blocking Google-Extended only
                prevents Google from using your content to train Gemini. Your search rankings remain unaffected.
            </p>

            <h3>Can AI crawlers bypass robots.txt?</h3>
            <p>
                Legally, no — the EU AI Act explicitly requires compliance. Technically, some crawlers may not respect
                robots.txt. Server-level blocking (IP ranges, rate limiting) provides stronger enforcement. OpenAI
                and Google publish their crawler IP ranges for this purpose.
            </p>

            <h3>Should I block all AI crawlers?</h3>
            <p>
                It depends on your goals. If your business benefits from visibility in AI-powered search (most do),
                allow citation crawlers. If you&apos;re a publisher whose content is being copied without attribution,
                blocking training crawlers protects your intellectual property.
            </p>
        </ArticleLayout>
    );
}
