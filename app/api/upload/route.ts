import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// import { compressModel } from '@/utils/compression';
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

            let fileToUpload: any = buffer;
            let fileNameToUpload = originalFileName;
            let mimeType = 'application/octet-stream';

            try {
                // [DEBUG] Temporarily disable compression to isolate Cloud 500 cause
                // if (ext.toLowerCase() === '.stl' || ext.toLowerCase() === '.ply') {
                //     const compressedBuffer = await compressModel(buffer, originalFileName);
                //     fileToUpload = compressedBuffer as unknown as Buffer;
                //     fileNameToUpload = `${baseFileName}.glb`;
                //     mimeType = 'model/gltf-binary';
                // }
            } catch (err) {
                console.error(`Compression failed for ${originalFileName}, utilizing original.`, err);
            }

            await uploadFileToR2(fileToUpload, fileNameToUpload, mimeType);

            return { path: fileNameToUpload, type: key, size: fileToUpload.length };
        };

        const scanFiles = formData.getAll('scans') as File[];
        const designFiles = formData.getAll('designs') as File[];
        
        // Parallel processing of all files
        const scanPromises = scanFiles.map((file, i) => 
            file.size > 0 ? saveAndCompress(file as File, 'scan', i) : null
        );
        
        const designPromises = designFiles.map((file, i) => 
            file.size > 0 ? saveAndCompress(file as File, 'design', i) : null
        );

        const results = await Promise.all([...scanPromises, ...designPromises]);
        const filesToCreate = results.filter((r): r is { path: string, type: string, size: number } => r !== null);

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
                            path: f.path, 
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

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}