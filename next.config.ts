import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Proxy Umami analytics through our domain (avoids mixed content + adblockers)
  async rewrites() {
    return [
      {
        source: '/pctrack.js',
        destination: 'http://23.95.222.204:3000/pctrack.js',
      },
      {
        source: '/api/send',
        destination: 'http://23.95.222.204:3000/api/send',
      },
    ];
  },


  // Security Headers for 100% compliance score
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://*.googleapis.com https://*.gstatic.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com https://*.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com https://*.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.googleapis.com https://*.gstatic.com",
              "frame-src 'self' https://js.stripe.com https://translate.google.com",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
