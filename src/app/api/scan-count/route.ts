import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { createClient } = await import('@/lib/supabase-server');
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ count: 0, limit: 10, remaining: 10 });
        }

        // Get user's tier
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier')
            .eq('user_id', user.id)
            .single();

        const tier = subscription?.tier || 'free';
        const limit = tier === 'pro_plus' ? 200 : tier === 'pro' ? 50 : 10;

        // Count scans this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count, error: countError } = await supabase
            .from('scan_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth.toISOString());

        if (countError) {
            console.error('Error counting scans:', countError);
            return NextResponse.json({ count: 0, limit, remaining: limit, tier });
        }

        const scanCount = count || 0;
        const remaining = Math.max(0, limit - scanCount);

        return NextResponse.json({
            count: scanCount,
            limit,
            remaining,
            tier,
            atLimit: remaining === 0
        });
    } catch (error) {
        console.error('Scan count error:', error);
        return NextResponse.json({ count: 0, limit: 10, remaining: 10, error: 'Failed to get scan count' });
    }
}
