import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'gdpr-ai-compliance-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Artificial intelligence is transforming every industry — but it&apos;s also creating a compliance minefield.
                The EU AI Act became fully applicable in 2025, and it operates alongside GDPR, not as a replacement.
                If your AI system processes personal data of EU residents, you must comply with both frameworks simultaneously.
            </p>
            <p>
                This guide covers the practical intersection of GDPR and the EU AI Act — what you need to do, what to document,
                and how to avoid the pitfalls that have already triggered enforcement actions.
            </p>

            <h2>Where GDPR and the EU AI Act Overlap</h2>
            <p>
                The EU AI Act regulates AI systems based on risk level (unacceptable, high, limited, minimal).
                GDPR regulates any processing of personal data. When your AI system uses personal data — and most do — both apply.
            </p>
            <table>
                <thead>
                    <tr><th>Requirement</th><th>GDPR</th><th>EU AI Act</th></tr>
                </thead>
                <tbody>
                    <tr><td>Transparency</td><td>Art. 13-14: inform data subjects</td><td>Art. 52: disclose AI interaction</td></tr>
                    <tr><td>Risk assessment</td><td>Art. 35: DPIA for high-risk processing</td><td>Art. 9: risk management system</td></tr>
                    <tr><td>Human oversight</td><td>Art. 22: right not to be subject to automated decisions</td><td>Art. 14: human oversight measures</td></tr>
                    <tr><td>Data quality</td><td>Art. 5(1)(d): accuracy principle</td><td>Art. 10: training data governance</td></tr>
                    <tr><td>Documentation</td><td>Art. 30: records of processing</td><td>Art. 11: technical documentation</td></tr>
                    <tr><td>Accountability</td><td>Art. 5(2): demonstrate compliance</td><td>Art. 17: quality management system</td></tr>
                </tbody>
            </table>

            <h2>1. Determine Your Lawful Basis for AI Data Processing</h2>
            <p>
                Every use of personal data in AI requires a lawful basis under GDPR Article 6. The most common bases for AI are:
            </p>
            <ul>
                <li><strong>Consent (Art. 6(1)(a)):</strong> The data subject explicitly agrees. Hard to use for training data at scale because consent must be specific, informed, and freely given.</li>
                <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> Most common for AI. Requires a documented Legitimate Interest Assessment (LIA) balancing your interest against the data subject&apos;s rights.</li>
                <li><strong>Contract performance (Art. 6(1)(b)):</strong> If the AI is necessary to provide a service the user requested (e.g., a recommendation engine they actively use).</li>
            </ul>
            <p>
                <strong>Critical:</strong> &quot;Publicly available data&quot; does not create a lawful basis.
                The Italian DPA fined Clearview AI €20 million for scraping public images without a legal basis.
                You must still justify your processing regardless of data source.
            </p>

            <h2>2. Conduct a DPIA for AI Systems</h2>
            <p>
                GDPR Article 35 requires a <a href="/blog/data-protection-impact-assessment-guide">Data Protection Impact Assessment</a> when processing
                is likely to result in high risk. AI systems almost always qualify because they involve:
            </p>
            <ul>
                <li>Systematic and extensive evaluation of personal aspects (profiling)</li>
                <li>Large-scale processing of personal data</li>
                <li>Innovative use of technology</li>
                <li>Automated decision-making with legal or significant effects</li>
            </ul>
            <p>Your AI DPIA should document:</p>
            <ul>
                <li>The purpose and necessity of processing</li>
                <li>Training data sources and how personal data was collected</li>
                <li>Model architecture and how it processes data</li>
                <li>Output types and potential impact on individuals</li>
                <li>Bias testing results and mitigation measures</li>
                <li>Data retention policies for training and inference data</li>
                <li>Supplementary measures (anonymization, differential privacy, access controls)</li>
            </ul>

            <h2>3. Address Automated Decision-Making (Article 22)</h2>
            <p>
                GDPR Article 22 gives individuals the right not to be subject to decisions based solely on automated processing
                that produce legal or similarly significant effects. This directly impacts AI-driven:
            </p>
            <ul>
                <li>Credit scoring and loan approvals</li>
                <li>Automated hiring or CV screening</li>
                <li>Insurance risk assessment</li>
                <li>Content moderation affecting user access</li>
                <li>Pricing algorithms based on personal characteristics</li>
            </ul>
            <p>To comply with Article 22:</p>
            <ul>
                <li>Implement meaningful human review for high-impact decisions</li>
                <li>Provide the right to contest automated decisions</li>
                <li>Explain the logic involved — not the full algorithm, but the key factors</li>
                <li>Allow users to obtain human intervention</li>
                <li>Document your human-in-the-loop processes</li>
            </ul>

            <h2>4. Ensure AI Transparency Obligations</h2>
            <p>
                Both GDPR and the EU AI Act require transparency. Under GDPR Articles 13-14, you must inform users
                about automated processing. Under EU AI Act Article 52, you must disclose when users are interacting with AI.
            </p>
            <p>Your <a href="/blog/ai-privacy-policy-requirements">AI privacy policy disclosures</a> must include:</p>
            <ul>
                <li>The existence of automated decision-making and profiling</li>
                <li>Meaningful information about the logic involved</li>
                <li>The significance and envisaged consequences for the data subject</li>
                <li>The categories of personal data used as input</li>
                <li>Whether third-party AI APIs process user data (OpenAI, Google, Anthropic)</li>
            </ul>

            <h2>5. Implement Training Data Governance</h2>
            <p>
                The EU AI Act Article 10 requires training data to be relevant, representative, free of errors, and complete.
                GDPR adds requirements around purpose limitation and data minimization.
            </p>
            <ul>
                <li>Document the provenance of all training datasets</li>
                <li>Assess and mitigate biases in training data</li>
                <li>Implement data quality checks before and during training</li>
                <li>Honor data subject rights for data used in training (erasure, rectification)</li>
                <li>Consider <a href="/blog/privacy-enhancing-technologies-guide">privacy-enhancing technologies</a> like differential privacy for training</li>
            </ul>

            <h2>6. EU AI Act Risk Classification for Websites</h2>
            <p>
                Most website AI features fall into the limited or minimal risk categories. Here&apos;s how common AI features are classified:
            </p>
            <table>
                <thead>
                    <tr><th>AI Feature</th><th>Risk Level</th><th>Key Obligation</th></tr>
                </thead>
                <tbody>
                    <tr><td>AI chatbot (customer service)</td><td>Limited</td><td>Disclose AI interaction to users</td></tr>
                    <tr><td>Product recommendations</td><td>Minimal</td><td>Transparency in privacy policy</td></tr>
                    <tr><td>AI-generated content</td><td>Limited</td><td>Label as AI-generated</td></tr>
                    <tr><td>Automated hiring/CV screening</td><td>High</td><td>Full compliance framework required</td></tr>
                    <tr><td>Credit scoring</td><td>High</td><td>Full compliance framework required</td></tr>
                    <tr><td>Emotion recognition</td><td>Prohibited*</td><td>Banned in workplace/education</td></tr>
                    <tr><td>Social scoring</td><td>Unacceptable</td><td>Prohibited entirely</td></tr>
                </tbody>
            </table>

            <h2>7. Practical Compliance Checklist</h2>
            <ul>
                <li>Identify all AI systems processing personal data</li>
                <li>Document the lawful basis for each (with LIA if using legitimate interest)</li>
                <li>Conduct a DPIA for each AI system</li>
                <li>Classify each AI system under the EU AI Act risk framework</li>
                <li>Update your privacy policy with AI-specific disclosures</li>
                <li>Implement human oversight for automated decisions</li>
                <li>Create a process for data subjects to contest AI decisions</li>
                <li>Document training data provenance and quality measures</li>
                <li>Implement bias testing and monitoring</li>
                <li>Review and update quarterly as models and regulations evolve</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Start by auditing your website for AI-driven processing. <a href="/">PrivacyChecker</a> detects AI chatbots,
                third-party AI scripts, automated personalization, and <a href="/blog/ai-crawlers-robots-txt">AI crawlers</a> accessing your
                content. Run a free scan to see what AI-related compliance issues your site may have.
            </p>
        </ArticleLayout>
    );
}
