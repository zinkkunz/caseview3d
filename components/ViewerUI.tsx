'use client';

import { Settings, X, Palette, Sun, Eye, EyeOff, Share2, MessageSquare, Plus, Check, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Logo from '@/components/Logo';
import QRCodeModal from '@/components/QRCodeModal';
import GuideModal from '@/components/GuideModal';

interface FileItem {
    path: string;
    name: string;
    type: 'maxilla' | 'mandible' | 'design';
}

interface ViewerUIProps {
    files: FileItem[];
    fileOpacities: Record<string, number>;
    onFileOpacityChange: (filePath: string, opacity: number) => void;

    brightness: number;
    onBrightnessChange: (value: number) => void;

    globalColor: string;
    onGlobalColorChange: (color: string) => void;

    designColor: string;
    onDesignColorChange: (color: string) => void;

    backgroundColor: string;
    onBackgroundColorChange: (color: string) => void;

    showOriginalColor: boolean;
    onShowOriginalColorChange: (value: boolean) => void;

    hasPLY: boolean;

    onViewChange: (view: 'front' | 'left' | 'right' | 'top' | 'bottom') => void;
    onOpenGuide: () => void;
    onCloseGuide: () => void;
    isGuideOpen: boolean;
    settings: Record<string, string>;

    // Phase 2 Props
    isClippingEnabled: boolean;
    onToggleClipping: (value: boolean) => void;
    clippingValue: number;
    onClippingChange: (value: number) => void;
    measurementMode: boolean;
    onToggleMeasurement: (value: boolean) => void;
    isGizmoEnabled: boolean;
    onToggleGizmo: (value: boolean) => void;
    caseId: string;
    // Phase 4 Props
    annotationMode: boolean;
    onToggleAnnotationMode: (value: boolean) => void;
    pendingAnnotation: any; // THREE.Vector3 | null
    onCancelAnnotation: () => void;
    onSubmitAnnotation: (text: string) => void;
    
    ownerPlan?: string;
}

export default function ViewerUI({
    files,
    fileOpacities,
    onFileOpacityChange,
    brightness,
    onBrightnessChange,
    globalColor,
    onGlobalColorChange,
    designColor,
    onDesignColorChange,
    backgroundColor,
    onBackgroundColorChange,
    showOriginalColor,
    onShowOriginalColorChange,
    hasPLY,
    onViewChange,
    onOpenGuide,
    onCloseGuide,
    isGuideOpen,
    settings,
    isClippingEnabled,
    onToggleClipping,
    clippingValue,
    onClippingChange,
    measurementMode,
    onToggleMeasurement,
    isGizmoEnabled,
    onToggleGizmo,
    caseId,
    annotationMode,
    onToggleAnnotationMode,
    pendingAnnotation,
    onCancelAnnotation,
    onSubmitAnnotation,
    ownerPlan = 'FREE'
}: ViewerUIProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [origin, setOrigin] = useState('');
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    // Initial opacity state handling
    const getOpacity = (path: string) => fileOpacities[path] ?? 1.0;

    const handleToggleVisibility = (path: string) => {
        const currentOpacity = getOpacity(path);
        if (currentOpacity > 0) {
            onFileOpacityChange(path, 0);
        } else {
            onFileOpacityChange(path, 1.0);
        }
    };

    const backgroundPresets = [
        { label: 'Mid Gray', value: '#4a5568' },
        { label: 'Navy', value: '#1e293b' },
        { label: 'Black', value: '#000000' },
        { label: 'Beige', value: '#f5f5f4' },
    ];

    // Check if Pro Plan logic applies
    // Note: Since we don't have customLogoUrl yet, we assume standard behavior unless URL is present.
    // For now, we keep the Standard Logo. 
    // BUT the requirement is: "If Custom Logo, Main=Custom, Sub(BottomLeft)=CaseView".
    // I will simulate this structure:
    const customLogoUrl = null; // Placeholder effectively. 
    // In future: const customLogoUrl = ownerPlan === 'PRO' ? settings['custom_logo_url'] : null;

    return (
        <>
            {/* Logo Logic */}
            {customLogoUrl ? (
                <>
                    {/* Main Custom Logo (Top Left) */}
                    <div className="absolute top-8 left-8 z-40 select-none origin-top-left">
                        <img src={customLogoUrl} alt="Lab Logo" className="h-12 object-contain drop-shadow-lg" />
                    </div>
                    {/* Secondary CaseView Logo (Bottom Left) */}
                    <div className="absolute bottom-6 left-6 z-40 select-none scale-75 origin-bottom-left opacity-80 hover:opacity-100 transition-opacity">
                        <Logo className="px-3 py-2 glass rounded-2xl border border-white/20 shadow-lg" />
                        <span className="text-[10px] text-gray-400 font-bold ml-2">Powered by CaseView3D</span>
                    </div>
                </>
            ) : (
                /* Standard CaseView Logo (Top Left) */
                <div className="absolute top-8 left-8 z-40 select-none scale-90 origin-top-left">
                    <Logo className="px-4 py-3 glass rounded-3xl border border-white/40 shadow-2xl shadow-blue-500/10" />
                </div>
            )}

            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "absolute top-6 right-6 p-3 rounded-full shadow-2xl transition-all z-50 text-white flex items-center justify-center",
                    "bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-110 hover:shadow-blue-500/30 active:scale-95",
                    isGuideOpen ? "opacity-0 pointer-events-none translate-x-10" : "opacity-100 translate-x-0 pointer-events-auto"
                )}
            >
                <Settings size={22} className="drop-shadow-sm" />
            </button>

            {/* QR Code Button */}
            <div className={cn(
                "absolute top-6 right-36 z-10 transition-all",
                isGuideOpen ? "opacity-0 pointer-events-none translate-x-10" : "opacity-100 translate-x-0 pointer-events-auto"
            )}>
                <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="glass p-3 rounded-full shadow-xl hover:bg-white/50 transition-all text-gray-700 hover:scale-110 active:scale-95 border-white/50"
                    title="QR 코드 공유"
                >
                    <Share2 size={20} />
                </button>
            </div>

            {/* Help Button (Top Right, left of Settings) */}
            <div className={cn(
                "absolute top-6 right-20 z-10 transition-all",
                isGuideOpen ? "opacity-0 pointer-events-none translate-x-10" : "opacity-100 translate-x-0 pointer-events-auto"
            )}>
                <button
                    onClick={onOpenGuide}
                    className="glass p-3 rounded-full shadow-xl hover:bg-white/50 transition-all text-gray-700 hover:scale-110 active:scale-95 border-white/50"
                    title="사용 가이드"
                >
                    <span className="font-extrabold text-lg leading-none">?</span>
                </button>
            </div>

            {/* Annotation Toggle Button */}
            <div className={cn(
                "absolute top-6 right-52 z-10 transition-all",
                isGuideOpen ? "opacity-0 pointer-events-none translate-x-10" : "opacity-100 translate-x-0 pointer-events-auto"
            )}>
                <button
                    onClick={() => onToggleAnnotationMode(!annotationMode)}
                    className={cn(
                        "glass p-3 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 border-white/50",
                        annotationMode ? "bg-blue-600 text-white border-blue-400" : "text-gray-700 hover:bg-white/50"
                    )}
                    title="진료 메모 추가"
                >
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* File-based Opacity Sliders (Right Bottom) */}
            <div className={cn(
                "absolute bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300",
                isGuideOpen ? "opacity-0 pointer-events-none translate-y-10" : "opacity-100 translate-y-0 pointer-events-auto"
            )}>

                {files.map((file, idx) => {
                    const opacity = getOpacity(file.path);
                    const isVisible = opacity > 0;

                    return (
                        <div
                            key={file.path}
                            className="flex items-center gap-4 group"
                            title={file.name}
                        >
                            {/* Toggle Button */}
                            <button
                                onClick={() => handleToggleVisibility(file.path)}
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-xl transition-all shadow-sm active:scale-90 touch-manipulation",
                                    isVisible
                                        ? "bg-gradient-to-br from-blue-500/80 to-indigo-600/80 text-white shadow-blue-500/20"
                                        : "glass-card bg-gray-200/50 text-gray-400 border-none"
                                )}
                            >
                                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            {/* Slider Container */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={opacity}
                                    onChange={(e) => onFileOpacityChange(file.path, parseFloat(e.target.value))}
                                    className="w-32 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-blue-500 backdrop-blur-md touch-manipulation hover:accent-blue-400 transition-all shadow-sm"
                                />
                                <span className="text-[9px] font-mono font-bold text-blue-500/80 w-6 text-right">
                                    {Math.round(opacity * 100)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div
                className={cn(
                    "absolute top-0 right-0 h-full w-full sm:w-85 glass-card backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] border-l border-white/40",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="p-6 space-y-8 h-full overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-gray-100/50 pb-5">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Settings size={18} />
                            </div>
                            View Settings
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100/50 rounded-full transition-all text-gray-400 hover:text-gray-600 hover:rotate-90"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Background</h4>
                        <div className="grid grid-cols-4 gap-2.5">
                            {backgroundPresets.map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => onBackgroundColorChange(preset.value)}
                                    className={cn(
                                        "h-10 rounded-xl border-2 text-[10px] font-bold transition-all shadow-sm hover:scale-105 active:scale-95",
                                        backgroundColor === preset.value ? "border-blue-500 scale-105 shadow-blue-500/20" : "border-white shadow-none"
                                    )}
                                    style={{ backgroundColor: preset.value, color: preset.value === '#f5f5f4' ? '#333' : '#fff' }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Palette size={12} /> Model Color
                        </h4>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card bg-white/30 border-white/60 hover:bg-white/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700">Jaw (Base)</span>
                                    <span className="text-[9px] text-gray-400">Default model color</span>
                                </div>
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-white/80">
                                    <input
                                        type="color"
                                        value={globalColor}
                                        onChange={(e) => onGlobalColorChange(e.target.value)}
                                        className="absolute -inset-2 w-14 h-14 cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card bg-blue-50/30 border-white/60 hover:bg-blue-50/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-blue-700">Design (Crown)</span>
                                    <span className="text-[9px] text-blue-400/80">Active work segments</span>
                                </div>
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-white/80">
                                    <input
                                        type="color"
                                        value={designColor}
                                        onChange={(e) => onDesignColorChange(e.target.value)}
                                        className="absolute -inset-2 w-14 h-14 cursor-pointer border-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brightness */}
                    <div className="space-y-4 bg-orange-50/30 p-4 rounded-2xl border border-orange-100/30">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-orange-600/70 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Sun size={12} /> Brightness
                            </h4>
                            <span className="text-xs font-mono font-bold text-orange-600">{Math.round(brightness * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={brightness}
                            onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-orange-200/50 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                        />
                    </div>

                    {/* Phase 2: Practical Tools */}
                    <div className="space-y-6 pt-4 border-t border-gray-100/50">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Practical Tools</h4>
                        
                        {/* Clipping Plane */}
                        <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/30">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-700">단면 보기 (Clipping)</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isClippingEnabled}
                                        onChange={(e) => onToggleClipping(e.target.checked)}
                                    />
                                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>

                            {isClippingEnabled && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-100/30 border border-indigo-200/30">
                                    <span className="text-[10px] font-bold text-indigo-600">3D 드래그 모드</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isGizmoEnabled}
                                            onChange={(e) => onToggleGizmo(e.target.checked)}
                                        />
                                        <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                                    </label>
                                </div>
                            )}

                            {isClippingEnabled && !isGizmoEnabled && (
                                <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    step="0.1"
                                    value={clippingValue}
                                    onChange={(e) => onClippingChange(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-indigo-200/50 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                />
                            )}
                        </div>

                        {/* Measurement Tool */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/30 border border-green-100/30">
                            <span className="text-xs font-bold text-green-700">거리 측정 (Measurement)</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={measurementMode}
                                    onChange={(e) => onToggleMeasurement(e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className={cn("pt-2 space-y-4 transition-all", !hasPLY && "opacity-30 grayscale pointer-events-none")}>
                        <div className="flex items-center justify-between p-1">
                            <div className="flex flex-col">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Original Color
                                </h4>
                                <span className="text-[9px] text-gray-400 mt-0.5">Texture mapping (PLY only)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={showOriginalColor}
                                    onChange={(e) => onShowOriginalColorChange(e.target.checked)}
                                    disabled={!hasPLY}
                                />
                                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <GuideModal open={isGuideOpen} onClose={onCloseGuide} />
            <QRCodeModal 
                open={isQRModalOpen} 
                onClose={() => setIsQRModalOpen(false)} 
                url={`${origin}/viewer/${caseId}`} 
            />
        
            {/* Annotation Input Overlay */}
            {pendingAnnotation && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card bg-white p-6 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-sm border border-white/50 mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <Plus size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">진료 메모</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 ml-1">선택한 위치에 남길 메모를 입력하세요</p>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="예: 치수 노출 주의, 인접면 삭제 필요 등"
                            className="w-full h-32 p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm mb-4 resize-none"
                            autoFocus
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    onCancelAnnotation();
                                    setNoteText('');
                                }}
                                className="py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    onSubmitAnnotation(noteText);
                                    setNoteText('');
                                }}
                                disabled={!noteText.trim()}
                                className="py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <Check size={18} />
                                    저장하기
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
            {/* Mode Indicator */}
            {annotationMode && !pendingAnnotation && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[150] animate-bounce">
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-2xl text-sm font-bold border border-blue-400">
                        모델의 위치를 클릭하여 메모를 남기세요
                    </div>
                </div>
            )}
            {/* Annotation Input Modal */}
            {pendingAnnotation && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="text-blue-600" size={24} />
                            메모 추가
                        </h3>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="메모 내용을 입력하세요..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-gray-900 placeholder-gray-400 bg-white"
                            rows={4}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => {
                                    onCancelAnnotation();
                                    setNoteText('');
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    if (noteText.trim()) {
                                        onSubmitAnnotation(noteText.trim());
                                        setNoteText('');
                                    }
                                }}
                                disabled={!noteText.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                            >
                                저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
