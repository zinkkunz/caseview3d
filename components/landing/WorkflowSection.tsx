'use client';

import { Upload, Link as LinkIcon, Share2 } from 'lucide-react';

const steps = [
    {
        title: '파일 업로드',
        description: 'STL, PLY 등 3D 모델 파일을 드래그 앤 드롭으로 간편하게 업로드하세요.',
        icon: Upload,
        color: 'bg-blue-600 text-white shadow-lg shadow-blue-100'
    },
    {
        title: '링크 생성',
        description: '업로드 즉시 안전하게 공유 가능한 전용 링크가 생성됩니다.',
        icon: LinkIcon,
        color: 'bg-white dark:bg-gray-800 text-blue-600 border border-blue-100 dark:border-gray-700 shadow-sm'
    },
    {
        title: '간편 공유',
        description: '문자, 카톡, 이메일 어디로든 클릭 한 번으로 링크를 전송하세요.',
        icon: Share2,
        color: 'bg-white dark:bg-gray-800 text-blue-600 border border-blue-100 dark:border-gray-700 shadow-sm'
    }
];

export default function WorkflowSection() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-8 tracking-tight">
                        업로드부터 공유까지,<br />가장 직관적인 흐름
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        복잡한 대기 시간이나 소프트웨어 설치 없이,<br />
                        웹 브라우저 하나만 있으면 충분합니다.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection line (desktop) */}
                    <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 md:gap-8 relative z-10">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mb-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2`}>
                                    <step.icon size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{step.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto text-sm">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
