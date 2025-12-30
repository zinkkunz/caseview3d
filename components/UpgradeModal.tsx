'use client';

import { X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    reason: 'MAX_LINKS_EXCEEDED' | 'LINK_EXPIRED';
    recommendedPlan?: 'BASIC' | 'STANDARD';
}

export default function UpgradeModal({ isOpen, onClose, reason, recommendedPlan }: UpgradeModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const messages = {
        MAX_LINKS_EXCEEDED: {
            title: '링크 생성 제한',
            description: '현재 요금제에서는 생성 가능한 링크 수를 초과했습니다.\nBASIC에서는 더 많은 링크를 관리할 수 있습니다.',
        },
        LINK_EXPIRED: {
            title: '링크 만료',
            description: '이 링크는 유지 시간이 지나 만료되었습니다.\nSTANDARD에서는 하루 동안 링크를 유지할 수 있습니다.',
        },
    };

    const message = messages[reason];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={24} />
                        {message.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-8 whitespace-pre-line leading-relaxed">
                    {message.description}
                </p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
                    >
                        닫기
                    </button>
                    <button
                        onClick={() => router.push('/pricing')}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-semibold shadow-sm"
                    >
                        요금제 보기
                    </button>
                </div>
            </div>
        </div>
    );
}
