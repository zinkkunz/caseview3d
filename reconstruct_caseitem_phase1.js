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
    return (
        <div className="p-4 border">
            <h1>Case: {c.memo || "No Memo"}</h1>
            <p>ID: {c.id}</p>
        </div>
    );
}
`;

const filePath = path.join(process.cwd(), 'components', 'CaseItem.tsx');
try {
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Successfully wrote Phase 1 component to ' + filePath);
} catch (err) {
    console.error('Error writing file:', err);
}
