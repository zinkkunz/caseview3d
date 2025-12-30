'use client';

import { useState } from 'react';
import { Copy, Link as LinkIcon, Eye, Calendar, X } from 'lucide-react';

interface ShareModalProps {
    caseId: string;
}

export function ShareModal({ caseId }: ShareModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Options
    const [expiresAt, setExpiresAt] = useState<string>('7d'); // 1d, 7d, 30d, inf
    const [maxViews, setMaxViews] = useState<string>('100'); // 10, 50, 100, inf

    const generateLink = async () => {
        console.log('[ShareModal] Generating link for Case ID:', caseId);
        setIsLoading(true);
        try {
            // Calculate actual date based on selection
            let dateValue: Date | null = new Date();
            if (expiresAt === '1d') dateValue.setDate(dateValue.getDate() + 1);
            else if (expiresAt === '7d') dateValue.setDate(dateValue.getDate() + 7);
            else if (expiresAt === '30d') dateValue.setDate(dateValue.getDate() + 30);
            else dateValue = null;

            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    expiresAt: dateValue?.toISOString(),
                    maxViews: maxViews === 'inf' ? null : maxViews
                })
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedLink(data.url);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            alert('Link copied!');
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="w-12 h-12 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#0061FF] dark:hover:text-blue-400 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all border border-transparent hover:border-blue-50"
                title="Secure Share"
            >
                <LinkIcon size={22} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Secure Link Generation</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!generatedLink ? (
                        <>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    Expiration
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['1d', '7d', '30d', 'inf'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setExpiresAt(opt)}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${
                                                expiresAt === opt 
                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                : 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            {opt === 'inf' ? '' : opt.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-green-500" />
                                    Max Views
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['10', '50', '100', 'inf'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setMaxViews(opt)}
                                            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all border ${
                                                maxViews === opt 
                                                ? 'bg-green-600 text-white border-green-600' 
                                                : 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300'
                                            }`}
                                        >
                                            {opt === 'inf' ? '' : opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={generateLink}
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Generating...' : 'Create Secure Link'}
                            </button>
                        </>
                    ) : (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                             <div className="p-4 bg-gray-50 dark:bg-neutral-950 rounded-xl border border-gray-100 dark:border-neutral-800 text-center space-y-2">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Secure Link</div>
                                <div className="font-mono text-blue-500 break-all select-all text-sm">{generatedLink}</div>
                            </div>
                            <button 
                                onClick={copyToClipboard}
                                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Copy size={16} />
                                Copy Link
                            </button>
                            <button 
                                onClick={() => setGeneratedLink(null)}
                                className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
                            >
                                Generate New Link
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
