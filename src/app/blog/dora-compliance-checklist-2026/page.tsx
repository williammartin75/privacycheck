import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'dora-compliance-checklist-2026')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> The Digital Operational Resilience Act (DORA) became enforceable on
                <strong> January 17, 2025</strong>. It requires financial entities and their ICT providers in the EU to
                implement strict cybersecurity, incident reporting, and resilience testing measures. Unlike GDPR,
                DORA is a <strong>regulation</strong> (directly applicable — no national transposition needed).
            </p>

            <h2>What Is DORA?</h2>
            <p>
                DORA (Regulation (EU) 2022/2554) establishes a unified framework for <strong>digital operational
                    resilience</strong> across the EU financial sector. It ensures that banks, insurance companies,
                investment firms, and their technology providers can withstand, respond to, and recover from
                ICT-related disruptions and cyber threats.
            </p>

            <h2>Who Must Comply?</h2>
            <table>
                <thead>
                    <tr><th>Entity Type</th><th>Examples</th><th>Must comply?</th></tr>
                </thead>
                <tbody>
                    <tr><td>Banks &amp; credit institutions</td><td>All EU-licensed banks</td><td>Yes</td></tr>
                    <tr><td>Insurance &amp; reinsurance</td><td>All EU-regulated insurers</td><td>Yes</td></tr>
                    <tr><td>Investment firms</td><td>MiFID-regulated firms</td><td>Yes</td></tr>
                    <tr><td>Payment institutions</td><td>PSPs, e-money issuers</td><td>Yes</td></tr>
                    <tr><td>Crypto-asset service providers</td><td>MiCA-regulated entities</td><td>Yes</td></tr>
                    <tr><td>Crowdfunding platforms</td><td>EU-regulated platforms</td><td>Yes</td></tr>
                    <tr><td>ICT third-party providers</td><td>Cloud providers, SaaS, fintech tools</td><td><strong>Yes (critical providers)</strong></td></tr>
                    <tr><td>Microenterprises (&lt;10 employees)</td><td>Small fintechs</td><td>Simplified regime</td></tr>
                </tbody>
            </table>

            <h2>The 5 Pillars of DORA Compliance</h2>

            <h3>Pillar 1: ICT Risk Management (Articles 5-16)</h3>
            <ul>
                <li>Establish a comprehensive ICT risk management framework</li>
                <li>Identify, classify, and document all ICT assets and dependencies</li>
                <li>Implement protection measures: encryption, access controls, patch management</li>
                <li>Define detection mechanisms: monitoring, logging, anomaly detection</li>
                <li>Create response &amp; recovery plans with defined RTOs and RPOs</li>
                <li>Assign a dedicated function for ICT risk management (or CISO)</li>
                <li><strong>Management body responsibility</strong> — board members are personally accountable</li>
            </ul>

            <h3>Pillar 2: ICT Incident Reporting (Articles 17-23)</h3>
            <ul>
                <li>Classify incidents by severity (major vs non-major)</li>
                <li><strong>Initial notification within 4 hours</strong> of classifying a major incident</li>
                <li>Intermediate report within 72 hours</li>
                <li>Final report within 1 month</li>
                <li>Report to the competent authority (national financial regulator)</li>
                <li>Voluntary reporting for significant cyber threats</li>
            </ul>

            <h3>Pillar 3: Digital Operational Resilience Testing (Articles 24-27)</h3>
            <ul>
                <li><strong>Basic testing:</strong> Vulnerability assessments, network security testing, gap analyses — at least annually</li>
                <li><strong>Advanced testing (TLPT):</strong> Threat-Led Penetration Testing every 3 years for significant financial entities</li>
                <li>TLPT must follow the TIBER-EU framework</li>
                <li>Tests must cover critical ICT systems and be performed by qualified independent testers</li>
            </ul>

            <h3>Pillar 4: Third-Party Risk Management (Articles 28-44)</h3>
            <ul>
                <li>Maintain a register of all ICT third-party contracts</li>
                <li>Perform due diligence before contracting with ICT providers</li>
                <li>Include mandatory contractual clauses: audit rights, incident notification, subcontracting limits, exit strategies</li>
                <li><strong>Critical ICT providers</strong> (designated by ESAs) are subject to direct EU-level oversight</li>
                <li>Concentration risk assessment — avoid over-dependence on a single provider</li>
            </ul>

            <h3>Pillar 5: Information Sharing (Article 45)</h3>
            <ul>
                <li>Participate in voluntary cyber threat intelligence sharing arrangements</li>
                <li>Share anonymized threat data with peers and authorities</li>
                <li>Establish information exchange agreements with appropriate safeguards</li>
            </ul>

            <h2>DORA Compliance Checklist</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Pillar</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Appoint ICT risk management function / CISO</td><td>1</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Document all ICT assets, systems, and dependencies</td><td>1</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Create/update ICT risk management policy</td><td>1</td><td>Critical</td></tr>
                    <tr><td>4</td><td>Implement incident classification framework</td><td>2</td><td>Critical</td></tr>
                    <tr><td>5</td><td>Set up 4-hour incident notification process</td><td>2</td><td>Critical</td></tr>
                    <tr><td>6</td><td>Build ICT third-party provider register</td><td>4</td><td>High</td></tr>
                    <tr><td>7</td><td>Review all ICT contracts for DORA-required clauses</td><td>4</td><td>High</td></tr>
                    <tr><td>8</td><td>Conduct annual resilience testing program</td><td>3</td><td>High</td></tr>
                    <tr><td>9</td><td>Assess concentration risk for critical providers</td><td>4</td><td>High</td></tr>
                    <tr><td>10</td><td>Train board/management on ICT risk responsibilities</td><td>1</td><td>High</td></tr>
                    <tr><td>11</td><td>Define business continuity &amp; disaster recovery plans</td><td>1</td><td>High</td></tr>
                    <tr><td>12</td><td>Plan first TLPT (if significant entity)</td><td>3</td><td>Medium</td></tr>
                    <tr><td>13</td><td>Establish information sharing arrangements</td><td>5</td><td>Medium</td></tr>
                    <tr><td>14</td><td>Review exit strategies for critical ICT providers</td><td>4</td><td>Medium</td></tr>
                </tbody>
            </table>

            <h2>DORA vs GDPR vs NIS2: Key Differences</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>DORA</th><th>GDPR</th><th>NIS2</th></tr>
                </thead>
                <tbody>
                    <tr><td>Focus</td><td>Financial sector ICT resilience</td><td>Personal data protection</td><td>Network &amp; information security</td></tr>
                    <tr><td>Scope</td><td>Financial entities + their ICT providers</td><td>All organizations processing EU personal data</td><td>Essential &amp; important entities (broad sectors)</td></tr>
                    <tr><td>Type</td><td>Regulation (directly applicable)</td><td>Regulation (directly applicable)</td><td>Directive (requires national transposition)</td></tr>
                    <tr><td>Incident reporting</td><td>4 hours (initial), 72h, 1 month</td><td>72 hours to DPA</td><td>24 hours (early warning), 72h, 1 month</td></tr>
                    <tr><td>Fines</td><td>Up to 1% of avg daily worldwide turnover (critical providers: up to €5M)</td><td>Up to €20M or 4% of revenue</td><td>Up to €10M or 2% of revenue</td></tr>
                    <tr><td>Testing</td><td>Annual + TLPT every 3 years</td><td>No specific testing requirement</td><td>Risk-appropriate measures</td></tr>
                </tbody>
            </table>

            <h2>Impact on Website Compliance</h2>
            <p>
                If you&apos;re a financial entity or an ICT provider to the financial sector, DORA impacts your
                website and online services:
            </p>
            <ul>
                <li><strong>Security headers:</strong> Mandatory implementation of CSP, HSTS, X-Frame-Options — <a href="/">scan your headers with PrivacyChecker</a></li>
                <li><strong>Third-party scripts:</strong> Every external dependency (analytics, fonts, CDNs) must be documented and risk-assessed</li>
                <li><strong>Incident response:</strong> Your website is a critical ICT system — downtime and breaches must be reported</li>
                <li><strong>Penetration testing:</strong> Customer-facing web applications must be included in resilience testing</li>
            </ul>

            <h2>Frequently Asked Questions</h2>

            <h3>Does DORA apply to fintech startups?</h3>
            <p>
                <strong>Yes</strong>, if you&apos;re an EU-regulated financial entity (even a small payment institution
                or e-money issuer). However, microenterprises (&lt;10 employees, &lt;€2M turnover) benefit from a
                <strong>simplified ICT risk management framework</strong> under Article 16.
            </p>

            <h3>Does DORA apply to SaaS providers used by banks?</h3>
            <p>
                <strong>Yes.</strong> If your SaaS product is used by financial entities for critical or important
                functions, you&apos;re an &quot;ICT third-party service provider&quot; under DORA. You must be
                prepared for: contractual audit rights, incident notification obligations, and possibly
                direct oversight by European Supervisory Authorities (if designated as &quot;critical&quot;).
            </p>

            <h3>What are the fines for DORA non-compliance?</h3>
            <p>
                Individual financial entities face enforcement by their national regulator (which can impose fines,
                suspend activities, or revoke licenses). Critical ICT third-party providers face fines of up to
                <strong>1% of average daily worldwide turnover</strong> per day, or up to <strong>€5 million</strong>
                for natural persons.
            </p>
        </ArticleLayout>
    );
}
