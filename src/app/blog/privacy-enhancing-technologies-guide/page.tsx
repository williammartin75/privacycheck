import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'privacy-enhancing-technologies-guide')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Privacy-Enhancing Technologies (PETs) let you extract value from data while protecting individual privacy.
                As regulators push for stronger protections and &quot;privacy by design,&quot; PETs are moving from academic curiosity
                to production necessity. This guide explains each technology in plain English with practical use cases.
            </p>

            <h2>Why PETs Matter for GDPR Compliance</h2>
            <p>
                GDPR encourages technical measures to protect data (Art. 25 — <a href="/blog/privacy-by-design-implementation">privacy by design</a>; Art. 32 — security measures).
                PETs can help you:
            </p>
            <ul>
                <li><strong>Reduce scope:</strong> Truly anonymized data falls outside GDPR entirely</li>
                <li><strong>Minimize risk:</strong> Less exposure means smaller breach impact</li>
                <li><strong>Enable analytics:</strong> Extract insights without processing personal data</li>
                <li><strong>Strengthen DPIAs:</strong> PETs demonstrate proactive risk mitigation in your <a href="/blog/data-protection-impact-assessment-guide">DPIA</a></li>
            </ul>

            <h2>PETs Comparison Table</h2>
            <table>
                <thead>
                    <tr><th>Technology</th><th>What It Does</th><th>Complexity</th><th>Performance</th><th>Best For</th></tr>
                </thead>
                <tbody>
                    <tr><td>Differential Privacy</td><td>Adds calibrated noise to outputs</td><td>Medium</td><td>Fast</td><td>Analytics, ML training</td></tr>
                    <tr><td>Homomorphic Encryption</td><td>Computes on encrypted data</td><td>Very High</td><td>Very Slow</td><td>Outsourced computation</td></tr>
                    <tr><td>Secure Multi-Party Computation</td><td>Joint computation without sharing data</td><td>High</td><td>Slow</td><td>Cross-org analytics</td></tr>
                    <tr><td>Synthetic Data</td><td>Generates fake data with real patterns</td><td>Medium</td><td>Fast</td><td>Testing, ML training</td></tr>
                    <tr><td>K-Anonymity</td><td>Makes each record indistinguishable from k-1 others</td><td>Low</td><td>Fast</td><td>Dataset publishing</td></tr>
                    <tr><td>Federated Learning</td><td>Trains models without centralizing data</td><td>High</td><td>Medium</td><td>Mobile AI, healthcare</td></tr>
                    <tr><td>Zero-Knowledge Proofs</td><td>Proves a statement without revealing data</td><td>Very High</td><td>Fast</td><td>Age verification, auth</td></tr>
                    <tr><td>Trusted Execution Environments</td><td>Processes data in hardware-isolated enclaves</td><td>Medium</td><td>Fast</td><td>Cloud processing</td></tr>
                </tbody>
            </table>

            <h2>1. Differential Privacy</h2>
            <p>
                The most practical PET for most organizations. Differential privacy adds mathematically calibrated noise to query results
                or datasets, making it impossible to determine whether any individual&apos;s data was included.
            </p>
            <p><strong>How it works:</strong> When you query &quot;average age of users in France,&quot; the system returns the true answer ± a small random value.
                Individual records are protected, but aggregate statistics remain accurate.</p>
            <ul>
                <li><strong>Used by:</strong> Apple (telemetry), Google (Chrome, Maps), US Census Bureau (2020 Census)</li>
                <li><strong>GDPR impact:</strong> Can produce truly anonymous outputs, removing data from GDPR scope</li>
                <li><strong>Tools:</strong> Google&apos;s dp-lib, OpenDP, IBM&apos;s diffprivlib, TensorFlow Privacy</li>
            </ul>

            <h2>2. Homomorphic Encryption</h2>
            <p>
                Allows computation on encrypted data without decrypting it first. The encrypted result, when decrypted, matches
                the result you&apos;d get from processing the plaintext.
            </p>
            <ul>
                <li><strong>Fully Homomorphic Encryption (FHE):</strong> Supports any computation — addition, multiplication, comparisons</li>
                <li><strong>Partially Homomorphic:</strong> Supports only specific operations but is much faster</li>
                <li><strong>Use case:</strong> Outsourcing computation to cloud providers without trusting them with your data</li>
                <li><strong>Limitation:</strong> Currently 1,000x-1,000,000x slower than plaintext operations. Improving rapidly.</li>
                <li><strong>Tools:</strong> Microsoft SEAL, IBM HElib, Google&apos;s FHE compiler</li>
            </ul>

            <h2>3. Synthetic Data Generation</h2>
            <p>
                Creates artificial datasets that statistically mirror real data but contain no actual personal information.
                Useful for development, testing, and sharing data externally.
            </p>
            <ul>
                <li><strong>How:</strong> GANs, VAEs, or statistical models learn the distribution of real data and generate new samples</li>
                <li><strong>GDPR benefit:</strong> If properly generated, synthetic data is not personal data</li>
                <li><strong>Risk:</strong> Poor generation can leak information about training data — always validate with privacy metrics</li>
                <li><strong>Tools:</strong> Mostly.ai, Gretel.ai, SDV (Python), Synthea (healthcare)</li>
            </ul>

            <h2>4. K-Anonymity, L-Diversity, and T-Closeness</h2>
            <p>
                Classical anonymization techniques for structured datasets:
            </p>
            <ul>
                <li><strong>K-anonymity:</strong> Every record is identical to at least k-1 other records on quasi-identifiers (age, ZIP, gender). If k=5, you can&apos;t distinguish any individual from at least 4 others.</li>
                <li><strong>L-diversity:</strong> Extends k-anonymity by ensuring sensitive attributes have at least l distinct values in each group.</li>
                <li><strong>T-closeness:</strong> Ensures the distribution of sensitive attributes in each group is close to the overall distribution.</li>
            </ul>
            <p>
                <strong>Limitations:</strong> Vulnerable to background knowledge attacks. If an attacker knows someone is in a specific group,
                and all members share a sensitive attribute, k-anonymity fails. Always combine with other PETs for high-sensitivity data.
            </p>

            <h2>5. Federated Learning</h2>
            <p>
                Trains machine learning models across multiple devices or servers without centralizing data. Each participant
                trains a local model and only shares model updates (gradients), not raw data.
            </p>
            <ul>
                <li><strong>Used by:</strong> Google (Gboard keyboard predictions), Apple (Siri improvements), hospitals (joint medical research)</li>
                <li><strong>GDPR benefit:</strong> Data never leaves the device/organization — reduces cross-border transfer issues</li>
                <li><strong>Risk:</strong> Model updates can leak information — combine with differential privacy for stronger guarantees</li>
                <li><strong>Tools:</strong> TensorFlow Federated, PySyft, NVIDIA FLARE</li>
            </ul>

            <h2>6. Zero-Knowledge Proofs</h2>
            <p>
                Proves a statement is true without revealing any underlying information. For example, proving you&apos;re over 18
                without revealing your actual age or birthdate.
            </p>
            <ul>
                <li><strong>Use cases:</strong> Age verification, credential verification, anonymous authentication</li>
                <li><strong>GDPR benefit:</strong> Enables verification without data collection — ultimate data minimization</li>
                <li><strong>Emerging:</strong> EU Digital Identity Wallet (eIDAS 2.0) plans to use zero-knowledge proofs for selective attribute disclosure</li>
            </ul>

            <h2>Choosing the Right PET</h2>
            <p>Use this decision framework:</p>
            <ul>
                <li><strong>Need aggregate analytics?</strong> → Differential privacy</li>
                <li><strong>Need to share datasets externally?</strong> → Synthetic data + k-anonymity</li>
                <li><strong>Need to process data in untrusted environments?</strong> → Homomorphic encryption or TEEs</li>
                <li><strong>Need multi-party analytics without sharing raw data?</strong> → Secure multi-party computation</li>
                <li><strong>Need to train ML without centralizing data?</strong> → Federated learning</li>
                <li><strong>Need to verify attributes without revealing data?</strong> → Zero-knowledge proofs</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Before implementing PETs, understand what data your website currently collects. <a href="/">PrivacyChecker</a> scans your site and identifies
                all <a href="/blog/what-data-does-my-website-collect">data collection points</a>, helping you determine where PETs could reduce your compliance burden.
            </p>
        </ArticleLayout>
    );
}
