import { prisma } from '@/lib/prisma';
import type { Plan } from './types';

// 요금제별 제한 값
export const PLAN_LIMITS = {
    FREE: {
        maxLinks: 1,
        linkDurationHours: 2,
        label: 'Free',
        features: { password: false, customLogo: false }
    },
    BASIC: {
        maxLinks: 5,
        linkDurationHours: 24, // 1일
        label: 'Basic',
        features: { password: true, customLogo: false }
    },
    PRO: {
        maxLinks: 20,
        linkDurationHours: 72, // 3일
        label: 'Pro',
        features: { password: true, customLogo: true }
    },
    ENTERPRISE: {
        maxLinks: 99999, // 무제한
        linkDurationHours: 87600, // 10년 (영구)
        label: 'Enterprise',
        features: { password: true, customLogo: true }
    },
    // 기존 호환성 유지
    STANDARD: { maxLinks: 10, linkDurationHours: 72, label: 'Standard (Deprecated)', features: { password: true, customLogo: false } },
    BUSINESS: { maxLinks: 99999, linkDurationHours: 87600, label: 'Business (Deprecated)', features: { password: true, customLogo: true } },
    ADMIN: { maxLinks: 99999, linkDurationHours: 87600, label: 'Admin', features: { password: true, customLogo: true } }
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
        select: { plan: true, planEndDate: true, role: true },
    });
    if (!user) return { allowed: false, reason: 'PLAN_EXPIRED' };

    // ADMIN 역할은 무조건 허용
    if (user.role === 'ADMIN') {
        return { allowed: true };
    }

    const plan = (user.plan as Plan) || 'FREE';

    // 만료 체크 (무료/Enterprise/Admin 플랜은 만료 없음)
    // FIX: ADMIN 플랜도 만료 체크에서 제외
    if (plan !== 'FREE' && plan !== 'ENTERPRISE' && plan !== 'ADMIN' && user.planEndDate && new Date() > user.planEndDate) {
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
