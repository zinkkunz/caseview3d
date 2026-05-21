'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        question: '파일 업로드 용량 제한이 있나요?',
        answer: '현재 무료 플랜은 파일당 50MB, 유료 플랜은 최대 500MB까지 지원합니다. 대용량 STL 파일도 웹 최적화 기술을 통해 빠르게 로드됩니다.'
    },
    {
        question: '상대방도 회원가입을 해야 3D 모델을 볼 수 있나요?',
        answer: '아니요, 공유받은 링크를 클릭하면 별도의 로그인이나 앱 설치 없이 즉시 웹 브라우저에서 3D 모델을 확인할 수 있습니다.'
    },
    {
        question: '링크 유지 기간은 플랜마다 다른가요?',
        answer: '네, 플랜별로 다릅니다. Free(2시간), Basic(24시간), Pro(3일) 동안 링크가 유지되며, Enterprise 플랜은 영구 보관을 지원합니다. 기간이 만료되면 데이터는 보안을 위해 자동 삭제됩니다.'
    },
    {
        question: '결제는 어떤 방식이 가능한가요?',
        answer: '국내 사용자는 신용카드, 계좌이체 등 포트원(PortOne)을 통한 결제가 가능하며, 해외 사용자는 Stripe를 통해 간편하게 달러 결제가 가능합니다.'
    },
    {
        question: '병원 로고를 넣거나 브랜딩을 할 수 있나요?',
        answer: '네, Pro 플랜 이상부터 뷰어 하단이나 링크 접속 화면에 병원/기공소 로고를 노출할 수 있는 커스텀 브랜딩 기능을 제공합니다.'
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="faq">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">자주 묻는 질문</h2>
                    <p className="text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] font-bold">궁금하신 점을 빠르게 해결해 드립니다</p>
                </div>

                <div className="space-y-2">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-100/80 dark:border-gray-900 pb-2">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center py-5 text-left group"
                            >
                                <span className={`text-base font-black tracking-tight transition-colors ${openIndex === index ? 'text-[#0061FF]' : 'text-gray-900 dark:text-gray-200 group-hover:text-[#0061FF]'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="text-[#0061FF] shrink-0 transition-transform duration-300" size={18} strokeWidth={2.5} />
                                ) : (
                                    <ChevronDown className="text-gray-400 dark:text-gray-600 group-hover:text-gray-600 shrink-0 transition-transform duration-300" size={18} strokeWidth={2.5} />
                                )}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100 mb-5' : 'max-h-0 opacity-0'}`}>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm font-medium pr-6">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
