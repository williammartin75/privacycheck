import { NextRequest, NextResponse } from 'next/server';
import { getRegulationForCountry, getConsentMode, shouldBlockByDefault } from '@/lib/geo-regulations';

// Free IP geolocation using Cloudflare headers or fallback
export async function GET(request: NextRequest) {
    try {
        // Try Cloudflare headers first (if behind Cloudflare)
        const cfCountry = request.headers.get('cf-ipcountry');
        const cfRegion = request.headers.get('cf-region');

        // Try Vercel/other edge headers
        const vercelCountry = request.headers.get('x-vercel-ip-country');
        const vercelRegion = request.headers.get('x-vercel-ip-country-region');

        // Get client IP for fallback lookup
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

        let countryCode = cfCountry || vercelCountry;
        let regionCode = cfRegion || vercelRegion;

        // If no header-based geo, use free IP API fallback
        if (!countryCode && clientIp !== 'unknown') {
            try {
                // Use ip-api.com (free, no API key needed, 45 req/min)
                const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode,region`, {
                    signal: AbortSignal.timeout(2000),
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    countryCode = geoData.countryCode;
                    regionCode = geoData.region;
                }
            } catch {
                // Fallback silently - will use default regulation
            }
        }

        // Default to unknown if we couldn't detect
        countryCode = countryCode || 'XX';

        // Get applicable regulation
        const regulation = getRegulationForCountry(countryCode, regionCode || undefined);
        const consentMode = getConsentMode(regulation);
        const blockByDefault = shouldBlockByDefault(regulation);

        return NextResponse.json({
            detected: {
                countryCode,
                regionCode: regionCode || null,
                ip: clientIp !== 'unknown' ? clientIp.substring(0, 10) + '***' : null,
            },
            regulation: {
                code: regulation.code,
                name: regulation.name,
                shortName: regulation.shortName,
                bannerText: regulation.bannerText,
            },
            settings: {
                consentMode,          // 'opt-in' | 'opt-out' | 'notice-only'
                blockByDefault,       // Should block cookies before consent?
                requireExplicit: regulation.requirements.priorConsent,
                allowOptOut: regulation.requirements.optOut,
            },
        });
    } catch (error) {
        console.error('Geo detection error:', error);
        return NextResponse.json({
            detected: { countryCode: 'XX', regionCode: null, ip: null },
            regulation: {
                code: 'default',
                name: 'General Privacy Notice',
                shortName: 'Privacy',
                bannerText: 'We use cookies to enhance your experience.',
            },
            settings: {
                consentMode: 'opt-out',
                blockByDefault: false,
                requireExplicit: false,
                allowOptOut: true,
            },
        });
    }
}
