'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function DashboardActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-100"
            >
                <ShieldCheck size={18} />
                <span className="hidden md:inline">비밀번호 변경</span>
            </button>

            <ChangePasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
