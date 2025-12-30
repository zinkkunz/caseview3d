'use client';
import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function FindIdForm() {
    const [name, setName] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setEmails([]);
        try {
            const res = await fetch('/api/auth/find-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (res.ok) {
                setEmails(data.emails);
            } else {
                setError(data.message || '정보를 찾을 수 없습니다.');
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
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">아이디 찾기</h1>
                    <p className="text-gray-400 text-sm font-medium mt-2 uppercase tracking-widest text-center">회원님의 성함을 입력해 주세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">이름</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-14 px-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-gray-900 dark:text-white font-bold w-full"
                            placeholder="성함을 입력하세요"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {loading ? '검색 중...' : '계정 찾기'}
                    </button>
                </form>

                {emails.length > 0 && (
                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-3">일치하는 계정 정보입니다:</p>
                        <div className="space-y-2">
                            {emails.map((email, idx) => (
                                <div key={idx} className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 border border-blue-100 dark:border-blue-900/50">
                                    {email}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                        {error}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center space-x-4">
                    <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">로그인으로 돌아가기</Link>
                    <span className="text-gray-200">|</span>
                    <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">비밀번호 찾기</Link>
                </div>
            </div>
        </div>
    );
}
