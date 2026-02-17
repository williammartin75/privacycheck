---
description: PrivacyChecker deployment and infrastructure configuration
---

## Hosting
- **Frontend**: Hosted on **Render** (NOT Vercel) at `privacychecker.pro`
- **Legacy URL**: `privacycheck.onrender.com` (old Render URL, still accessible)
- **Database**: Supabase
- **Analytics**: Plausible script is installed but no paid account — consider replacing with Umami or free alternative
- **Domain**: `privacychecker.pro`
- **Git**: GitHub `williammartin75/privacycheck`, auto-deploys from `main` branch

## VPS Infrastructure
- 40 RackNerd VPS for Common Crawl processing and email campaigns
- 63 email domains across 40 VPS for outreach

## Important
- Do NOT refer to Vercel anywhere — the site is on Render
- Push to `main` triggers auto-deploy on Render
