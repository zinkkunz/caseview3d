const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'zinsunz@naver.com';
    const password = 'admin1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            plan: 'ENTERPRISE'
        },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
            plan: 'ENTERPRISE'
        }
    });

    console.log('Admin account created/updated:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
