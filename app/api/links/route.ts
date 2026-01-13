import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateSlug(length: number = 7): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { caseId, expiresAt, maxViews, description, password } = body;

        console.log('[API] Creating link for case:', caseId);

        if (!caseId) {
            return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });
        }

        // Verify ownership and plan
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true, role: true }
        });

        const caseItem = await prisma.case.findUnique({
            where: { id: caseId },
            select: { userId: true }
        });

        if (!caseItem || caseItem.userId !== session.user.id) {
            console.error('[API] Case not found or unauthorized:', caseId);
            return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 });
        }

        // Password Feature Check
        let passwordHash: string | null = null;
        if (password && password.trim().length > 0) {
            const plan = user?.plan || 'FREE';
            const allowedPlans = ['BASIC', 'PRO', 'ENTERPRISE', 'ADMIN', 'STANDARD', 'BUSINESS'];

            if (user?.role !== 'ADMIN' && !allowedPlans.includes(plan)) {
                return NextResponse.json({ error: 'Password protection requires Basic or Pro plan.' }, { status: 403 });
            }

            // Simple hash or Bcrypt
            try {
                const bcrypt = require('bcryptjs');
                passwordHash = await bcrypt.hash(password, 10);
            } catch (e) {
                console.error('Bcrypt error:', e);
                // Fallback probably not safe, but erroring is safer
                return NextResponse.json({ error: 'Encryption failed' }, { status: 500 });
            }
        }

        // Generate unique slug
        let slug = generateSlug();
        let retries = 0;
        while (await prisma.link.findUnique({ where: { slug } })) {
            slug = generateSlug();
            retries++;
            if (retries > 5) throw new Error('Too many slug collisions');
        }

        const newLink = await prisma.link.create({
            data: {
                slug,
                caseId,
                description,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                maxViews: maxViews ? parseInt(maxViews) : null,
                createdBy: session.user.id,
                password: passwordHash
            }
        });

        console.log('[API] Link created:', slug);

        return NextResponse.json({
            success: true,
            link: newLink,
            url: `${request.nextUrl.origin}/s/${slug}`
        });

    } catch (error: any) {
        console.error('Create Link Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error', stack: error.stack }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
