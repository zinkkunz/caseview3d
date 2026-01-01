import { Settings, Shield, HardDrive, Palette, Save } from 'lucide-react';
import { getSettings, updateSettings, triggerCleanup } from './actions';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const settings = await getSettings();

    async function handleSave(formData: FormData) {
        'use server';
        const updates: Record<string, string> = {};
        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                updates[key] = value;
            }
        });
        await updateSettings(updates);
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="text-blue-600" />
                    시스템 설정
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">사이트 운영 및 시스템 전반에 걸친 설정을 관리합니다.</p>
            </div>

            <form action={handleSave} className="space-y-6">
                {/* Branding Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:text-white">
                        <Palette size={20} className="text-purple-500" />
                        브랜드 및 UI
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">사이트 이름</label>
                            <input
                                name="site_name"
                                defaultValue={settings['site_name'] || 'CaseView3D'}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">베타 안내 문구</label>
                            <input
                                name="beta_text"
                                defaultValue={settings['beta_text'] || '지금 CaseView3D 베타 테스트 중입니다.'}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </section>

                {/* Storage Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:text-white">
                        <HardDrive size={20} className="text-green-500" />
                        저장 공간 및 만료
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">케이스 자동 만료 기간 (일)</label>
                            <input
                                type="number"
                                name="case_expiry_days"
                                defaultValue={settings['case_expiry_days'] || '30'}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="text-xs text-gray-500">설정한 기간이 지나면 케이스가 자동으로 삭제 목록으로 분류됩니다.</p>
                        </div>
                    </div>
                </section>

                {/* Security/Access Section */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-4 dark:text-white">
                        <Shield size={20} className="text-red-500" />
                        관리자 접근 제어
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">관리자 이메일 목록 (쉼표로 구분)</label>
                        <textarea
                            name="admin_emails"
                            defaultValue={settings['admin_emails'] || ''}
                            rows={3}
                            placeholder="admin@example.com, user@example.com"
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <p className="text-xs text-gray-500">여기에 등록된 계정은 자동으로 관리자 권한을 가집니다.</p>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        설정 저장하기
                    </button>
                </div>
            </form>
        </div>
    );
}
