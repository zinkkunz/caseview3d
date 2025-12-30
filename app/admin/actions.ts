'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public');

export async function updateUserRole(userId: string, newRole: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        revalidatePath("/admin/users");
        return { success: true, message: "User role updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update user role" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true, message: "User deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete user" };
    }
}

export async function deleteCase(caseId: string) {
    try {
        // 1. Get file paths before deletion
        const files = await prisma.file.findMany({
            where: { caseId }
        });

        // 2. Delete the case (Cascade deletes File records in DB)
        await prisma.case.delete({
            where: { id: caseId }
        });

        // 3. Delete physical files
        for (const file of files) {
            const absolutePath = path.join(UPLOAD_DIR, file.path);
            try {
                if (fs.existsSync(absolutePath)) {
                    await fs.promises.unlink(absolutePath);
                }
            } catch (err) {
                console.error(`Failed to delete file: ${absolutePath}`, err);
            }
        }

        revalidatePath("/admin/cases");
        revalidatePath("/admin");
        return { success: true, message: "Case and associated files deleted successfully" };
    } catch (error) {
        console.error("Delete case error:", error);
        return { success: false, message: "Failed to delete case" };
    }
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive },
        });
        revalidatePath('/admin/users');
        return { success: true, message: 'User status updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update user status' };
    }
}

export async function deleteExpiredCases() {
    console.log('Deleting expired cases...');
    try {
        const now = new Date(new Date().getTime() + 1000 * 60); // 1 minute buffer for safety

        // 1. Find all expired cases
        const expiredCases = await prisma.case.findMany({
            where: {
                expiryDate: {
                    lt: now
                }
            },
            include: {
                File: true
            }
        });

        console.log(`Found ${expiredCases.length} expired cases`);
        if (expiredCases.length === 0) {
            return { success: true, message: "만료된 케이스가 없습니다.", count: 0 };
        }

        const caseIds = expiredCases.map(c => c.id);
        const allFilePaths = expiredCases.flatMap(c => c.File.map(f => f.path));

        // 2. Delete the cases
        const result = await prisma.case.deleteMany({
            where: {
                id: {
                    in: caseIds
                }
            }
        });

        // 3. Delete physical files
        for (const filePath of allFilePaths) {
            const absolutePath = path.join(UPLOAD_DIR, filePath);
            try {
                if (fs.existsSync(absolutePath)) {
                    await fs.promises.unlink(absolutePath);
                }
            } catch (err) {
                console.error(`Failed to delete file: ${absolutePath}`, err);
            }
        }

        revalidatePath('/admin/cases');
        revalidatePath('/admin');
        return { success: true, message: `만료된 케이스 ${result.count}개와 관련 파일을 삭제했습니다.`, count: result.count };
    } catch (error) {
        console.error("Delete expired cases error:", error);
        return { success: false, message: '만료된 케이스 삭제에 실패했습니다.' };
    }
}

export async function updateUserPlan(userId: string, newPlan: string) {
    console.log(`Updating user ${userId} plan to ${newPlan}`);
    try {
        const data: any = { plan: newPlan };
        await prisma.user.update({
            where: { id: userId },
            data: data,
        });
        revalidatePath('/admin/users');
        return { success: true, message: `요금제가 ${newPlan}으로 변경되었습니다.` };
    } catch (error) {
        return { success: false, message: '요금제 변경에 실패했습니다.' };
    }
}
