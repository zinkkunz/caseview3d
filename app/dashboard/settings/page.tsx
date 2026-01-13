'use client';

import { useSearchParams } from 'next/navigation';
import { User, Shield, CreditCard, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Added useRouter
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
    const { data: session, update } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) return alert('이름을 입력해주세요.');
        setLoading(true);
        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error('Failed to update');

            alert('프로필이 수정되었습니다.');
            window.location.reload(); // Refresh to show new name in header
        } catch (error) {
            console.error(error);
            alert('수정 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-bold mb-4">내 프로필</h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 overflow-hidden relative group cursor-pointer border border-gray-200 dark:border-gray-700">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} />
                        )}
                        {/* Hover Overlay for Upload Hint */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                            변경
                        </div>
                    </div>
                    <div>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                            사진 변경 (준비중)
                        </button>
                        <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF (최대 2MB)</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 max-w-md">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">이름</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="사용자 이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button
                            onClick={handleUpdateProfile}
                            disabled={loading || name === session?.user?.name}
                            className={`px-6 rounded-xl font-bold text-sm transition-all ${loading || name === session?.user?.name
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                }`}
                        >
                            {loading ? '...' : '저장'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">실명이나 기공소 이름을 사용하세요.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">이메일</label>
                    <input
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-400"
                        value={session?.user?.email || ''}
                        disabled
                    />
                    <p className="text-xs text-gray-400 mt-2">이메일 변경은 불가능합니다.</p>
                </div>
            </div>
        </div>
    );
}

function SecuritySettings() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession(); // Import useSession
    const router = useRouter(); // Import useRouter

    const handleDeleteAccount = async () => {
        const confirmed = confirm('정말로 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 데이터(케이스, 파일)가 영구적으로 삭제됩니다.');
        if (!confirmed) return;

        const doubleConfirmed = prompt('확인을 위해 "탈퇴"라고 입력해주세요.');
        if (doubleConfirmed !== '탈퇴') {
            alert('입력이 일치하지 않습니다.');
            return;
        }

        try {
            const res = await fetch('/api/user', {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('계정이 삭제되었습니다. 이용해주셔서 감사합니다.');
                window.location.href = '/'; // Force reload to clear session
            } else {
                alert('탈퇴 처리에 실패했습니다. 관리자에게 문의해주세요.');
            }
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        }
    };

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
            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Account Deletion Area (Placeholder for Phase 4) */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-red-600">계정 삭제</h2>
                <p className="text-gray-500 mb-4">계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다.</p>
                <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                >
                    계정 탈퇴
                </button>
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
