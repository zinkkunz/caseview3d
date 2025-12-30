'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteExpiredCases } from '@/app/admin/actions';

interface DeleteExpiredButtonProps {
  expiredCount: number;
}

export default function DeleteExpiredButton({ expiredCount }: DeleteExpiredButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (expiredCount === 0) return;
    
    if (window.confirm(`만료된 케이스 ${expiredCount}개를 정말 삭제하시겠습니까?`)) {
      setIsDeleting(true);
      try {
        const result = await deleteExpiredCases();
        if (result.success) {
          alert(result.message);
          window.location.reload();
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('삭제 요청 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting || expiredCount === 0}
      className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 text-sm transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Trash2 size={16} />
      {isDeleting ? '삭제 중...' : `만료된 케이스 삭제 (${expiredCount})`}
    </button>
  );
}
