'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    지금 CaseView 베타 테스트 중
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 animate-slide-up">
                    치과 3D 디자인을
                    <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        간편하게 공유하세요
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto animate-slide-up animation-delay-200">
                    별도 설치 없이 링크 하나로 환자와 협력 치과에 3D 모델을 공유할 수 있습니다.
                    <br />
                    <span className="text-indigo-600 font-semibold">3초 만에 시작하세요.</span>
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up animation-delay-400">
                    <Link
                        href="/signup"
                        className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        무료로 시작하기
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 border border-gray-200">
                        <Play size={20} />
                        데모 보기
                    </button>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 animate-fade-in animation-delay-600">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>신용카드 불필요</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>설치 불필요</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>3초 만에 시작</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
