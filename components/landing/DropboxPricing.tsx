'use client';

import { Check, Globe, CreditCard, Lock, Crown, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const plans = [
    {
        id: 'FREE',
        name: 'FREE',
        priceKRW: 0,
        priceUSD: 0,
        description: '3D 뷰어 경험하기',
        icon: '🌱',
        features: [
            '활성 링크: 1개',
            '유지 시간: 2시간',
            '기본 뷰어 기능'
        ],
        cta: '무료 시작',
        popular: false,
        disabled: false
    },
    {
        id: 'BASIC',
        name: 'BASIC',
        priceKRW: 9900,
        priceUSD: 9,
        description: '프리랜서 및 소규모',
        icon: '⚡',
        features: [
            'Free 플랜의 모든 기능 포함',
            '활성 링크: 5개',
            '유지 시간: 24시간',
            '비밀번호 공유 (보안)'
        ],
        cta: '시작하기',
        popular: true,
        disabled: false
    },
    {
        id: 'PRO',
        name: 'PRO',
        priceKRW: 24900,
        priceUSD: 24,
        description: '전문 기공소용',
        icon: '👑',
        features: [
            'Basic 플랜의 모든 기능 포함',
            '활성 링크: 20개',
            '유지 시간: 3일 (72시간)',
            '커스텀 로고 (브랜딩)',
            '접속 로그 확인'
        ],
        cta: '업그레이드',
        popular: false,
        disabled: false
    },
    {
        id: 'ENTERPRISE',
        name: 'ENTERPRISE',
        priceKRW: 0,
        priceUSD: 0,
        description: '대형 병원 및 체인',
        icon: '🏢',
        features: [
            'Pro 플랜의 모든 기능 포함',
            '활성 링크: 무제한',
            '유지 시간: 영구 보관',
            'API 연동 지원',
            '전용 도메인'
        ],
        cta: '준비 중',
        popular: false,
        disabled: true
    }
];

declare global {
    interface Window {
        IMP: any;
    }
}

export default function DropboxPricing() {
    const { data: session } = useSession();
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<'DOMESTIC' | 'GLOBAL'>('DOMESTIC');
    const [loading, setLoading] = useState<string | null>(null);

    const handlePayment = async (plan: typeof plans[0]) => {
        if (!session) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        if (plan.disabled) {
            alert('준비 중인 요금제입니다.');
            return;
        }

        if (plan.id === 'FREE') {
            alert('이미 무료 요금제를 사용 중이거나, 기본으로 제공됩니다.');
            return;
        }

        setLoading(plan.id);

        if (paymentMethod === 'DOMESTIC') {
            const { IMP } = window;
            IMP.init(process.env.NEXT_PUBLIC_PORTONE_IMP_ID || '');

            const merchant_uid = `user_${session.user.id}_${plan.id}_${Date.now()}`;

            IMP.request_pay({
                pg: 'html5_inicis',
                pay_method: 'card',
                merchant_uid: merchant_uid,
                name: `CaseView ${plan.name} Plan`,
                amount: plan.priceKRW,
                buyer_email: session.user.email,
                buyer_name: session.user.name,
            }, async (rsp: any) => {
                if (rsp.success) {
                    const res = await fetch('/api/payments/portone/webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imp_uid: rsp.imp_uid,
                            merchant_uid: rsp.merchant_uid,
                            status: 'paid',
                        }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert('결제가 완료되었습니다!');
                        router.push('/dashboard');
                    }
                } else {
                    alert(`결제 실패: ${rsp.error_msg}`);
                }
                setLoading(null);
            });
        }
    };

    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 tracking-tight">요금제 선택</h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        필요한 만큼만 합리적으로 선택하세요.
                    </p>

                    <div className="flex justify-center mt-8">
                        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner">
                            <button
                                onClick={() => setPaymentMethod('DOMESTIC')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'DOMESTIC' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'}`}
                            >
                                <CreditCard size={16} />
                                국내 결제
                            </button>
                            <button
                                onClick={() => setPaymentMethod('GLOBAL')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'GLOBAL' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'}`}
                            >
                                <Globe size={16} />
                                Global
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`p-8 flex flex-col rounded-[2rem] transition-all duration-300 hover:scale-[1.02] ${plan.popular
                                ? 'bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-500 relative shadow-xl'
                                : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800'
                                } ${plan.disabled ? 'opacity-70 grayscale' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                    Best Value
                                </div>
                            )}

                            <div className="mb-6 text-center">
                                <div className="text-4xl mb-2">{plan.icon}</div>
                                <h3 className="text-lg font-black uppercase tracking-widest text-gray-500">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1 my-4">
                                    {plan.priceKRW === 0 && plan.priceUSD === 0 && !plan.disabled ? (
                                        <span className="text-3xl font-black">Free</span>
                                    ) : plan.disabled ? (
                                        <span className="text-xl font-bold text-gray-400">Coming Soon</span>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-black">
                                                {paymentMethod === 'DOMESTIC'
                                                    ? `₩${plan.priceKRW.toLocaleString()}`
                                                    : `$${plan.priceUSD}`}
                                            </span>
                                            <span className="text-xs text-gray-400">/mo</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-gray-400 min-h-[40px]">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePayment(plan)}
                                disabled={loading === plan.id || plan.disabled}
                                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.disabled
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none'
                                            : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {loading === plan.id ? '처리 중...' : plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
