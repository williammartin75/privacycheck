import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'us-state-privacy-laws-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> The US has no federal privacy law, but <strong>19 states</strong> have
                enacted comprehensive privacy legislation as of 2026. Beyond California&apos;s CCPA/CPRA, Virginia, Colorado,
                Connecticut, Utah, and many others now have active privacy laws — each with unique requirements. If your
                website serves US users, you likely need to comply with multiple state laws simultaneously.
            </p>

            <h2>The US Privacy Patchwork: What Happened?</h2>
            <p>
                In the absence of a federal privacy law, US states have been passing their own legislation at an
                accelerating pace. What started with California&apos;s CCPA in 2018 has become a patchwork of state-level
                laws that collectively cover a significant portion of the US population. For businesses, this means
                navigating different consent models, consumer rights, and enforcement mechanisms depending on where
                their users are located.
            </p>

            <h2>State Privacy Laws: Complete Comparison Table</h2>
            <table>
                <thead>
                    <tr><th>State</th><th>Law</th><th>Effective</th><th>Consent Model</th><th>Private Right of Action</th><th>Key Feature</th></tr>
                </thead>
                <tbody>
                    <tr><td>California</td><td>CCPA/CPRA</td><td>Jan 2020 / Jan 2023</td><td>Opt-out</td><td>Yes (data breaches)</td><td>Broadest scope; CPPA enforcement</td></tr>
                    <tr><td>Virginia</td><td>VCDPA</td><td>Jan 2023</td><td>Opt-out</td><td>No</td><td>GDPR-inspired; no private right of action</td></tr>
                    <tr><td>Colorado</td><td>CPA</td><td>Jul 2023</td><td>Opt-out</td><td>No</td><td>Universal opt-out mechanism required</td></tr>
                    <tr><td>Connecticut</td><td>CTDPA</td><td>Jul 2023</td><td>Opt-out</td><td>No</td><td>Covers loyalty programs; AG enforcement</td></tr>
                    <tr><td>Utah</td><td>UCPA</td><td>Dec 2023</td><td>Opt-out</td><td>No</td><td>Most business-friendly; high thresholds</td></tr>
                    <tr><td>Texas</td><td>TDPSA</td><td>Jul 2024</td><td>Opt-out</td><td>No</td><td>No revenue threshold; applies broadly</td></tr>
                    <tr><td>Oregon</td><td>OCPA</td><td>Jul 2024</td><td>Opt-out</td><td>No</td><td>Covers nonprofits; employee data included</td></tr>
                    <tr><td>Montana</td><td>MCDPA</td><td>Oct 2024</td><td>Opt-out</td><td>No</td><td>Lowest threshold: 50K consumers</td></tr>
                    <tr><td>Iowa</td><td>ICDPA</td><td>Jan 2025</td><td>Opt-out</td><td>No</td><td>90-day cure period</td></tr>
                    <tr><td>Delaware</td><td>DPDPA</td><td>Jan 2025</td><td>Opt-out</td><td>No</td><td>Lowest threshold tied to data volume</td></tr>
                    <tr><td>New Hampshire</td><td>NHPA</td><td>Jan 2025</td><td>Opt-out</td><td>No</td><td>Modelled after Connecticut CTDPA</td></tr>
                    <tr><td>New Jersey</td><td>NJDPA</td><td>Jan 2025</td><td>Opt-out</td><td>No</td><td>Broad definition of &quot;sale&quot;</td></tr>
                    <tr><td>Nebraska</td><td>NDPA</td><td>Jan 2025</td><td>Opt-out</td><td>No</td><td>No revenue/consumer threshold</td></tr>
                    <tr><td>Tennessee</td><td>TIPA</td><td>Jul 2025</td><td>Opt-out</td><td>No</td><td>Affirmative defense for privacy programs</td></tr>
                    <tr><td>Minnesota</td><td>MPDPA</td><td>Jul 2025</td><td>Opt-out</td><td>No</td><td>Includes profiling transparency</td></tr>
                    <tr><td>Maryland</td><td>MODPA</td><td>Oct 2025</td><td>Opt-in for sensitive</td><td>No</td><td>Strictest: requires data minimization by default</td></tr>
                    <tr><td>Indiana</td><td>INCDPA</td><td>Jan 2026</td><td>Opt-out</td><td>No</td><td>Standard VCDPA-style law</td></tr>
                    <tr><td>Kentucky</td><td>KCDPA</td><td>Jan 2026</td><td>Opt-out</td><td>No</td><td>60-day cure period</td></tr>
                    <tr><td>Rhode Island</td><td>RIDPA</td><td>Jan 2026</td><td>Opt-out</td><td>No</td><td>Broad scope, includes small businesses</td></tr>
                </tbody>
            </table>

            <h2>What These Laws Have in Common</h2>
            <p>
                Despite differences, most US state privacy laws share a common DNA inspired by the CCPA and VCDPA:
            </p>
            <ul>
                <li><strong>Opt-Out for Targeted Advertising:</strong> All laws require a mechanism for consumers to opt out of targeted ads and the &quot;sale&quot; of personal data</li>
                <li><strong>Right to Access:</strong> Consumers can request a copy of their personal data</li>
                <li><strong>Right to Delete:</strong> Consumers can request deletion of their data</li>
                <li><strong>Right to Correct:</strong> Most laws include a correction right</li>
                <li><strong>Non-Discrimination:</strong> Businesses cannot discriminate against consumers who exercise their rights</li>
                <li><strong>Privacy Policy:</strong> All require a publicly available privacy policy disclosing data practices</li>
                <li><strong>Data Protection Assessments:</strong> Required for high-risk processing (targeted ads, profiling, sensitive data)</li>
            </ul>

            <h2>Key Differences That Matter</h2>

            <h3>1. Applicability Thresholds</h3>
            <p>
                Each state defines different thresholds for which businesses must comply:
            </p>
            <ul>
                <li><strong>California (CCPA):</strong> $25M revenue, OR 100K consumers, OR 50%+ revenue from selling data</li>
                <li><strong>Virginia (VCDPA):</strong> 100K consumers OR 25K consumers + 50%+ revenue from data sales</li>
                <li><strong>Texas (TDPSA):</strong> No revenue threshold — applies to any business not classified as &quot;small&quot;</li>
                <li><strong>Nebraska (NDPA):</strong> No threshold at all — applies to all businesses handling personal data</li>
                <li><strong>Montana (MCDPA):</strong> Just 50K consumers — the lowest consumer threshold</li>
            </ul>

            <h3>2. Sensitive Data: Opt-In vs Opt-Out</h3>
            <p>
                Sensitive data handling is where the biggest divergence occurs:
            </p>
            <ul>
                <li><strong>Opt-in consent required:</strong> Virginia, Colorado, Connecticut, Oregon, Maryland, Minnesota, and most newer laws</li>
                <li><strong>Opt-out sufficient:</strong> Utah, Iowa (more business-friendly approach)</li>
                <li><strong>California:</strong> Consumer can limit use of sensitive data but initial processing is allowed without prior opt-in</li>
            </ul>
            <p>
                <strong>Sensitive data</strong> typically includes: race, ethnicity, religion, health data, sexual orientation,
                citizenship status, genetic/biometric data, precise geolocation, and children&apos;s data.
            </p>

            <h3>3. Universal Opt-Out Mechanisms</h3>
            <p>
                Several states now require businesses to honor <strong>browser-based opt-out signals</strong> like the
                Global Privacy Control (GPC):
            </p>
            <ul>
                <li><strong>Required:</strong> California, Colorado, Connecticut, Texas, Montana, Delaware, Oregon, Minnesota, Maryland, Nebraska</li>
                <li><strong>Not required:</strong> Virginia, Utah, Iowa, Indiana, Kentucky</li>
            </ul>
            <p>
                This means your <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> and consent management
                platform should detect and respect GPC signals. Check with our
                <a href="/blog/consent-management-platform-comparison">CMP comparison guide</a> if your CMP supports this.
            </p>

            <h3>4. Cure Periods</h3>
            <p>
                Some states give businesses time to fix violations before facing penalties:
            </p>
            <ul>
                <li><strong>No cure period:</strong> California (CPRA), Colorado (after Jan 2025)</li>
                <li><strong>30 days:</strong> Virginia, Connecticut, Texas, Oregon, Montana, Delaware</li>
                <li><strong>60 days:</strong> Kentucky, New Hampshire</li>
                <li><strong>90 days:</strong> Iowa (most generous)</li>
            </ul>

            <h2>How US State Laws Compare to GDPR</h2>
            <table>
                <thead>
                    <tr><th>Feature</th><th>GDPR</th><th>US State Laws (Typical)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Consent Model</td><td>Opt-in by default</td><td>Opt-out (except for sensitive data)</td></tr>
                    <tr><td>Scope</td><td>All data processing</td><td>Usually above revenue/consumer thresholds</td></tr>
                    <tr><td>DPO Required</td><td>In certain cases</td><td>Not required by any state</td></tr>
                    <tr><td>Fines</td><td>Up to €20M or 4% of revenue</td><td>Typically $7,500–$25,000 per violation</td></tr>
                    <tr><td>Enforcement</td><td>Data Protection Authorities</td><td>State Attorney General (most states)</td></tr>
                    <tr><td>Cookie Consent</td><td>Prior opt-in consent</td><td>Opt-out for targeted advertising</td></tr>
                    <tr><td>Data Portability</td><td>Yes</td><td>Most states include this right</td></tr>
                    <tr><td>Right to Delete</td><td>Yes</td><td>Yes (all states)</td></tr>
                </tbody>
            </table>

            <h2>Practical Compliance Strategy</h2>
            <p>
                Given the patchwork nature of US state laws, the most practical approach is to <strong>comply with the
                    strictest standard</strong> and apply it nationally:
            </p>
            <ol>
                <li><strong>Implement a universal opt-out mechanism</strong> that honors GPC signals (covers California, Colorado, Texas, and all states trending this way)</li>
                <li><strong>Get opt-in consent for sensitive data</strong> (covers Virginia, Colorado, Connecticut, Maryland, and the majority of states)</li>
                <li><strong>Publish a comprehensive privacy policy</strong> disclosing data practices, consumer rights by state, and categories of data sold/shared</li>
                <li><strong>Add a &quot;Do Not Sell My Personal Information&quot; link</strong> visible on your homepage (required by CCPA, expected by most states)</li>
                <li><strong>Implement data access and deletion workflows</strong> — standardize across all states</li>
                <li><strong>Conduct data protection assessments</strong> for targeted advertising and profiling activities</li>
                <li><strong>Audit third-party vendors</strong> — use our <a href="/blog/vendor-risk-assessment-gdpr">vendor risk assessment guide</a> to ensure your data processors comply</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>Do US state privacy laws apply to my website if I&apos;m based in Europe?</h3>
            <p>
                <strong>Yes.</strong> These laws apply based on where the <strong>consumer</strong> is located, not where
                the business is based. If your website processes data of residents in any of these states, the corresponding
                law applies. This is similar to GDPR&apos;s extraterritorial scope.
            </p>

            <h3>Is a federal US privacy law coming?</h3>
            <p>
                The <strong>American Privacy Rights Act (APRA)</strong> has been proposed multiple times but has not passed
                as of 2026. Until a federal law is enacted, the state-level patchwork will continue to grow. Preparing for
                the strictest state standards is the safest strategy.
            </p>

            <h3>What is Global Privacy Control (GPC)?</h3>
            <p>
                GPC is a <strong>browser signal</strong> (similar to Do Not Track, but legally binding in some states) that
                tells websites the user does not want their data sold or shared. California, Colorado, and Texas explicitly
                require honoring GPC. It is implemented in Firefox, Brave, and DuckDuckGo by default.
            </p>

            <h3>How do I know which state laws apply to my website?</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to scan your website. It detects cookies, trackers, consent mechanisms,
                and third-party data sharing practices, helping you identify compliance gaps across all applicable
                regulations — including US state laws.
            </p>
        </ArticleLayout>
    );
}
