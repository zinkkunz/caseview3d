export const dynamic = 'force-dynamic';
import { authOptions } from "@/lib/authOptions";
import { ModeToggle } from "@/components/ModeToggle";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CaseItem from "@/components/CaseItem";
import Link from "next/link";
import { Plus, Settings, CreditCard, BarChart, AlertCircle } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import { getPlanLimits } from "@/lib/plan-limits";
import DashboardActions from "@/components/DashboardActions";
import Logo from "@/components/Logo";

export default async function DashboardPage() {
    console.log("[DEBUG] Starting DashboardPage render");
    const session = await getServerSession(authOptions);
    console.log("[DEBUG] Session:", session ? "FOUND" : "NULL");

    if (!session) {
        console.log("[DEBUG] No session, redirecting");
        redirect("/login");
    }

    try {
        console.log("[DEBUG] Fetching cases for user:", session.user.id);
        if (!session.user.id) {
            throw new Error("Session user ID is missing: " + JSON.stringify(session.user));
        }

        const cases = await prisma.case.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: { File: true }
        });
        console.log("[DEBUG] Cases fetched:", cases.length);

        console.log("[DEBUG] Counting active links");
        const activeLinkCount = await prisma.case.count({
            where: {
                userId: session.user.id,
                OR: [
                    { expiryDate: { gt: new Date() } },
                    { expiryDate: null }
                ]
            }
        });

        console.log("[DEBUG] Getting plan limits for plan:", session.user.plan);
        // Fix: Use session.user.plan instead of role, default to FREE if undefined
        const planKey = (session.user.plan || 'FREE') as any;
        const limits = await getPlanLimits(planKey) || { maxLinks: 1, linkDurationHours: 2 };
        const currentPlan = session.user.plan || 'FREE';

        const maxLinks = limits.maxLinks;
        const linkDurationHours = limits.linkDurationHours;
        const usagePercent = Math.min((activeLinkCount / maxLinks) * 100, 100);
        const isLimitReached = activeLinkCount >= maxLinks;

        return (
            <div className="min-h-screen bg-[#F7F9FA] dark:bg-black transition-colors duration-300">
                {/* Premium Sticky Header */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20 items-center">
                            <div className="flex items-center gap-4">
                                <Logo iconOnly className="block lg:hidden" />
                                <Logo className="hidden lg:flex" />
                                <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-2 hidden sm:block"></div>
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest hidden sm:block">Dashboard</span>
                            </div>
                            <div className="flex items-center gap-3 md:gap-6">
                                {session.user.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-all border border-blue-100/50 dark:border-blue-800/50"
                                    >
                                        <Settings size={16} />
                                        <span>관리자</span>
                                    </Link>
                                )}
                                <DashboardActions />
                                <ModeToggle />
                                <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>
                                <SignOutButton />
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className='text-3xl font-black text-gray-900 dark:text-white tracking-tight'>안녕하세요 {session.user.name || '사용자'}님</h2>
                            <p className='text-gray-400 text-sm font-medium mt-1'>{session.user.email}</p>
                        </div>
                        <Link href="/upload" className="hidden sm:flex items-center px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                            <Plus className="-ml-1 mr-2 h-6 w-6 stroke-[3]" />
                            새 케이스 업로드                        </Link>
                    </div>

                    <div className="bg-white dark:bg-[#111] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 md:p-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                                    <CreditCard size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">My Subscription</span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">{currentPlan}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {currentPlan === 'ADMIN' ? 'Enterprise Pro' : (currentPlan === 'ENTERPRISE' ? 'Enterprise' : 'Professional')}
                                    </h3>
                                </div>
                            </div>
                            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F7F9FA] dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-black hover:bg-gray-100 transition-all border border-transparent dark:border-gray-700">
                                <BarChart size={18} />
                                플랜 업그레이드                        </Link>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm font-black items-end">
                                <span className="text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px]">Active Links Usage</span>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl ${isLimitReached ? "text-red-500" : "text-blue-600"}`}>{activeLinkCount}</span>
                                    <span className="text-gray-300 font-bold">/ {maxLinks}</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-50 dark:bg-gray-800 h-5 rounded-full overflow-hidden p-1 border border-gray-100/50">
                                <div className={`h-full rounded-full transition-all duration-1000 ${isLimitReached ? "bg-red-500" : "bg-blue-600"}`} style={{ width: usagePercent + "%" }}></div>
                            </div>
                            {isLimitReached && (
                                <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/10 px-6 py-4 rounded-2xl mt-6 border border-red-100/50">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-bold">생성 한도 초과! 업그레이드가 필요합니다.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-end justify-between px-2">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">내 보관함</h2>
                            <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-3"></div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Total</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{cases.length} Items</p>
                        </div>
                    </div>

                    <div className="animate-slide-up">
                        {cases.length === 0 ? (
                            <div className="text-center py-32 bg-white dark:bg-[#111] rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-200 mb-8">
                                    <Plus size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">업로드된 케이스가 없습니다</h3>
                                <Link href="/upload" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-4 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl">지금 업로드하기</Link>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-[#111] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <ul className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {cases.map((c) => (
                                        <li key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <CaseItem c={{ ...c, files: c.File, createdAt: c.createdAt.toISOString(), expiryDate: c.expiryDate ? c.expiryDate.toISOString() : null }} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="sm:hidden fixed bottom-8 right-8 z-40">
                        <Link href="/upload" className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all">
                            <Plus size={32} strokeWidth={3} />
                        </Link>
                    </div>
                </main>
            </div>
        );
    } catch (e: any) {
        console.error("Dashboard Error:", e);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 font-bold p-10 bg-red-50 rounded-xl">
                    <h1 className="text-2xl mb-4">Dashboard Error</h1>
                    <pre className="whitespace-pre-wrap max-w-2xl">{e.toString()}</pre>
                </div>
            </div>
        );
    }
}
