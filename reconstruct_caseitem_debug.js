const fs = require('fs');
const path = require('path');

const content = `'use client';

import Link from "next/link";
import { Trash2, ExternalLink, CreditCard, Share2, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { ShareModal } from "@/components/ShareModal";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

declare global {
    interface Window {
        IMP: any;
    }
}

interface CaseItemProps {
    c: {
        id: string;
        memo: string | null;
        createdAt: string;
        expiryDate: string | null;
        files: any[];
    };
}

export default function CaseItem({ c }: CaseItemProps) {
    const router = useRouter();
    
    // Hydration fix state
    const [mounted, setMounted] = useState(false);
    const [expiryInfo, setExpiryInfo] = useState<{
        isExpired: boolean;
        text: string;
        icon: React.ReactNode;
        className: string;
        isPermanent: boolean;
    }>({
        isExpired: false,
        text: '',
        icon: null,
        className: '',
        isPermanent: false
    });

    useEffect(() => {
        setMounted(true);
        if (!c.expiryDate) {
            setExpiryInfo({ isExpired: false, text: '', icon: null, className: '', isPermanent: true });
            return;
        }

        const expiry = new Date(c.expiryDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

        if (diffMs <= 0) {
            setExpiryInfo({
                isExpired: true,
                text: '자동 만료 되었습니다.',
                icon: <AlertCircle size={14} className="text-red-500" />,
                className: 'text-red-500',
                isPermanent: false
            });
        } else if (diffHours <= 1) {
            setExpiryInfo({
                isExpired: false,
                text: '곧 만료됨 (1시간 이내)',
                icon: <Clock size={14} className="text-orange-500" />,
                className: 'text-orange-500',
                isPermanent: false
            });
        } else {
            setExpiryInfo({
                isExpired: false,
                text: '자동 만료: ' + diffHours + '시간 후',
                icon: <Clock size={14} className="text-blue-500" />,
                className: 'text-blue-500',
                isPermanent: false
            });
        }
    }, [c.expiryDate]);

    const handlePayment = (caseId: string) => {
        // ... (Logic is fine)
        if (!window.IMP) return;
        const { IMP } = window;
        IMP.init('imp32135064');
        IMP.request_pay({
            pg: 'html5_inicis',
            pay_method: 'card',
            merchant_uid: 'mid_' + new Date().getTime(),
            name: '영구 보관 전환',
            amount: 100,
            buyer_email: 'test@test.com',
            buyer_name: '테스트유저',
        }, async (rsp) => {
             // ...
        });
    };

    const handleDelete = async (caseId) => {
         // ...
    };

    if (!mounted) {
        return <div className="p-4">Loading...</div>;
    }

    const isPermanent = expiryInfo.isPermanent;

    return (
        <div className="block hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-all duration-300">
            <div className="px-5 py-5 sm:px-10 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left Side: Title and Info */}
                    <div className="flex flex-col min-w-0 flex-1 w-full">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 flex-col sm:flex-row">
                             <p className="text-lg font-black">{c.memo || "No Title"}</p>
                        </div>
                    </div>

                    {/* Right Side: Expiry and Actions - COMMENTED OUT FOR DEBUGGING
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                         <div>Expiry Info Place</div>
                         <div>Actions Place</div>
                    </div>
                    */}
                    <div className="p-2 border">Right Side Placeholder</div>
                </div>
            </div>
        </div>
    );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote Debug component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
