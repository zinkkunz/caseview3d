import { deleteExpiredCases } from '@/app/admin/actions';
import { NextResponse } from 'next/server';

// Vercel Cron은 GET 요청을 보냄
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 보안을 위해 CRON_SECRET을 확인할 수 있으나, 로컬 테스트 편의를 위해 일단 주석 처리
    // const authHeader = request.headers.get('authorization');
    // if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        const result = await deleteExpiredCases();
        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
