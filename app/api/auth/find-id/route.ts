import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ message: '이름을 입력해주세요.' }, { status: 400 });

        const users = await prisma.user.findMany({
            where: { name },
            select: { email: true, createdAt: true }
        });

        if (users.length === 0) {
            return NextResponse.json({ message: '해당 이름으로 가입된 계정이 없습니다.' }, { status: 404 });
        }

        // Masking the emails for privacy
        const maskedUsers = users.map(user => {
            const [local, domain] = user.email!.split('@');
            const maskedLocal = local.slice(0, 3) + '*'.repeat(local.length - 3);
            return {
                email: `${maskedLocal}@${domain}`,
                createdAt: user.createdAt
            };
        });

        return NextResponse.json({ success: true, users: maskedUsers });
    } catch (error) {
        console.error('Find ID error:', error);
        return NextResponse.json({ message: '서버 오류' }, { status: 500 });
    }
}
