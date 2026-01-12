// lib/types.ts
// SQLite는 enum을 지원하지 않으므로 TypeScript 타입으로 정의

export const PLAN_VALUES = ['FREE', 'BASIC', 'STANDARD', 'PRO', 'BUSINESS', 'ADMIN', 'ENTERPRISE'] as const;
export type Plan = typeof PLAN_VALUES[number];

export function isPlan(value: string): value is Plan {
    // @ts-ignore
    return PLAN_VALUES.includes(value as Plan);
}

export function assertPlan(value: string): Plan {
    if (!isPlan(value)) {
        throw new Error(`Invalid plan: ${value}. Must be one of: ${PLAN_VALUES.join(', ')}`);
    }
    return value;
}
