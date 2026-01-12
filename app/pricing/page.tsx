import DropboxPricing from '@/components/landing/DropboxPricing';
import { LogIn, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { ModeToggle } from '@/components/ModeToggle';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function PricingPage() {
    const session = await getServerSession(authOptions);

    return (
        <div className='min-h-screen bg-white dark:bg-black transition-colors'>
            <nav className='fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 h-20 flex items-center shadow-sm'>
                <div className='max-w-7xl mx-auto px-6 w-full flex justify-between items-center'>
                    <Link href="/">
                        <Logo />
                    </Link>
                    <div className='flex items-center gap-6'>
                        <ModeToggle />
                        {session ? (
                            <Link href='/dashboard' className='flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none text-sm font-black hover:bg-blue-700 hover:-translate-y-0.5 transition-all'>
                                <LayoutDashboard size={18} />
                                <span>대시보드</span>
                            </Link>
                        ) : (
                            <Link href='/login' className='flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl text-sm font-black hover:opacity-80 transition-all'>
                                <LogIn size={18} />
                                <span>로그인</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            <div className='pt-20'>
                <DropboxPricing />
            </div>
        </div>
    );
}
