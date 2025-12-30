'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none">
                {/* Decorative background circle */}
                <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                        치과 보철 디자인의<br />새로운 표준을 경험하세요.
                    </h2>
                    <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        지금 바로 무료로 시작하고,<br />
                        복잡했던 소통 과정을 클릭 몇 번으로 해결하세요.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link 
                            href="/login" 
                            className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-gray-50 transition-all flex items-center gap-2 group shadow-xl"
                        >
                            무료로 시작하기 
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link 
                            href="/docs" 
                            className="text-white border-2 border-white/30 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                        >
                            가이드북 보기
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
