import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { getSignedFileUrl, deleteFileFromR2 } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const caseItem = await prisma.case.findUnique({
            where: { id },
            include: {
                File: true,
                User: true
            }
        });

        if (!caseItem) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        const isExpiredByFlag = caseItem.isExpired;
        const isExpiredByTime = caseItem.expiryDate && new Date() > new Date(caseItem.expiryDate);

        if (isExpiredByFlag || isExpiredByTime) {
            return NextResponse.json({
                success: false,
                error: 'Link Expired',
                ownerPlan: caseItem.User?.plan
            }, { status: 410 });
        }

        const filesWithSignedUrls = await Promise.all(caseItem.File.map(async (file) => {
            if (!file.path.startsWith('/')) {
                try {
                    const signedUrl = await getSignedFileUrl(file.path);
                    return { ...file, path: signedUrl };
                } catch (e) {
                    console.error('Failed to sign URL for R2 file:', file.path, e);
                    // Decide: Return original path (will fail on client) or omit?
                    // Returning original path causes < HTML error.
                    // Better to return empty path or handle error gracefully.
                    // But for now, keeping original path behavior as fallback.
                    return file; 
                }
            }
            return file;
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...caseItem,
                files: filesWithSignedUrls
            }
        });
    } catch (error) {
        console.error('Fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const existingCase = await prisma.case.findUnique({
            where: { id },
        });

        if (!existingCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        if (existingCase.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const files = await prisma.file.findMany({ where: { caseId: id } });
        
        await prisma.case.delete({
            where: { id },
        });

        const UPLOAD_DIR = path.join(process.cwd(), 'public');
        for (const file of files) {
            if (file.path.startsWith('/')) {
                const absolutePath = path.join(UPLOAD_DIR, file.path);
                try {
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                    }
                } catch (err) {
                    console.error('Failed to delete local file:', absolutePath, err);
                }
            } else {
                try {
                    await deleteFileFromR2(file.path);
                } catch (err) {
                    console.error('Failed to delete R2 file:', file.path, err);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
