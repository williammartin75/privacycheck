import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'ai-crawling-gdpr-legal')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> When AI companies crawl your website to train their models, they may be
                processing personal data — which triggers GDPR obligations. The legal landscape around AI crawling is
                evolving rapidly, with data protection authorities across Europe issuing new guidance in 2025 and 2026.
            </p>

            <h2>The Legal Problem With AI Crawling</h2>
            <p>
                Every time an AI crawler like GPTBot or ClaudeBot visits your website, it downloads your content — including
                any personal data that appears on your pages. This includes names on &quot;About Us&quot; pages, email addresses on
                contact pages, employee directories, testimonials with real names, and user-generated content.
            </p>
            <p>
                Under GDPR, this download constitutes <strong>data processing</strong>. The AI company becomes a
                data controller for that processing — and they need to comply with all GDPR requirements, including
                having a <strong>lawful basis</strong> for processing.
            </p>

            <h2>What Legal Basis Do AI Companies Use?</h2>
            <p>
                Most AI companies claim <strong>legitimate interest</strong> (GDPR Article 6(1)(f)) as their legal basis
                for crawling and training. But this claim is increasingly challenged:
            </p>
            <table>
                <thead>
                    <tr><th>Company</th><th>Claimed Legal Basis</th><th>DPA Response</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>OpenAI (GPTBot)</td><td>Legitimate interest</td><td>Italian DPA banned ChatGPT temporarily in 2023</td><td>Under ongoing scrutiny</td></tr>
                    <tr><td>Google (Google-Extended)</td><td>Legitimate interest</td><td>Multiple complaints filed to DPAs</td><td>Pending decisions</td></tr>
                    <tr><td>Meta (Meta-ExternalAgent)</td><td>Legitimate interest + consent</td><td>Paused EU AI training after DPC pushback</td><td>Restricted in EU</td></tr>
                    <tr><td>Anthropic (ClaudeBot)</td><td>Legitimate interest</td><td>Honors robots.txt opt-out</td><td>Lower regulatory profile</td></tr>
                    <tr><td>Common Crawl (CCBot)</td><td>Public interest / research</td><td>Debated as training data source</td><td>Legal gray area</td></tr>
                </tbody>
            </table>

            <h2>Key GDPR Principles at Stake</h2>

            <h3>1. Purpose Limitation (Article 5(1)(b))</h3>
            <p>
                When you publish content on your website, the purpose is to inform visitors. AI companies repurpose
                this content for an entirely different purpose — training machine learning models. This arguably violates
                the <strong>purpose limitation principle</strong>, as the data is being used in a way the data subjects
                never anticipated.
            </p>

            <h3>2. Right to Object (Article 21)</h3>
            <p>
                Under GDPR, data subjects have the right to object to processing based on legitimate interest. For AI
                crawling, the <code>robots.txt</code> file has become the de facto objection mechanism. The
                <strong>EU AI Act (Article 53)</strong> now requires AI providers to respect robots.txt directives.
            </p>

            <h3>3. Transparency (Article 14)</h3>
            <p>
                When AI companies collect data from websites (not directly from data subjects), they must provide
                information about the processing under Article 14. Most AI companies fail to individually notify
                website owners or the people whose data appears on crawled pages.
            </p>

            <h3>4. Data Minimization (Article 5(1)(c))</h3>
            <p>
                AI crawlers typically download <strong>entire pages</strong>, including content unrelated to their
                training purpose. This &quot;vacuum everything&quot; approach conflicts with the data minimization principle.
            </p>

            <h2>What the EU AI Act Says About Web Crawling</h2>
            <p>
                The EU AI Act, which took effect in phases starting August 2024, includes specific provisions
                relevant to AI crawling:
            </p>
            <ul>
                <li><strong>Article 53(1)(c):</strong> Providers of general-purpose AI models must put in place a policy to
                    respect the rights of copyright holders, including honoring machine-readable opt-outs like robots.txt</li>
                <li><strong>Article 53(1)(d):</strong> Providers must draw up and make publicly available a sufficiently
                    detailed summary of the content used for training</li>
                <li><strong>Recital 106:</strong> The opt-out mechanism must be &quot;appropriate and proportionate&quot; — robots.txt
                    is explicitly mentioned as one such mechanism</li>
            </ul>

            <h2>How to Protect Your Website</h2>

            <h3>Step 1: Audit Your Current AI Crawler Exposure</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. The audit identifies third-party connections
                and external services that may include AI-related data collection. Check which AI crawlers are currently
                accessing your site by reviewing your server access logs.
            </p>

            <h3>Step 2: Configure robots.txt</h3>
            <p>
                Add explicit directives for AI crawlers in your <code>robots.txt</code> file. See our detailed
                guide: <a href="/blog/ai-crawlers-robots-txt">AI Crawlers and robots.txt: Complete Guide</a>.
            </p>

            <h3>Step 3: Add Machine-Readable Rights Statements</h3>
            <p>
                Consider adding the <strong>TDM Reservation Protocol</strong> (Text and Data Mining) headers.
                The EU DSM Directive allows rights holders to express machine-readable reservations against TDM:
            </p>
            <pre><code>{`<!-- Add to your HTML <head> -->
<meta name="tdm-reservation" content="1">

<!-- Or via HTTP header -->
TDM-Reservation: 1`}</code></pre>

            <h3>Step 4: Update Your Privacy Policy</h3>
            <p>
                Your privacy policy should address AI crawling if you&apos;re aware of it. Include a statement about
                automated data collection by third parties and your position on AI training data.
            </p>

            <h2>Recent Enforcement Actions</h2>
            <ul>
                <li><strong>Italy (March 2023):</strong> Garante temporarily banned ChatGPT for GDPR violations
                    related to data collection and lack of age verification</li>
                <li><strong>France (2024):</strong> CNIL launched investigations into AI companies&apos; data scraping
                    practices under GDPR</li>
                <li><strong>Ireland (2024):</strong> DPC ordered Meta to pause using EU user data for AI training</li>
                <li><strong>EDPB (2024):</strong> Published opinion on AI model training, clarifying legitimate
                    interest requirements</li>
                <li><strong>Worldwide (2025-2026):</strong> Multiple class-action lawsuits filed against AI
                    companies for unauthorized data scraping</li>
            </ul>

            <h2>What Website Owners Should Do Now</h2>
            <table>
                <thead>
                    <tr><th>Action</th><th>Difficulty</th><th>Impact</th><th>Timeline</th></tr>
                </thead>
                <tbody>
                    <tr><td>Add AI crawler rules to robots.txt</td><td>Easy</td><td>High</td><td>Today</td></tr>
                    <tr><td>Scan your site for AI-related services</td><td>Easy</td><td>Medium</td><td>Today</td></tr>
                    <tr><td>Add TDM Reservation headers</td><td>Easy</td><td>Medium</td><td>This week</td></tr>
                    <tr><td>Update privacy policy</td><td>Medium</td><td>High</td><td>This week</td></tr>
                    <tr><td>Review server logs for AI crawlers</td><td>Medium</td><td>High</td><td>Monthly</td></tr>
                    <tr><td>Implement server-level IP blocking</td><td>Hard</td><td>Very high</td><td>If needed</td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>Can I sue an AI company for crawling my website?</h3>
            <p>
                Potentially, yes. Under GDPR, you can lodge a complaint with your local DPA and seek compensation under
                Article 82. Several class-action lawsuits are underway in the EU and US. The strength of your case
                depends on whether the AI company violated your robots.txt directives and processed personal data
                without a valid legal basis.
            </p>

            <h3>Does the GDPR apply to AI crawlers from non-EU companies?</h3>
            <p>
                Yes. GDPR applies to any entity processing data of EU residents, regardless of where the company
                is based (Article 3(2)). OpenAI (US), Anthropic (US), and others must comply with GDPR when
                crawling EU websites.
            </p>

            <h3>Is blocking AI crawlers enough to comply with GDPR?</h3>
            <p>
                Blocking AI crawlers is about protecting <em>your</em> content and <em>your visitors&apos;</em> data. GDPR
                compliance requires broader measures — using <a href="/">PrivacyChecker</a> helps identify all privacy
                gaps on your site, not just AI-related ones.
            </p>
        </ArticleLayout>
    );
}
