import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: "blue" | "pink" | "orange" | "green" | "purple" | "default";
    className?: string;
}

const variantClasses: Record<string, string> = {
    blue: "badge-blue",
    pink: "badge-pink",
    orange: "badge-orange",
    green: "badge-green",
    purple: "badge-purple",
    default: "bg-gray-100 text-gray-700",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
    return (
        <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-[var(--radius-badge)] ${variantClasses[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
