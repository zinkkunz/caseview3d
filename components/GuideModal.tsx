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

    useEffect(() => {
        if (open) {
            setStep(0);
            setClosing(false);
        }
    }, [open]);

    const handleClose = () => {
        setClosing(true);
        localStorage.setItem('dentalViewerGuideSeen', 'true');
        setTimeout(onClose, 300);
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
                "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-300 font-sans",
                open && !closing ? "opacity-100" : "opacity-0"
            )}
        >
            {/* Backdrop with Blur and simulated Viewer Background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0" onClick={handleClose}></div>
            
            {/* Simulated Viewer Background (Optional, adds realism) */}
             <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none overflow-hidden">
                <img src="/images/landing/viewer_mockup.png" alt="Background" className="w-full h-full object-cover grayscale" />
            </div>


            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-300">
                
                {/* Animation Area */}
                <div className="relative w-64 h-64 bg-gradient-to-b from-white/5 to-transparent rounded-3xl flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                     {/* Dynamic Background for Animation Area */}
                     <div className="absolute inset-0 opacity-30">
                        <img src="/images/landing/viewer_mockup.png" alt="Context" className="w-full h-full object-cover mix-blend-overlay" />
                     </div>
                     <div className="relative z-10 w-full h-full flex items-center justify-center scale-125">
                         {current.animation}
                     </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
                        {current.title}
                    </h2>
                    <div className="space-y-1">
                        <p className="text-lg text-white/90 font-medium leading-relaxed">
                            {current.desc}
                        </p>
                        <p className="text-sm text-blue-200 font-medium">
                            {current.subDesc}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full flex flex-col gap-6">
                    <button
                        onClick={nextStep}
                        className="w-full h-14 bg-white text-blue-900 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
                    >
                        {step === steps.length - 1 ? (
                            <>
                                시작하기
                                <Check size={20} className="text-blue-600" strokeWidth={3} />
                            </>
                        ) : (
                            <>
                                다음
                                <ChevronRight size={20} className="text-blue-600 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                            </>
                        )}
                    </button>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    idx === step ? "w-8 bg-white" : "w-1.5 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors hover:rotate-90 duration-300"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}

// --- Visual Assets ---

const FingerIcon = ({ className }: { className?: string }) => (
    <div className={cn("w-14 h-14 bg-white/90 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-4 border-blue-500/50 backdrop-blur-sm z-20 flex items-center justify-center", className)}>
         <div className="w-8 h-8 rounded-full bg-blue-100/50" />
    </div>
);

// --- Steps Data ---

const steps = [
    {
        title: "회전하기",
        desc: "한 손가락으로 드래그",
        subDesc: "(PC: 마우스 왼쪽 버튼)",
        animation: (
            <div className="relative w-full h-full">
                {/* Hand moving left-right */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 animate-gesture-drag">
                    <FingerIcon />
                </div>
                {/* Trail effect */}
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 opacity-60 overflow-visible pointer-events-none">
                    <path d="M20,40 Q100,20 180,40" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeDasharray="0 1000" className="animate-draw-path" />
                </svg>
            </div>
        )
    },
    {
        title: "이동하기",
        desc: "두 손가락으로 드래그",
        subDesc: "(PC: 마우스 오른쪽 버튼)",
        animation: (
            <div className="relative w-full h-full">
                <div className="flex gap-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-gesture-pan">
                    <FingerIcon />
                    <FingerIcon />
                </div>
            </div>
        )
    },
    {
        title: "확대/축소",
        desc: "두 손가락 오므리기",
        subDesc: "(PC: 마우스 휠)",
        animation: (
            <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center animate-gesture-pinch">
                    <div className="flex gap-16 items-center">
                        <FingerIcon />
                        <FingerIcon />
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "준비 완료!",
        desc: "자유롭게 확인하세요",
        subDesc: "우측 상단 '?' 버튼으로 다시보기",
        animation: (
            <div className="animate-bounce">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50 border-4 border-white">
                    <Check size={48} className="text-white" strokeWidth={4} />
                </div>
            </div>
        )
    }
];

// Add global styles for customized animations
const style = `
@keyframes gesture-drag {
    0%, 100% { transform: translate(-50%, -50%) translateX(-40px); }
    50% { transform: translate(-50%, -50%) translateX(40px); }
}
@keyframes draw-path {
    0% { stroke-dasharray: 0 1000; opacity: 0; }
    20% { opacity: 1; }
    80% { stroke-dasharray: 200 1000; opacity: 1; }
    100% { stroke-dasharray: 200 1000; opacity: 0; }
}
.animate-draw-path { animation: draw-path 2s infinite ease-in-out; }

@keyframes gesture-pan {
    0%, 100% { transform: translate(-50%, -50%) translate(-30px, -30px); }
    50% { transform: translate(-50%, -50%) translate(30px, 30px); }
}
@keyframes gesture-pinch {
    0%, 100% { transform: scale(1.1); opacity: 1; }
    50% { transform: scale(0.6); opacity: 0.8; }
}
.animate-gesture-drag { animation: gesture-drag 2s infinite ease-in-out; }
.animate-gesture-pan { animation: gesture-pan 2s infinite ease-in-out; }
.animate-gesture-pinch { animation: gesture-pinch 2s infinite ease-in-out; }
`;

if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = style;
    document.head.appendChild(styleEl);
}
