import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrivacyChecker - Free Privacy Compliance Checker - GDPR & CCPA",
  description: "Scan your website for GDPR, CCPA, and privacy compliance issues. Get instant audit reports with step-by-step fix recommendations. Free privacy compliance checker.",
  keywords: ["GDPR", "CCPA", "privacy compliance", "cookie consent", "website audit", "privacy policy checker", "data protection"],
  authors: [{ name: "PrivacyChecker" }],
  creator: "PrivacyChecker",
  publisher: "PrivacyChecker",
  robots: "index, follow",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
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
        <script defer data-domain="privacychecker.pro" src="https://plausible.io/js/script.js"></script>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr,de,es,it,pt,nl,pl,ro,cs,hu,el,sv,da,fi,no,bg,sk,hr,sl,lt,lv,et,uk,ru,tr,ja,ko,zh-CN,th',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
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

