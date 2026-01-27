import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get('sb-access-token')?.value;

        if (!authToken) {
            return NextResponse.json({ tier: 'free' });
        }

        // Get user from token
        const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
        if (authError || !user) {
            return NextResponse.json({ tier: 'free' });
        }

        // Get subscription
        const { data: subscription } = await supabase
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
