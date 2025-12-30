import { Metadata } from 'next';
import ViewerClient from '@/components/ViewerClient';
import { prisma } from '@/lib/prisma';
import { getSettings } from '../../admin/settings/actions';
import ExpiredLinkPage from '@/components/ExpiredLinkPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params;
    let title = 'Dental 3D Viewer';
    let description = "첨부된 링크를 통해 3D 디자인을 확인하실 수 있습니다. 별도 설치 없이 바로 열립니다.";

    try {
        const caseItem = await prisma.case.findUnique({
            where: { id },
            select: { memo: true }
        });
        if (caseItem?.memo) {
            title = caseItem.memo;
        }
    } catch (error) {
        console.error("Failed to fetch case for metadata:", error);
    }

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
        },
    };
}

export default async function ViewerPage({ params }: Props) {
    const session = await getServerSession(authOptions);
    const settings = await getSettings();
    const { id } = await params;

    try {
        const caseData = await prisma.case.findUnique({
            where: { id },
            include: { User: true }
        });

        if (!caseData) {
            return <ViewerClient id={id} settings={settings} />;
        }

        const isOwner = session?.user?.id === caseData.userId;

        // 서버 사이드 만료 체크
        const isExpiredByFlag = caseData.isExpired;
        const isExpiredByTime = caseData.expiryDate && new Date() > new Date(caseData.expiryDate);

        if (isExpiredByFlag || isExpiredByTime) {
            return (
                <ExpiredLinkPage
                    caseId={id}
                    ownerPlan={caseData.User?.plan as string}
                    isOwner={isOwner}
                />
            );
        }

        // 정상 케이스일 때도 소유자 여부 전달 (클라이언트 사이드 만료 체크 대비)
        return <ViewerClient id={id} settings={settings} isOwner={isOwner} />;

    } catch (error) {
        console.error("Error checking case expiry:", error);
    }

    return <ViewerClient id={id} settings={settings} />;
}
