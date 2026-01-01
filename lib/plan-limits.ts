// lib/plan-limits.ts
import { prisma } from '@/lib/prisma';
import type { Plan } from './types';

// 요금제별 제한 값 (사용자 요청 정책 반영: FREE 1/2h, BASIC 3/6h, STANDARD 10/24h)
export const PLAN_LIMITS = {
    FREE: {
        maxLinks: 1,
        linkDurationHours: 2,
        label: 'Free'
    },
    BASIC: {
        maxLinks: 3,
        linkDurationHours: 6,
        label: 'Basic'
    },
    STANDARD: {
        maxLinks: 10,
        linkDurationHours: 24,
        label: 'Standard'
    },
    // 상위 플랜은 추후 확장을 위해 정의
    PRO: {
        maxLinks: 50,
        linkDurationHours: 168,
        label: 'Pro'
    },
    BUSINESS: {
        maxLinks: 1000,
        linkDurationHours: 720,
        label: 'Business'
    },
    ADMIN: {
        maxLinks: 99999,
        linkDurationHours: 8760, // 1 year
        label: 'Admin'
    }
} as const;

export async function canCreateLink(userId: string): Promise<{
    allowed: boolean;
    reason?: 'MAX_LINKS_EXCEEDED' | 'PLAN_EXPIRED';
    currentCount?: number;
    maxLinks?: number;
}> {
    if (!userId) return { allowed: false, reason: 'PLAN_EXPIRED' };
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, planEndDate: true },
    });
    if (!user) return { allowed: false, reason: 'PLAN_EXPIRED' };
    const plan = (user.plan as Plan) || 'FREE';

    // 만료 체크 (무료 요금제는 만료가 없음)
    if (plan !== 'FREE' && user.planEndDate && new Date() > user.planEndDate) {
        return { allowed: false, reason: 'PLAN_EXPIRED' };
    }

    const activeLinkCount = await getUserActiveLinkCount(userId);
    // @ts-ignore
    const maxLinks = PLAN_LIMITS[plan]?.maxLinks ?? 1;

    if (activeLinkCount >= maxLinks) {
        return { allowed: false, reason: 'MAX_LINKS_EXCEEDED', currentCount: activeLinkCount, maxLinks };
    }
    return { allowed: true };
}

export async function getUserActiveLinkCount(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
        const count = await prisma.case.count({
            where: {
                userId: userId,
                isExpired: false,
                expiryDate: { gt: new Date() },
            },
        });
        return count;
    } catch (error) {
        console.error(`[getUserActiveLinkCount] Prisma error:`, error);
        return 0;
    }
}

export function calculateExpiryDate(plan: Plan): Date {
    // @ts-ignore
    const hours = PLAN_LIMITS[plan]?.linkDurationHours ?? 2;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + hours);
    return expiryDate;
}

export async function getPlanLimits(plan: Plan) {
    const planLimit = await prisma.planLimit.findUnique({ where: { plan } });
    // @ts-ignore
    if (!planLimit) return PLAN_LIMITS[plan];
    return { maxLinks: planLimit.maxLinks, linkDurationHours: planLimit.linkDurationHours };
}
