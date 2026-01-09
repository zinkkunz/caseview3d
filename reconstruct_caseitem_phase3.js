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
        }, async (rsp: any) => {
            if (rsp.success) {
                const res = await fetch('/api/payment/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId,
                        imp_uid: rsp.imp_uid,
                        merchant_uid: rsp.merchant_uid
                    })
                });
                if (res.ok) {
                    alert('결제가 완료되었습니다. 이제 영구 보관됩니다.');
                    router.refresh();
                } else {
                    alert('결제 처리 중 오류가 발생했습니다.');
                }
            } else {
                alert('결제 실패: ' + rsp.error_msg);
            }
        });
    };

    const handleDelete = async (caseId: string) => {
        if (!confirm('정말 삭제하시겠습니까?\\n 삭제된 데이터는 복구할 수 없습니다.')) return;

        try {
            const res = await fetch('/api/cases/' + caseId, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                window.location.reload(); 
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    };

    return (
        <div className="p-4 border">
            <h1>Phase 3 Logic Check</h1>
            <p>Expiry: {expiryInfo.text}</p>
            <button onClick={() => handleDelete(c.id)}>Test Delete</button>
        </div>
    );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote Phase 3 component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
