import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'lgpd-vs-gdpr-brazil')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> LGPD (Lei Geral de Proteção de Dados) is Brazil&apos;s data protection law,
                modelled after GDPR but with key differences. If your website or SaaS has users in Brazil,
                you likely need to comply with both LGPD and GDPR. The main differences are in legal bases for
                processing, DPO requirements, and enforcement mechanisms.
            </p>

            <h2>LGPD vs GDPR: Side-by-Side Comparison</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>GDPR (EU)</th><th>LGPD (Brazil)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Effective Date</td><td>May 2018</td><td>September 2020</td></tr>
                    <tr><td>Scope</td><td>EU residents&apos; data, anywhere processed</td><td>Data collected/processed in Brazil or of individuals in Brazil</td></tr>
                    <tr><td>Legal Bases</td><td>6 legal bases</td><td>10 legal bases (adds credit protection, health protection)</td></tr>
                    <tr><td>Consent</td><td>Must be freely given, specific, informed, unambiguous</td><td>Same — must be free, informed, unambiguous, and for a specific purpose</td></tr>
                    <tr><td>Legitimate Interest</td><td>Allowed with balancing test</td><td>Allowed but ANPD can request a LIA (Legitimate Interest Assessment)</td></tr>
                    <tr><td>DPO Required?</td><td>Required for large-scale processing or public bodies</td><td>Required for all controllers (ANPD may exempt small businesses)</td></tr>
                    <tr><td>Breach Notification</td><td>72 hours to DPA</td><td>&quot;Reasonable time&quot; — no fixed deadline (ANPD recommends 2 business days)</td></tr>
                    <tr><td>DPIA Required?</td><td>When processing poses high risk</td><td>ANPD can request a &quot;Privacy Impact Report&quot; at any time</td></tr>
                    <tr><td>Cross-Border Transfers</td><td>Adequacy decisions, SCCs, BCRs</td><td>Similar — adequacy, SCCs, BCRs, or specific consent</td></tr>
                    <tr><td>Fines</td><td>Up to €20M or 4% of global revenue</td><td>Up to 2% of Brazilian revenue, capped at R$50M (~€8.5M) per violation</td></tr>
                    <tr><td>Enforcement Authority</td><td>National DPAs (CNIL, ICO, BfDI, etc.)</td><td>ANPD (Autoridade Nacional de Proteção de Dados)</td></tr>
                    <tr><td>Data Portability</td><td>Required</td><td>Required</td></tr>
                    <tr><td>Right to Erasure</td><td>Yes (with exceptions)</td><td>Yes (with fewer exceptions)</td></tr>
                    <tr><td>Children&apos;s Data</td><td>Parental consent under 16 (Member States can lower to 13)</td><td>Parental consent required for under 18</td></tr>
                </tbody>
            </table>

            <h2>Key Differences That Matter in Practice</h2>

            <h3>1. More Legal Bases Under LGPD</h3>
            <p>
                LGPD recognizes <strong>10 legal bases</strong> for processing (vs. GDPR&apos;s 6), including:
            </p>
            <ul>
                <li><strong>Credit protection:</strong> Processing for credit scoring and risk assessment</li>
                <li><strong>Health protection:</strong> Processing of health data by health professionals in emergencies</li>
                <li><strong>Research by study bodies:</strong> Academic and statistical research</li>
                <li><strong>Protection of life:</strong> Broader than GDPR&apos;s &quot;vital interests&quot;</li>
            </ul>

            <h3>2. DPO for Everyone</h3>
            <p>
                Under GDPR, a DPO is required only in specific cases. Under LGPD, <strong>every data controller</strong> must
                appoint a DPO (&quot;encarregado&quot;). The ANPD may dispense small businesses from this obligation, but
                it hasn&apos;t broadly done so yet.
            </p>

            <h3>3. Lower Fines, But Growing Enforcement</h3>
            <p>
                LGPD fines are capped at <strong>R$50 million (~€8.5M)</strong> per violation, significantly lower than GDPR.
                However, the ANPD has been actively enforcing since 2023, and penalties include daily fines, public
                disclosure of violations, and data processing bans.
            </p>

            <h3>4. Cookie Consent</h3>
            <p>
                Unlike the EU&apos;s ePrivacy Directive, Brazil does <strong>not have a separate cookie law</strong>. However,
                cookies that process personal data fall under LGPD, meaning consent is still required for tracking cookies.
                Use a <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> that covers both GDPR and LGPD.
            </p>

            <h2>If You&apos;re Already GDPR Compliant, What Extra Steps for LGPD?</h2>
            <ol>
                <li><strong>Appoint a DPO</strong> (if you haven&apos;t already) — LGPD requires this for all controllers</li>
                <li><strong>Update your privacy policy</strong> to mention LGPD compliance and ANPD as the authority</li>
                <li><strong>Review your legal bases</strong> — some processing may have different legal bases under LGPD</li>
                <li><strong>Add Portuguese translation</strong> of your privacy policy and cookie notice</li>
                <li><strong>Prepare for ANPD requests</strong> — they can ask for Privacy Impact Reports at any time</li>
                <li><strong>Map data flows to/from Brazil</strong> and ensure adequate transfer mechanisms</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Does LGPD apply if my company is not in Brazil?</h3>
            <p>
                <strong>Yes.</strong> LGPD applies to any organization that processes data of individuals located in Brazil,
                or collects data in Brazil — regardless of where the organization is based. This mirrors GDPR&apos;s
                extraterritorial reach.
            </p>

            <h3>Can I use the same DPA for GDPR and LGPD?</h3>
            <p>
                You can include LGPD provisions in your existing DPA, but you should add specific references to LGPD
                articles and the 10 legal bases. Many companies use a single &quot;Global DPA&quot; that covers both.
            </p>

            <h3>Is Brazil considered adequate under GDPR?</h3>
            <p>
                Not yet. The EU has not granted Brazil an adequacy decision as of 2026. Data transfers from the EU to
                Brazil require Standard Contractual Clauses or other safeguards under GDPR Chapter V.
            </p>

            <h3>How do I check if my website complies with both GDPR and LGPD?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website for cookie compliance, consent banner
                implementation, privacy policy completeness, and third-party tracker detection. The same privacy
                standards apply to both regulations.
            </p>
        </ArticleLayout>
    );
}
