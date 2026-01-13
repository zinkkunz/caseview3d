'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Lock } from 'lucide-react';

interface ShareModalProps {
    caseId: string;
    isOpen: boolean;            // Controlled
    onClose: () => void;        // Controlled
    onLinkGenerated?: (url: string) => void;
}

export function ShareModal({ caseId, isOpen, onClose, onLinkGenerated }: ShareModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const generateLink = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    expiresAt: null, 
                    maxViews: null,
                    password: password || null
                })
            });

            if (!res.ok) {
                 const err = await res.json();
                 alert(err.error || 'Failed to create link');
                 return;
            }

            const data = await res.json();
            if (data.success) {
                // Auto-Copy the new link
                try {
                    await navigator.clipboard.writeText(data.url);
                    alert('보안 링크가 설정되고 클립보드에 복사되었습니다!');
                } catch (err) {
                    // Fallback if clipboard fails (unlikely in user interaction)
                    alert('보안 링크가 설정되었습니다.');
                }
                
                if (onLinkGenerated) onLinkGenerated(data.url);
                onClose();
            } else {
                alert('링크 생성 실패');
            }

        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted || !isOpen) return null;

    // Use Portal to break out of any parent stacking contexts (like Toasts)
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden relative scale-100 z-10 transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Lock size={16} className="text-blue-600" />
                        보안 링크 설정 (Secure Link)
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            비밀번호를 설정하여 데이터를 안전하게 보호하세요.<br/>
                            <span className="text-xs text-gray-400">(설정하지 않으면 누구나 볼 수 있습니다)</span>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="비밀번호 입력 (선택)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-normal"
                                    autoFocus
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Lock size={14} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateLink}
                        disabled={isLoading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-100 dark:shadow-none"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={18} strokeWidth={3} />
                                <span>설정 저장 및 링크 생성</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
