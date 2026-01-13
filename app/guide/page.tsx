'use client';

import { Check, ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';

// Mockup Data (Synced with GuideModal)
const steps = [
    {
        title: "회전하기",
        desc: "한 손가락으로 화면을 드래그하여 모델을 회전시킵니다.",
        subDesc: "(PC: 마우스 왼쪽 클릭 드래그)",
        image: "/images/landing/viewer_mockup.png" // Placeholder or specific gesture image
    },
    {
        title: "이동하기",
        desc: "두 손가락으로 화면을 드래그하여 시점을 이동합니다.",
        subDesc: "(PC: 마우스 오른쪽 클릭 드래그)",
        image: "/images/landing/viewer_mockup.png"
    },
    {
        title: "확대/축소",
        desc: "두 손가락을 오므리거나 벌려 줌 인/아웃 합니다.",
        subDesc: "(PC: 마우스 휠 스크롤)",
        image: "/images/landing/viewer_mockup.png"
    }
];

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-6">
                        <HelpCircle size={32} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                        CaseView3D 사용 가이드
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        3D 뷰어의 기본적인 조작 방법을 안내해 드립니다.
                    </p>
                </div>

                <div className="space-y-24">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="flex-1 space-y-4">
                                <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                                    Step {index + 1}
                                </span>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {step.title}
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300">
                                    {step.desc}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {step.subDesc}
                                </p>
                            </div>
                            <div className="flex-1 w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                                {/* Use generic mockup for now, or specific gesture GIFs if available later */}
                                <img 
                                    src={step.image} 
                                    alt={step.title} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    {/* Overlay Placeholder for Gesture Icon */}
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                                        <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-24 text-center p-12 bg-gray-50 dark:bg-gray-900 rounded-3xl">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        직접 체험해보세요
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-lg mx-auto">
                        가입 없이 무료로 데모 케이스를 열람해볼 수 있습니다.
                        지금 바로 CaseView3D의 강력한 기능을 경험해보세요.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/upload"
                            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            무료로 시작하기
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
