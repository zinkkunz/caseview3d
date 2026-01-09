'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, Check, Copy, FileBox, Hexagon, LayoutDashboard, LogIn, Settings, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import UpgradeModal from '@/components/UpgradeModal';
import Logo from '@/components/Logo';
import { ModeToggle } from '@/components/ModeToggle';

export default function ClientPage({ settings }: { settings: Record<string, string> }) {
    const { data: session } = useSession();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [memo, setMemo] = useState('');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeReason, setUpgradeReason] = useState<'MAX_LINKS_EXCEEDED' | 'LINK_EXPIRED'>('MAX_LINKS_EXCEEDED');
    
    // File selection states for visual feedback
    const [scanFileCount, setScanFileCount] = useState(0);
    const [designFileCount, setDesignFileCount] = useState(0);
    
    const [copied, setCopied] = useState(false);
    
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const allFiles = ([...formData.getAll('scans'), ...formData.getAll('designs')] as File[]).filter(f => f.size > 0);
        
        if (allFiles.length === 0) {
            alert('최소한 하나의 파일을 선택해주세요.');
            return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        setStatusMessage('업로드 준비 중...');
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);
        
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.min((event.loaded / event.total) * 100, 99);
                setUploadProgress(progress);
                setStatusMessage('파일 업로드 및 처리 중... (잠시만 기다려주세요)');
            }
        };
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        setUploadProgress(100);
                        setStatusMessage('완료!');
                        setGeneratedLink(window.location.origin + '/viewer/' + data.caseId);
                    } else {
                        alert('업로드 실패: ' + (data.error || '알 수 없는 오류'));
                        setUploading(false);
                    }
                } catch (e) { 
                    console.error("JSON Parse Error:", e, xhr.responseText);
                    alert('서버 응답 처리 중 오류가 발생했습니다.'); 
                    setUploading(false);
                }
            } else if (xhr.status === 403) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    setUpgradeReason(data.data?.reason || 'MAX_LINKS_EXCEEDED');
                    setShowUpgradeModal(true);
                    setUploading(false);
                } catch (e) {
                    setUploading(false);
                }
            } else {
                alert('업로드에 실패했습니다. (Error: ' + xhr.status + ')');
                setUploading(false);
            }
        };
        
        xhr.onerror = () => {
            alert('네트워크 오류가 발생했습니다.');
            setUploading(false);
        };
        
        xhr.send(formData);
    };

    const handleCopy = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareKakao = () => {
        if (!generatedLink) return;
        const shareUrl = generatedLink;
        if (navigator.share) {
            navigator.share({
                title: 'CaseView3D 공유',
                text: '3D 구강 스캔 데이터를 확인해보세요.',
                url: shareUrl,
            }).catch(() => {
                window.open(`https://sharer.kakao.com/talk/friends/picker/link?app_key=57cd0c6b3918941d7482715938cbab0a&link=${encodeURIComponent(shareUrl)}`);
            });
        } else {
            window.open(`https://sharer.kakao.com/talk/friends/picker/link?app_key=57cd0c6b3918941d7482715938cbab0a&link=${encodeURIComponent(shareUrl)}`);
        }
    };

    const handleShareEmail = () => {
        if (!generatedLink) return;
        const subject = encodeURIComponent('CaseView3D - 3D 데이터 케이스 공유');
        const body = encodeURIComponent(`안녕하세요.\n\n요청하신 3D 데이터 케이스 링크를 보내드립니다.\n아래 링크를 통해 뷰어를 확인하실 수 있습니다.\n\n링크: ${generatedLink}\n\n감사합니다.`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
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
                                {copied && (
                                    <div className="absolute inset-0 bg-green-600/90 backdrop-blur-sm flex items-center justify-center text-white font-black animate-fade-in">
                                        ✅ 복사 완료!
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2"
                                >
                                    <Copy size={18} />
                                    <span>{copied ? '복사되었습니다' : '링크 복사하기'}</span>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleShareKakao}
                                        className="py-4 bg-[#FEE500] text-[#3c1e1e] font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <MessageCircle size={18} fill="#3c1e1e" />
                                        <span>카카오톡 전송</span>
                                    </button>
                                    <button
                                        onClick={handleShareEmail}
                                        className="py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                    >
                                        <Mail size={18} />
                                        <span>메일 전송</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
