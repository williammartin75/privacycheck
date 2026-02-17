import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'gdpr-fines-database-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Since GDPR enforcement began in May 2018, data protection authorities across Europe have issued over €5 billion in fines.
                This page compiles the most significant GDPR fines, organized by amount, country, and violated article. Use it to understand
                enforcement patterns and avoid the mistakes that cost these companies millions.
            </p>

            <h2>Top 10 Largest GDPR Fines Ever</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Company</th><th>Amount</th><th>Country</th><th>Year</th><th>Violation</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Meta (Facebook)</td><td>€1.2 billion</td><td>Ireland</td><td>2023</td><td>Illegal EU-US data transfers</td></tr>
                    <tr><td>2</td><td>Amazon</td><td>€746 million</td><td>Luxembourg</td><td>2021</td><td>Targeted advertising without consent</td></tr>
                    <tr><td>3</td><td>Meta (Instagram)</td><td>€405 million</td><td>Ireland</td><td>2022</td><td>Children&apos;s data processing</td></tr>
                    <tr><td>4</td><td>Meta (Facebook)</td><td>€390 million</td><td>Ireland</td><td>2023</td><td>Forced consent for personalized ads</td></tr>
                    <tr><td>5</td><td>Meta (WhatsApp)</td><td>€225 million</td><td>Ireland</td><td>2021</td><td>Transparency failures</td></tr>
                    <tr><td>6</td><td>Google Ireland</td><td>€150 million</td><td>France</td><td>2022</td><td>Cookie consent violations</td></tr>
                    <tr><td>7</td><td>TikTok</td><td>€345 million</td><td>Ireland</td><td>2023</td><td>Children&apos;s data processing</td></tr>
                    <tr><td>8</td><td>Criteo</td><td>€40 million</td><td>France</td><td>2023</td><td>Consent for ad tracking</td></tr>
                    <tr><td>9</td><td>Clearview AI</td><td>€20 million</td><td>Italy</td><td>2022</td><td>Biometric data scraping</td></tr>
                    <tr><td>10</td><td>H&amp;M</td><td>€35 million</td><td>Germany</td><td>2020</td><td>Employee surveillance</td></tr>
                </tbody>
            </table>

            <h2>GDPR Fines by Violation Category</h2>
            <p>
                Understanding which GDPR articles trigger the most fines helps you prioritize your compliance efforts:
            </p>
            <table>
                <thead>
                    <tr><th>Violation Category</th><th>GDPR Articles</th><th>% of Total Fines</th><th>Typical Fine Range</th></tr>
                </thead>
                <tbody>
                    <tr><td>Insufficient legal basis</td><td>Art. 6</td><td>30%</td><td>€10K - €746M</td></tr>
                    <tr><td>Data processing principles</td><td>Art. 5</td><td>25%</td><td>€5K - €1.2B</td></tr>
                    <tr><td>Transparency failures</td><td>Art. 13, 14</td><td>20%</td><td>€1K - €225M</td></tr>
                    <tr><td>Security measures</td><td>Art. 32</td><td>15%</td><td>€2K - €50M</td></tr>
                    <tr><td>Data subject rights</td><td>Art. 15-22</td><td>10%</td><td>€500 - €20M</td></tr>
                    <tr><td>International transfers</td><td>Art. 44-49</td><td>5%</td><td>€10K - €1.2B</td></tr>
                </tbody>
            </table>

            <h2>GDPR Fines by Country</h2>
            <p>
                Enforcement activity varies significantly across EU member states:
            </p>
            <table>
                <thead>
                    <tr><th>Country</th><th>DPA</th><th>Total Fines</th><th>Number of Fines</th><th>Enforcement Style</th></tr>
                </thead>
                <tbody>
                    <tr><td>Ireland</td><td>DPC</td><td>€2.8B+</td><td>25+</td><td>Big Tech focused (Meta, TikTok, LinkedIn)</td></tr>
                    <tr><td>Luxembourg</td><td>CNPD</td><td>€746M+</td><td>5+</td><td>Amazon-dominated</td></tr>
                    <tr><td>France</td><td>CNIL</td><td>€500M+</td><td>50+</td><td>Cookie consent enforcement leader</td></tr>
                    <tr><td>Italy</td><td>Garante</td><td>€150M+</td><td>200+</td><td>High volume, diverse targets</td></tr>
                    <tr><td>Spain</td><td>AEPD</td><td>€80M+</td><td>600+</td><td>Highest volume; small-medium fines</td></tr>
                    <tr><td>Germany</td><td>State DPAs</td><td>€100M+</td><td>100+</td><td>Employee data focus (16 state DPAs)</td></tr>
                    <tr><td>Sweden</td><td>IMY</td><td>€30M+</td><td>20+</td><td>Google Analytics rulings</td></tr>
                    <tr><td>Austria</td><td>DSB</td><td>€20M+</td><td>15+</td><td>Google Analytics transfer rulings</td></tr>
                    <tr><td>Belgium</td><td>APD</td><td>€15M+</td><td>30+</td><td>IAB TCF ruling</td></tr>
                    <tr><td>Norway</td><td>Datatilsynet</td><td>€12M+</td><td>15+</td><td>Meta behavioral advertising</td></tr>
                </tbody>
            </table>

            <h2>Key Enforcement Trends 2025-2026</h2>

            <h2>1. Cookie Consent Is the #1 Trigger for SMB Fines</h2>
            <p>
                The CNIL alone has issued dozens of fines for <a href="/blog/cookie-consent-banner-guide">cookie consent</a> violations. Common issues:
                loading trackers before consent, missing reject button, pre-checked boxes, and cookie walls.
            </p>

            <h2>2. Children&apos;s Data Is a Top Priority</h2>
            <p>
                TikTok (€345M), Instagram (€405M), and YouTube (€170M FTC fine) show that <a href="/blog/age-verification-compliance-guide">children&apos;s privacy</a> violations
                trigger the largest fines after data transfers.
            </p>

            <h2>3. Google Analytics Transfers Triggered EU-Wide Action</h2>
            <p>
                Following Schrems II, DPAs in Austria, France, Italy, and Sweden ruled that using
                <a href="/blog/google-analytics-4-gdpr-legal">Google Analytics</a> violated GDPR due to US data transfers.
                These rulings affected thousands of businesses.
            </p>

            <h2>4. AI and Automated Decision-Making Are Emerging</h2>
            <p>
                Clearview AI received fines in Italy (€20M), Greece (€20M), France (€20M), and the UK (£7.5M) for
                scraping facial images for <a href="/blog/gdpr-ai-compliance-guide">AI training</a> without consent.
            </p>

            <h2>5. Employee Surveillance Remains a Hot Topic</h2>
            <p>
                H&amp;M (€35M, Germany) and Amazon (€32M, France) were fined for excessive employee monitoring.
                GDPR applies to employee data, not just customer data.
            </p>

            <h2>GDPR Fine Tiers</h2>
            <p>GDPR specifies two tiers of maximum fines:</p>
            <table>
                <thead>
                    <tr><th>Tier</th><th>Maximum Fine</th><th>Applies To</th></tr>
                </thead>
                <tbody>
                    <tr><td>Lower tier</td><td>€10M or 2% of global annual revenue</td><td>Technical/organisational violations (Art. 8, 11, 25-39, 42-43)</td></tr>
                    <tr><td>Upper tier</td><td>€20M or 4% of global annual revenue</td><td>Core principles, consent, data subject rights, international transfers (Art. 5-7, 9, 12-22, 44-49)</td></tr>
                </tbody>
            </table>
            <p>
                The higher amount applies. For a company with €500M annual revenue, the upper tier maximum is €20 million
                (not 4% of revenue, since €20M &gt; €20M).
            </p>

            <h2>How to Avoid Fines: Priority Checklist</h2>
            <ul>
                <li><strong>Cookie consent:</strong> Implement proper opt-in with reject button (<a href="/blog/do-you-need-a-cookie-banner">check if you need one</a>)</li>
                <li><strong>Privacy policy:</strong> Include all <a href="/blog/gdpr-privacy-policy-template">12 required sections</a></li>
                <li><strong>Data transfers:</strong> Document transfers and <a href="/blog/transfer-impact-assessment-template">conduct TIAs</a></li>
                <li><strong>Security:</strong> Implement <a href="/blog/website-security-headers-guide">security headers</a> and encryption</li>
                <li><strong>Data subject rights:</strong> Provide clear mechanisms for <a href="/blog/gdpr-data-subject-rights-guide">exercising rights</a></li>
                <li><strong>Third-party vendors:</strong> Sign <a href="/blog/vendor-risk-assessment-gdpr">DPAs with all processors</a></li>
                <li><strong>Children&apos;s data:</strong> Implement <a href="/blog/age-verification-compliance-guide">age verification</a> if applicable</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Don&apos;t wait for enforcement — proactively check your compliance. <a href="/">PrivacyChecker</a> scans your website against
                the most commonly fined violations: cookie consent, privacy policy completeness, security headers,
                third-party trackers, and more. Run a <a href="/blog/free-gdpr-compliance-checker">free scan</a> in 60 seconds.
            </p>
        </ArticleLayout>
    );
}
