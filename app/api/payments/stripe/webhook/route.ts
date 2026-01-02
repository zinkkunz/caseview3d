import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import Stripe from 'stripe';
import { logPayment, updateUserPlan, PlanType } from '@/lib/payments';

// Initialize Stripe safely to prevent build errors
let stripe: Stripe | null = null;
try {
    const key = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
    stripe = new Stripe(key, {
        apiVersion: '2024-11-20.acacia' as any,
        typescript: true,
    });
} catch (e) {
    console.warn('Stripe initialization failed (OK during build):', e);
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripe) {
      return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.warn('Stripe signature or endpoint secret missing. Skipping verification for testing.');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ error: 'Webhook Error: ' + err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment successful for checkout session:', session.id);
      
      const userId = session.metadata?.userId || session.client_reference_id;
      const plan = session.metadata?.plan as PlanType;

      if (userId && plan) {
        await logPayment({
          userId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || 'USD',
          provider: 'STRIPE',
          externalId: session.id,
          status: 'PAID',
        });

        await updateUserPlan(userId, plan);
        console.log('User upgraded via Stripe:', userId, plan);
      }
      break;
    
    case 'invoice.payment_failed':
      break;

    default:
      console.log('Unhandled event type', event.type);
  }

  return NextResponse.json({ received: true });
}
