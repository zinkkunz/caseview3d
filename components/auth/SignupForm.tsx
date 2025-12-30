'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { UserPlus } from 'lucide-react';

export default function SignupForm({ settings }: { settings?: Record<string, string> }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) router.push('/login?signup=success');
            else { const data = await res.json(); setError(data.message || '회원가입에 실패했습니다.'); }
        } catch (err) { setError('서버 오류가 발생했습니다.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-lg bg-white dark:bg-[#111] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-10 md:p-14 relative z-10">
                <div className="flex flex-col items-center mb-12">
                    <Logo className="mb-8" />
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">회원가입</h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest">Join the Future of Dental 3D</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="Your Name"
                            required
                        />
                    </div>
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
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <p className="text-[11px] text-gray-400 px-1 leading-relaxed">
                        계정을 생성하면 당사의 <span className="underline">이용약관</span> 및 <span className="underline">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-none mt-2 flex items-center justify-center gap-2 group"
                    >
                        {loading ? '가입 중...' : '계정 생성하기'}
                        <UserPlus size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-12 text-center border-t border-gray-50 dark:border-gray-800 pt-8">
                    <p className="text-gray-400 text-sm font-medium">
                        이미 계정이 있으신가요? <Link href="/login" className="text-blue-600 font-bold hover:underline">로그인</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
