import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        : 'https://privacychecker.pro/api/auth/callback';

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://privacychecker.pro';

    // Supabase client with service role
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
        return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
        }

        const tokens = await tokenResponse.json();
        const idToken = tokens.id_token;

        if (!idToken) {
            return NextResponse.redirect(`${baseUrl}/login?error=no_id_token`);
        }

        // Sign in to Supabase using the Google ID token
        const { data, error: signInError } = await supabaseAdmin.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (signInError) {
            console.error('Supabase sign in error:', signInError);
            return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(signInError.message)}`);
        }

        // Create session cookie by redirecting to a page that will set the session
        const session = data.session;

        if (!session) {
            return NextResponse.redirect(`${baseUrl}/login?error=no_session`);
        }

        // Redirect to a client-side handler that will set the session
        const sessionParams = new URLSearchParams({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        });

        return NextResponse.redirect(`${baseUrl}/auth/session?${sessionParams.toString()}`);

    } catch (err) {
        console.error('OAuth callback error:', err);
        return NextResponse.redirect(`${baseUrl}/login?error=callback_failed`);
    }
}
