const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function reset() {
    const email = 'zinsunz@naver.com';
    const password = '1234';

    try {
        // Force delete via prisma first
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            await prisma.user.delete({ where: { email } });
            console.log('Deleted existing user');
        }
    } catch (e) {
        console.log('Delete check failed', e.message);
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
        data: {
            email,
            password: hashed,
            role: 'ADMIN',
            isActive: true,
            plan: 'ENTERPRISE',
            name: 'Admin User'
        }
    });
    console.log(`Created clean user ${email} with password '1234'`);
}

reset()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
