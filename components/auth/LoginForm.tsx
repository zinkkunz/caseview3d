'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginForm({ settings }: { settings: Record<string, string> }) {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    
    const authError = searchParams.get('error');
    
    const getErrorMessage = (err: string) => {
        switch (err) {
            case 'SessionRequired': return '로그인이 필요한 서비스입니다.';
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
            case 'EmailCreateAccount':
            case 'Callback':
            case 'OAuthAccountNotLinked':
                return '구글 인증 과정에서 오류가 발생했습니다. 다시 시도해 주세요.';
            default: return '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn('google', { callbackUrl: '/dashboard' });
        } catch (err) {
            console.error('Google Auth Trigger Error:', err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] dark:shadow-none border border-gray-100/50 dark:border-gray-800/50 p-10 md:p-14 relative z-10 text-center">
                <div className="flex flex-col items-center mb-10">
                    <Logo className="mb-8 scale-110" />
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">간편 시작하기</h1>
                    <p className="text-gray-400 text-xs font-black mt-2 uppercase tracking-widest">Connect seamlessly via Google</p>
                </div>

                {authError && (
                    <div className="mb-8 p-5 rounded-2xl text-sm font-bold border bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30">
                        {getErrorMessage(authError)}
                    </div>
                )}

                <div className="space-y-6">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                        별도의 회원가입 없이 기존 구글 계정을 사용하여 <br />
                        <strong>1초 만에 즉시 시작</strong>할 수 있습니다.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] transform hover:-translate-y-0.5 group active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <svg className="w-6 h-6 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="font-extrabold text-gray-800 dark:text-gray-200 text-sm tracking-tight">Google 계정으로 시작하기</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-100/50 dark:border-gray-800/50 flex flex-col items-center gap-2">
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-wider">Secure Sync</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold leading-relaxed max-w-[280px]">
                        본 서비스는 구글의 보안 OAuth2 프로토콜을 통과하여 데이터를 안전하게 싱크합니다.
                    </p>
                </div>
            </div>
        </div>
    );
}

