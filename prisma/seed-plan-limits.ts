import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding plan limits...');

    // FREE 요금제
    await prisma.planLimit.upsert({
        where: { plan: 'FREE' },
        update: {},
        create: {
            plan: 'FREE',
            maxLinks: 1,
            linkDurationHours: 2,
        },
    });

    // BASIC 요금제
    await prisma.planLimit.upsert({
        where: { plan: 'BASIC' },
        update: {},
        create: {
            plan: 'BASIC',
            maxLinks: 3,
            linkDurationHours: 6,
        },
    });

    // STANDARD 요금제
    await prisma.planLimit.upsert({
        where: { plan: 'STANDARD' },
        update: {},
        create: {
            plan: 'STANDARD',
            maxLinks: 10,
            linkDurationHours: 24,
        },
    });

    console.log('Plan limits seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
