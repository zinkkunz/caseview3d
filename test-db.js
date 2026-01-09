const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Searching for users...");
        const users = await prisma.user.findMany({ take: 1 });
        console.log("DB Connection Success. Found user count:", users.length);
    } catch (e) {
        console.error("DB Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
