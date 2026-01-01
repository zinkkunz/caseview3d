import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

console.log('[Prisma] Initializing client...');
console.log('[Prisma] DB_URL from Env:', process.env.DATABASE_URL);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Diagnostic check
// prisma.case.count().then(c => console.log('[Prisma] Total Cases:', c)).catch(e => console.error('[Prisma] Error:', e));
