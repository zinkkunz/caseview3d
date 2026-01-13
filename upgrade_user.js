
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'testuser@example.com';
    console.log(`Upgrading user ${email} to PRO plan...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                plan: 'PRO',
                role: 'USER' // Ensure they are not ADMIN for this test, or keep it simple
            }
        });
        console.log('User updated:', user);
    } catch (e) {
        console.error('Error updating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
