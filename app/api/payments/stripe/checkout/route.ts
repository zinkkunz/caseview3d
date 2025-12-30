import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// STRIPE_SECRET_KEY는 환경 변수에서 가져옵니다.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { userId, plan, priceId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Stripe Dashboard에서 생성한 Price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment_status=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?payment_status=cancel`,
      metadata: {
        userId,
        plan,
      },
      client_reference_id: userId,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
