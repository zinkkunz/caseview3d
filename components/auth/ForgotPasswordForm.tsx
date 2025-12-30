'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugLink, setDebugLink] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSent(true);
                if (data.debugLink) setDebugLink(data.debugLink);
            } else {
                setError(data.message || '오류가 발생했습니다.');
            }
        } catch (err) {
            setError('서버와 통신 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black transition-colors duration-300 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-[2.5rem] p-10 md:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-800 relative z-10">
                <div className="flex flex-col items-center mb-12">
                    <Logo className="mb-8" />
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">비밀번호 찾기</h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest text-center">재설정 링크를 받으실 이메일을 입력하세요</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 dark:text-white font-bold w-full"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                            {loading ? '발송 중...' : '재설정 링크 받기'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 text-center">
                            <p className="text-sm font-bold text-green-800 dark:text-green-400">이메일이 발송되었습니다!</p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-2">메일함을 확인해주세요.</p>
                        </div>
                        <Link href="/login" className="w-full block text-center py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-80 transition-all">
                            로그인으로 돌아가기
                        </Link>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
