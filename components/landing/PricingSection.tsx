'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        name: 'Free',
        price: 0,
        period: '무료',
        duration: '2시간',
        features: [
            'STL/PLY 파일 지원',
            '2시간 보관',
            '모바일 뷰어',
            '기본 공유 기능'
        ],
        cta: '무료 시작',
        popular: false
    },
    {
        name: 'Basic',
        price: 9900,
        period: '월',
        duration: '6시간',
        features: [
            'Free 플랜 모든 기능',
            '6시간 보관',
            '빠른 로딩 속도',
            '이메일 지원'
        ],
        cta: '시작하기',
        popular: false
    },
    {
        name: 'Standard',
        price: 29000,
        period: '월',
        duration: '24시간',
        features: [
            'Basic 플랜 모든 기능',
            '24시간 보관',
            '우선 지원',
            '고급 공유 옵션',
            'QR 코드 생성'
        ],
        cta: '시작하기',
        popular: true
    },
    {
        name: 'Premium',
        price: 59000,
        period: '월',
        duration: '무제한',
        features: [
            'Standard 플랜 모든 기능',
            '영구 보관',
            '전담 지원',
            '고급 분석',
            'API 접근',
            '커스텀 브랜딩'
        ],
        cta: '시작하기',
        popular: false
    }
];

export default function PricingSection() {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <section className="py-24 bg-gray-50" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        간단하고 명확한 요금제
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        필요에 맞는 플랜을 선택하세요
                    </p>

                    <div className="inline-flex items-center gap-4 p-1 bg-white rounded-full shadow-md">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${
                                !isAnnual
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            월간 결제
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${
                                isAnnual
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            연간 결제
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                20% 할인
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                                plan.popular ? 'ring-2 ring-indigo-600 scale-105' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                                        가장 인기
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">보관 기간: {plan.duration}</p>

                                <div className="mb-6">
                                    {plan.price === 0 ? (
                                        <div className="text-4xl font-extrabold text-gray-900">무료</div>
                                    ) : (
                                        <>
                                            <div className="text-4xl font-extrabold text-gray-900">
                                                {isAnnual ? Math.floor(plan.price * 0.8).toLocaleString() : plan.price.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">/ {plan.period}</div>
                                        </>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href="/signup"
                                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                                        plan.popular
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <p className="text-gray-600 mb-4">
                        더 많은 기능이 필요하신가요?
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
                    >
                        맞춤 플랜 문의하기
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
