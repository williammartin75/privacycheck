import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { email, tier = 'pro' } = await request.json();

        // Select price ID based on tier
        const priceId = tier === 'pro_plus'
            ? process.env.STRIPE_PRICE_ID_PRO_PLUS!
            : process.env.STRIPE_PRICE_ID!;

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
