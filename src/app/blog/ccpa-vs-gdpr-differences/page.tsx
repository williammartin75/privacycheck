import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'ccpa-vs-gdpr-differences')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                If your website has visitors from both Europe and California, you need to comply with both GDPR and CCPA.
                While they share the same goal — protecting personal data — their approach, scope, and requirements differ significantly.
                Understanding these differences is critical for building a compliance strategy that works worldwide.
            </p>

            <h2>Scope: Who Must Comply?</h2>
            <table>
                <thead>
                    <tr><th>Criteria</th><th>GDPR</th><th>CCPA</th></tr>
                </thead>
                <tbody>
                    <tr><td>Geography</td><td>EU/EEA residents</td><td>California residents</td></tr>
                    <tr><td>Who it applies to</td><td>Any organization processing EU resident data, regardless of size</td><td>Businesses with $25M+ revenue, 100k+ consumers, or 50%+ revenue from selling data</td></tr>
                    <tr><td>Type of data</td><td>Any personal data (name, IP, cookies, etc.)</td><td>Personal information linked to a consumer or household</td></tr>
                    <tr><td>Small business exempt?</td><td>No — applies to all</td><td>Yes — thresholds must be met</td></tr>
                </tbody>
            </table>

            <h2>Consent Model: Opt-In vs Opt-Out</h2>
            <p>This is the most fundamental difference between the two laws:</p>
            <ul>
                <li><strong>GDPR</strong> requires <strong>opt-in consent</strong> — you cannot process personal data (including setting cookies) until the user explicitly agrees. No pre-checked boxes. No tracking before consent.</li>
                <li><strong>CCPA</strong> follows an <strong>opt-out model</strong> — you can collect and use data by default, but you must provide a &quot;Do Not Sell My Personal Information&quot; link and honor opt-out requests.</li>
            </ul>
            <p>
                In practice, if you comply with GDPR&apos;s stricter opt-in model, you&apos;re largely covered for CCPA as well.
                But CCPA has specific requirements (like the &quot;Do Not Sell&quot; link) that GDPR doesn&apos;t address.
            </p>

            <h2>User Rights Comparison</h2>
            <table>
                <thead>
                    <tr><th>Right</th><th>GDPR</th><th>CCPA</th></tr>
                </thead>
                <tbody>
                    <tr><td>Right to know/access</td><td>Yes (Art. 15)</td><td>Yes</td></tr>
                    <tr><td>Right to delete</td><td>Yes (Art. 17)</td><td>Yes</td></tr>
                    <tr><td>Right to data portability</td><td>Yes (Art. 20)</td><td>Yes</td></tr>
                    <tr><td>Right to rectify</td><td>Yes (Art. 16)</td><td>No</td></tr>
                    <tr><td>Right to restrict processing</td><td>Yes (Art. 18)</td><td>No</td></tr>
                    <tr><td>Right to object</td><td>Yes (Art. 21)</td><td>Opt-out of sale only</td></tr>
                    <tr><td>Right against automated decisions</td><td>Yes (Art. 22)</td><td>No</td></tr>
                    <tr><td>Non-discrimination</td><td>Implied</td><td>Explicit protected right</td></tr>
                </tbody>
            </table>

            <h2>Penalties and Enforcement</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>GDPR</th><th>CCPA</th></tr>
                </thead>
                <tbody>
                    <tr><td>Maximum fine</td><td>€20M or 4% of global revenue</td><td>$7,500 per intentional violation</td></tr>
                    <tr><td>Enforced by</td><td>National Data Protection Authorities</td><td>California Attorney General</td></tr>
                    <tr><td>Private right of action</td><td>Yes (limited)</td><td>Yes (for data breaches)</td></tr>
                    <tr><td>Cure period</td><td>No automatic cure</td><td>30 days to fix after notice</td></tr>
                </tbody>
            </table>
            <p>
                While CCPA fines are lower per violation, they can add up quickly with thousands of affected consumers.
                GDPR fines are percentage-based and have proven devastating — Meta received a €1.2B fine in 2023.
            </p>

            <h2>Cookie and Tracker Requirements</h2>
            <p>
                GDPR is much stricter on cookies. Under GDPR, you need consent before loading any non-essential cookies.
                Under CCPA, cookies are considered &quot;selling&quot; data only if they&apos;re used for targeted advertising and involve a third party.
            </p>
            <p>
                Our <a href="/blog/cookie-consent-banner-guide">cookie consent banner guide</a> explains
                how to implement a banner that satisfies both regulations simultaneously.
            </p>

            <h2>Privacy Policy Differences</h2>
            <p>Both laws require a privacy policy, but the specific disclosures differ:</p>
            <ul>
                <li><strong>GDPR</strong>: Legal basis for processing, DPO contact, international transfers, right to lodge a complaint</li>
                <li><strong>CCPA</strong>: Categories of data collected, purpose of collection, third parties data is shared with, &quot;Do Not Sell&quot; instructions</li>
            </ul>
            <p>A combined privacy policy that covers both is the most practical approach for most businesses.</p>

            <h2>What About CPRA?</h2>
            <p>
                The California Privacy Rights Act (CPRA) amended CCPA in 2023, adding new requirements:
            </p>
            <ul>
                <li>Right to correct personal information (similar to GDPR&apos;s right to rectification)</li>
                <li>Right to limit use of sensitive personal information</li>
                <li>Data minimization and purpose limitation principles</li>
                <li>New enforcement agency: California Privacy Protection Agency (CPPA)</li>
            </ul>
            <p>CPRA makes CCPA more GDPR-like, narrowing the gap between the two regulations.</p>

            <h2>Practical Compliance Strategy</h2>
            <p>If you need to comply with both laws, here&apos;s the most efficient approach:</p>
            <ol>
                <li>Implement GDPR-level consent (opt-in) — this covers CCPA&apos;s opt-out requirement automatically</li>
                <li>Add a &quot;Do Not Sell My Information&quot; link for CCPA compliance</li>
                <li>Write a unified privacy policy with sections for both jurisdictions</li>
                <li>Set up data subject request mechanisms that handle both GDPR and CCPA rights</li>
                <li>Run a <a href="/">compliance audit</a> to identify gaps across both regulations</li>
            </ol>

            <h2>Quick Decision Guide</h2>
            <table>
                <thead>
                    <tr><th>Your Situation</th><th>What You Need</th></tr>
                </thead>
                <tbody>
                    <tr><td>EU visitors only</td><td>GDPR compliance</td></tr>
                    <tr><td>California visitors only</td><td>CCPA compliance</td></tr>
                    <tr><td>Both EU and US visitors</td><td>Both GDPR + CCPA (implement GDPR-level consent)</td></tr>
                    <tr><td>Global audience</td><td>GDPR as baseline + region-specific additions</td></tr>
                </tbody>
            </table>

            <p>
                Not sure which regulations apply to your website? <a href="/">PrivacyChecker</a> automatically detects
                which laws are relevant based on your visitors and technology stack, and shows you exactly what to fix.
            </p>
        </ArticleLayout>
    );
}
