import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'dark-patterns-detection')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Dark patterns are deceptive design techniques that manipulate users into making decisions they wouldn&apos;t otherwise make.
                From trick consent banners to hidden subscription cancellations, these practices are now explicitly targeted by GDPR,
                the EU Digital Services Act, and the FTC in the United States.
            </p>

            <h2>What Are Dark Patterns?</h2>
            <p>
                The term was coined by UX researcher Harry Brignull in 2010. Dark patterns exploit cognitive biases to benefit
                the business at the user&apos;s expense. In 2022, the European Data Protection Board (EDPB) published specific
                guidelines on dark patterns in social media platforms, setting precedent for all websites.
            </p>

            <h2>Common Dark Pattern Types</h2>
            <table>
                <thead>
                    <tr><th>Pattern</th><th>Description</th><th>Example</th></tr>
                </thead>
                <tbody>
                    <tr><td>Confirm-shaming</td><td>Using guilt to discourage opting out</td><td>&quot;No thanks, I don&apos;t want to save money&quot;</td></tr>
                    <tr><td>Hidden costs</td><td>Revealing extra charges at checkout</td><td>Service fees shown only at payment step</td></tr>
                    <tr><td>Forced continuity</td><td>Making cancellation difficult</td><td>Subscribe in 1 click, cancel via phone call</td></tr>
                    <tr><td>Trick questions</td><td>Confusing double negatives</td><td>&quot;Uncheck to not receive non-promotional emails&quot;</td></tr>
                    <tr><td>Misdirection</td><td>Drawing attention away from important info</td><td>Giant &quot;Accept&quot; button, tiny &quot;Reject&quot; link</td></tr>
                    <tr><td>Roach motel</td><td>Easy to get in, hard to get out</td><td>One-click sign up, 12-step account deletion</td></tr>
                    <tr><td>Privacy Zuckering</td><td>Tricking users into sharing more data</td><td>Default settings maximize data sharing</td></tr>
                    <tr><td>Bait and switch</td><td>Promising one thing, delivering another</td><td>&quot;Free trial&quot; that auto-charges without warning</td></tr>
                </tbody>
            </table>

            <h2>Dark Patterns in Cookie Consent</h2>
            <p>
                The most common regulatory target is cookie consent banners. The CNIL has fined major tech companies hundreds
                of millions for <a href="/blog/cookie-consent-banner-guide">non-compliant consent banners</a> that use dark patterns:
            </p>
            <ul>
                <li><strong>Asymmetric buttons</strong>: &quot;Accept All&quot; is prominent, &quot;Reject&quot; requires extra clicks</li>
                <li><strong>Pre-checked boxes</strong>: Analytics and marketing cookies enabled by default</li>
                <li><strong>Cookie walls</strong>: Blocking content until cookies are accepted</li>
                <li><strong>Confusing language</strong>: &quot;By continuing to browse, you accept cookies&quot; (implied consent is not valid)</li>
                <li><strong>No reject option</strong>: Only offering &quot;Accept&quot; and &quot;Manage preferences&quot;</li>
            </ul>

            <h2>Legal Framework</h2>
            <h3>GDPR (Article 7, Recital 42)</h3>
            <p>Consent must be freely given, specific, informed, and unambiguous. Dark patterns invalidate consent.</p>

            <h3>EU Digital Services Act (2024)</h3>
            <p>Explicitly prohibits deceptive design practices on online platforms, including dark patterns that manipulate user choices.</p>

            <h3>FTC (United States)</h3>
            <p>The FTC has filed enforcement actions against companies using dark patterns, especially around subscription cancellation and data collection.</p>

            <h3>Consumer Rights Directive (EU)</h3>
            <p>Protects consumers from misleading commercial practices, including deceptive UX in e-commerce.</p>

            <h2>How to Detect Dark Patterns</h2>
            <ol>
                <li>
                    <strong>Automated scanning</strong>: <a href="/">PrivacyChecker Pro+</a> detects common dark patterns
                    in consent banners, forms, and checkout flows
                </li>
                <li>
                    <strong>Consent banner audit</strong>: Compare the visual weight and click depth of &quot;Accept&quot; vs &quot;Reject&quot; options
                </li>
                <li>
                    <strong>User journey review</strong>: Map the steps required to:
                    <ul>
                        <li>Sign up vs. delete account</li>
                        <li>Subscribe vs. unsubscribe from emails</li>
                        <li>Accept cookies vs. reject cookies</li>
                        <li>Start a trial vs. cancel a trial</li>
                    </ul>
                </li>
                <li>
                    <strong>A/B test analysis</strong>: Review whether A/B tests manipulate user decisions toward business-favorable outcomes
                </li>
            </ol>

            <h2>How to Fix Dark Patterns</h2>
            <table>
                <thead>
                    <tr><th>Dark Pattern</th><th>Fix</th></tr>
                </thead>
                <tbody>
                    <tr><td>Asymmetric consent buttons</td><td>Make Accept and Reject equal in size, color, and prominence</td></tr>
                    <tr><td>Pre-checked consent boxes</td><td>All non-essential options unchecked by default</td></tr>
                    <tr><td>Hidden unsubscribe</td><td>One-click unsubscribe link in every email + account settings</td></tr>
                    <tr><td>Difficult account deletion</td><td>Self-service deletion in account settings, max 2 clicks</td></tr>
                    <tr><td>Confusing double negatives</td><td>Use clear, affirmative language: &quot;Yes, send me emails&quot; / &quot;No, don&apos;t send&quot;</td></tr>
                    <tr><td>Confirm-shaming</td><td>Neutral language for opt-out: &quot;No, thanks&quot; instead of guilt-trip text</td></tr>
                </tbody>
            </table>

            <h2>Penalties</h2>
            <p>
                Dark pattern violations can trigger GDPR fines (up to €20M or 4% of global revenue), FTC enforcement actions,
                and consumer protection lawsuits. The EDPB&apos;s 2022 guidelines make it clear that dark patterns constitute
                non-compliance with the consent requirements of GDPR.
            </p>

            <p>
                Run a <a href="/">free privacy audit</a> to detect dark patterns on your website.
                PrivacyChecker Pro+ specifically checks for deceptive consent patterns, asymmetric buttons,
                and manipulative UX elements.
            </p>
        </ArticleLayout>
    );
}
