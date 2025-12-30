'use client';

import { Check, Globe, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const plans = [
    {
        id: 'FREE',
        name: 'FREE',
        priceKRW: 0,
        priceUSD: 0,
        description: '처음 써보고 흐름만 확인할 때',
        icon: '🟢',
        features: ['링크 생성: 1개', '링크 유지 시간: 2시간', '흐름 확인용'],
        cta: '무료 시작',
        popular: false
    },
    {
        id: 'BASIC',
        name: 'BASIC',
        priceKRW: 9900,
        priceUSD: 9,
        description: '‘아직 못 봤어요’ 전화 줄이고 싶을 때',
        icon: '🔵',
        features: ['링크 생성: 3개', '링크 유지 시간: 6시간', '관리가 필요한 단계'],
        cta: '시작하기',
        popular: false
    },
    {
        id: 'STANDARD',
        name: 'STANDARD',
        priceKRW: 29000,
        priceUSD: 25,
        description: '치소와 치과 사이의 원활한 소통',
        icon: '🟠',
        features: ['링크 생성: 10개', '링크 유지 시간: 24시간', '실사용 단계'],
        cta: '지금 시작',
        popular: true
    },
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

        if (plan.id === 'FREE') {
            alert('이미 무료 요금제를 사용 중이거나, 기본으로 제공됩니다.');
            return;
        }

        setLoading(plan.id);

        if (paymentMethod === 'DOMESTIC') {
            // PortOne (Iamport)
            const { IMP } = window;
            IMP.init(process.env.NEXT_PUBLIC_PORTONE_IMP_ID || ''); // 실제 상점 아이디로 변경 필요

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
                    // 서버에 검증 요청
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
        } else {
            // Stripe
            try {
                const res = await fetch('/api/payments/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: session.user.id,
                        plan: plan.id,
                        priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '', // 실제 Stripe Price ID
                    }),
                });
                const { url } = await res.json();
                if (url) {
                    window.location.href = url;
                }
            } catch (err) {
                console.error(err);
                alert('해외 결제 준비 중 오류가 발생했습니다.');
            } finally {
                setLoading(null);
            }
        }
    };

    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="pricing">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 mb-6 tracking-tight">요금제 선택</h2>
                    
                    {/* Payment Method Toggle */}
                    <div className="flex justify-center mt-8">
                        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner">
                            <button
                                onClick={() => setPaymentMethod('DOMESTIC')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'DOMESTIC' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'}`}
                            >
                                <CreditCard size={16} />
                                국내 결제 (PortOne)
                            </button>
                            <button
                                onClick={() => setPaymentMethod('GLOBAL')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'GLOBAL' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-100'}`}
                            >
                                <Globe size={16} />
                                Global (Stripe)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`p-10 flex flex-col rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl ${plan.popular
                                    ? 'bg-white dark:bg-gray-800 shadow-[0_32px_64px_-16px_rgba(0,97,255,0.12)] dark:shadow-[0_0_30px_rgba(0,0,0,0.4)] border-2 border-blue-50 dark:border-blue-900/30 relative overflow-hidden'
                                    : 'bg-[#F7F9FA] dark:bg-gray-800 border border-transparent dark:border-gray-700'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                                    Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">{plan.icon}</span>
                                    <h3 className={`text-sm font-black uppercase tracking-widest ${plan.popular ? 'text-[#0061FF]' : 'text-gray-400'}`}>
                                        {plan.name}
                                    </h3>
                                </div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                                        {paymentMethod === 'DOMESTIC' 
                                            ? (plan.priceKRW === 0 ? '무료' : `₩${plan.priceKRW.toLocaleString()}`) 
                                            : (plan.priceUSD === 0 ? 'Free' : `$${plan.priceUSD}`)}
                                    </span>
                                    {plan.priceKRW > 0 && <span className="text-gray-400 text-sm font-medium">/ month</span>}
                                </div>
                                <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3">
                                        <div className="w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-[#0061FF] stroke-[3]" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePayment(plan)}
                                disabled={loading === plan.id}
                                className={`w-full py-4 text-center font-black rounded-2xl text-sm transition-all shadow-md ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''} ${plan.popular
                                        ? 'bg-[#0061FF] text-white hover:bg-[#0052D9] shadow-blue-100 dark:shadow-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:text-gray-100 hover:bg-gray-50 border border-gray-100 dark:border-gray-700'
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
