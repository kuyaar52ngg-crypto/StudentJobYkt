import { CheckCircle2 } from "lucide-react";

interface VerifiedBadgeProps {
    className?: string;
}

export default function VerifiedBadge({ className = "" }: VerifiedBadgeProps) {
    return (
        <div className={`relative group inline-flex items-center ml-1 ${className}`}>
            <CheckCircle2 
                className="w-4 h-4 text-blue-500 fill-blue-500/10" 
                strokeWidth={2.5} 
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Официальный аккаунт
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    );
}
