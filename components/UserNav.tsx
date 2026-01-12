'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
    User,
    Settings,
    CreditCard,
    LogOut,
    ChevronDown,
    ShieldCheck
} from 'lucide-react';

interface UserNavProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function UserNav({ user }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Get initials for avatar fallback
    const initials = user.name
        ? user.name.slice(0, 2).toUpperCase()
        : user.email?.slice(0, 2).toUpperCase() || 'U';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {initials}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-none">
                        {user.name || '사용자'}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-none mt-0.5 truncate max-w-[100px]">
                        {user.email}
                    </p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 mb-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white">내 계정</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <div className="px-2 space-y-1">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <User size={16} />
                            <span>프로필 설정</span>
                        </Link>

                        <Link
                            href="/dashboard/settings?tab=security"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <ShieldCheck size={16} />
                            <span>보안 및 로그인</span>
                        </Link>

                        <Link
                            href="/dashboard/settings?tab=billing"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <CreditCard size={16} />
                            <span>결제 및 구독</span>
                        </Link>
                    </div>

                    <div className="my-2 border-t border-gray-50 dark:border-gray-800"></div>

                    <div className="px-2">
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                        >
                            <LogOut size={16} />
                            <span>로그아웃</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
