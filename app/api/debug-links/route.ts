import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const links = await prisma.link.findMany();
        const cases = await prisma.case.findMany({ select: { id: true, title: true, memo: true } });
        return NextResponse.json({ links, cases });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
