'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                const data = await res.json();
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
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">비밀번호 변경</h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest text-center">안전한 비밀번호로 변경하세요</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">새 비밀번호</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 dark:text-white font-bold w-full"
                                placeholder="8자 이상 입력"
                                required
                                minLength={8}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-3.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 dark:text-white font-bold w-full"
                                placeholder="다시 한번 입력"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all">
                            {loading ? '변경 중...' : '비밀번호 변경 완료'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">변경 완료!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">잠시 후 로그인 페이지로 이동합니다.</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 text-center">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
