import { Metadata } from 'next';
import { blogPosts, generateBlogMetadata } from '../data';
import { ArticleLayout } from '../ArticleLayout';

const post = blogPosts.find(p => p.slug === 'ecommerce-checkout-privacy-compliance')!;
export const metadata: Metadata = generateBlogMetadata(post);

export default function Article() {
    return (
        <ArticleLayout post={post}>
            <p>
                Your checkout page handles the most sensitive data on your website: names, addresses, email,
                phone numbers, and payment details. It&apos;s also where privacy violations are most costly —
                both in regulatory fines and lost conversions. Here&apos;s how to make your checkout
                privacy-compliant across GDPR, CCPA, and PCI DSS.
            </p>

            <h2>What Data Checkout Pages Collect</h2>
            <table>
                <thead>
                    <tr><th>Data Category</th><th>GDPR Classification</th><th>PCI DSS Scope</th><th>Retention Guidance</th></tr>
                </thead>
                <tbody>
                    <tr><td>Full name</td><td>Personal data</td><td>Out of scope</td><td>As long as needed for order fulfillment</td></tr>
                    <tr><td>Email address</td><td>Personal data</td><td>Out of scope</td><td>Order lifecycle + legal retention</td></tr>
                    <tr><td>Shipping address</td><td>Personal data</td><td>Out of scope</td><td>Order lifecycle</td></tr>
                    <tr><td>Phone number</td><td>Personal data</td><td>Out of scope</td><td>Order lifecycle (if collected)</td></tr>
                    <tr><td>Card number (PAN)</td><td>Personal data</td><td>In scope (storage prohibited without PCI compliance)</td><td>Never store — use tokenization</td></tr>
                    <tr><td>CVV/CVC</td><td>Personal data</td><td>In scope (storage prohibited)</td><td>Never store</td></tr>
                    <tr><td>Transaction history</td><td>Personal data</td><td>Out of scope</td><td>Legal retention (typically 7-10 years)</td></tr>
                </tbody>
            </table>

            <h2>PCI DSS Requirements</h2>
            <p>
                If you handle credit card data in any way, PCI DSS applies. Most e-commerce sites use hosted
                payment pages (Stripe Checkout, PayPal) to reduce scope:
            </p>
            <table>
                <thead>
                    <tr><th>Approach</th><th>PCI DSS Level</th><th>Your Responsibility</th></tr>
                </thead>
                <tbody>
                    <tr><td>Hosted payment page (Stripe Checkout, PayPal)</td><td>SAQ A</td><td>Minimal — just secure your website</td></tr>
                    <tr><td>Embedded payment form (Stripe Elements, Braintree)</td><td>SAQ A-EP</td><td>Moderate — secure delivery of payment page</td></tr>
                    <tr><td>Direct API integration</td><td>SAQ D</td><td>Full — you handle card data directly</td></tr>
                </tbody>
            </table>

            <h2>GDPR Checkout Requirements</h2>

            <h3>1. Data Minimization</h3>
            <p>Only collect data that&apos;s actually necessary for the transaction:</p>
            <ul>
                <li><strong>Phone number</strong>: Don&apos;t require it unless you need it for delivery SMS updates</li>
                <li><strong>Date of birth</strong>: Only require for age-restricted products</li>
                <li><strong>Company name</strong>: Make optional unless B2B-only</li>
                <li><strong>Account creation</strong>: Offer guest checkout — don&apos;t force account registration</li>
            </ul>

            <h3>2. Marketing Consent</h3>
            <ul>
                <li><strong>Unchecked by default</strong>: Newsletter and marketing checkboxes must not be pre-checked</li>
                <li><strong>Separate from terms</strong>: Marketing consent must be a separate checkbox from terms acceptance</li>
                <li><strong>Clear language</strong>: &quot;I agree to receive marketing emails&quot; not &quot;Keep me updated&quot;</li>
                <li><strong>No <a href="/blog/dark-patterns-detection">dark patterns</a></strong>: Don&apos;t use confusing double-negatives or hidden opt-outs</li>
            </ul>

            <h3>3. Transparency</h3>
            <ul>
                <li>Link to privacy policy near checkout form fields</li>
                <li>Explain why each piece of data is needed (tooltip or inline text)</li>
                <li>Disclose which parties receive the data (payment processor, shipping carrier, etc.)</li>
            </ul>

            <h2>Tracking on Checkout Pages</h2>
            <p>
                Conversion tracking pixels on checkout pages create significant compliance risk:
            </p>
            <table>
                <thead>
                    <tr><th>Tracker</th><th>Risk</th><th>Recommendation</th></tr>
                </thead>
                <tbody>
                    <tr><td>Facebook Pixel</td><td>Sends purchase data to Meta</td><td>Use Conversions API (server-side) instead</td></tr>
                    <tr><td>Google Ads conversion</td><td>Links purchase to ad click</td><td>Use <a href="/blog/google-consent-mode-v2-setup">Consent Mode V2</a> for modeling</td></tr>
                    <tr><td>TikTok Pixel</td><td>Sends purchase events</td><td>Server-side events API</td></tr>
                    <tr><td>Hotjar on checkout</td><td>Records sensitive form inputs</td><td>Exclude checkout pages from recording</td></tr>
                    <tr><td>A/B testing tools</td><td>May expose payment page variations</td><td>Avoid testing checkout UX with client-side tools</td></tr>
                </tbody>
            </table>

            <h2>CCPA-Specific Checkout Requirements</h2>
            <ul>
                <li><strong>&quot;Do Not Sell&quot; link</strong>: Must be visible at or near checkout if you share data with ad networks</li>
                <li><strong>Financial incentives disclosure</strong>: If loyalty programs offer discounts for data sharing, terms must be clear</li>
                <li><strong>Right to delete</strong>: Customers can request deletion of their purchase data (subject to legal retention requirements)</li>
            </ul>

            <h2>Checkout Privacy Checklist</h2>
            <table>
                <thead>
                    <tr><th>Item</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr><td>Guest checkout available</td><td>Required</td></tr>
                    <tr><td>Marketing checkbox unchecked by default</td><td>Required (GDPR)</td></tr>
                    <tr><td>Privacy policy linked on checkout page</td><td>Required</td></tr>
                    <tr><td>Payment handled by PCI-compliant processor</td><td>Required</td></tr>
                    <tr><td>No unnecessary data fields</td><td>Required (data minimization)</td></tr>
                    <tr><td>Conversion pixels respect consent state</td><td>Required (GDPR)</td></tr>
                    <tr><td>Session replay excluded from checkout</td><td>Recommended</td></tr>
                    <tr><td>Server-side conversion tracking</td><td>Recommended</td></tr>
                    <tr><td>SSL/TLS with strong ciphers</td><td>Required (PCI DSS)</td></tr>
                    <tr><td>Security headers present</td><td>Recommended</td></tr>
                </tbody>
            </table>

            <p>
                <a href="/">Scan your checkout page with PrivacyChecker</a> to identify trackers, missing
                security headers, and consent issues. Our report flags exactly which scripts load on your
                payment pages and whether they respect consent.
            </p>
        </ArticleLayout>
    );
}
