'use client';

import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface QRCodeModalProps {
    open: boolean;
    onClose: () => void;
    url: string;
}

export default function QRCodeModal({ open, onClose, url }: QRCodeModalProps) {
    const [copied, setCopied] = useState(false);

    if (!open) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                    <h3 className="font-black text-gray-900 tracking-tight">QR CODE SHARE</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 mb-8">
                        <QRCodeSVG 
                            value={url} 
                            size={200}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/favicon.ico",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-900 mb-1">모바일기기로 스캔하세요</p>
                            <p className="text-xs text-gray-500">별도의 앱 설치 없이 바로 디자인을 확인할 수 있습니다.</p>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <input 
                                type="text" 
                                readOnly 
                                value={url} 
                                className="bg-transparent text-[10px] text-gray-400 flex-1 outline-none font-mono"
                            />
                            <button 
                                onClick={handleCopy}
                                className={cn(
                                    "p-2 rounded-xl transition-all active:scale-90",
                                    copied ? "bg-green-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all active:scale-[0.98]"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
