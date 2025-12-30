import { NextResponse } from 'next/server';
import { logPayment, updateUserPlan, PlanType } from '@/lib/payments';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imp_uid, merchant_uid, status } = body;

    console.log(`PortOne Webhook received: ${imp_uid}, Status: ${status}`);

    if (status === 'paid') {
      // 1. Get Access Token from PortOne
      // (Mocked for now as we don't have API keys)
      /*
      const tokenRes = await fetch('https://api.iamport.kr/users/getToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              imp_key: process.env.PORTONE_API_KEY,
              imp_secret: process.env.PORTONE_API_SECRET
          })
      });
      const { response: { access_token } } = await tokenRes.json();
      
      // 2. Verify Payment Status and Amount
      const paymentRes = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
          headers: { 'Authorization': access_token }
      });
      const paymentData = await paymentRes.json();
      if (paymentData.response.status !== 'paid') throw new Error('Payment not paid');
      */

      // 3. Extract userId and plan from merchant_uid
      const parts = merchant_uid.split('_');
      if (parts.length >= 3) {
        const userId = parts[1];
        const plan = parts[2] as PlanType;

        await logPayment({
          userId,
          amount: 0, // Should come from PortOne API validation
          currency: 'KRW',
          provider: 'PORTONE',
          externalId: imp_uid,
          status: 'PAID',
        });

        await updateUserPlan(userId, plan);
        console.log(`User ${userId} upgraded to ${plan}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PortOne Webhook Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
