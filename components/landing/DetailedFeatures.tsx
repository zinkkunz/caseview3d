'use client';

import { Layers, Zap, ShieldCheck } from 'lucide-react';

const detailedFeatures = [
    {
        title: '강력한 3D 뷰어 엔진',
        subtitle: '웹 표준 기술의 정점',
        description: '별도의 프로그램 설치 없이 웹 브라우저만으로 고해상도 STL 데이터를 실시간으로 랜더링합니다. 줌, 회전, 투명도 조절 기능을 통해 정밀한 디자인 검토가 가능합니다.',
        icon: Layers,
        color: 'bg-blue-600',
        image: 'https://images.unsplash.com/photo-1598133594931-385016202422?q=80&w=1000&auto=format&fit=crop'
    },
    {
        title: '즉각적인 공유 시스템',
        subtitle: '전화 한 통 줄이는 마법',
        description: '디자인 파일을 올리자마자 생성되는 고유 링크를 치과에 전달하세요. 치과의사는 모바일 카톡에서도 즉석에서 확인하고 컨펌할 수 있습니다.',
        icon: Zap,
        color: 'bg-orange-500',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffce47267a5?q=80&w=1000&auto=format&fit=crop'
    },
    {
        title: '자동 데이터 보존 정책',
        subtitle: '보안은 기본, 공간은 효율적으로',
        description: '일정 기간이 지나면 공유된 데이터가 자동으로 삭제되어 보안 사고를 예방하고 스토리지 공간을 효율적으로 관리할 수 있습니다.',
        icon: ShieldCheck,
        color: 'bg-green-600',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
    }
];

export default function DetailedFeatures() {
    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
                {detailedFeatures.map((feature, index) => (
                    <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 lg:gap-24`}>
                        <div className="flex-1 space-y-8">
                            <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                                <feature.icon size={32} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm">{feature.subtitle}</h4>
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{feature.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-md font-light">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl relative group">
                            <img 
                                src={feature.image} 
                                alt={feature.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
