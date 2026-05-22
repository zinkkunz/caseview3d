import { ModeToggle } from '@/components/ModeToggle';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, FolderOpen, HardDrive, Settings, LogOut, Home } from 'lucide-react';
import Logo from '@/components/Logo';
import SignOutButton from '@/components/SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect('/login');
    // 어드민 판별: DB role=ADMIN OR 환경변수 OR 하드코드 폴백 (이중 보안)
    const adminEmails = [
        ...(process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []),
        'zinsun0@gmail.com', // 마스터 관리자 계정 (폴백)
    ];
    const isAdmin = session.user.role === 'ADMIN' || adminEmails.includes(session.user.email ?? '');
    if (!isAdmin) redirect('/');

    return (
        <div className='flex h-screen bg-gray-50 dark:bg-black transition-colors duration-300'>
            {/* Premium Sidebar */}
            <aside className='w-72 bg-white dark:bg-[#050505] border-r border-gray-100 dark:border-gray-900 hidden md:flex flex-col z-20 shadow-xl shadow-gray-200/50 dark:shadow-none'>
                <div className='p-8'>
                    <Logo className='mb-2 scale-110 origin-left' />
                    <div className='flex items-center gap-2 mt-4'>
                        <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse'></div>
                        <p className='text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]'>Admin Control Unit</p>
                    </div>
                </div>

                <nav className='flex-1 px-6 space-y-2 mt-4'>
                    <NavItem href='/admin' icon={LayoutDashboard} label='대시보드' />
                    <NavItem href='/admin/users' icon={Users} label='사용자 관리' />
                    <NavItem href='/admin/cases' icon={FolderOpen} label='케이스 관리' />
                    <NavItem href='/admin/storage' icon={HardDrive} label='저장 공간' />
                    <NavItem href='/admin/settings' icon={Settings} label='사이트 설정' />
                </nav>

                <div className='p-8 mt-auto border-t border-gray-100 dark:border-gray-900'>
                    <Link href='/' className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all'>
                        <Home size={18} />
                        <span>메인으로 돌아가기</span>
                    </Link>
                </div>
            </aside>

            <main className='flex-1 flex flex-col min-w-0'>
                <header className='h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900 flex items-center justify-between px-10 sticky top-0 z-10'>
                    <div className='flex items-center gap-4'>
                         <div className='md:hidden'><Logo iconOnly /></div>
                         <h2 className='text-xl font-black text-gray-900 dark:text-white tracking-tight'>관리자 모드</h2>
                    </div>
                    <div className='flex items-center gap-6'>
                        <ModeToggle />
                        <div className='h-6 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block'></div>
                        <div className='hidden sm:flex flex-col items-end'>
                            <span className='text-xs font-black text-gray-400 uppercase tracking-widest'>Active Session</span>
                            <span className='text-sm font-bold text-gray-900 dark:text-gray-200'>{session.user.email}</span>
                        </div>
                        <SignOutButton />
                    </div>
                </header>
                <div className='p-10 flex-1 overflow-auto animate-fade-in'>
                    <div className='max-w-6xl mx-auto'>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className='flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all font-bold'
        >
            <Icon size={20} />
            <span className='text-sm'>{label}</span>
        </Link>
    );
}