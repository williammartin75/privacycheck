---
description: PrivacyChecker deployment and infrastructure configuration
---

# PrivacyChecker Infrastructure

## Hosting
- **Platform**: Render (NOT Vercel)
- **Framework**: Next.js

## Deployment
After pushing to GitHub, Render will automatically:
1. Detect the push
2. Build the Next.js application
3. Deploy with the new changes

## Security Headers
All 10 security headers are configured in `next.config.ts`:
- Strict-Transport-Security
- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Cross-Origin-Embedder-Policy

## Notes
- Headers become active after Render redeploys (typically 2-5 minutes after push)
- Re-scan the site after deployment to verify header changes
