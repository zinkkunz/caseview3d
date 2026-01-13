
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'testuser@example.com';
    console.log(`Creating dummy case for ${email}...`);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User not found');

        const newCase = await prisma.case.create({
            data: {
                userId: user.id,
                title: 'Password Test Case',
                memo: 'Test Memo',
                expiryDate: new Date(Date.now() + 86400000) // 1 day
            }
        });
        console.log('Case created:', newCase.id);
    } catch (e) {
        console.error('Error creating case:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
