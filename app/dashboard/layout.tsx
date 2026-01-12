import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import { Settings } from "lucide-react";
import Logo from "@/components/Logo";
import UserNav from "@/components/UserNav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#F7F9FA] dark:bg-black transition-colors duration-300">
            {/* Persistent Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Logo iconOnly className="block lg:hidden" />
                                <Logo className="hidden lg:flex" />
                            </Link>
                            <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-2 hidden sm:block"></div>
                            <Link href="/dashboard" className="text-sm font-black text-gray-400 uppercase tracking-widest hidden sm:block hover:text-blue-600 transition-colors">
                                Dashboard
                            </Link>
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
                            <ModeToggle />
                            <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>
                            <UserNav user={session.user} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>
        </div>
    );
}
