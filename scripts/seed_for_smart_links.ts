import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function main() {
    // 1. Create User
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            plan: 'STANDARD', // ensure premium features
        },
    });

    console.log('User created:', user.id);

    // 2. Create Case
    const newCase = await prisma.case.create({
        data: {
            userId: user.id,
            title: 'Smart Link Test Case',
            memo: 'Testing Secure Links',
            files: {
                create: [
                    { path: 'test-file.glb', type: 'glb', size: 1024 }
                ]
            }
        }
    });

    console.log('Case created:', newCase.id);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
