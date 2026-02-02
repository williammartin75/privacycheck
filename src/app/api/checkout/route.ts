import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price ID mapping based on tier and billing period
const getPriceId = (tier: 'pro' | 'pro_plus', billingPeriod: 'monthly' | 'yearly'): string => {
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
        const { email, tier = 'pro', billingPeriod = 'yearly' } = await request.json();

        const priceId = getPriceId(tier, billingPeriod);

        if (!priceId) {
            console.error(`Missing price ID for tier: ${tier}, billing: ${billingPeriod}`);
            return NextResponse.json(
                { error: 'Invalid pricing configuration' },
                { status: 500 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${request.headers.get('origin')}/?success=true`,
            cancel_url: `${request.headers.get('origin')}/?canceled=true`,
            customer_email: email,
            metadata: {
                email: email,
                tier: tier,
                billingPeriod: billingPeriod,
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
