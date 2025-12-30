
'use client';

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
    size?: number;
    className?: string;
    text?: string;
}

export default function Spinner({ size = 24, className, text }: SpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <Loader2 size={size} className="text-blue-600 animate-spin relative z-10" />
            </div>
            {text && (
                <p className="text-sm font-medium text-gray-500 animate-pulse">{text}</p>
            )}
        </div>
    );
}
