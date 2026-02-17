import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'nis2-directive-website-requirements')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> The NIS2 Directive (Directive (EU) 2022/2555) significantly expands EU
                cybersecurity requirements, covering over <strong>160,000 entities</strong> across 18 sectors. Unlike NIS1,
                NIS2 affects mid-size companies, imposes personal liability on management, and requires 24-hour incident
                reporting. Member states had until <strong>October 17, 2024</strong> to transpose it into national law.
            </p>

            <h2>What Is NIS2?</h2>
            <p>
                NIS2 is the EU&apos;s upgraded Network and Information Security Directive. It replaces the original
                NIS Directive (2016) which was criticized for inconsistent implementation across member states and
                too-narrow scope. NIS2 harmonizes cybersecurity requirements across the EU and significantly expands
                the range of affected organizations.
            </p>

            <h2>Who Must Comply?</h2>
            <p>
                NIS2 applies to <strong>essential entities</strong> and <strong>important entities</strong> across
                18 sectors. The key threshold: organizations with <strong>50+ employees</strong> or
                <strong>€10M+ annual turnover</strong> in covered sectors must comply.
            </p>

            <h3>Essential Entities (Higher obligations)</h3>
            <table>
                <thead>
                    <tr><th>Sector</th><th>Examples</th></tr>
                </thead>
                <tbody>
                    <tr><td>Energy</td><td>Electricity, oil, gas, hydrogen, district heating</td></tr>
                    <tr><td>Transport</td><td>Air, rail, road, water transport operators</td></tr>
                    <tr><td>Banking</td><td>Credit institutions (also covered by DORA)</td></tr>
                    <tr><td>Financial market infrastructure</td><td>Trading venues, CCPs</td></tr>
                    <tr><td>Healthcare</td><td>Hospitals, laboratories, pharma R&amp;D, medical devices</td></tr>
                    <tr><td>Drinking water</td><td>Water supply and distribution</td></tr>
                    <tr><td>Wastewater</td><td>Wastewater collection, treatment, disposal</td></tr>
                    <tr><td>Digital infrastructure</td><td>DNS providers, TLD registries, cloud providers, data centers, CDNs, IXPs</td></tr>
                    <tr><td>ICT service management (B2B)</td><td>Managed service providers, managed security service providers</td></tr>
                    <tr><td>Public administration</td><td>Central government entities (excluding judiciary/parliament)</td></tr>
                    <tr><td>Space</td><td>Operators of ground-based space infrastructure</td></tr>
                </tbody>
            </table>

            <h3>Important Entities (Standard obligations)</h3>
            <table>
                <thead>
                    <tr><th>Sector</th><th>Examples</th></tr>
                </thead>
                <tbody>
                    <tr><td>Postal &amp; courier</td><td>Postal service providers, parcel delivery</td></tr>
                    <tr><td>Waste management</td><td>Waste collection, treatment, recycling</td></tr>
                    <tr><td>Chemicals</td><td>Manufacturing, production, distribution</td></tr>
                    <tr><td>Food</td><td>Production, processing, distribution (wholesale)</td></tr>
                    <tr><td>Manufacturing</td><td>Medical devices, electronics, machinery, vehicles</td></tr>
                    <tr><td>Digital providers</td><td>Online marketplaces, search engines, social networks</td></tr>
                    <tr><td>Research</td><td>Research organizations</td></tr>
                </tbody>
            </table>

            <h2>NIS2 Requirements for Websites</h2>
            <p>
                If your organization falls under NIS2, your website and online services are <strong>in scope</strong>.
                Here are the specific website-related requirements:
            </p>

            <h3>1. Risk Management Measures (Article 21)</h3>
            <ul>
                <li><strong>Security headers:</strong> Implement HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy</li>
                <li><strong>Access control:</strong> Strong authentication for admin panels, MFA for management interfaces</li>
                <li><strong>Encryption:</strong> TLS 1.2+ for all connections, encrypt data at rest</li>
                <li><strong>Supply chain security:</strong> Audit all third-party scripts, libraries, and dependencies — a compromised CDN or analytics script is a supply chain attack vector</li>
                <li><strong>Vulnerability management:</strong> Regular vulnerability scans, patch management, WAF deployment</li>
            </ul>

            <h3>2. Incident Reporting (Article 23)</h3>
            <table>
                <thead>
                    <tr><th>Timeline</th><th>Requirement</th></tr>
                </thead>
                <tbody>
                    <tr><td><strong>24 hours</strong></td><td>Early warning to CSIRT/competent authority</td></tr>
                    <tr><td><strong>72 hours</strong></td><td>Incident notification with initial assessment, severity, and impact</td></tr>
                    <tr><td><strong>1 month</strong></td><td>Final report with root cause analysis, mitigation measures, and cross-border impact</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Website breaches count.</strong> If your website is defaced, suffers a DDoS, or leaks
                customer data, it&apos;s a reportable incident under NIS2 if it has a
                &quot;significant impact&quot; on the service.
            </p>

            <h3>3. Management Accountability (Article 20)</h3>
            <p>
                NIS2 introduces <strong>personal liability</strong> for management bodies. Directors and C-suite
                executives must:
            </p>
            <ul>
                <li>Approve cybersecurity risk management measures</li>
                <li>Oversee implementation</li>
                <li>Undertake cybersecurity training</li>
                <li><strong>Can be held personally liable</strong> for non-compliance</li>
            </ul>

            <h2>NIS2 Website Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Implement all security headers (HSTS, CSP, X-Frame-Options, etc.)</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Enable TLS 1.2+ and disable older protocols (SSLv3, TLS 1.0/1.1)</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Deploy MFA on all admin/CMS interfaces</td><td>Critical</td></tr>
                    <tr><td>4</td><td>Audit all third-party scripts and external dependencies</td><td>Critical</td></tr>
                    <tr><td>5</td><td>Implement automated vulnerability scanning (weekly+)</td><td>High</td></tr>
                    <tr><td>6</td><td>Set up DDoS protection (Cloudflare, AWS Shield, etc.)</td><td>High</td></tr>
                    <tr><td>7</td><td>Create incident response plan with 24h notification process</td><td>High</td></tr>
                    <tr><td>8</td><td>Implement logging and monitoring (SIEM, access logs)</td><td>High</td></tr>
                    <tr><td>9</td><td>Document supply chain — list all CDNs, APIs, SaaS integrations</td><td>High</td></tr>
                    <tr><td>10</td><td>Regular penetration testing (at least annually)</td><td>Medium</td></tr>
                    <tr><td>11</td><td>Implement Content Security Policy to prevent XSS/injection attacks</td><td>Medium</td></tr>
                    <tr><td>12</td><td>Review and update business continuity plan</td><td>Medium</td></tr>
                </tbody>
            </table>
            <p>
                <strong>Start with a free scan:</strong> <a href="/">PrivacyChecker</a> checks your website&apos;s
                security headers, TLS configuration, third-party dependencies, and known vulnerabilities in under
                60 seconds.
            </p>

            <h2>Fines and Enforcement</h2>
            <table>
                <thead>
                    <tr><th>Entity type</th><th>Maximum fine</th></tr>
                </thead>
                <tbody>
                    <tr><td>Essential entities</td><td><strong>€10 million</strong> or <strong>2%</strong> of global annual turnover (whichever is higher)</td></tr>
                    <tr><td>Important entities</td><td><strong>€7 million</strong> or <strong>1.4%</strong> of global annual turnover (whichever is higher)</td></tr>
                </tbody>
            </table>
            <p>
                Additionally, competent authorities can: suspend certifications, impose temporary bans on management
                exercising functions, and order public disclosure of non-compliance.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Does NIS2 apply to SMEs?</h3>
            <p>
                <strong>Generally no</strong> — NIS2 applies to organizations with 50+ employees or €10M+ turnover
                in covered sectors. However, certain entities are covered <strong>regardless of size</strong>: DNS
                providers, TLD registries, trust service providers, and entities that are the sole provider of a
                critical service in a member state.
            </p>

            <h3>How does NIS2 overlap with GDPR?</h3>
            <p>
                NIS2 focuses on <strong>network and information security</strong> (the systems), while GDPR focuses
                on <strong>personal data protection</strong> (the data). A data breach triggers reporting under
                <strong>both</strong> regulations — NIS2 to the CSIRT (24h), GDPR to the DPA (72h). The
                requirements are complementary, not duplicative.
            </p>

            <h3>What if my country hasn&apos;t transposed NIS2 yet?</h3>
            <p>
                The transposition deadline was October 17, 2024. Some member states are delayed. However, the
                Directive&apos;s requirements are clear and fixed — organizations should prepare now regardless
                of national transposition status, as enforcement will be retroactive to the deadline.
            </p>
        </ArticleLayout>
    );
}
