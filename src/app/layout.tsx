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
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

