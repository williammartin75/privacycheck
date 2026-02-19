import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GDPR Checker & Privacy Compliance Scanner — Free Website Audit | PrivacyChecker",
  description: "Free GDPR checker and privacy compliance scanner. Check website GDPR, CCPA, LGPD compliance in 60 seconds. Audit cookies, consent banners, privacy policy, security headers and trackers instantly.",
  keywords: ["GDPR checker", "privacy checker", "GDPR website scanner", "check website GDPR", "GDPR compliance checker", "privacy policy checker", "CCPA compliance", "cookie consent", "website privacy audit", "data protection", "free GDPR scanner"],
  authors: [{ name: "PrivacyChecker" }],
  creator: "PrivacyChecker",
  publisher: "PrivacyChecker",
  robots: "index, follow",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "GDPR Checker — Free Website Privacy & Compliance Scanner | PrivacyChecker",
    description: "Check if your website is GDPR compliant for free. Scan cookies, trackers, consent banners, privacy policy and security headers in 60 seconds. 25+ automated checks.",
    url: "https://privacychecker.pro",
    siteName: "PrivacyChecker",
    images: [
      {
        url: "https://privacychecker.pro/og-image.png",
        width: 1200,
        height: 630,
        alt: "PrivacyChecker - Privacy Compliance Scanner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GDPR Checker — Free Website Privacy Scanner | PrivacyChecker",
    description: "Free GDPR checker: scan your website in 60 seconds. Audit cookies, consent banners, privacy policy and 25+ checks.",
    images: ["https://privacychecker.pro/og-image.png"],
  },
  metadataBase: new URL("https://privacychecker.pro"),
  verification: {
    google: "NmfWlawWX20rs8aA2StcgEocD3lxYBXlzttI85l4Bwo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Cloudflare Web Analytics (free, privacy-friendly, no cookies) */}
        <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "0f9139f4c2734cbdad5eb6ec359876f8"}'></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "name": "PrivacyChecker",
                  "url": "https://privacychecker.pro",
                  "applicationCategory": "SecurityApplication",
                  "operatingSystem": "Web",
                  "description": "Free privacy compliance scanner for GDPR, CCPA, and website security audits",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "EUR"
                  },
                  "featureList": [
                    "GDPR Compliance Audit",
                    "CCPA Compliance Check",
                    "Cookie Scanner",
                    "Security Headers Analysis",
                    "Accessibility Audit (EAA 2025)",
                    "AI Detection"
                  ]
                },
                {
                  "@type": "Organization",
                  "name": "PrivacyChecker",
                  "url": "https://privacychecker.pro",
                  "logo": "https://privacychecker.pro/logo.png",
                  "sameAs": [],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "privacy@privacychecker.pro",
                    "contactType": "customer support"
                  }
                }
              ]
            })
          }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Lazy-load Google Translate only after user interaction (scroll/click/touch)
            (function() {
              var loaded = false;
              function loadGT() {
                if (loaded) return;
                loaded = true;
                window.googleTranslateElementInit = function() {
                  new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,fr,de,es,it,pt,nl,pl,ro,cs,hu,el,sv,da,fi,no,bg,sk,hr,sl,lt,lv,et,uk,ru,tr,ja,ko,zh-CN,th',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                  }, 'google_translate_element');
                };
                var s = document.createElement('script');
                s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
                document.head.appendChild(s);
                ['scroll','click','touchstart'].forEach(function(e){document.removeEventListener(e,loadGT)});
              }
              ['scroll','click','touchstart'].forEach(function(e){document.addEventListener(e,loadGT,{once:true,passive:true})});
              // Also load after 5s idle as fallback
              setTimeout(loadGT, 5000);
            })();
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            .goog-te-banner-frame { display: none !important; }
            body { top: 0 !important; }
            .goog-te-gadget { font-family: inherit !important; font-size: 0 !important; }
            .goog-te-gadget-simple { 
              background-color: white !important; 
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              padding: 8px 12px !important;
              font-size: 14px !important;
              cursor: pointer;
            }
            .goog-te-gadget-simple .goog-te-menu-value span { color: #374151 !important; font-size: 14px !important; }
            .goog-te-gadget-icon { display: none !important; }
            #google_translate_element { display: inline-block; }
            .VIpgJd-ZVi9od-ORHb-OEVmcd { display: none !important; }
            /* Hide Google Translate feedback popup/tooltip on hover */
            .goog-tooltip { display: none !important; }
            .goog-tooltip:hover { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
            #goog-gt-tt { display: none !important; }
            .goog-te-balloon-frame { display: none !important; }
            .goog-te-menu-frame { display: none !important; }
            .goog-te-spinner-pos { display: none !important; }
            div[id^="goog-gt-"] { display: none !important; }
            .VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q { display: none !important; }
          `
        }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

