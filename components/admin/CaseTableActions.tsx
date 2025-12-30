'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaseTableActions({ caseId }: { caseId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('정말 이 케이스를 삭제하시겠습니까?')) return;
        
        setIsPending(true);
        try {
            const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
            if (res.ok) {
                alert('삭제되었습니다.');
                router.refresh();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (e) {
            alert('오류가 발생했습니다.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button 
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/50"
        >
            <Trash2 size={16} className={isPending ? 'opacity-50' : ''} />
        </button>
    );
}