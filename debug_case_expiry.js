const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const caseId = '262e2f5b-b118-4dd8-9eae-5f122ff409ff';
    const c = await prisma.case.findUnique({
        where: { id: caseId }
    });

    if (!c) {
        console.log('Case not found');
        return;
    }

    console.log('Case ID:', c.id);
    console.log('Created At:', c.createdAt);
    console.log('Expiry Date:', c.expiryDate);
    console.log('Is Expired Flag:', c.isExpired);
    console.log('System Now:', new Date());
    
    if (c.expiryDate) {
        console.log('Diff (Expiry - Now) in ms:', new Date(c.expiryDate).getTime() - new Date().getTime());
        console.log('Is Now > Expiry?', new Date() > c.expiryDate);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
