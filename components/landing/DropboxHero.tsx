'use client';

import Link from 'next/link';

export default function DropboxHero() {
    return (
        <section className="relative bg-white dark:bg-black transition-colors duration-300 pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Geometric Decorations */}
            <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] text-blue-100 dark:text-blue-900/20 opacity-20 hidden md:block select-none pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor">
                    <path d="M0,100 L100,0 L100,100 Z" />
                </svg>
            </div>
            <div className="absolute top-[10%] right-[5%] w-12 h-12 text-blue-600 opacity-80 hidden md:block animate-pulse">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                    {/* Left content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase">
                            Professional Dental 3D Solutions
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-gray-100 leading-[1] mb-8 tracking-tighter">
                            Share <span className="text-[#0061FF]">Dental</span><br />
                            3D Design<span className="inline-block w-8 h-2 bg-blue-600 ml-2 -mb-1"></span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                            전화 한 통 줄이는 마법,<br />
                            치과 보철 디자인 공유의 새로운 기준.<br />
                            복잡한 과정 대신, <span className="font-bold text-gray-900 dark:text-white underline decoration-blue-500 decoration-4">본질에만 집중하세요.</span>
                        </p>
                        
                        {/* Highlights */}
                        <div className="grid grid-cols-2 gap-8 mb-12 max-w-md mx-auto lg:mx-0">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-blue-600">0%</p>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Installation</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-blue-600">1s</p>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Fast Sharing</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="flex-1 w-full max-w-md relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="bg-white dark:bg-[#111] rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative z-20 border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">간편 시작하기</h2>
                                    <p className="text-gray-400 text-xs font-medium">1초 만에 구글 계정으로 연결</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed text-center">
                                    별도의 복잡한 회원가입 없이<br />
                                    기존 구글 계정으로 즉시 시작합니다.
                                </p>
                                <Link
                                    href="/login"
                                    className="w-full h-16 bg-[#0061FF] text-white flex items-center justify-center gap-3 text-lg font-black rounded-2xl hover:bg-[#0052D9] transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-100 dark:shadow-none active:scale-[0.98]"
                                >
                                    <svg className="w-6 h-6 shrink-0 bg-white p-1 rounded-full text-blue-600" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    <span>Google 계정으로 시작하기</span>
                                </Link>
                            </div>
                            
                            <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed font-light">
                                시작 시 당사의 <span className="underline cursor-pointer">이용약관</span> 및 <span className="underline cursor-pointer">개인정보처리방침</span>에 동의하게 됩니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
