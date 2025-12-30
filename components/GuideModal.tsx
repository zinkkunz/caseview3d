
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GuideModal({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [step, setStep] = useState(0);
    const [closing, setClosing] = useState(false);

    // Reset step when opened
    useEffect(() => {
        if (open) {
            setStep(0);
            setClosing(false);
        }
    }, [open]);

    const handleClose = () => {
        setClosing(true);
        localStorage.setItem('dentalViewerGuideSeen', 'true');
        setTimeout(onClose, 300); // Allow exit animation
    };

    const nextStep = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    if (!open) return null;

    const current = steps[step];

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center transition-opacity duration-300",
                open && !closing ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Dark gradient overlay at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Gesture Animation Area (Centered) */}
            <div className="flex-1 flex items-center justify-center w-full pointer-events-none">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {current.animation}
                </div>
            </div>

            {/* Instruction Card (Bottom) */}
            <div className="w-full max-w-md p-6 pb-12 pointer-events-auto flex flex-col items-center text-center space-y-6 animate-slide-up">

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                        {current.title}
                    </h2>
                    <p className="text-white/90 text-sm font-medium drop-shadow-md">
                        {current.desc}
                    </p>
                    <p className="text-white/60 text-xs">
                        {current.subDesc}
                    </p>
                </div>

                <button
                    onClick={nextStep}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full font-semibold transition-all active:scale-95 flex items-center gap-2 group"
                >
                    {step === steps.length - 1 ? (
                        <>
                            <Check size={20} className="text-green-400" />
                            시작하기
                        </>
                    ) : (
                        <>
                            다음
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                {/* Progress Indicators */}
                <div className="flex gap-2">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                idx === step ? "bg-white w-6" : "bg-white/30"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Skip Button (Top Left) */}
            <button
                onClick={handleClose}
                className="absolute top-6 left-6 pointer-events-auto text-white/70 hover:text-white p-2"
                title="가이드 닫기"
            >
                <X size={24} />
            </button>
        </div>
    );
}

// --- Visual Assets ---

const HandIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="white"
        className={cn("drop-shadow-lg", className)}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M21.92,16.62a1,1,0,0,0-.22-.39l-4-4a1,1,0,0,0-1.42,1.42L18.59,16H13a1,1,0,0,1-1-1V4a1,1,0,1,0-2,0V15H9a1,1,0,0,1,0-2h.06a1,1,0,0,0,0-2H9A3,3,0,0,0,6,14c0,3.31,2.69,6,6,6h6.24l3.12-3.12A1,1,0,0,0,21.92,16.62Z" />
    </svg>
);

const FingerIcon = ({ className }: { className?: string }) => (
    <div className={cn("w-12 h-12 bg-white/90 rounded-full shadow-lg border-4 border-blue-500/50 backdrop-blur-sm", className)} />
);

// --- Steps Data ---

const steps = [
    {
        title: "회전하기",
        desc: "한 손가락으로 화면을 드래그하세요",
        subDesc: "(PC: 마우스 왼쪽 클릭 드래그)",
        animation: (
            <div className="relative w-full h-full">
                {/* Hand moving left-right */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 animate-gesture-drag">
                    <FingerIcon />
                </div>
                {/* Trail effect */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 opacity-50 overflow-visible">
                    <path d="M20,40 Q100,40 180,40" fill="none" stroke="white" strokeWidth="4" strokeDasharray="10 10" className="animate-pulse" />
                </svg>
            </div>
        )
    },
    {
        title: "이동하기",
        desc: "두 손가락으로 화면을 드래그하세요",
        subDesc: "(PC: 마우스 오른쪽 클릭 드래그)",
        animation: (
            <div className="relative w-full h-full">
                <div className="flex gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-gesture-pan">
                    <FingerIcon />
                    <FingerIcon />
                </div>
            </div>
        )
    },
    {
        title: "확대 / 축소",
        desc: "두 손가락을 오므리거나 벌려보세요",
        subDesc: "(PC: 마우스 휠 스크롤)",
        animation: (
            <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center animate-gesture-pinch">
                    <div className="flex gap-12">
                        <FingerIcon />
                        <FingerIcon />
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "준비 완료!",
        desc: "이제 자유롭게 3D 모델을 확인하세요.",
        subDesc: "우측 상단 '?' 버튼으로 언제든 다시 볼 수 있습니다.",
        animation: (
            <div className="animate-bounce">
                <Check size={80} className="text-white drop-shadow-lg" />
            </div>
        )
    }
];

// Add global styles for custom animations if not defined in Tailwind
const style = `
@keyframes gesture-drag {
    0%, 100% { transform: translate(-50%, -50%) translateX(-30px); }
    50% { transform: translate(-50%, -50%) translateX(30px); }
}
@keyframes gesture-pan {
    0%, 100% { transform: translate(-50%, -50%) translate(-20px, -20px); }
    50% { transform: translate(-50%, -50%) translate(20px, 20px); }
}
@keyframes gesture-pinch {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.6); opacity: 0.8; }
}
.animate-gesture-drag { animation: gesture-drag 2s infinite ease-in-out; }
.animate-gesture-pan { animation: gesture-pan 2s infinite ease-in-out; }
.animate-gesture-pinch { animation: gesture-pinch 2s infinite ease-in-out; }
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = style;
    document.head.appendChild(styleEl);
}
