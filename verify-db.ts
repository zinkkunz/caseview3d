import { prisma } from '@/lib/prisma';

async function main() {
  try {
    console.log('Verifying User table...');
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);

    console.log('Verifying PlanLimit table...');
    const limits = await prisma.planLimit.findMany();
    console.log(`Plan Limits found: ${limits.length}`);
    
    console.log('Database verification SUCCESS');
  } catch (error) {
    console.error('Database verification FAILED:', error);
    process.exit(1);
  }
}

main();
