'use client';

import { Layout } from 'lucide-react';
import Link from 'next/link';

interface ExpiredLinkPageProps {
    caseId: string;
    ownerPlan?: string;
    isOwner?: boolean;
}

export default function ExpiredLinkPage({ caseId, ownerPlan, isOwner }: ExpiredLinkPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 max-w-md w-full p-12 text-center animate-in fade-in zoom-in duration-500">
                <h1 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">
                    링크 만료 안내
                </h1>

                <p className="text-gray-500 font-medium leading-relaxed mb-10">
                    죄송합니다. 이 디자인 링크의<br />
                    전용 유지 시간이 경과하여 만료되었습니다.
                </p>

                {isOwner && (
                    <div className="bg-blue-50/50 rounded-2xl p-6 mb-10 border border-blue-50 text-left">
                        <p className="text-xs font-black text-[#0061FF] uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Layout size={14} /> Tip for clinical work
                        </p>
                        <p className="text-sm text-blue-800 font-bold leading-relaxed">
                            STANDARD 요금제를 이용하시면<br />
                            최대 24시간 동안 링크가 유지되어<br />
                            여유로운 확인이 가능합니다.
                        </p>
                    </div>
                )}

                <div className={isOwner ? "grid grid-cols-2 gap-4" : "flex justify-center"}>
                    <button
                        onClick={() => window.close()}
                        className={`py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all text-sm ${!isOwner ? "px-12" : "w-full"}`}
                    >
                        {isOwner ? "닫기" : "확인"}
                    </button>
                    {isOwner && (
                        <Link
                            href="/pricing"
                            className="py-4 bg-[#0061FF] text-white font-black rounded-2xl hover:bg-[#0052D9] transition-all shadow-lg shadow-blue-200 text-sm"
                        >
                            요금제 상세 보기
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
