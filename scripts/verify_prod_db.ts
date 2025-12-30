import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to Prisma...');
    const userCount = await prisma.user.count();
    console.log(` Success! Connection established. Current users: ${userCount}`);
  } catch (e) {
    console.error(' Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
