'use client';

import { FileUp, Link as LinkIcon, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WorkflowVisual() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4); // 0, 1, 2, 3 (Reset requires logic adjustment if 3 is nothing)
            // Let's make it 0->1->2->0.
            // Actually, let's do 0,1,2, then brief pause?
            // Simple: 0, 1, 2. if 3, set to 0 immediately?
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // effective step: if step is 3, show 0? 
    // Let's just use mod 3.
    const activeStep = step % 3;

    return (
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#111] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] animate-pulse"></div>

            {/* Step Indicators */}
            <div className="absolute top-8 flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            i === activeStep ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200 dark:bg-gray-800'
                        }`}
                    />
                ))}
            </div>

            {/* Main Stage */}
            <div className="relative w-full h-64 flex items-center justify-center">
                
                {/* Step 1: Upload */}
                <div className={`absolute transition-all duration-700 transform ${activeStep === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}>
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center relative overflow-hidden group">
                            <FileUp className="text-blue-600 w-10 h-10 animate-bounce" />
                            {/* Drag Effect */}
                            <div className="absolute inset-0 bg-blue-100/50 dark:bg-blue-800/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Drag & Upload</h3>
                            <p className="text-sm text-gray-500">STL / PLY / OBJ Supported</p>
                        </div>
                    </div>
                </div>

                {/* Step 2: Link Generation */}
                <div className={`absolute transition-all duration-700 transform ${activeStep === 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}>
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                                <LinkIcon className="text-white w-10 h-10" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-green-500 rounded-full p-1 shadow-md animate-in zoom-in duration-500 delay-300">
                                <CheckCircle2 size={24} fill="currentColor" className="text-white dark:text-gray-900" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Instant Link</h3>
                            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono text-gray-500 flex items-center gap-2">
                                caseview.3d/s/x8k9... <ArrowRight size={10} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 3: Share (Mobile) */}
                <div className={`absolute transition-all duration-700 transform ${activeStep === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'}`}>
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative w-24 h-36 bg-gray-900 rounded-2xl p-1 shadow-xl border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                             {/* Mobile Screen */}
                            <div className="w-full h-full bg-white dark:bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
                                <div className="absolute top-2 w-8 h-1 bg-gray-200 rounded-full"></div>
                                <div className="mt-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Share2 size={20} className="text-blue-600" />
                                </div>
                                <div className="mt-3 w-16 h-2 bg-gray-100 rounded"></div>
                                <div className="mt-1 w-10 h-2 bg-gray-100 rounded"></div>
                            </div>
                            {/* Notification Pop */}
                            <div className="absolute top-1/2 -right-12 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in slide-in-from-left duration-500">
                                <span className="text-[10px] font-bold text-blue-600 block">New Case</span>
                                <span className="text-[8px] text-gray-400">Sent via KakaoTalk</span>
                            </div>
                        </div>
                         <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Share Anywhere</h3>
                            <p className="text-sm text-gray-500">KakaoTalk / SMS / Email</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
