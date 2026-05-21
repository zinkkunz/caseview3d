'use client';

import { ShieldCheck, Smartphone, Zap } from 'lucide-react';

const values = [
    {
        title: '강력한 보안',
        description: '업로드된 파일은 암호화되어 안전하게 보존되며, 설정된 기간 이후 자동으로 영구 삭제됩니다.',
        icon: ShieldCheck,
        color: 'text-[#0061FF]'
    },
    {
        title: '모바일 완벽 지원',
        description: '별도 앱 설치 없이 스마트폰, 태블릿, PC 어디서든 고화질 3D 뷰어를 경험할 수 있습니다.',
        icon: Smartphone,
        color: 'text-[#0061FF]'
    },
    {
        title: '압도적인 성능',
        description: '대용량 STL 파일도 웹 환경에서 끊김 없이 3D 회전, 줌, 측정이 가능합니다.',
        icon: Zap,
        color: 'text-[#0061FF]'
    }
];

export default function TrustSection() {
    return (
        <section className="py-32 bg-white dark:bg-black transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {values.map((value, index) => (
                        <div key={index} className="bg-[#F7F9FA] dark:bg-gray-800 p-12 rounded-[2.5rem] flex flex-col items-center md:items-start text-center md:text-left transition-all hover:scale-[1.03] duration-500 border border-transparent dark:border-gray-700 hover:border-blue-50 dark:hover:border-gray-700">
                            <div className={`${value.color} mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm`}>
                                <value.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6 tracking-tight">{value.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
