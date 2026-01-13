'use client';

import { Check, Mail, MessageCircle, Lock, X } from 'lucide-react';

interface ShareToastProps {
    onClose: () => void;
    onOpenSecure: () => void; // Call parent to open modal and close toast
}

export function ShareToast({ onClose, onOpenSecure }: ShareToastProps) {
    const handleShareKakao = () => {
        alert('카카오톡 공유 준비 중'); 
    };

    const handleShareEmail = () => {
         alert('메일 공유 준비 중');
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 min-w-[320px] justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <Check size={16} strokeWidth={3} />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">링크 복사 완료 (Copied)</span>
            </div>
            
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleShareKakao}
                    className="w-8 h-8 rounded-full bg-[#FEE500] hover:brightness-95 flex items-center justify-center transition-all"
                    title="카카오톡 공유"
                >
                    <MessageCircle size={14} className="text-[#3c1e1e] fill-[#3c1e1e]" />
                </button>
                <button 
                    onClick={handleShareEmail}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                    title="이메일 공유"
                >
                    <Mail size={14} className="text-gray-600 dark:text-gray-300" />
                </button>
                
                <button 
                    onClick={onOpenSecure}
                    className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center transition-all"
                    title="보안 설정"
                >
                    <Lock size={14} className="text-blue-600 dark:text-blue-400" />
                </button>
                
                <button 
                    onClick={onClose}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                >
                    <span className="sr-only">닫기</span>
                    <X size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
