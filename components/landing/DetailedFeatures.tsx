'use client';

import { Layers, Zap, ShieldCheck } from 'lucide-react';

const detailedFeatures = [
    {
        title: '자동 데이터 보존 및 보안 정책',
        subtitle: '보안은 기본, 공간은 효율적으로',
        description: '일정 기간이 지나면 공유된 3D 스캔 및 디자인 데이터가 클라우드에서 자동으로 영구 삭제되어 중요 환자 정보의 보안 사고를 차단하고 스토리지 공간을 효율적으로 관리할 수 있습니다. 추가적인 비밀번호 설정을 통해 강력한 보안 제어가 가능합니다.',
        icon: ShieldCheck,
        color: 'bg-[#0061FF]',
        image: '/images/landing/mobile_secure_mockup.png'
    }
];

export default function DetailedFeatures() {
    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {detailedFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
                        <div className="flex-1 space-y-8">
                            <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none`}>
                                <feature.icon size={32} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[#0061FF] font-bold uppercase tracking-widest text-sm">{feature.subtitle}</h4>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-md font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 w-full aspect-video rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] dark:shadow-none relative group bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800">
                            {/* Use img tag for direct static asset access */}
                            <img 
                                src={feature.image} 
                                alt={feature.title}
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
