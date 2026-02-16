import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'ai-privacy-policy-requirements')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Yes, if your app, website, or SaaS uses AI (ChatGPT API, Gemini, Claude, or any
                machine learning model), you need a privacy policy that specifically discloses AI data processing.
                Under both GDPR and the EU AI Act, you must inform users that AI is being used, what data it processes,
                and how decisions are made.
            </p>

            <h2>Why AI Changes Your Privacy Requirements</h2>
            <p>
                Using AI APIs in your product introduces new data processing activities that most standard privacy policies
                don&apos;t cover. When a user submits a query that gets sent to OpenAI, Google, or Anthropic,
                you are <strong>transferring personal data to a third-party sub-processor</strong> — often across borders.
            </p>
            <ul>
                <li><strong>Input data:</strong> User prompts may contain personal data (names, emails, health info)</li>
                <li><strong>Output data:</strong> AI-generated responses may constitute profiling or automated decision-making</li>
                <li><strong>Training data:</strong> Some AI providers may use your API calls for model training (opt-out required)</li>
                <li><strong>Logging:</strong> AI providers typically log requests for 30 days for abuse detection</li>
            </ul>

            <h2>What Your AI Privacy Policy Must Include</h2>

            <h3>1. Disclosure of AI Usage</h3>
            <p>
                Under the <strong>EU AI Act (2024)</strong> and <strong>GDPR Article 13-14</strong>, you must tell users:
            </p>
            <ul>
                <li>That AI is being used in your product</li>
                <li>Which AI provider(s) you use (OpenAI, Google, Anthropic, etc.)</li>
                <li>What data is sent to the AI provider</li>
                <li>The purpose of the AI processing</li>
            </ul>
            <p>Example disclosure:</p>
            <blockquote>
                <p>&quot;Our product uses OpenAI&apos;s GPT-4 API to generate [descriptions/analysis/recommendations].
                    When you use [feature name], your input text is sent to OpenAI for processing. OpenAI processes
                    this data under our Data Processing Agreement and does not use it for model training.&quot;</p>
            </blockquote>

            <h3>2. Automated Decision-Making (GDPR Art. 22)</h3>
            <p>
                If your AI makes or assists decisions that <strong>significantly affect users</strong> (hiring, credit scoring,
                content moderation, insurance), GDPR Article 22 gives users the right to:
            </p>
            <ul>
                <li>Know that automated decision-making is happening</li>
                <li>Understand the logic involved</li>
                <li>Contest the decision and request human review</li>
            </ul>

            <h3>3. Sub-Processor Disclosure</h3>
            <p>
                AI API providers are sub-processors under GDPR. Your privacy policy and DPA must list them:
            </p>
            <table>
                <thead>
                    <tr><th>Provider</th><th>API</th><th>Data Location</th><th>Training on API Data?</th><th>DPA Available?</th></tr>
                </thead>
                <tbody>
                    <tr><td>OpenAI</td><td>GPT-4, GPT-4o</td><td>US (DPF certified)</td><td>No (API data excluded by default)</td><td>Yes</td></tr>
                    <tr><td>Google</td><td>Gemini API</td><td>US / EU option</td><td>No (paid API excluded)</td><td>Yes</td></tr>
                    <tr><td>Anthropic</td><td>Claude API</td><td>US (DPF certified)</td><td>No (API data not used)</td><td>Yes</td></tr>
                    <tr><td>Meta</td><td>LLaMA (self-hosted)</td><td>Your infrastructure</td><td>N/A (self-hosted)</td><td>N/A</td></tr>
                    <tr><td>Mistral</td><td>Mistral API</td><td>EU (France)</td><td>No (API excluded)</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h3>4. Data Retention for AI Processing</h3>
            <p>
                Most AI providers retain API request logs temporarily for abuse detection:
            </p>
            <ul>
                <li><strong>OpenAI:</strong> 30 days (zero data retention available for enterprise)</li>
                <li><strong>Google Gemini API:</strong> Logs retained per Google Cloud terms</li>
                <li><strong>Anthropic:</strong> 30 days, then deleted</li>
            </ul>
            <p>Your privacy policy must disclose these retention periods.</p>

            <h3>5. EU AI Act Transparency Requirements</h3>
            <p>
                The EU AI Act (effective August 2025) introduces additional requirements:
            </p>
            <ul>
                <li><strong>AI-generated content labelling:</strong> Users must know when content is AI-generated</li>
                <li><strong>High-risk AI systems:</strong> Additional documentation, human oversight, and conformity assessments</li>
                <li><strong>General-purpose AI:</strong> Providers must publish training data summaries and comply with copyright rules</li>
            </ul>

            <h2>Privacy Policy Template Sections for AI</h2>
            <p>Add these sections to your existing privacy policy:</p>
            <ol>
                <li><strong>&quot;Use of Artificial Intelligence&quot;</strong> — Describe which AI services you use and why</li>
                <li><strong>&quot;AI Data Processing&quot;</strong> — What data is sent, how it&apos;s processed, and retention</li>
                <li><strong>&quot;Automated Decision-Making&quot;</strong> — If applicable, explain the logic and user rights</li>
                <li><strong>&quot;AI Sub-Processors&quot;</strong> — List AI providers with links to their DPAs</li>
                <li><strong>&quot;Your Rights Regarding AI&quot;</strong> — Right to opt-out, right to explanation, right to human review</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Does using ChatGPT&apos;s API require a privacy policy update?</h3>
            <p>
                <strong>Yes.</strong> Any integration with OpenAI&apos;s API constitutes a data transfer to a US-based
                sub-processor. You must disclose this in your privacy policy, sign a DPA with OpenAI, and
                ensure you have a legal basis for the data transfer (the EU-US DPF covers this for OpenAI).
            </p>

            <h3>Can I use AI to process health or financial data?</h3>
            <p>
                Yes, but with extra safeguards. Health data and financial data are &quot;special categories&quot; under GDPR
                requiring explicit consent or another strong legal basis. You should also conduct a
                <a href="/blog/data-protection-impact-assessment-guide">Data Protection Impact Assessment (DPIA)</a> and
                consider using zero-data-retention options from your AI provider.
            </p>

            <h3>How do I check if my website&apos;s privacy policy covers AI?</h3>
            <p>
                <a href="/">PrivacyChecker</a> scans your website for privacy policy completeness, including AI-related
                disclosures. It checks for third-party connections to AI providers and flags missing transparency requirements.
            </p>
        </ArticleLayout>
    );
}
