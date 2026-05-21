export const dynamic = 'force-dynamic';
import DropboxHero from '@/components/landing/DropboxHero';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
import WorkflowSection from '@/components/landing/WorkflowSection';
import TrustSection from '@/components/landing/TrustSection';
import DropboxPricing from '@/components/landing/DropboxPricing';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { LogIn, LayoutDashboard } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className='min-h-screen bg-white dark:bg-black transition-colors duration-300'>
      {/* Sticky Premium Navbar */}
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50'>
        <div className='max-w-7xl mx-auto px-6 h-20 flex justify-between items-center transition-all'>
          <Link href="/" className='flex items-center gap-2 group'>
            <div className='w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold transition-transform group-hover:rotate-12'>C</div>
            <span className='font-black text-xl tracking-tighter dark:text-white'>CaseView<span className="text-blue-600">3D</span></span>
          </Link>
          
          <div className='flex items-center gap-6'>
            <div className='hidden md:flex items-center gap-8 mr-4'>
                <Link href="#features" className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">주요 기능</Link>
                <Link href="#pricing" className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">요금제</Link>
                <Link href="#faq" className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">FAQ</Link>
            </div>
            
            <div className='flex items-center gap-3'>
              <ModeToggle />
              {session ? (
                <Link
                    href='/dashboard'
                    className='flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none text-sm font-black hover:bg-blue-700 hover:-translate-y-0.5 transition-all'
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">대시보드</span>
                </Link>
              ) : (
                <Link
                    href='/login'
                    className='flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-gray-800 dark:hover:bg-white hover:-translate-y-0.5 transition-all'
                >
                    <LogIn size={18} />
                    <span>로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20">
        <DropboxHero />
        <InteractiveDemo />
        <WorkflowSection />
        <TrustSection />
        <DropboxPricing />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
