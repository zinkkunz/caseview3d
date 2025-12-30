
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Attempting to create a test annotation...");
        const ann = await prisma.annotation.create({
            data: {
                caseId: '376c2484-1da1-42b3-b9bc-45382073c8c5',
                x: 0,
                y: 0,
                z: 0,
                nx: 0,
                ny: 1,
                nz: 0,
                text: 'Diagnostic Test'
            }
        });
        console.log("Success:", ann);
    } catch (err) {
        console.error("CRITICAL ERROR:", err);
        if (err.code) console.error("Error Code:", err.code);
        if (err.meta) console.error("Error Meta:", err.meta);
    } finally {
        await prisma.$disconnect();
    }
}

test();
