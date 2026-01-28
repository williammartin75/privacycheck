import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        console.log('[Portal] Looking for customer with email:', email);

        // Find customer by email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1,
        });

        console.log('[Portal] Found customers count:', customers.data.length);

        if (customers.data.length === 0) {
            // Try searching with lowercase email as fallback
            const customersLower = await stripe.customers.list({
                email: email.toLowerCase(),
                limit: 1,
            });

            console.log('[Portal] Found customers (lowercase) count:', customersLower.data.length);

            if (customersLower.data.length === 0) {
                // Last resort: search all customers and filter
                const allCustomers = await stripe.customers.list({ limit: 100 });
                const matchingCustomer = allCustomers.data.find(c =>
                    c.email?.toLowerCase() === email.toLowerCase()
                );

                if (!matchingCustomer) {
                    console.log('[Portal] No customer found for email:', email);
                    return NextResponse.json(
                        { error: 'No subscription found' },
                        { status: 404 }
                    );
                }

                console.log('[Portal] Found customer via search:', matchingCustomer.id);
                const portalSession = await stripe.billingPortal.sessions.create({
                    customer: matchingCustomer.id,
                    return_url: `${request.headers.get('origin')}/dashboard`,
                });
                return NextResponse.json({ url: portalSession.url });
            }

            const customer = customersLower.data[0];
            console.log('[Portal] Using lowercase match customer:', customer.id);
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customer.id,
                return_url: `${request.headers.get('origin')}/dashboard`,
            });
            return NextResponse.json({ url: portalSession.url });
        }

        const customer = customers.data[0];
        console.log('[Portal] Found customer:', customer.id, 'email:', customer.email);

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${request.headers.get('origin')}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        return NextResponse.json(
            { error: 'Error creating portal session' },
            { status: 500 }
        );
    }
}
