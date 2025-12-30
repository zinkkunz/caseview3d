import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ message: '이메일을 입력해주세요.' }, { status: 400 });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Security best practice: don't reveal if user exists.
            // But for a prototype, we can be more explicit or just return success.
            return NextResponse.json({ success: true, message: '이메일이 존재하면 초기화 링크가 발송됩니다.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry
            }
        });

        // In production, send email here. In prototype, we log it.
        console.log(`Password reset requested for ${email}. Token: ${token}`);
        
        return NextResponse.json({ 
            success: true, 
            message: '비밀번호 초기화 링크가 발송되었습니다. (콘솔 로그 확인)',
            debugToken: process.env.NODE_ENV === 'development' ? token : undefined 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: '서버 오류' }, { status: 500 });
    }
}
