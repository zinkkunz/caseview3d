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
    console.log("[DELETE] /api/cases/[id] params:", params);
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        console.log("[DELETE] Deleting case:", id);

        const existingCase = await prisma.case.findUnique({
            where: { id },
        });

        if (!existingCase) {
             console.log("[DELETE] Case not found:", id);
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        // Admin check or Owner check
        if (existingCase.userId !== session.user.id && session.user.role !== 'ADMIN') {
             console.log("[DELETE] Forbidden:", session.user.id, existingCase.userId);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Get files (failures here shouldn't block DB delete if possible, but we need paths)
        let files: any[] = [];
        try {
            files = await prisma.file.findMany({ where: { caseId: id } });
        } catch (e) {
            console.error("[DELETE] Failed to fetch files, proceeding to delete case:", e);
        }
        
        // 2. Delete DB Record
        try {
            await prisma.case.delete({
                where: { id },
            });
             console.log("[DELETE] DB record deleted:", id);
        } catch (dbError) {
             console.error("[DELETE] DB delete failed:", dbError);
             return NextResponse.json({ error: 'Database Delete Failed' }, { status: 500 });
        }

        // 3. Delete Physical Files (Best Effort)
        // We explicitly do NOT return 500 if this fails, just log it.
        const UPLOAD_DIR = path.join(process.cwd(), 'public');
        
        Promise.allSettled(files.map(async (file) => {
            if (file.path.startsWith('/')) {
                const absolutePath = path.join(UPLOAD_DIR, file.path);
                try {
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                        console.log("[DELETE] Local file deleted:", absolutePath);
                    }
                } catch (err) {
                    console.error('[DELETE] Failed to delete local file:', absolutePath, err);
                }
            } else {
                try {
                    await deleteFileFromR2(file.path);
                     console.log("[DELETE] R2 file deleted:", file.path);
                } catch (err) {
                    console.error('[DELETE] Failed to delete R2 file:', file.path, err);
                }
            }
        }));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
