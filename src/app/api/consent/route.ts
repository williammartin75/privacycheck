import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Hash IP address for privacy (we don't store raw IPs)
function hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'privacychecker').digest('hex').substring(0, 16);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { siteId, visitorId, consentType, categories } = body;

        // Validate required fields
        if (!siteId || !visitorId || !consentType) {
            return NextResponse.json(
                { error: 'Missing required fields: siteId, visitorId, consentType' },
                { status: 400 }
            );
        }

        // Validate consent type
        if (!['accept', 'reject'].includes(consentType)) {
            return NextResponse.json(
                { error: 'consentType must be "accept" or "reject"' },
                { status: 400 }
            );
        }

        // Get IP and User Agent
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Create Supabase client
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        // Find user_id from site_id (optional - link to subscription owner)
        // For now, we store without user_id link since banner is on external sites

        // Insert consent log
        const { error } = await supabase.from('consent_logs').insert({
            site_id: siteId,
            visitor_id: visitorId,
            consent_type: consentType,
            ip_hash: hashIP(ip),
            user_agent: userAgent.substring(0, 500), // Limit length
            categories: categories || {
                necessary: true,
                analytics: consentType === 'accept',
                marketing: consentType === 'accept',
                preferences: consentType === 'accept',
            },
        });

        if (error) {
            console.error('Error inserting consent log:', error);
            return NextResponse.json(
                { error: 'Failed to log consent' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Consent API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve consent logs for a site (Pro users only)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
        return NextResponse.json(
            { error: 'siteId is required' },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options);
                    });
                },
            },
        }
    );

    // Get consent logs with pagination
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error, count } = await supabase
        .from('consent_logs')
        .select('*', { count: 'exact' })
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching consent logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch consent logs' },
            { status: 500 }
        );
    }

    // Calculate stats
    const acceptCount = data?.filter(log => log.consent_type === 'accept').length || 0;
    const rejectCount = data?.filter(log => log.consent_type === 'reject').length || 0;
    const total = acceptCount + rejectCount;

    return NextResponse.json({
        logs: data,
        total: count,
        stats: {
            accept: acceptCount,
            reject: rejectCount,
            acceptRate: total > 0 ? Math.round((acceptCount / total) * 100) : 0,
        },
    });
}
