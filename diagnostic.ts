import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient({
    log: [],
});

async function main() {
    console.log('--- DIAGNOSTIC START ---');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    try {
        const count = await prisma.case.count();
        console.log('Total Cases:', count);

        const specificId = '46747bb6-4eb9-4366-90d8-647ffdf0ccf8';
        const specificCase = await prisma.case.findUnique({ where: { id: specificId }});
        console.log('Case Found?', !!specificCase);
        if (specificCase) {
             console.log('Case Data:', JSON.stringify(specificCase));
        } else {
             console.log('Case NOT found in DB');
        }

    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        await prisma.();
        console.log('--- DIAGNOSTIC END ---');
    }
}

main();
