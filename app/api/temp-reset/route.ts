import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const email = 'zinsunz@naver.com';
        const newPassword = 'admin1234';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email },
            data: { 
                password: hashedPassword,
                role: 'ADMIN',
                plan: 'ADMIN' // Also force Plan to ADMIN to fix upload issue completely
            }
        });

        return NextResponse.json({ success: true, message: `Password for ${email} reset to ${newPassword}, Plan set to ADMIN` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
