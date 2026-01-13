import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ slug: string }> } // Updated type for Next.js 15+
) {
    const { slug } = await context.params;

    try {
        const { password } = await req.json();

        // 1. Find Link
        const link = await prisma.link.findUnique({
            where: { slug },
            select: { password: true }
        });

        if (!link) {
            return NextResponse.json({ error: 'Link not found' }, { status: 404 });
        }

        if (!link.password) {
            return NextResponse.json({ success: true, message: 'No password required' });
        }

        // 2. Verify Password
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(password, link.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        // 3. Set Cookie
        // Cookie name: `link_unlock_${slug}`
        const cookieStore = await cookies();
        cookieStore.set(`link_unlock_${slug}`, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day access
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Unlock Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
