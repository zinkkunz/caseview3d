'use client';

import { Upload, Link as LinkIcon, Share2 } from 'lucide-react';
import WorkflowVisual from './WorkflowVisual';

const steps = [
    {
        title: 'Drag & Upload',
        description: '상/하악 스캔 데이터와 디자인 파일을 분리하여 간편하게 드래그 앤 업로드하세요.',
        icon: Upload,
        color: 'bg-[#0061FF] text-white shadow-lg shadow-blue-200 dark:shadow-none'
    },
    {
        title: 'Instant Link',
        description: '업로드 즉시 보안 암호화가 적용된 공유 전용 링크가 실시간으로 생성됩니다.',
        icon: LinkIcon,
        color: 'bg-white dark:bg-[#111] text-[#0061FF] border border-blue-100 dark:border-gray-800 shadow-sm'
    },
    {
        title: 'Fast Sharing',
        description: '카카오톡/문자로 1초 만에 치과의사에게 즉시 공유하고 실시간으로 확인 및 컨펌받으세요.',
        icon: Share2,
        color: 'bg-white dark:bg-[#111] text-[#0061FF] border border-blue-100 dark:border-gray-800 shadow-sm'
    }
];

export default function WorkflowSection() {
    return (
        <section className="py-24 bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-8 tracking-tight">
                        업로드부터 공유까지,<br />가장 직관적인 흐름
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                        복잡한 대기 시간이나 소프트웨어 설치 없이,<br />
                        웹 브라우저 하나만 있으면 충분합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Animation Visual */}
                    <div className="order-2 lg:order-1">
                        <WorkflowVisual />
                    </div>

                    {/* Right: Steps List */}
                    <div className="order-1 lg:order-2 space-y-12">
                         {steps.map((step, index) => (
                            <div key={index} className="flex gap-6 group">
                                <div className={`w-16 h-16 shrink-0 ${step.color} rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                                    <step.icon size={28} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
