import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'cookie-banner-requirements-by-country')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Cookie consent rules vary dramatically around the world. The EU requires opt-in consent before any non-essential cookies.
                The US generally uses opt-out. Many countries have no specific cookie legislation at all. This guide maps the requirements
                for 30+ countries so you know exactly what to implement.
            </p>

            <h2>Global Cookie Consent Models</h2>
            <p>There are three main approaches to cookie regulation worldwide:</p>
            <ul>
                <li><strong>Opt-in (prior consent):</strong> No non-essential cookies until the user explicitly agrees. Used in the EU/EEA.</li>
                <li><strong>Opt-out (notice + choice):</strong> Cookies can load by default, but users must be able to opt out. Used in most US states.</li>
                <li><strong>No specific legislation:</strong> General data protection laws may apply, but no cookie-specific rules exist.</li>
            </ul>

            <h2>European Union / EEA — Opt-In Required</h2>
            <p>
                The ePrivacy Directive (2002/58/EC, amended by 2009/136/EC) requires prior consent for storing
                or accessing information on a user&apos;s device — except for &quot;strictly necessary&quot; cookies.
                Combined with GDPR, this creates the strictest cookie regime in the world.
            </p>
            <table>
                <thead>
                    <tr><th>Country</th><th>Model</th><th>Regulator</th><th>Key Requirement</th></tr>
                </thead>
                <tbody>
                    <tr><td>France</td><td>Opt-in</td><td>CNIL</td><td>Reject button same level as Accept; guidelines updated 2024</td></tr>
                    <tr><td>Germany</td><td>Opt-in</td><td>State DPAs</td><td>TTDSG requires consent; Planet49 ruling sets precedent</td></tr>
                    <tr><td>Italy</td><td>Opt-in</td><td>Garante</td><td>Cookie wall ban; scroll does not equal consent</td></tr>
                    <tr><td>Spain</td><td>Opt-in</td><td>AEPD</td><td>Cookie guide updated 2024; fines up to €20M</td></tr>
                    <tr><td>Netherlands</td><td>Opt-in</td><td>AP</td><td>Strict enforcement; cookie wall ban</td></tr>
                    <tr><td>Belgium</td><td>Opt-in</td><td>APD</td><td>IAB TCF ruling — consent framework found non-compliant</td></tr>
                    <tr><td>Austria</td><td>Opt-in</td><td>DSB</td><td>TKG 2021; Google Analytics rulings 2021-2022</td></tr>
                    <tr><td>Ireland</td><td>Opt-in</td><td>DPC</td><td>Hosts many Big Tech HQs; high-profile enforcement</td></tr>
                    <tr><td>Poland</td><td>Opt-in</td><td>UODO</td><td>Telecom law + GDPR; moderate enforcement</td></tr>
                    <tr><td>Sweden</td><td>Opt-in</td><td>IMY</td><td>Active enforcement; Google Analytics rulings</td></tr>
                </tbody>
            </table>
            <p>
                <strong>All 27 EU member states + EEA (Norway, Iceland, Liechtenstein) require opt-in consent.</strong> Variations exist in enforcement intensity
                and specific guidance, but the core requirement is the same.
            </p>

            <h2>United Kingdom — Opt-In (With Potential Relaxation)</h2>
            <p>
                The UK currently follows the EU approach under PECR (Privacy and Electronic Communications Regulations).
                The DPDI Act may relax consent requirements for analytics cookies, but as of 2026, the ICO still expects prior consent for non-essential cookies.
            </p>
            <ul>
                <li><strong>Model:</strong> Opt-in (PECR Regulation 6)</li>
                <li><strong>Regulator:</strong> ICO</li>
                <li><strong>Key point:</strong> The ICO has been lenient on enforcement but is expected to increase activity in 2026</li>
            </ul>

            <h2>United States — Mostly Opt-Out</h2>
            <p>
                The US has no federal cookie law. Requirements come from state privacy laws and the FTC Act:
            </p>
            <table>
                <thead>
                    <tr><th>State</th><th>Law</th><th>Cookie Requirement</th><th>GPC Required?</th></tr>
                </thead>
                <tbody>
                    <tr><td>California</td><td>CCPA/CPRA</td><td>Opt-out of sale/sharing; &quot;Do Not Sell&quot; link</td><td>Yes</td></tr>
                    <tr><td>Colorado</td><td>CPA</td><td>Opt-out of targeted advertising</td><td>Yes</td></tr>
                    <tr><td>Connecticut</td><td>CTDPA</td><td>Opt-out of targeted advertising</td><td>Yes</td></tr>
                    <tr><td>Virginia</td><td>VCDPA</td><td>Opt-out of targeted advertising</td><td>No</td></tr>
                    <tr><td>Texas</td><td>TDPSA</td><td>Opt-out of sale and profiling</td><td>Yes</td></tr>
                    <tr><td>Oregon</td><td>OCPA</td><td>Opt-out of targeted advertising</td><td>Yes</td></tr>
                    <tr><td>Montana</td><td>MCDPA</td><td>Opt-out of targeted advertising</td><td>Yes</td></tr>
                </tbody>
            </table>
            <p>
                For US compliance, you typically need a &quot;Do Not Sell/Share My Information&quot; link and must honor the
                <a href="/blog/global-privacy-control-gpc-guide">Global Privacy Control signal</a>.
            </p>

            <h2>Canada — Implied Consent Model</h2>
            <ul>
                <li><strong>Law:</strong> <a href="/blog/pipeda-canada-privacy-law">PIPEDA</a> + CASL (anti-spam law)</li>
                <li><strong>Model:</strong> Implied consent for non-essential cookies (with notification); express consent for marketing</li>
                <li><strong>Quebec:</strong> Quebec Law 25 (2023) requires express consent, closer to EU model</li>
            </ul>

            <h2>Brazil — General Consent Model</h2>
            <ul>
                <li><strong>Law:</strong> <a href="/blog/lgpd-vs-gdpr-brazil">LGPD</a></li>
                <li><strong>Model:</strong> Consent is one of 10 legal bases; legitimate interest can be used for analytics</li>
                <li><strong>Practice:</strong> Cookie banners are common but enforcement is still maturing</li>
            </ul>

            <h2>Asia-Pacific</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>Law</th><th>Cookie Model</th><th>Notes</th></tr>
                </thead>
                <tbody>
                    <tr><td>Japan</td><td>APPI</td><td>Opt-out (with 2022 amendments)</td><td>Cookie data = personal info when combinable</td></tr>
                    <tr><td>South Korea</td><td>PIPA + IT Network Act</td><td>Opt-in for marketing</td><td>Strict; similar to EU approach</td></tr>
                    <tr><td>China</td><td>PIPL</td><td>Consent for non-essential</td><td>Broad scope; separate consent for sensitive data</td></tr>
                    <tr><td>Australia</td><td>Privacy Act 1988</td><td>No specific cookie law</td><td>Proposed reforms may change this</td></tr>
                    <tr><td>India</td><td>DPDPA 2023</td><td>Consent-based</td><td>Still implementing; rules pending</td></tr>
                    <tr><td>Singapore</td><td>PDPA</td><td>Notification + opt-out</td><td>No specific cookie provisions</td></tr>
                    <tr><td>Thailand</td><td><a href="/blog/thailand-pdpa-vs-gdpr">PDPA</a></td><td>Consent for non-essential</td><td>Similar to GDPR approach</td></tr>
                </tbody>
            </table>

            <h2>Other Regions</h2>
            <table>
                <thead>
                    <tr><th>Country</th><th>Cookie Model</th><th>Notes</th></tr>
                </thead>
                <tbody>
                    <tr><td>Switzerland</td><td>Opt-in trending</td><td><a href="/blog/swiss-ndsg-compliance-guide">nDSG</a> + FDPIC guidance; move towards EU alignment</td></tr>
                    <tr><td>Turkey</td><td>Consent-based</td><td><a href="/blog/kvkk-turkey-privacy-law-guide">KVKK</a> 2024 amendments; explicit consent for cookies</td></tr>
                    <tr><td>South Africa</td><td>Consent for processing</td><td>POPIA; cookies processing personal info need consent</td></tr>
                    <tr><td>Israel</td><td>No specific law</td><td>General privacy law applies; minimal enforcement</td></tr>
                    <tr><td>UAE</td><td>No specific law</td><td>DIFC/ADGM have GDPR-like rules for free zones</td></tr>
                    <tr><td>Nigeria</td><td>Consent-based</td><td>NDPR requires consent for data processing</td></tr>
                </tbody>
            </table>

            <h2>Practical Recommendations</h2>
            <ul>
                <li><strong>Global audience:</strong> Default to EU opt-in model (strictest) to ensure compliance everywhere</li>
                <li><strong>US-only:</strong> Implement opt-out with &quot;Do Not Sell&quot; link + GPC support</li>
                <li><strong>EU + US:</strong> Use geo-targeted banners — opt-in for EU visitors, opt-out for US visitors</li>
                <li><strong>Use a CMP:</strong> A <a href="/blog/consent-management-platform-comparison">consent management platform</a> handles geo-targeting automatically</li>
                <li><strong>Document your approach:</strong> Record why you chose your consent model for each jurisdiction</li>
            </ul>

            <h2>Next Steps</h2>
            <p>
                Check if your current cookie banner meets the requirements for your audience&apos;s countries.
                <a href="/">PrivacyChecker</a> scans your <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> for compliance issues,
                detects all cookies on your site, and verifies that non-essential cookies don&apos;t load before consent.
            </p>
        </ArticleLayout>
    );
}
