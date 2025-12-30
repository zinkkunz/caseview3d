import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('1234', 10)

    // 1. 임시 테스트 계정 (ADMIN)
    const user = await prisma.user.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: {
            email: 'test@test.com',
            name: 'Test User',
            password,
            role: 'ADMIN',
        },
    })
    console.log(' Test user checked:', user.email)

    // 2. 요금제 정책 동기화 (사용자 요청 기준 반영)
    const plans = [
        { plan: 'FREE', maxLinks: 1, linkDurationHours: 2 },
        { plan: 'BASIC', maxLinks: 3, linkDurationHours: 6 },
        { plan: 'STANDARD', maxLinks: 10, linkDurationHours: 24 },
    ];

    for (const p of plans) {
        await prisma.planLimit.upsert({
            where: { plan: p.plan },
            update: {
                maxLinks: p.maxLinks,
                linkDurationHours: p.linkDurationHours,
            },
            create: {
                plan: p.plan,
                maxLinks: p.maxLinks,
                linkDurationHours: p.linkDurationHours,
            },
        });
        console.log(` Updated ${p.plan}: ${p.maxLinks} links, ${p.linkDurationHours} hours`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
