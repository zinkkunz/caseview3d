'use client';

import { useState } from 'react';
import { updateUserPlan } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface UserPlanSelectProps {
    userId: string;
    currentPlan: string;
}

export default function UserPlanSelect({ userId, currentPlan }: UserPlanSelectProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [plan, setPlan] = useState(currentPlan);
    const router = useRouter();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newPlan = e.target.value;
        if (!window.confirm(`사용자의 요금제를 ${newPlan}으로 변경하시겠습니까?`)) {
            return;
        }

        setIsUpdating(true);
        try {
            const result = await updateUserPlan(userId, newPlan);
            if (result.success) {
                setPlan(newPlan);
                alert(result.message);
                window.location.reload();
            } else {
                alert(result.message);
                // Revert to old plan on error
                setPlan(currentPlan);
            }
        } catch (error) {
            console.error('Plan update error:', error);
            alert('요금제 변경 중 오류가 발생했습니다.');
            setPlan(currentPlan);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative">
            <select
                value={plan}
                onChange={handleChange}
                disabled={isUpdating}
                className={`bg-white border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                    } ${plan === 'FREE' ? 'text-green-600 border-green-200 bg-green-50' :
                        plan === 'BASIC' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                            'text-orange-600 border-orange-200 bg-orange-50'
                    }`}
            >
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="STANDARD">STANDARD</option>
            </select>
            {isUpdating && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="animate-spin text-gray-400" size={16} />
                </div>
            )}
        </div>
    );
}
