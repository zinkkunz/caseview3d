import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function main() {
    console.log("=== LINKS ===");
    const links = await prisma.link.findMany();
    console.log(JSON.stringify(links, null, 2));

    console.log("\n=== CASES ===");
    const cases = await prisma.case.findMany({ select: { id: true, title: true, memo: true } });
    console.log(JSON.stringify(cases, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
