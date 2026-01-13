'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, Check, Copy, FileBox, Hexagon, LayoutDashboard, LogIn, Settings, ArrowRight } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UpgradeModal from '@/components/UpgradeModal';
import Logo from '@/components/Logo';
import { ModeToggle } from '@/components/ModeToggle';
import { ShareToast } from '@/components/ShareToast';
import { ShareModal } from '@/components/ShareModal';

export default function ClientPage({ settings }: { settings: Record<string, string> }) {
    const { data: session } = useSession();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
    const [memo, setMemo] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<'MAX_LINKS_EXCEEDED' | 'LINK_EXPIRED'>('MAX_LINKS_EXCEEDED');
    
    const [scanFileCount, setScanFileCount] = useState(0);
    const [designFileCount, setDesignFileCount] = useState(0);
    
    // Toast & Modal State
    const [showShareToast, setShowShareToast] = useState(false);
    const [showSecureModal, setShowSecureModal] = useState(false);
    
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const scans = formData.getAll('scans') as File[];
        const designs = formData.getAll('designs') as File[];
        const allFiles = [...scans.filter(f => f.size > 0), ...designs.filter(f => f.size > 0)];
        const memo = formData.get('memo') as string;
        
        if (allFiles.length === 0) {
            alert('최소한 하나의 파일을 선택해주세요.');
            return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        setStatusMessage('업로드 준비 중... (0%)');
        
        try {
            const uploadedFiles = [];
            let completedCount = 0;
            const totalCount = allFiles.length;

            const uploadFile = async (file: File, type: 'scan' | 'design') => {
                const presignRes = await fetch('/api/upload/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream' })
                });
                
                if (!presignRes.ok) {
                    const err = await presignRes.json();
                    throw new Error(err.error || 'Presign failed');
                }
                
                const { url, key } = await presignRes.json();
                
                const uploadRes = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type || 'application/octet-stream' }
                });

                if (!uploadRes.ok) throw new Error('R2 Upload failed');

                completedCount++;
                const progress = Math.round((completedCount / totalCount) * 100);
                setUploadProgress(progress);
                setStatusMessage(`파일 업로드 중... (${completedCount}/${totalCount})`);

                return { key, type, size: file.size };
            };

            const scanPromises = scans.filter(f => f.size > 0).map(f => uploadFile(f, 'scan'));
            const designPromises = designs.filter(f => f.size > 0).map(f => uploadFile(f, 'design'));

            const results = await Promise.all([...scanPromises, ...designPromises]);

            setStatusMessage('데이터 저장 중...');
            const createRes = await fetch('/api/cases/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: results, memo })
            });

            if (createRes.ok) {
                const data = await createRes.json();
                setUploadProgress(100);
                setStatusMessage('완료!');
                setGeneratedLink(window.location.origin + '/viewer/' + data.caseId);
                setCreatedCaseId(data.caseId);
            } else {
                const errData = await createRes.json();
                if (createRes.status === 403) {
                     setUpgradeReason(errData.data?.reason || 'MAX_LINKS_EXCEEDED');
                     setShowUpgradeModal(true);
                } else {
                    throw new Error(errData.error || 'Case creation failed');
                }
            }

        } catch (error: any) {
            console.error('Upload flow error:', error);
            alert('업로드 실패: ' + (error.message || '알 수 없는 오류'));
        } finally {
            if (uploadProgress < 100) setUploading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setShowShareToast(true);
        // Timeout handling: only hide if secure modal is NOT open? 
        // Actually, if secure modal opens, we explicitly hide toast.
        // So simple timeout is fine, if user clicks Lock, we clear timeout implicitly by unmounting or state change?
        // No, timeout callback runs. But if we set state false, it's fine.
        setTimeout(() => setShowShareToast(false), 5000); 
    };

    const handleOpenSecure = () => {
        setShowShareToast(false); // Close Toast immediately
        setShowSecureModal(true); // Open Modal
    };

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black transition-colors duration-300">
            {/* Premium Sticky Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50 h-20 items-center flex">
                <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
                    <Logo />
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        {session ? (
                            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-sm font-black hover:bg-blue-600/20 transition-all">
                                <LayoutDashboard size={18} />
                                <span>대시보드</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2 rounded-xl text-sm font-black hover:opacity-80 transition-all">
                                <LogIn size={18} />
                                <span>로그인</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-lg mx-auto pt-32 pb-20 px-6 w-full animate-fade-in">
                <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase">
                            CaseView3D Engine
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">새 케이스 업로드</h1>
                        <p className="text-gray-400 text-sm font-medium">{settings['beta_text'] || '파일을 선택하여 관찰용 공유 링크를 생성하세요.'}</p>
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <FileInput 
                                label="스캔 모델 (STL, PLY)" 
                                name="scans" 
                                icon={<FileBox size={18} />} 
                                color="blue" 
                                multiple 
                                onChange={(files: FileList) => setScanFileCount(files.length)}
                                count={scanFileCount}
                            />
                            <FileInput 
                                label="디자인 파일 (STL, PLY)" 
                                name="designs" 
                                icon={<Hexagon size={18} />} 
                                color="indigo" 
                                multiple 
                                onChange={(files: FileList) => setDesignFileCount(files.length)}
                                count={designFileCount}
                            />
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Memo</label>
                                <input
                                    type="text"
                                    name="memo"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="업로드 제목을 입력하세요"
                                    className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        {uploading ? (
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100/30">
                                <ProgressBar progress={uploadProgress} message={statusMessage} />
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full h-16 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                            >
                                <Upload size={22} className="stroke-[3]" />
                                <span>링크 생성하기</span>
                            </button>
                        )}
                    </form>

                    {generatedLink && (
                        <div className="mt-10 p-8 rounded-3xl bg-green-50/50 dark:bg-green-900/10 border border-green-100/50 dark:border-green-900/30 space-y-6 animate-slide-up">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-green-700 dark:text-green-400 font-black">
                                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                    <span>생성 완료!</span>
                                </div>
                                <Link 
                                    href={generatedLink}
                                    target="_blank"
                                    className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                                >
                                    <span>뷰어로 바로가기</span>
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-xl border border-green-100 dark:border-green-900/50 text-xs font-bold text-gray-500 break-all relative group overflow-hidden">
                                {generatedLink}
                            </div>

                            <button
                                onClick={handleCopy}
                                className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2"
                            >
                                <Copy size={18} />
                                <span>링크 복사하기</span>
                            </button>
                        </div>
                    )}
                    
                    {/* ShareToast Component */}
                    {showShareToast && (
                        <ShareToast 
                            onClose={() => setShowShareToast(false)}
                            onOpenSecure={handleOpenSecure}
                        />
                    )}
                    
                    {/* Secure Modal (Portal) */}
                    <ShareModal 
                        caseId={createdCaseId || ''}
                        isOpen={showSecureModal}
                        onClose={() => setShowSecureModal(false)}
                        onLinkGenerated={(url) => setGeneratedLink(url)}
                    />
                </div>
            </main>

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                reason={upgradeReason}
            />
        </div>
    );
}

function FileInput({ label, name, icon, color, multiple = false, onChange, count }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={`relative flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all`}>
                <div className="w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-700 text-blue-600">{icon}</div>
                <input
                    type="file"
                    name={name}
                    multiple={multiple}
                    accept=".stl,.ply"
                    onChange={(e) => onChange && onChange(e.target.files)}
                    className="w-full h-14 opacity-0 absolute inset-0 cursor-pointer z-10"
                />
                <div className="px-4 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {count > 0 ? `${count}개의 파일 선택됨` : '파일을 선택해 주세요...'}
                </div>
            </div>
        </div>
    );
}
