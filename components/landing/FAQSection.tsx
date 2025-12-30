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
        question: '링크 유지 기간이 지나면 파일은 어떻게 되나요?',
        answer: '설정된 링크 유지 기간이 만료되면 해당 링크는 비활성화되며, 서버에 저장된 파일은 보안을 위해 즉시 영구 삭제됩니다.'
    },
    {
        question: '결제는 어떤 방식이 가능한가요?',
        answer: '국내 사용자는 신용카드, 계좌이체 등 포트원(PortOne)을 통한 결제가 가능하며, 해외 사용자는 Stripe를 통해 간편하게 달러 결제가 가능합니다.'
    },
    {
        question: '병원 로고를 넣거나 브랜딩을 할 수 있나요?',
        answer: '엔터프라이즈 플랜 또는 커스텀 설정을 통해 뷰어 하단이나 링크 접속 화면에 병원/기공소 로고를 노출할 수 있는 기능을 준비 중입니다.'
    }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-white dark:bg-black transition-colors duration-300" id="faq">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">자주 묻는 질문</h2>
                    <p className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs font-bold">궁금하신 점을 확인해 보세요</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-4">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center py-4 text-left group"
                            >
                                <span className={`text-lg font-bold transition-colors ${openIndex === index ? 'text-blue-600' : 'text-gray-900 dark:text-gray-200 group-hover:text-blue-500'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-gray-400" />}
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
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
