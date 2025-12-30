'use client';

import { useState } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }, 2000);
            } else {
                setError(data.message || '비밀번호 변경에 실패했습니다.');
            }
        } catch (err) {
            setError('서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0061FF] mb-4">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">비밀번호 변경</h2>
                        <p className="text-sm text-gray-500 mt-1">안전을 위해 정기적인 비밀번호 변경을 추천합니다.</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">현재 비밀번호</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0061FF] focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="h-px bg-gray-50 my-2"></div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">새 비밀번호</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0061FF] focus:border-transparent outline-none transition-all"
                                    placeholder="8자 이상"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">새 비밀번호 확인</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#0061FF] focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>

                            {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#0061FF] text-white font-bold rounded-xl hover:bg-[#0052D9] transition-all disabled:opacity-50 shadow-lg shadow-blue-100 mt-4 active:scale-[0.98]"
                            >
                                {loading ? '처리 중...' : '비밀번호 변경하기'}
                            </button>
                        </form>
                    ) : (
                        <div className="py-10 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">변경 완료!</h3>
                            <p className="text-sm text-gray-500 mt-2">안전하게 비밀번호가 수정되었습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
