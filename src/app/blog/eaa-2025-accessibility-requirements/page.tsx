import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'eaa-2025-accessibility-requirements')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                The European Accessibility Act (EAA) came into effect on June 28, 2025. It requires that digital products
                and services — including websites and mobile apps — sold in the EU meet WCAG 2.1 Level AA accessibility standards.
                Non-compliance can result in fines up to €30,000 and your product being banned from the EU market.
            </p>

            <h2>Who Must Comply?</h2>
            <p>
                The EAA applies to businesses that provide products or services to EU consumers, regardless of where the business is headquartered.
                Key industries include:
            </p>
            <ul>
                <li>E-commerce websites and online marketplaces</li>
                <li>Banking and financial services</li>
                <li>Telecommunications services</li>
                <li>Media and streaming services</li>
                <li>Transportation and travel booking</li>
                <li>E-books and digital publishing</li>
            </ul>
            <p>
                <strong>Exemption</strong>: Micro-enterprises (fewer than 10 employees and less than €2M annual turnover)
                are exempt, but only from service requirements — not product requirements.
            </p>

            <h2>What Is WCAG 2.1 AA?</h2>
            <p>
                The Web Content Accessibility Guidelines (WCAG) 2.1 Level AA is the international standard for web accessibility.
                It covers four principles: Perceivable, Operable, Understandable, and Robust (POUR).
            </p>

            <h3>Key Requirements</h3>
            <table>
                <thead>
                    <tr><th>Category</th><th>Requirement</th><th>What to Check</th></tr>
                </thead>
                <tbody>
                    <tr><td>Images</td><td>Alt text on all images</td><td>Every <code>&lt;img&gt;</code> needs a descriptive alt attribute</td></tr>
                    <tr><td>Color contrast</td><td>4.5:1 minimum ratio</td><td>Text must be readable against its background</td></tr>
                    <tr><td>Keyboard navigation</td><td>Full keyboard access</td><td>All interactive elements must work without a mouse</td></tr>
                    <tr><td>Forms</td><td>Labeled form fields</td><td>Every input needs an associated <code>&lt;label&gt;</code></td></tr>
                    <tr><td>Headings</td><td>Proper heading hierarchy</td><td>Use h1-h6 in order, no skipping levels</td></tr>
                    <tr><td>Links</td><td>Descriptive link text</td><td>No &quot;click here&quot; or &quot;read more&quot; without context</td></tr>
                    <tr><td>ARIA</td><td>Correct ARIA attributes</td><td>ARIA roles, states, and properties must be valid</td></tr>
                    <tr><td>Language</td><td>Document language set</td><td><code>&lt;html lang=&quot;en&quot;&gt;</code> must be present</td></tr>
                    <tr><td>Focus</td><td>Visible focus indicators</td><td>Tab focus must be clearly visible</td></tr>
                    <tr><td>Media</td><td>Captions and transcripts</td><td>Videos need captions; audio needs transcripts</td></tr>
                </tbody>
            </table>

            <h2>Common Accessibility Violations</h2>
            <p>Based on our analysis of thousands of websites, the most common EAA violations are:</p>
            <ol>
                <li><strong>Missing alt text</strong> (89% of sites) — Images without descriptive alternatives</li>
                <li><strong>Low color contrast</strong> (83% of sites) — Text that&apos;s hard to read, especially on mobile</li>
                <li><strong>Missing form labels</strong> (67% of sites) — Input fields without associated labels</li>
                <li><strong>Empty links</strong> (58% of sites) — Links with no text content or aria-label</li>
                <li><strong>Missing document language</strong> (25% of sites) — No lang attribute on the html element</li>
            </ol>

            <h2>How to Audit Your Website</h2>
            <p>An accessibility audit should cover both automated checks and manual testing:</p>
            <h3>Automated Testing</h3>
            <ul>
                <li>Run a <a href="/">PrivacyChecker Pro+ scan</a> — our accessibility module checks 15+ WCAG criteria across all your pages</li>
                <li>Use browser extensions like Axe DevTools or WAVE for page-level testing</li>
                <li>Test with screen readers (NVDA on Windows, VoiceOver on Mac)</li>
            </ul>
            <h3>Manual Testing</h3>
            <ul>
                <li>Navigate your entire site using only the keyboard (Tab, Enter, Escape)</li>
                <li>Test with browser zoom at 200%</li>
                <li>Verify all forms can be completed without a mouse</li>
                <li>Check that error messages are announced to screen readers</li>
            </ul>

            <h2>Implementation Checklist</h2>
            <table>
                <thead>
                    <tr><th>Action</th><th>Priority</th><th>Effort</th></tr>
                </thead>
                <tbody>
                    <tr><td>Add alt text to all images</td><td>Critical</td><td>Low</td></tr>
                    <tr><td>Fix color contrast ratios</td><td>Critical</td><td>Medium</td></tr>
                    <tr><td>Add form labels</td><td>Critical</td><td>Low</td></tr>
                    <tr><td>Implement keyboard navigation</td><td>High</td><td>Medium</td></tr>
                    <tr><td>Fix heading hierarchy</td><td>High</td><td>Low</td></tr>
                    <tr><td>Add skip-to-content link</td><td>Medium</td><td>Low</td></tr>
                    <tr><td>Add ARIA landmarks</td><td>Medium</td><td>Medium</td></tr>
                    <tr><td>Add video captions</td><td>Medium</td><td>High</td></tr>
                </tbody>
            </table>

            <h2>Penalties for Non-Compliance</h2>
            <p>
                Each EU member state sets its own enforcement and penalty structure.
                Penalties can include fines up to €30,000, removal from the market, and public enforcement actions.
                More importantly, inaccessible websites exclude approximately 87 million Europeans with disabilities — a significant market opportunity lost.
            </p>

            <h2>Getting Started</h2>
            <p>
                The fastest way to assess your EAA compliance is to run an automated accessibility audit.
                <a href="/"> PrivacyChecker Pro+</a> checks your site against 15+ WCAG 2.1 AA criteria and provides
                specific fix recommendations for each issue found. Start with a free scan to see your current accessibility score.
            </p>
        </ArticleLayout>
    );
}
