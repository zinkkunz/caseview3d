'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { LogIn } from 'lucide-react';

export default function LoginForm({ settings }: { settings: Record<string, string> }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const signupSuccess = searchParams.get('signup') === 'success';
    const authError = searchParams.get('error');
    
    const getErrorMessage = (err: string) => {
        switch (err) {
            case 'CredentialsSignin': return '이메일 또는 비밀번호가 올바르지 않습니다.';
            case 'SessionRequired': return '로그인이 필요한 서비스입니다.';
            default: return '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';
        }
    };

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await signIn('credentials', { redirect: false, email, password });
            if (res?.error) setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            else { router.push('/dashboard'); router.refresh(); }
        } catch (err) { setError('로그인 중 서버 오류가 발생했습니다.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-lg bg-white dark:bg-[#111] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-10 md:p-14 relative z-10">
                <div className="flex flex-col items-center mb-12">
                    <Logo className="mb-8" />
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">로그인</h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest">Welcome back to CaseView3D</p>
                </div>

                {(signupSuccess || authError || error) && (
                    <div className={`mb-8 p-5 rounded-2xl text-sm font-bold border ${signupSuccess ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {signupSuccess ? '회원가입 완료! 이제 로그인하세요.' : (authError ? getErrorMessage(authError) : error)}
                    </div>
                )}

                <form onSubmit={handleCredentialsLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Password</label>
                            <Link href="/forgot-password" className="text-xs text-blue-600 font-bold hover:underline">비밀번호 찾기</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none mt-4 flex items-center justify-center gap-2 group"
                    >
                        {loading ? '처리 중...' : '계속하기'}
                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em] text-gray-400"><span className="bg-white dark:bg-[#111] px-6">Social Sync</span></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                        <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    </button>
                    <button onClick={() => signIn('kakao', { callbackUrl: '/dashboard' })} className="h-14 flex items-center justify-center rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] transition-all shadow-sm">
                        <svg className="w-6 h-6 fill-[#191919]" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.332 6.112l-.841 3.08c-.05.187.058.375.242.428a.381.381 0 00.12.02.392.392 0 00.282-.123l3.619-2.396c.41.06.829.094 1.248.094 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" /></svg>
                    </button>
                    <button onClick={() => signIn('naver', { callbackUrl: '/dashboard' })} className="h-14 flex items-center justify-center rounded-2xl bg-[#03C75A] hover:bg-[#02B351] transition-all shadow-sm">
                        <span className="font-black text-white text-xl">N</span>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm font-medium">
                        아직 계정이 없으신가요? <Link href="/signup" className="text-blue-600 font-bold hover:underline">회원가입</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
