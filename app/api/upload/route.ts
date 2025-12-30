import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { compressModel } from '@/utils/compression';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { canCreateLink, calculateExpiryDate } from '@/lib/plan-limits';
import { Plan } from '@/lib/types';
import { uploadFileToR2 } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;
        let userPlan: Plan = 'FREE';

        if (userId) {
            const check = await canCreateLink(userId);
            if (!check.allowed) {
                return NextResponse.json({
                    success: false,
                    error: check.reason === 'MAX_LINKS_EXCEEDED' ? 'LIMIT_EXCEEDED' : 'PLAN_EXPIRED',
                    data: {
                        reason: check.reason,
                        currentCount: check.currentCount,
                        maxLinks: check.maxLinks
                    }
                }, { status: 403 });
            }
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { plan: true }
            });
            if (user && user.plan) {
                userPlan = user.plan as Plan;
            }
        }

        const formData = await request.formData();
        const caseId = uuidv4();
        const memo = formData.get('memo') as string || '';

        const saveAndCompress = async (file: File, key: string, index: number) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name) || '.stl';
            const suffix = `-${key}-${index}`;
            const baseFileName = `${caseId}${suffix}`;
            const originalFileName = `${baseFileName}${ext}`;

            let fileToUpload = buffer;
            let fileNameToUpload = originalFileName;
            let mimeType = 'application/octet-stream';

            try {
                if (ext.toLowerCase() === '.stl' || ext.toLowerCase() === '.ply') {
                    const compressedBuffer = await compressModel(buffer, originalFileName);
                    fileToUpload = compressedBuffer;
                    fileNameToUpload = `${baseFileName}.glb`;
                    mimeType = 'model/gltf-binary';
                }
            } catch (err) {
                console.error(`Compression failed for ${originalFileName}, utilizing original.`, err);
            }

            await uploadFileToR2(fileToUpload, fileNameToUpload, mimeType);

            return { path: fileNameToUpload, type: key, size: fileToUpload.length };
        };

        const filesToCreate: { path: string, type: string, size: number }[] = [];
        const scanFiles = formData.getAll('scans') as File[];
        for (let i = 0; i < scanFiles.length; i++) {
            if (scanFiles[i].size > 0) {
                const result = await saveAndCompress(scanFiles[i], 'scan', i);
                filesToCreate.push(result);
            }
        }

        const designFiles = formData.getAll('designs') as File[];
        for (let i = 0; i < designFiles.length; i++) {
            if (designFiles[i].size > 0) {
                const result = await saveAndCompress(designFiles[i], 'design', i);
                filesToCreate.push(result);
            }
        }

        try {
            const expiryDate = calculateExpiryDate(userPlan);
            let finalUserId = null;
            if (userId) {
                const userExists = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });
                if (userExists) finalUserId = userId;
            }

            await prisma.case.create({
                data: {
                    id: caseId,
                    memo: memo,
                    userId: finalUserId,
                    expiryDate: expiryDate,
                    File: {
                        create: filesToCreate.map(f => ({
                            path: f.path, // This matches what is returned by saveAndCompress (fileNameToUpload)
                            type: f.type,
                            size: f.size
                        }))
                    }
                }
            });
        } catch (dbError) {
            console.error("Database save failed:", dbError);
            return NextResponse.json({ success: false, error: 'Database save failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, caseId, link: `/viewer/${caseId}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
