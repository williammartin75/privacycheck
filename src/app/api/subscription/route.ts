import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();

        // Create a proper Supabase server client that reads cookies correctly
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ tier: 'free' });
        }

        // Get subscription using service role for database access
        const { createClient } = await import('@supabase/supabase-js');
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: subscription } = await adminSupabase
            .from('subscriptions')
            .select('tier, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            return NextResponse.json({ tier: 'free' });
        }

        return NextResponse.json({
            tier: subscription.tier || 'pro'
        });
    } catch (error) {
        console.error('Error getting subscription tier:', error);
        return NextResponse.json({ tier: 'free' });
    }
}
