const fs = require('fs');
const path = require('path');

const content = `'use client';

import Link from "next/link";
import { Trash2, ExternalLink, CreditCard, Share2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

declare global {
    interface Window {
        IMP: any;
    }
}

interface CaseItemProps {
    c: {
        id: string;
        memo: string | null;
        createdAt: string;
        expiryDate: string | null;
        files: any[];
    };
}

export default function CaseItem({ c }: CaseItemProps) {
    const router = useRouter();
    
    // Hydration fix state
    const [mounted, setMounted] = useState(false);
    const [expiryInfo, setExpiryInfo] = useState<{
        isExpired: boolean;
        text: string;
        icon: React.ReactNode;
        className: string;
        isPermanent: boolean;
    }>({
        isExpired: false,
        text: '',
        icon: null,
        className: '',
        isPermanent: false
    });

    useEffect(() => {
        setMounted(true);
        if (!c.expiryDate) {
            setExpiryInfo({ isExpired: false, text: '', icon: null, className: '', isPermanent: true });
            return;
        }

        const expiry = new Date(c.expiryDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

        if (diffMs <= 0) {
            setExpiryInfo({
                isExpired: true,
                text: '자동 만료 되었습니다.',
                icon: <AlertCircle size={14} className="text-red-500" />,
                className: 'text-red-500',
                isPermanent: false
            });
        } else if (diffHours <= 1) {
            setExpiryInfo({
                isExpired: false,
                text: '곧 만료됨 (1시간 이내)',
                icon: <Clock size={14} className="text-orange-500" />,
                className: 'text-orange-500',
                isPermanent: false
            });
        } else {
            setExpiryInfo({
                isExpired: false,
                text: '자동 만료: ' + diffHours + '시간 후',
                icon: <Clock size={14} className="text-blue-500" />,
                className: 'text-blue-500',
                isPermanent: false
            });
        }
    }, [c.expiryDate]);

    const handlePayment = (caseId: string) => {
        if (!window.IMP) return;
        const { IMP } = window;
        IMP.init('imp32135064');

        IMP.request_pay({
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: 'mid_' + new Date().getTime(),
            name: '영구 보관 전환',
            amount: 100,
            buyer_email: 'test@test.com',
            buyer_name: '테스트유저',
        }, async (rsp) => {
            if (rsp.success) {
                const res = await fetch('/api/payment/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId,
                        imp_uid: rsp.imp_uid,
                        merchant_uid: rsp.merchant_uid
                    })
                });
                if (res.ok) {
                    alert('결제가 완료되었습니다. 이제 영구 보관됩니다.');
                    router.refresh();
                } else {
                    alert('결제 처리 중 오류가 발생했습니다.');
                }
            } else {
                alert('결제 실패: ' + rsp.error_msg);
            }
        });
    };

    const handleDelete = async (caseId) => {
        if (!confirm('정말 삭제하시겠습니까?\\n 삭제된 데이터는 복구할 수 없습니다.')) return;

        try {
            const res = await fetch('/api/cases/' + caseId, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                window.location.reload(); 
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    };

    if (!mounted) {
        // Simplified Skeleton
        return (
            <div className="block p-5 border-b">
                 <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }

    const isPermanent = expiryInfo.isPermanent;

    return (
        <div className="block hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-all duration-300">
            <div className="px-5 py-5 sm:px-10 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0 flex-1 w-full">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 flex-col sm:flex-row">
                            <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-200 truncate tracking-tight">
                                {c.memo || "제목 없음"}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 rounded-full flex-shrink-0">
                                    {c.files.length} Files
                                </span>
                                {isPermanent && (
                                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-[#0061FF] border border-blue-100 rounded-full flex-shrink-0">
                                        Premium
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium">
                            <span className="mr-3">ID: {c.id.substring(0, 8)}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full mr-3"></span>
                            <span>업로드: {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                        <div className="flex items-center w-full sm:w-auto sm:border-r border-gray-100 sm:pr-6">
                            {!isPermanent && (
                                <div className={'flex items-center gap-1.5 font-bold ' + expiryInfo.className}>
                                    {expiryInfo.icon}
                                    <span className="text-xs uppercase tracking-tighter">{expiryInfo.text}</span>
                                </div>
                            )}
                            {isPermanent && (
                                <div className="flex items-center gap-1.5 text-indigo-500 font-bold">
                                    <CheckCircle2 size={16} />
                                    <span className="text-xs uppercase tracking-tighter">영구 보관</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                            <div className="flex items-center gap-2">
                                <ShareModal caseId={c.id} />
                                <Link
                                    href={'/viewer/' + c.id}
                                    target="_blank"
                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#0061FF] dark:hover:text-blue-400 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all border border-transparent hover:border-blue-50"
                                    title="뷰어 열기"
                                >
                                    <ExternalLink size={20} className="sm:w-[22px] sm:h-[22px]" />
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isPermanent && !expiryInfo.isExpired && (
                                    <button
                                        onClick={() => handlePayment(c.id)}
                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all transform hover:-translate-y-1 whitespace-nowrap"
                                    >
                                        <CreditCard size={14} />
                                        연장하기
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-gray-300 hover:text-red-500 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all"
                                    title="삭제"
                                >
                                    <Trash2 size={20} className="sm:w-[22px] sm:h-[22px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote Phase 4 component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
