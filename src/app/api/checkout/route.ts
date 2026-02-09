import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID mapping based on tier, billing period, and purchase mode
const getPriceId = (
    tier: 'pro' | 'pro_plus',
    billingPeriod: 'monthly' | 'yearly',
    purchaseMode: 'one_time' | 'subscription' = 'subscription'
): string => {
    if (purchaseMode === 'one_time') {
        const oneTimePriceMap = {
            pro: process.env.STRIPE_PRICE_ID_PRO_ONETIME!,
            pro_plus: process.env.STRIPE_PRICE_ID_PRO_PLUS_ONETIME!,
        };
        return oneTimePriceMap[tier];
    }

    const priceMap = {
        pro: {
            monthly: process.env.STRIPE_PRICE_ID!, // existing
            yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY!,
        },
        pro_plus: {
            monthly: process.env.STRIPE_PRICE_ID_PRO_PLUS!, // existing
            yearly: process.env.STRIPE_PRICE_ID_PRO_PLUS_YEARLY!,
        },
    };

    return priceMap[tier][billingPeriod];
};

export async function POST(request: NextRequest) {
    try {
        const { email, tier = 'pro', billingPeriod = 'yearly', purchaseMode = 'subscription' } = await request.json();

        const priceId = getPriceId(tier, billingPeriod, purchaseMode);

        if (!priceId) {
            console.error(`Missing price ID for tier: ${tier}, billing: ${billingPeriod}, mode: ${purchaseMode}`);
            return NextResponse.json(
                { error: 'Invalid pricing configuration' },
                { status: 500 }
            );
        }

        const isOneTime = purchaseMode === 'one_time';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: isOneTime ? 'payment' : 'subscription',
            success_url: `${request.headers.get('origin')}/?success=true`,
            cancel_url: `${request.headers.get('origin')}/?canceled=true`,
            customer_email: email,
            metadata: {
                email: email,
                tier: tier,
                billingPeriod: billingPeriod,
                purchaseMode: purchaseMode,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}
