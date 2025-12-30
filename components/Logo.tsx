'use client';

import Link from 'next/link';

export default function Logo({ className = "", iconOnly = false }) {
    return (
        <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
            <div className='w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-all group-hover:rotate-12 group-hover:scale-105 shadow-lg shadow-blue-200 dark:shadow-none'>
                C
            </div>
            {!iconOnly && (
                <span className='font-black text-2xl tracking-tighter transition-colors text-gray-900 dark:text-white'>
                    CaseView<span className="text-blue-600">3D</span>
                </span>
            )}
        </Link>
    );
}
