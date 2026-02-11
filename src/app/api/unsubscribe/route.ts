import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        const cleanEmail = email.toLowerCase().trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Upsert into unsubscribes table (idempotent — safe to call multiple times)
        const { error } = await supabase
            .from('unsubscribes')
            .upsert(
                {
                    email: cleanEmail,
                    unsubscribed_at: new Date().toISOString(),
                    source: 'web',
                    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                },
                { onConflict: 'email' }
            );

        if (error) {
            console.error('Unsubscribe DB error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to process request' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Unsubscribe error:', err);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET handler — for one-click unsubscribe from email links
export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
        return NextResponse.redirect(new URL('/unsubscribe', req.url));
    }

    const cleanEmail = decodeURIComponent(email).toLowerCase().trim();

    // Auto-unsubscribe via link click
    await supabase
        .from('unsubscribes')
        .upsert(
            {
                email: cleanEmail,
                unsubscribed_at: new Date().toISOString(),
                source: 'email_link',
                ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
            },
            { onConflict: 'email' }
        );

    // Redirect to confirmation page
    return NextResponse.redirect(
        new URL(`/unsubscribe?email=${encodeURIComponent(cleanEmail)}&confirmed=true`, req.url)
    );
}
