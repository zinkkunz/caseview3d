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

    return (
        <div className="p-4 border">
            <h1>Phase 2 Logic Check</h1>
            <p>Expiry: {expiryInfo.text}</p>
        </div>
    );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote Phase 2 component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
