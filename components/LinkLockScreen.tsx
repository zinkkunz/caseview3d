'use client';

import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LinkLockScreenProps {
    slug: string;
    memo?: string; // Optional case title hint
}

export function LinkLockScreen({ slug, memo }: LinkLockScreenProps) {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/links/${slug}/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (res.ok) {
                router.refresh(); // Refresh to trigger server-side redirect
            } else {
                const data = await res.json();
                setError(data.error || 'Incorrect password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Protected Link</h2>
                        <p className="text-gray-500 text-sm">
                            This link requires a password to access.<br />
                            {memo && <span className="font-medium text-gray-700 dark:text-gray-300">"{memo}"</span>}
                        </p>
                    </div>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-500 text-sm pl-1 animate-in slide-in-from-left-1">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Unlock Link
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 dark:bg-neutral-950 p-4 text-center text-xs text-gray-400">
                    Protected by CaseView3D Security
                </div>
            </div>
        </div>
    );
}
