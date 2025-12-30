
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { caseId, imp_uid, merchant_uid } = await request.json();

        // In a real app, VERIFY 'imp_uid' with PortOne REST API here to prevent fraud.
        // For prototype/test mode, we assume if we got here, it's okay (Client says success).
        console.log(`Processing payment for case ${caseId}, imp_uid: ${imp_uid}`);

        // Update Case to be Permanent
        const updatedCase = await prisma.case.update({
            where: { id: caseId },
            data: {
                expiryDate: null, // NULL means Permanent
                // We could store payment ID in memo or a new field if we wanted
            }
        });

        return NextResponse.json({ success: true, case: updatedCase });

    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json({ success: false, error: 'Payment processing failed' }, { status: 500 });
    }
}
