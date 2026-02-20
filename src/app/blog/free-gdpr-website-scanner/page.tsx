import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'free-gdpr-website-scanner')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> A GDPR website scanner analyzes your site for privacy compliance
                issues &mdash; from cookie consent banners and privacy policies to tracking scripts and security
                headers. With PrivacyChecker&apos;s free tool, you get a full compliance report in under 60 seconds.
            </p>

            <h2>Why You Need a GDPR Website Scanner</h2>
            <p>
                Since the GDPR came into force in May 2018, every organization processing personal data of
                EU residents must comply with strict data protection rules. This applies to <strong>every
                    website owner</strong> &mdash; from solo entrepreneurs to multinationals.
            </p>
            <p>
                Most websites unknowingly violate the GDPR. The most common issues include:
            </p>
            <ul>
                <li>Missing or broken <strong>cookie consent banners</strong></li>
                <li>Incomplete or outdated <strong>privacy policies</strong></li>
                <li>Tracking without consent (Google Analytics, Facebook Pixel)</li>
                <li>Missing <strong>SSL/TLS encryption</strong> (no HTTPS)</li>
                <li>External resources like Google Fonts loaded without consent</li>
                <li>No <strong>Data Protection Officer (DPO)</strong> contact listed</li>
            </ul>

            <h2>GDPR Fines: The Financial Risk</h2>
            <p>
                Data protection authorities across Europe are actively enforcing the GDPR. The potential
                penalties are significant:
            </p>
            <table>
                <thead>
                    <tr><th>Violation</th><th>Maximum Fine</th><th>Example</th></tr>
                </thead>
                <tbody>
                    <tr><td>Severe (Art. 83(5))</td><td>&euro;20M or 4% of annual revenue</td><td>No legal basis for data processing</td></tr>
                    <tr><td>Less severe (Art. 83(4))</td><td>&euro;10M or 2% of annual revenue</td><td>Missing technical measures</td></tr>
                    <tr><td>Google Fonts CDN (Munich ruling)</td><td>&euro;100 per page view</td><td>IP transfer to Google without consent</td></tr>
                    <tr><td>Missing cookie banner</td><td>Up to &euro;300,000</td><td>CNIL/DPA enforcement actions</td></tr>
                </tbody>
            </table>

            <h2>What Does a GDPR Scanner Check?</h2>
            <p>
                A comprehensive GDPR website scanner analyzes your site across multiple categories:
            </p>

            <h3>1. Cookie Analysis</h3>
            <ul>
                <li>Which cookies are set? (First-party, third-party)</li>
                <li>Are cookies set <strong>before consent</strong> is given?</li>
                <li>Are all cookies declared in the privacy policy?</li>
                <li>Do cookie lifetimes comply with guidelines (max. 13 months)?</li>
            </ul>

            <h3>2. Consent Banner Check</h3>
            <ul>
                <li>Is a cookie consent banner present?</li>
                <li>Does it offer a genuine <strong>reject option</strong> (not just &quot;Accept&quot;)?</li>
                <li>Are <strong>dark patterns</strong> used (e.g., highlighted accept button)?</li>
                <li>Does the reject button actually work technically?</li>
            </ul>

            <h3>3. Privacy Policy</h3>
            <ul>
                <li>Is a privacy policy present and complete?</li>
                <li>Does it contain all <strong>mandatory disclosures under Art. 13 GDPR</strong>?</li>
                <li>Is a Data Protection Officer listed?</li>
                <li>Are third-country transfer details up to date?</li>
            </ul>

            <h3>4. Security Check</h3>
            <ul>
                <li><strong>HTTPS/SSL:</strong> Is the connection encrypted?</li>
                <li><strong>HSTS:</strong> Is HTTP Strict Transport Security enabled?</li>
                <li><strong>Security Headers:</strong> Content-Security-Policy, X-Frame-Options, etc.</li>
                <li><strong>SPF/DKIM/DMARC:</strong> Email authentication configured?</li>
            </ul>

            <h3>5. Trackers &amp; External Services</h3>
            <ul>
                <li>Which <strong>third-party trackers</strong> are embedded?</li>
                <li>Are Google Analytics, Facebook Pixel, or similar loaded before consent?</li>
                <li>Are <strong>Google Fonts</strong> loaded via CDN (IP transfer issue)?</li>
                <li>Are external resources loaded without consent?</li>
            </ul>

            <h2>How to Run a GDPR Scan in 3 Steps</h2>
            <ol>
                <li><strong>Enter your URL:</strong> Type your domain on <a href="/">privacychecker.pro</a></li>
                <li><strong>Automatic analysis:</strong> Our scanner checks up to 200 pages for GDPR violations</li>
                <li><strong>Get your report:</strong> Receive a detailed compliance score with actionable recommendations</li>
            </ol>

            <h2>Most Common GDPR Violations Found on Websites</h2>
            <table>
                <thead>
                    <tr><th>Rank</th><th>Violation</th><th>Frequency</th><th>Risk Level</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Tracking without consent</td><td>67% of websites</td><td>High</td></tr>
                    <tr><td>2</td><td>No proper cookie banner</td><td>58%</td><td>High</td></tr>
                    <tr><td>3</td><td>Google Fonts via CDN</td><td>43%</td><td>Medium</td></tr>
                    <tr><td>4</td><td>Incomplete privacy policy</td><td>41%</td><td>Medium</td></tr>
                    <tr><td>5</td><td>Missing SSL encryption</td><td>12%</td><td>Critical</td></tr>
                </tbody>
            </table>

            <h2>Free vs Pro GDPR Scanner</h2>
            <table>
                <thead>
                    <tr><th>Feature</th><th>Free</th><th>Pro</th><th>Pro+</th></tr>
                </thead>
                <tbody>
                    <tr><td>Pages scanned</td><td>20</td><td>100</td><td>200</td></tr>
                    <tr><td>Cookie analysis</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Tracker detection</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Security headers</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Dark pattern detection</td><td>Limited</td><td>Full</td><td>Full</td></tr>
                    <tr><td>Domain risk analysis</td><td>&mdash;</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Email security check</td><td>&mdash;</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>PDF export</td><td>&mdash;</td><td>Yes</td><td>Yes</td></tr>
                    <tr><td>Supply chain analysis</td><td>&mdash;</td><td>&mdash;</td><td>Yes</td></tr>
                    <tr><td>Fine risk estimate</td><td>&mdash;</td><td>&mdash;</td><td>Yes</td></tr>
                </tbody>
            </table>

            <h2>After the Scan: Priority Actions</h2>
            <p>
                Your GDPR scan results show exactly where action is needed.
                Prioritize fixes by risk level:
            </p>
            <ol>
                <li><strong>Critical:</strong> Enable HTTPS, stop tracking without consent</li>
                <li><strong>High:</strong> Fix cookie banner, complete privacy policy</li>
                <li><strong>Medium:</strong> Self-host Google Fonts, configure security headers</li>
                <li><strong>Low:</strong> Optimize cookie lifetimes, review meta tags</li>
            </ol>

            <h2>Frequently Asked Questions</h2>

            <h3>How often should I run a GDPR scan?</h3>
            <p>
                At least <strong>quarterly</strong> or after any change to your website. New plugins,
                marketing tools, or CMS updates can silently introduce new trackers. With PrivacyChecker
                Pro, you can set up automatic monthly scans.
            </p>

            <h3>Does the GDPR apply to small businesses?</h3>
            <p>
                <strong>Yes.</strong> The GDPR applies to all organizations processing personal data of
                EU residents &mdash; regardless of company size. Even a sole trader with a simple website
                must comply with the GDPR.
            </p>

            <h3>What is the difference between GDPR and national privacy laws?</h3>
            <p>
                The GDPR is the EU-wide regulation that applies directly in all member states. National
                laws like Germany&apos;s BDSG or France&apos;s Loi Informatique et Libert&eacute;s supplement
                the GDPR with country-specific rules &mdash; for example, Germany requires a Data Protection
                Officer when 20 or more employees regularly process personal data.
            </p>
        </ArticleLayout>
    );
}
