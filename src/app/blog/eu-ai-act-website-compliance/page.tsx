import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'eu-ai-act-website-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                The EU AI Act, adopted in 2024, is the world&apos;s first comprehensive law regulating artificial intelligence.
                If your website uses AI-powered chatbots, personalization engines, analytics, or recommendation systems,
                you have new compliance obligations. Many website owners don&apos;t realize their site uses AI — or that it&apos;s now regulated.
            </p>

            <h2>What Counts as &quot;AI&quot; on a Website?</h2>
            <p>The definition is broader than you might think. Common website AI systems include:</p>
            <table>
                <thead>
                    <tr><th>AI System</th><th>Examples</th><th>Risk Level</th></tr>
                </thead>
                <tbody>
                    <tr><td>Chatbots</td><td>Intercom, Drift, ChatGPT integrations, custom bots</td><td>Limited risk</td></tr>
                    <tr><td>Personalization</td><td>Product recommendations, dynamic content, A/B testing with ML</td><td>Minimal risk</td></tr>
                    <tr><td>Analytics</td><td>Predictive analytics, user behavior modeling, heatmap AI</td><td>Minimal risk</td></tr>
                    <tr><td>Fraud detection</td><td>reCAPTCHA, bot detection, account fraud prevention</td><td>Limited risk</td></tr>
                    <tr><td>Content moderation</td><td>Comment filtering, spam detection, content classification</td><td>High risk*</td></tr>
                    <tr><td>Biometric identification</td><td>Face recognition login, fingerprinting</td><td>Prohibited/High risk</td></tr>
                </tbody>
            </table>
            <p><em>*Content moderation AI that affects content visibility or user access can be classified as high-risk.</em></p>

            <h2>The Risk Classification System</h2>
            <p>The EU AI Act uses a risk-based approach with four tiers:</p>
            <h3>Prohibited AI</h3>
            <ul>
                <li>Social scoring systems</li>
                <li>Manipulative AI designed to distort behavior</li>
                <li>Emotion recognition in workplaces and schools</li>
                <li>Real-time biometric identification in public spaces</li>
            </ul>
            <h3>High-Risk AI</h3>
            <ul>
                <li>Requires conformity assessment before deployment</li>
                <li>Must have human oversight, transparency, and accuracy documentation</li>
                <li>Examples: credit scoring, hiring decisions, access to essential services</li>
            </ul>
            <h3>Limited Risk AI</h3>
            <ul>
                <li><strong>Transparency obligation</strong> — users must be told they&apos;re interacting with AI</li>
                <li>This applies to most AI chatbots on websites</li>
                <li>Must clearly disclose AI-generated or manipulated content</li>
            </ul>
            <h3>Minimal Risk AI</h3>
            <ul>
                <li>No specific obligations (spam filters, basic recommendations)</li>
                <li>Voluntary codes of conduct encouraged</li>
            </ul>

            <h2>Your Website&apos;s Obligations</h2>
            <p>For most websites, the key requirements are:</p>
            <ol>
                <li>
                    <strong>Transparency for chatbots</strong>: If your website has an AI chatbot,
                    users must be clearly informed they&apos;re interacting with an AI system, not a human.
                    A simple notice like &quot;You are chatting with an AI assistant&quot; is sufficient.
                </li>
                <li>
                    <strong>AI inventory</strong>: Document what AI systems are deployed on your website,
                    their purpose, risk level, and the provider.
                </li>
                <li>
                    <strong>No manipulative AI</strong>: AI systems must not use subliminal techniques or exploit
                    vulnerabilities to materially distort behavior. This overlaps with <a href="/blog/dark-patterns-detection">dark patterns</a> regulations.
                </li>
                <li>
                    <strong>Data protection alignment</strong>: AI that processes personal data must comply with GDPR.
                    This means purpose limitation, data minimization, and user consent where required.
                </li>
            </ol>

            <h2>How to Detect AI on Your Website</h2>
            <p>
                Many website owners don&apos;t even know they&apos;re using AI. Third-party widgets,
                analytics tools, and plugins often include AI components. Here&apos;s how to identify them:
            </p>
            <ul>
                <li>Run a <a href="/">PrivacyChecker Pro+ scan</a> — our AI Detection module automatically identifies AI systems on your website</li>
                <li>Review all third-party scripts and their documentation</li>
                <li>Check your analytics, chat, and recommendation tools for AI/ML features</li>
                <li>Ask your vendors: &quot;Does this product use machine learning or AI?&quot;</li>
            </ul>

            <h2>Compliance Timeline</h2>
            <table>
                <thead>
                    <tr><th>Date</th><th>Milestone</th></tr>
                </thead>
                <tbody>
                    <tr><td>February 2025</td><td>Prohibited AI practices banned</td></tr>
                    <tr><td>August 2025</td><td>General-purpose AI rules apply</td></tr>
                    <tr><td>August 2026</td><td>Full enforcement for high-risk AI</td></tr>
                    <tr><td>August 2027</td><td>Remaining provisions take effect</td></tr>
                </tbody>
            </table>

            <h2>Penalties</h2>
            <ul>
                <li><strong>Prohibited AI violations</strong>: Up to €35 million or 7% of global annual turnover</li>
                <li><strong>High-risk AI violations</strong>: Up to €15 million or 3% of global annual turnover</li>
                <li><strong>Providing incorrect information</strong>: Up to €7.5 million or 1% of global annual turnover</li>
            </ul>

            <h2>Action Steps</h2>
            <ol>
                <li>Run an AI audit on your website to identify all AI systems</li>
                <li>Classify each system by risk level (prohibited, high, limited, minimal)</li>
                <li>Add transparency notices for AI chatbots and AI-generated content</li>
                <li>Document your AI inventory (system, purpose, provider, risk level, data processed)</li>
                <li>Review AI vendor contracts for compliance commitments</li>
                <li>Set up ongoing monitoring to detect new AI integrations</li>
            </ol>

            <p>
                <a href="/">PrivacyChecker&apos;s AI Detection feature</a> automatically scans your website for AI systems,
                classifies them by risk level, and provides specific compliance recommendations. Available in Pro+ plans.
            </p>
        </ArticleLayout>
    );
}
