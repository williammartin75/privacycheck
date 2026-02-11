import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Use service role to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.customer_email) {
                    // Get user by email
                    const { data: users } = await supabase.auth.admin.listUsers();
                    const user = users?.users.find(u => u.email === session.customer_email);

                    if (user) {
                        // Extract tier from metadata (default to 'pro')
                        const tier = (session.metadata?.tier === 'pro_plus') ? 'pro_plus' : 'pro';
                        const purchaseMode = session.metadata?.purchaseMode || (session.mode === 'subscription' ? 'subscription' : 'one_time');

                        if (session.mode === 'subscription') {
                            // Recurring subscription
                            await supabase.from('subscriptions').upsert({
                                user_id: user.id,
                                stripe_customer_id: session.customer as string,
                                stripe_subscription_id: session.subscription as string,
                                status: 'active',
                                tier: tier,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: 'user_id'
                            });
                        } else if (session.mode === 'payment') {
                            // One-time payment — grant lifetime access
                            await supabase.from('subscriptions').upsert({
                                user_id: user.id,
                                stripe_customer_id: session.customer as string,
                                stripe_subscription_id: `onetime_${session.id}`,
                                status: 'active',
                                tier: tier,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: 'user_id'
                            });
                        }

                        // Sync tier into user app_metadata (visible in Supabase Auth dashboard)
                        await supabase.auth.admin.updateUserById(user.id, {
                            app_metadata: { tier, purchaseMode, stripe_customer_id: session.customer as string }
                        });

                        console.log(`[WEBHOOK] Checkout completed: ${session.customer_email}, tier=${tier}, mode=${purchaseMode}`);
                    } else {
                        console.error(`[WEBHOOK] User not found for email: ${session.customer_email}`);
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription & { current_period_end: number };

                await supabase.from('subscriptions').update({
                    status: subscription.status === 'active' ? 'active' : 'inactive',
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                }).eq('stripe_subscription_id', subscription.id);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                // Downgrade in subscriptions table
                const { data: subRow } = await supabase.from('subscriptions')
                    .update({ status: 'inactive', updated_at: new Date().toISOString() })
                    .eq('stripe_subscription_id', subscription.id)
                    .select('user_id')
                    .single();

                // Also downgrade app_metadata so Auth dashboard reflects it
                if (subRow?.user_id) {
                    await supabase.auth.admin.updateUserById(subRow.user_id, {
                        app_metadata: { tier: 'free', purchaseMode: null }
                    });
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
