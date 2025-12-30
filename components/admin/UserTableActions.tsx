'use client';

import { useState } from 'react';
import { toggleUserStatus, deleteUser } from '@/app/admin/actions';
import { Ban, CheckCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserTableActions({ user }: { user: any }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleToggle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('정말 상태를 변경하시겠습니까?')) return;
        
        setIsPending(true);
        try {
            await toggleUserStatus(user.id, !user.isActive);
            router.refresh();
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('정말 삭제하시겠습니까?')) return;

        setIsPending(true);
        try {
            await deleteUser(user.id);
            router.refresh();
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button 
                onClick={handleToggle}
                disabled={isPending}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${user.isActive ? 'text-orange-500' : 'text-green-500'}`}
                title={user.isActive ? '사용자 차단' : '차단 해제'}
            >
                {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
            </button>
            <button 
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/50"
                title="삭제"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}