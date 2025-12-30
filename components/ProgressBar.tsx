
'use client';

import { cn } from "@/lib/utils";

interface ProgressBarProps {
    progress: number; // 0 to 100
    message?: string;
    className?: string;
}

export default function ProgressBar({ progress, message, className }: ProgressBarProps) {
    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>{message || 'Processing...'}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
