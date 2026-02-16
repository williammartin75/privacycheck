import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'gdpr-for-small-businesses')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                <strong>Quick answer:</strong> Yes, GDPR applies to small businesses. There is no revenue threshold or
                employee minimum — if you process personal data of EU residents, you must comply. The good news: small
                businesses can often achieve compliance with a few targeted actions, without hiring a lawyer or a DPO.
            </p>

            <h2>Does GDPR Really Apply to My Small Business?</h2>
            <p>
                <strong>Yes</strong>, if any of these are true:
            </p>
            <ul>
                <li>Your website has visitors from the EU (even if your business is outside Europe)</li>
                <li>You collect email addresses (newsletter, contact forms, e-commerce)</li>
                <li>You use analytics tools that track behavior (Google Analytics, Hotjar, etc.)</li>
                <li>You run online advertising targeting EU users</li>
                <li>You sell products or services to EU customers</li>
            </ul>
            <p>
                The only exemption is for <strong>purely personal or household activity</strong>. If your website
                has any commercial purpose, GDPR applies.
            </p>

            <h2>But Can Small Businesses Actually Get Fined?</h2>
            <p>
                <strong>Yes — and it&apos;s happening.</strong> While the headline-grabbing fines target big companies,
                DPAs across Europe have increasingly targeted SMBs:
            </p>
            <ul>
                <li><strong>Spain (AEPD):</strong> Fined a small dental clinic €10,000 for an inadequate privacy policy</li>
                <li><strong>Italy (Garante):</strong> Fined a local business €20,000 for sending marketing emails without consent</li>
                <li><strong>Romania (ANSPDCP):</strong> Fined a small e-commerce site €5,000 for missing cookie consent</li>
                <li><strong>Germany (LfDI):</strong> Fined a freelancer €1,500 for using Google Fonts without consent (loading external resources that transmit IP addresses)</li>
            </ul>
            <p>
                For <a href="/blog/biggest-gdpr-fines-2025-2026">the full picture on GDPR fines</a>, see our detailed breakdown.
            </p>

            <h2>The Small Business GDPR Compliance Checklist</h2>
            <p>
                You don&apos;t need to do everything a multinational does. Focus on these <strong>10 actions</strong>:
            </p>

            <h3>Step 1: Add a Privacy Policy</h3>
            <p>
                Every website needs a <a href="/blog/gdpr-privacy-policy-template">GDPR-compliant privacy policy</a> that explains
                what data you collect, why, and how users can exercise their rights. Link it in your footer on every page.
            </p>

            <h3>Step 2: Implement Cookie Consent</h3>
            <p>
                If your site uses analytics, marketing, or social media cookies, you need a
                <a href="/blog/cookie-consent-banner-guide">cookie consent banner</a> that:
            </p>
            <ul>
                <li>Blocks non-essential cookies until consent is given</li>
                <li>Offers granular choices (not just &quot;Accept All&quot;)</li>
                <li>Allows users to withdraw consent easily</li>
                <li>Doesn&apos;t use <a href="/blog/dark-patterns-detection">dark patterns</a> to manipulate choices</li>
            </ul>

            <h3>Step 3: Scan Your Website</h3>
            <p>
                Use <a href="/">PrivacyChecker</a> to discover what&apos;s actually happening on your site. Many small
                businesses are surprised to find:
            </p>
            <ul>
                <li>Cookies they didn&apos;t know about (from WordPress plugins, embedded videos, etc.)</li>
                <li>Third-party trackers loading without consent</li>
                <li>Missing security headers</li>
                <li>Exposed email addresses in source code</li>
            </ul>

            <h3>Step 4: Secure Your Website</h3>
            <ul>
                <li>Use HTTPS everywhere (get a free SSL certificate via Let&apos;s Encrypt)</li>
                <li>Add <a href="/blog/website-security-headers-guide">security headers</a> (CSP, HSTS, X-Frame-Options)</li>
                <li>Keep your CMS and plugins updated</li>
                <li>Use strong passwords and two-factor authentication</li>
            </ul>

            <h3>Step 5: Handle Contact Forms Properly</h3>
            <ul>
                <li>Add a consent checkbox (unchecked by default): &quot;I agree to the processing of my data as described in the Privacy Policy&quot;</li>
                <li>Link to your privacy policy from the form</li>
                <li>Don&apos;t use the data for purposes beyond what users consented to</li>
                <li>Delete form submissions when they&apos;re no longer needed</li>
            </ul>

            <h3>Step 6: Get Email Marketing Right</h3>
            <ul>
                <li>Use <strong>double opt-in</strong> for newsletter signups</li>
                <li>Include an unsubscribe link in every email</li>
                <li>Keep records of when and how consent was given</li>
                <li>Set up <a href="/blog/spf-dkim-dmarc-email-deliverability">SPF, DKIM, and DMARC</a> for your domain</li>
            </ul>

            <h3>Step 7: Review Your Third-Party Tools</h3>
            <p>
                List every tool that processes customer data. For each one:
            </p>
            <ul>
                <li>Check if they offer a DPA (Data Processing Agreement) — sign it</li>
                <li>Verify where data is stored (EU is simplest)</li>
                <li>Add them to your privacy policy</li>
                <li>See our <a href="/blog/saas-tools-gdpr-compliance">SaaS tools GDPR guide</a> for specific tools</li>
            </ul>

            <h3>Step 8: Prepare for Data Requests</h3>
            <p>
                Users can request to access, correct, or delete their data. Have a simple process:
            </p>
            <ul>
                <li>Provide a contact email for privacy requests</li>
                <li>Respond within <strong>30 days</strong> (GDPR requirement)</li>
                <li>Know where all user data is stored so you can export or delete it</li>
            </ul>

            <h3>Step 9: Do You Need a DPO?</h3>
            <p>
                Most small businesses <strong>do not</strong> need a Data Protection Officer. A DPO is required only if:
            </p>
            <ul>
                <li>You&apos;re a public authority</li>
                <li>Your core activities involve large-scale systematic monitoring of individuals</li>
                <li>Your core activities involve large-scale processing of sensitive data</li>
            </ul>
            <p>
                A typical small business website with analytics and a contact form does <strong>not</strong> need a DPO.
            </p>

            <h3>Step 10: Document Everything</h3>
            <p>
                If you have more than 250 employees, you must maintain a Record of Processing Activities (ROPA). Even
                if you&apos;re smaller, documenting your data practices is smart — it&apos;s your best defense if a DPA
                ever audits you.
            </p>

            <h2>Common Small Business GDPR Mistakes</h2>
            <table>
                <thead>
                    <tr><th>Mistake</th><th>Risk</th><th>Fix</th></tr>
                </thead>
                <tbody>
                    <tr><td>No cookie consent banner</td><td>Fine up to €20M</td><td>Install a CMP — see our <a href="/blog/consent-management-platform-comparison">CMP comparison</a></td></tr>
                    <tr><td>Pre-checked consent boxes</td><td>Consent is invalid</td><td>All consent checkboxes must be unchecked by default</td></tr>
                    <tr><td>Using Google Fonts externally</td><td>IP transmitted to Google = data transfer</td><td>Self-host your fonts</td></tr>
                    <tr><td>No privacy policy</td><td>Guaranteed violation</td><td>Use our <a href="/blog/gdpr-privacy-policy-template">privacy policy guide</a></td></tr>
                    <tr><td>Newsletter without double opt-in</td><td>Consent is questionable</td><td>Enable double opt-in in your email platform</td></tr>
                    <tr><td>Keeping data forever</td><td>Violates data minimization</td><td>Set retention periods and auto-delete old data</td></tr>
                    <tr><td>Not knowing what cookies your site sets</td><td>Undeclared cookies = violation</td><td><a href="/blog/find-cookies-on-your-website">Scan your cookies</a></td></tr>
                </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>

            <h3>I&apos;m a sole trader / freelancer. Does GDPR apply to me?</h3>
            <p>
                <strong>Yes.</strong> GDPR applies to any organization — including sole traders, freelancers, and
                one-person businesses — that processes personal data of EU residents in a commercial context.
            </p>

            <h3>How much does GDPR compliance cost for a small business?</h3>
            <p>
                It can cost <strong>nothing to very little</strong>. Free tools like <a href="/">PrivacyChecker</a> scan
                your website at no cost. Free CMPs exist (Cookiebot free tier, Osano free). The main investment is
                your time to review and update your practices.
            </p>

            <h3>Can I just add &quot;By using this site, you agree to our privacy policy&quot;?</h3>
            <p>
                <strong>No.</strong> Implied consent is not valid under GDPR for non-essential data processing. You need
                active, affirmative consent — an unchecked checkbox, a clear accept/reject choice, or granular cookie preferences.
            </p>

            <h3>What&apos;s the fastest way to check if my small business website is compliant?</h3>
            <p>
                <a href="/">Scan your website with PrivacyChecker</a> — it takes 60 seconds and checks cookies, consent,
                privacy policy, security headers, third-party scripts, and more. You&apos;ll get a clear compliance
                score with specific recommendations.
            </p>
        </ArticleLayout>
    );
}
