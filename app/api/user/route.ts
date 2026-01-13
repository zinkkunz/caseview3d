import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// PUT: Update User Profile
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name } = body;

        // Validation
        if (!name || name.length < 2) {
            return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('[UPDATE USER] Error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE: Delete User Account
export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[DELETE ACCOUNT] Attempting to delete user: ${userId}`);

    try {
        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.error(`[DELETE ACCOUNT] User not found: ${userId}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Use transaction to ensure everything is deleted or nothing
        await prisma.$transaction(async (tx) => {
            // Delete Cases (Cascade should handle files/links/annotations, but we delete cases explicitly)
            const deletedCases = await tx.case.deleteMany({ where: { userId } });
            console.log(`[DELETE ACCOUNT] Deleted ${deletedCases.count} cases.`);

            // Delete User
            await tx.user.delete({ where: { id: userId } });
            console.log(`[DELETE ACCOUNT] User deleted successfully.`);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE ACCOUNT] Error:', error);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
