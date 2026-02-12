import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'vendor-risk-assessment-gdpr')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Under GDPR Article 28, you are responsible for every third-party processor that handles personal data on your behalf.
                If a vendor you use suffers a data breach, <strong>you</strong> must notify the supervisory authority and affected individuals.
                A proper vendor risk assessment isn&apos;t optional — it&apos;s a core GDPR requirement.
            </p>

            <h2>What Is a Vendor Risk Assessment?</h2>
            <p>
                A vendor risk assessment evaluates the data protection practices of third-party services that process
                personal data on your behalf. This includes your hosting provider, analytics service, CRM, email platform,
                payment processor, chat widget, and any other service that touches user data.
            </p>

            <h2>Which Vendors Need Assessment?</h2>
            <p>Any third-party that processes personal data from your users needs evaluation. Common categories:</p>
            <table>
                <thead>
                    <tr><th>Category</th><th>Examples</th><th>Data Processed</th></tr>
                </thead>
                <tbody>
                    <tr><td>Hosting</td><td>AWS, Vercel, Cloudflare</td><td>IP addresses, access logs, all site data</td></tr>
                    <tr><td>Analytics</td><td>Google Analytics, Mixpanel, Hotjar</td><td>Page views, behavior, demographics</td></tr>
                    <tr><td>Email</td><td>SendGrid, Mailchimp, Postmark</td><td>Email addresses, engagement data</td></tr>
                    <tr><td>Payments</td><td>Stripe, PayPal, Adyen</td><td>Payment details, billing addresses</td></tr>
                    <tr><td>Chat</td><td>Intercom, Crisp, Zendesk</td><td>Names, emails, conversation content</td></tr>
                    <tr><td>Advertising</td><td>Google Ads, Meta Pixel, LinkedIn</td><td>Browsing behavior, conversion events</td></tr>
                    <tr><td>CDN</td><td>Cloudflare, Fastly, Akamai</td><td>IP addresses, geo-location data</td></tr>
                    <tr><td>CRM</td><td>HubSpot, Salesforce, Pipedrive</td><td>Contact info, interaction history</td></tr>
                </tbody>
            </table>

            <h2>The Assessment Framework</h2>
            <p>For each vendor, evaluate the following areas:</p>

            <h3>1. Data Processing Agreement (DPA)</h3>
            <ul>
                <li>Does the vendor provide a GDPR-compliant DPA?</li>
                <li>Does it specify processing purposes and duration?</li>
                <li>Does it list sub-processors and require notification of changes?</li>
                <li>Does it include breach notification obligations (within 72 hours)?</li>
            </ul>

            <h3>2. Data Location and Transfers</h3>
            <ul>
                <li>Where is data stored? (EU, US, other)</li>
                <li>If outside the EU, what transfer mechanisms are used? (Standard Contractual Clauses, adequacy decision)</li>
                <li>Post-Schrems II: Are supplementary measures in place for US transfers?</li>
            </ul>

            <h3>3. Security Measures</h3>
            <ul>
                <li>Is data encrypted at rest and in transit?</li>
                <li>Does the vendor have SOC 2, ISO 27001, or equivalent certification?</li>
                <li>What access controls are in place?</li>
                <li>How are security incidents handled?</li>
            </ul>

            <h3>4. Data Retention and Deletion</h3>
            <ul>
                <li>How long does the vendor retain data after contract termination?</li>
                <li>Can you request data deletion, and how quickly is it executed?</li>
                <li>Are backups also purged?</li>
            </ul>

            <h3>5. Sub-Processors</h3>
            <ul>
                <li>Does the vendor use sub-processors?</li>
                <li>Is there a list of current sub-processors?</li>
                <li>Are you notified when sub-processors change?</li>
                <li>Do sub-processors have their own DPAs?</li>
            </ul>

            <h2>Risk Scoring Matrix</h2>
            <table>
                <thead>
                    <tr><th>Factor</th><th>Low Risk</th><th>Medium Risk</th><th>High Risk</th></tr>
                </thead>
                <tbody>
                    <tr><td>Data type</td><td>Anonymized, aggregated</td><td>Pseudonymized personal data</td><td>Directly identifiable, sensitive data</td></tr>
                    <tr><td>Data location</td><td>EU/EEA only</td><td>Adequacy countries</td><td>US or non-adequate countries</td></tr>
                    <tr><td>Certifications</td><td>SOC 2 + ISO 27001</td><td>One certification</td><td>No certifications</td></tr>
                    <tr><td>DPA quality</td><td>Comprehensive, customizable</td><td>Standard but adequate</td><td>Missing or incomplete</td></tr>
                    <tr><td>Breach history</td><td>No known breaches</td><td>Minor breaches, well-handled</td><td>Major breaches or poor response</td></tr>
                </tbody>
            </table>

            <h2>Automated Vendor Discovery</h2>
            <p>
                You don&apos;t always know which vendors are on your website. Marketing teams add tracking pixels,
                developers add libraries, CMS plugins load external scripts — all without a central inventory.
            </p>
            <p>
                <a href="/">PrivacyChecker</a> automatically discovers all third-party services on your website,
                identifies the vendors behind them, and flags those processing personal data without proper
                <a href="/blog/third-party-scripts-supply-chain-security"> security measures</a>.
            </p>

            <h2>Vendor Assessment Checklist</h2>
            <table>
                <thead>
                    <tr><th>Step</th><th>Action</th><th>Document</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Scan website for all third-party services</td><td>Vendor inventory</td></tr>
                    <tr><td>2</td><td>Request DPA from each vendor</td><td>DPA register</td></tr>
                    <tr><td>3</td><td>Verify data transfer mechanisms</td><td>Transfer impact assessment</td></tr>
                    <tr><td>4</td><td>Check security certifications</td><td>Risk assessment</td></tr>
                    <tr><td>5</td><td>Review sub-processor lists</td><td>Sub-processor register</td></tr>
                    <tr><td>6</td><td>Document findings and risk level</td><td>Vendor risk register</td></tr>
                    <tr><td>7</td><td>Schedule annual reassessment</td><td>Review calendar</td></tr>
                </tbody>
            </table>

            <p>
                <a href="/">Start with a free scan</a> to discover all third-party vendors on your website.
                Pro+ includes a Vendor Risk module that automatically assesses the privacy and security posture
                of detected third-party services.
            </p>
        </ArticleLayout>
    );
}
