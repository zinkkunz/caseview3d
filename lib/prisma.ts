import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

const getPrisma = () => {
  if (!prismaInstance) {
    const globalForPrisma = global as unknown as { prisma: PrismaClient };
    prismaInstance = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;
  }
  return prismaInstance;
};

export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    return getPrisma()[prop as keyof PrismaClient];
  }
});
