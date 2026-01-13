import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { LinkLockScreen } from '@/components/LinkLockScreen';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function SmartLinkPage({ params }: PageProps) {
    const { slug } = await params;

    try {
        const link = await prisma.link.findUnique({
            where: { slug },
            include: { Case: true }
        });

        if (!link || !link.isActive) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-center p-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link Not Found</h1>
                    <p className="text-gray-500">This link does not exist or has been disabled.</p>
                </div>
            );
        }

        // Check Expiration
        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-center p-4">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Link Expired</h1>
                    <p className="text-gray-500">The validity period for this link has ended.</p>
                </div>
            );
        }

        // Check View Limit
        if (link.maxViews !== null && link.currentViews >= link.maxViews) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-center p-4">
                    <h1 className="text-2xl font-bold text-orange-600 mb-2">View Limit Reached</h1>
                    <p className="text-gray-500">This link has reached its maximum number of views.</p>
                </div>
            );
        }

        // Password Protection Check
        if (link.password) {
            const cookieStore = await cookies();
            const hasAuth = cookieStore.get(`link_unlock_${slug}`);

            if (!hasAuth || hasAuth.value !== 'true') {
                return <LinkLockScreen slug={slug} memo={link.description || link.Case?.memo || '3D Model'} />;
            }
        }

        // Increment View Count (Atomic)
        await prisma.link.update({
            where: { id: link.id },
            data: { currentViews: { increment: 1 } }
        });

        // Redirect to Viewer
        redirect(`/viewer/${link.caseId}`);

    } catch (error: any) {
        // Handle redirect() throwing internally in Next.js
        if (error.message === 'NEXT_REDIRECT') throw error;

        console.error("Smart Link Error:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-neutral-900 text-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Error</h1>
                <p className="text-gray-500">An unexpected error occurred.</p>
            </div>
        );
    } finally {
        await prisma.$disconnect();
    }
}
