import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { canCreateLink } from '@/lib/plan-limits';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Rate/Plan Limit Check
        if (userId) {
            const check = await canCreateLink(userId);
            if (!check.allowed) {
                return NextResponse.json({
                    success: false, 
                    error: check.reason === 'MAX_LINKS_EXCEEDED' ? 'LIMIT_EXCEEDED' : 'PLAN_EXPIRED'
                }, { status: 403 });
            }
        }

        const body = await request.json();
        const { filename, contentType } = body;

        if (!filename || !contentType) {
            return NextResponse.json({ success: false, error: 'Missing filename or contentType' }, { status: 400 });
        }

        const date = new Date().toISOString().split('T')[0];
        const uniqueId = uuidv4();
        const key = `uploads/${date}/${uniqueId}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const { url } = await getPresignedUploadUrl(key, contentType);

        return NextResponse.json({ success: true, url, key });
    } catch (error) {
        console.error('Presign error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate upload URL' }, { status: 500 });
    }
}
