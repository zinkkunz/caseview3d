import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from './plan-limits';

export { PLAN_LIMITS };

export type PlanType = keyof typeof PLAN_LIMITS;

export async function updateUserPlan(userId: string, plan: PlanType, months: number = 1) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  return await prisma.user.update({
    where: { id: userId },
    data: {
      plan: plan as string,
      planStartDate: startDate,
      planEndDate: endDate,
    },
  });
}

export async function logPayment({
  userId,
  amount,
  currency,
  provider,
  externalId,
  status,
}: {
  userId: string;
  amount: number;
  currency: string;
  provider: 'PORTONE' | 'STRIPE';
  externalId: string;
  status: 'PAID' | 'FAILED' | 'CANCELLED';
}) {
  return await prisma.payment.upsert({
    where: { externalId },
    update: {
      status,
      updatedAt: new Date(),
    },
    create: {
      userId,
      amount,
      currency,
      provider,
      externalId,
      status,
    },
  });
}
