import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Use service role to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Admin endpoint to sync tier from Stripe based on price ID
export async function POST(request: NextRequest) {
    try {
        const { email, secret } = await request.json();

        // Simple admin check
        if (secret !== process.env.ADMIN_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Get user by email
        const { data: users } = await supabase.auth.admin.listUsers();
        const user = users?.users.find(u => u.email === email);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get subscription from database
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!subscription?.stripe_subscription_id) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        // Get subscription details from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

        if (!stripeSubscription.items.data[0]?.price?.id) {
            return NextResponse.json({ error: 'Could not retrieve Stripe subscription' }, { status: 500 });
        }

        const priceId = stripeSubscription.items.data[0].price.id;

        // Determine tier based on price ID
        const isProPlus = priceId === process.env.STRIPE_PRICE_ID_PRO_PLUS;
        const newTier = isProPlus ? 'pro_plus' : 'pro';

        // Update subscription with correct tier
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                tier: newTier,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            email,
            previousTier: subscription.tier,
            newTier,
            priceId,
            isProPlus
        });
    } catch (error) {
        console.error('Error syncing tier:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
