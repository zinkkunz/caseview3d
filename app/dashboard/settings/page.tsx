'use client';

import { useSearchParams } from 'next/navigation';
import { User, Shield, CreditCard, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ChangePasswordModal from '@/components/ChangePasswordModal'; // Direct import

export default function SettingsPage() {
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'profile';

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">설정</h1>
                <p className="text-gray-500 mt-2">계정 정보와 환경설정을 관리하세요.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    <NavButton
                        active={tab === 'profile'}
                        href="/dashboard/settings?tab=profile"
                        icon={<User size={18} />}
                        label="프로필"
                    />
                    <NavButton
                        active={tab === 'security'}
                        href="/dashboard/settings?tab=security"
                        icon={<Shield size={18} />}
                        label="보안"
                    />
                    <NavButton
                        active={tab === 'billing'}
                        href="/dashboard/settings?tab=billing"
                        icon={<CreditCard size={18} />}
                        label="구독 및 결제"
                    />
                    <NavButton
                        active={tab === 'notifications'}
                        href="/dashboard/settings?tab=notifications"
                        icon={<Bell size={18} />}
                        label="알림 (준비중)"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-[#111] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    {tab === 'profile' && <ProfileSettings />}
                    {tab === 'security' && <SecuritySettings />}
                    {tab === 'billing' && <BillingSettings />}
                    {tab === 'notifications' && <div className="text-center py-20 text-gray-400">알림 설정은 준비 중입니다.</div>}
                </div>
            </div>
        </div>
    );
}

function NavButton({ active, href, icon, label }: { active: boolean, href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${active
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
            {icon}
            <span>{label}</span>
        </Link>
    );
}

function ProfileSettings() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold mb-4">내 프로필</h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
                        <User size={40} />
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800">
                            사진 변경
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 max-w-md">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">이름</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="사용자 이름" disabled />
                    <p className="text-xs text-gray-400 mt-1">* 이름 변경은 관리자에게 문의하세요.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">이메일</label>
                    <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" placeholder="user@example.com" disabled />
                </div>
            </div>
        </div>
    );
}

function SecuritySettings() {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold mb-4">비밀번호 변경</h2>
                <p className="text-gray-500 mb-6">계정 보안을 위해 주기적으로 비밀번호를 변경해주세요.</p>
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors"
                >
                    <Shield size={18} />
                    비밀번호 변경하기
                </button>
                <ChangePasswordModal isOpen={open} onClose={() => setOpen(false)} />
            </div>
        </div>
    );
}

function BillingSettings() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold mb-4">내 구독 플랜</h2>
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-500 uppercase">Current Plan</span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <h3 className="text-3xl font-black mb-2">Free Plan</h3>
                    <p className="text-gray-500 mb-6">기본 기능을 무료로 이용 중입니다.</p>
                    <Link href="/pricing" className="block w-full text-center py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                        플랜 업그레이드
                    </Link>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-bold mb-4">결제 내역</h2>
                <div className="text-center py-10 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    결제 내역이 없습니다.
                </div>
            </div>
        </div>
    );
}
