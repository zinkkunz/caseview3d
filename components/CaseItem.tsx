'use client';

import Link from "next/link";
import { Trash2, ExternalLink, CreditCard, Share2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";
import { useRouter } from "next/navigation";

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

    const handlePayment = (caseId: string) => {
        if (!window.IMP) return;
        const { IMP } = window;
        IMP.init('imp32135064');

        IMP.request_pay({
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: `mid_${new Date().getTime()}`,
            name: '영구 보관 전환',
            amount: 100,
            buyer_email: 'test@test.com',
            buyer_name: '테스트유저',
        }, async (rsp: any) => {
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
                alert(`결제 실패: ${rsp.error_msg}`);
            }
        });
    };

    const handleDelete = async (caseId: string) => {
        if (!confirm('정말 삭제하시겠습니까?\n 삭제된 데이터는 복구할 수 없습니다.')) return;

        try {
            const res = await fetch(`/api/cases/${caseId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                window.location.reload(); // Force full reload for absolute safety
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    };

    const getExpiryInfo = () => {
        if (!c.expiryDate) return { isPermanent: true };

        const expiry = new Date(c.expiryDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

        if (diffMs <= 0) {
            return {
                isExpired: true,
                text: '자동 만료 되었습니다.',
                icon: <AlertCircle size={14} className="text-red-500" />,
                className: 'text-red-500'
            };
        }

        if (diffHours <= 1) {
            return {
                isExpired: false,
                text: '곧 만료됨 (1시간 이내)',
                icon: <Clock size={14} className="text-orange-500" />,
                className: 'text-orange-500'
            };
        }

        return {
            isExpired: false,
            text: `자동 만료: ${diffHours}시간 후`,
            icon: <Clock size={14} className="text-blue-500" />,
            className: 'text-blue-500'
        };
    };

    const expiryInfo = getExpiryInfo();
    const isPermanent = expiryInfo.isPermanent;

    return (
        <div className="block hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-all duration-300">
            <div className="px-6 py-6 sm:px-10">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <p className="text-xl font-black text-gray-900 dark:text-gray-200 truncate tracking-tight">
                                {c.memo || "제목 없음"}
                            </p>
                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 rounded-full">
                                {c.files.length} Files
                            </span>
                            {isPermanent && (
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-[#0061FF] border border-blue-100 rounded-full">
                                    Premium
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 font-medium">
                            <span className="mr-3">ID: {c.id.substring(0, 8)}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full mr-3"></span>
                            <span>업로드: {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center mr-6 border-r border-gray-100 pr-6">
                            {!isPermanent && (
                                <div className={`flex items-center gap-1.5 font-bold ${expiryInfo.className}`}>
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

                        <div className="flex items-center space-x-2">
                            {/* ShareModal Replaces Old Button */}
                            <ShareModal caseId={c.id} />
                            
                            <Link
                                href={`/viewer/${c.id}`}
                                target="_blank"
                                className="w-12 h-12 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#0061FF] dark:hover:text-blue-400 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all border border-transparent hover:border-blue-50"
                                title="뷰어 열기"
                            >
                                <ExternalLink size={22} />
                            </Link>

                            {!isPermanent && !expiryInfo.isExpired && (
                                <button
                                    onClick={() => handlePayment(c.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-lg shadow-gray-200 dark:shadow-none transition-all transform hover:-translate-y-1"
                                >
                                    <CreditCard size={14} />
                                    연장하기
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(c.id)}
                                className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all"
                                title="삭제"
                            >
                                <Trash2 size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
