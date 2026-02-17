import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'uk-gdpr-post-brexit-differences')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> After Brexit, the UK created its own version of GDPR — the &quot;UK
                GDPR&quot; — which is the EU GDPR as retained in UK law, supplemented by the Data Protection Act 2018
                (DPA 2018). As of 2026, the two laws remain largely identical, but the UK is diverging through the
                <strong> Data Protection and Digital Information Act (DPDI Act)</strong>, creating practical compliance
                differences you need to know.
            </p>

            <h2>The Legal Framework</h2>
            <table>
                <thead>
                    <tr><th>Aspect</th><th>EU GDPR</th><th>UK GDPR</th></tr>
                </thead>
                <tbody>
                    <tr><td>Legal text</td><td>Regulation (EU) 2016/679</td><td>EU GDPR as retained + DPA 2018 + DPDI Act 2024</td></tr>
                    <tr><td>Supervisory authority</td><td>National DPAs (CNIL, BfDI, etc.)</td><td>ICO (Information Commissioner&apos;s Office)</td></tr>
                    <tr><td>Territory</td><td>EU/EEA</td><td>England, Wales, Scotland, Northern Ireland</td></tr>
                    <tr><td>Adequacy</td><td>N/A</td><td>UK has EU adequacy decision (expires June 2025 — renewal pending)</td></tr>
                </tbody>
            </table>

            <h2>Key Differences in 2026</h2>

            <h3>1. Legitimate Interest: No More Balancing Test (in some cases)</h3>
            <p>
                The DPDI Act introduces a <strong>recognized legitimate interests</strong> list. For specific
                purposes (national security, public interest, safeguarding vulnerable individuals), controllers
                can rely on legitimate interest <strong>without conducting a balancing test</strong> against data
                subject rights.
            </p>
            <table>
                <thead>
                    <tr><th>EU GDPR</th><th>UK GDPR (post-DPDI)</th></tr>
                </thead>
                <tbody>
                    <tr><td>LIA (Legitimate Interest Assessment) always required</td><td>LIA not required for recognized legitimate interests</td></tr>
                    <tr><td>Must balance against data subject rights every time</td><td>Pre-approved purposes skip the balancing test</td></tr>
                </tbody>
            </table>

            <h3>2. Cookie Consent Rules Are Relaxing</h3>
            <p>
                The UK is softening cookie consent requirements through the DPDI Act:
            </p>
            <ul>
                <li><strong>Analytics cookies:</strong> May not require consent if used for aggregate statistics only</li>
                <li><strong>Broader &quot;strictly necessary&quot; exemption:</strong> Includes security scanning, fraud prevention, and service improvement metrics</li>
                <li><strong>Cookie banner fatigue:</strong> The ICO has signaled interest in reducing &quot;consent fatigue&quot; and exploring alternatives like browser-level consent</li>
            </ul>
            <p>
                <strong>In practice (2026):</strong> Most UK websites still implement full consent banners to
                maintain EU compliance for EU visitors. The relaxation mainly benefits UK-only businesses.
            </p>

            <h3>3. Data Protection Officer Requirements</h3>
            <table>
                <thead>
                    <tr><th>EU GDPR</th><th>UK GDPR (post-DPDI)</th></tr>
                </thead>
                <tbody>
                    <tr><td>DPO mandatory for public bodies + large-scale processing</td><td>DPO replaced by &quot;Senior Responsible Individual&quot; (SRI) — broader requirement</td></tr>
                    <tr><td>DPO must be independent, cannot be dismissed for performing duties</td><td>SRI is embedded in management — less independence required</td></tr>
                    <tr><td>DPO can be external</td><td>SRI must be a senior member of the organization</td></tr>
                </tbody>
            </table>

            <h3>4. Subject Access Requests (SARs)</h3>
            <ul>
                <li><strong>EU GDPR:</strong> Must respond within 1 month. Can refuse only if &quot;manifestly unfounded or excessive&quot;</li>
                <li><strong>UK GDPR (post-DPDI):</strong> Can refuse if &quot;vexatious or excessive&quot; (lower threshold). Can charge a &quot;reasonable fee&quot; for clearly unfounded requests. Can ask for ID verification before processing</li>
            </ul>

            <h3>5. International Data Transfers</h3>
            <p>
                The UK maintains its own adequacy decisions, independent of the EU:
            </p>
            <ul>
                <li>The UK has granted adequacy to the EU/EEA (so EU→UK transfers are fine)</li>
                <li>The EU granted adequacy to the UK (but it <strong>expires June 2025</strong> — renewal under review)</li>
                <li>The UK has its own <strong>UK-US Data Bridge</strong> (equivalent to the EU-US DPF)</li>
                <li>The UK accepts UK-specific International Data Transfer Agreements (IDTAs) as an alternative to EU SCCs</li>
            </ul>

            <h3>6. AI and Automated Decision-Making</h3>
            <p>
                The UK is taking a more permissive approach to AI than the EU:
            </p>
            <ul>
                <li><strong>EU:</strong> Strict AI Act with risk classifications, conformity assessments, and prohibitions</li>
                <li><strong>UK:</strong> Principles-based, sector-led approach — no equivalent of the EU AI Act</li>
                <li>UK GDPR Article 22 (automated decision-making) remains but is interpreted more flexibly by the ICO</li>
            </ul>

            <h2>Adequacy Risk: What Happens If EU Adequacy Lapses?</h2>
            <p>
                The EU&apos;s adequacy decision for the UK expires in June 2025. If not renewed:
            </p>
            <ul>
                <li>EU→UK personal data transfers would require SCCs or BCRs (like transfers to the US pre-DPF)</li>
                <li>UK companies serving EU customers would need <strong>EU-based representatives</strong> and additional safeguards</li>
                <li>Significant compliance cost increase for UK businesses with EU operations</li>
            </ul>
            <p>
                <strong>Risk assessment:</strong> The European Commission has raised concerns about UK divergence
                (specifically the DPDI Act). Renewal is likely but not guaranteed. Companies should prepare
                contingency SCCs for UK-EU transfers.
            </p>

            <h2>Compliance Checklist for Dual UK-EU Compliance</h2>
            <table>
                <thead>
                    <tr><th>#</th><th>Action</th><th>Priority</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>Maintain <strong>two privacy policies</strong> or a unified policy that covers both UK GDPR and EU GDPR requirements</td><td>Critical</td></tr>
                    <tr><td>2</td><td>Implement full cookie consent (GDPR standard) if you serve EU visitors, regardless of UK relaxation</td><td>Critical</td></tr>
                    <tr><td>3</td><td>Appoint an EU representative (Art. 27) if you target EU users from the UK</td><td>High</td></tr>
                    <tr><td>4</td><td>Prepare SCCs/IDTAs for UK-EU transfers as contingency for adequacy lapse</td><td>High</td></tr>
                    <tr><td>5</td><td>Review DPO vs SRI requirements and appoint the correct role</td><td>Medium</td></tr>
                    <tr><td>6</td><td>Update SAR procedures for UK-specific thresholds</td><td>Medium</td></tr>
                    <tr><td>7</td><td>Document legitimate interest assessments — UK recognized interests vs EU standard LIAs</td><td>Medium</td></tr>
                </tbody>
            </table>

            <h2>How PrivacyChecker Helps</h2>
            <p>
                <a href="/">PrivacyChecker</a> scans your website for compliance issues across <strong>both</strong> UK
                GDPR and EU GDPR. Our scanner detects cookie consent issues, privacy policy gaps, third-party tracker
                transfers, security header misconfigurations, and more — giving you a unified compliance score for both
                jurisdictions.
            </p>

            <h2>Frequently Asked Questions</h2>

            <h3>Do I need to comply with both UK GDPR and EU GDPR?</h3>
            <p>
                <strong>Yes</strong>, if you serve users in both the UK and the EU. In practice, complying with EU GDPR
                (the stricter standard) will generally satisfy UK GDPR requirements too. The exceptions are UK-specific
                rules like the SRI requirement and UK transfer mechanisms (IDTAs).
            </p>

            <h3>Is the UK still considered &quot;adequate&quot; by the EU?</h3>
            <p>
                The adequacy decision from June 2021 was for 4 years. Renewal discussions are underway as of 2026.
                The European Commission has flagged concerns about UK divergence through the DPDI Act.
                Until a decision is made, transfers continue under the existing decision.
            </p>

            <h3>Can I use Google Analytics on a UK-only website without consent?</h3>
            <p>
                The DPDI Act&apos;s relaxation of cookie rules <strong>may</strong> allow analytics cookies without
                consent for aggregate statistics. However, Google Analytics collects more than aggregate data
                (IP addresses, user identifiers) — so the ICO&apos;s current guidance still recommends consent.
                For a compliant alternative, consider privacy-focused analytics tools.
            </p>
        </ArticleLayout>
    );
}
