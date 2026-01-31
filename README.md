# PrivacyChecker

> **Free GDPR & CCPA Compliance Scanner for Websites**

PrivacyChecker is a SaaS platform that audits websites for privacy compliance across 25+ security and privacy checks. Get instant compliance scores, detailed reports, and actionable recommendations.

## ✨ Features

- **25+ Security Checks** - Cookies, trackers, consent banners, security headers, email security
- **80+ Vendor Risk Database** - Identify third-party risks with GDPR impact scores
- **Multi-Regulation Support** - GDPR, CCPA, LGPD, and 50+ privacy laws
- **Cookie Banner Widget** - GDPR-compliant consent management with Consent Mode v2
- **PDF Reports** - Professional compliance reports for stakeholders
- **Compliance Drift Detection** - Monitor changes that affect your score

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Auth**: Google OAuth via Supabase
- **Hosting**: Render
- **Analytics**: Plausible (privacy-friendly)

## 🔒 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
HIBP_API_KEY= # Optional: Have I Been Pwned API
```

## 📄 License

Proprietary - All rights reserved © 2025 PrivacyChecker SAS
