"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "./Badge";
import VerifiedBadge from "./VerifiedBadge";
import { useState } from "react";
import { Bookmark } from "lucide-react";

interface VacancyCardProps {
    id: string;
    title: string;
    company: string;
    companyLogo?: string | null;
    isVerified?: boolean;
    salary?: string;
    location?: string;
    date: string;
    isFavoriteInitial?: boolean;
    tags?: string[];
    accentColor?: "blue" | "pink" | "orange" | "green" | "purple";
}

export default function VacancyCard({
    id,
    title,
    company,
    companyLogo,
    isVerified,
    salary,
    location,
    date,
    isFavoriteInitial = false,
    tags = [],
    accentColor = "blue",
}: VacancyCardProps) {
    const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

    const borderColorMap: Record<string, string> = {
        blue: "border-t-blue-300",
        pink: "border-t-pink-300",
        orange: "border-t-orange-300",
        green: "border-t-emerald-300",
        purple: "border-t-violet-300",
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vacancyId: id }),
            });
            if (!res.ok) {
                setIsFavorite(!newStatus); // Rollback
            }
        } catch {
            setIsFavorite(!newStatus); // Rollback
        }
    };

    return (
        <Link href={`/vacancies/${id}`} id={`vacancy-card-${id}`}>
            <div
                className={`card-hover bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 border border-[var(--border)] border-t-4 ${borderColorMap[accentColor]} flex flex-col gap-3 h-full cursor-pointer transition-all hover:shadow-lg`}
            >
                {/* Top row: date + bookmark */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wider">{date}</span>
                    <button
                        className={`transition-colors p-1.5 rounded-full hover:bg-gray-100 ${isFavorite ? "text-yellow-500 fill-yellow-500" : "text-[var(--muted)]"}`}
                        onClick={toggleFavorite}
                    >
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>

                {/* Company Avatar + Info */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-[var(--border)] flex-shrink-0 relative">
                        {companyLogo ? (
                            <Image
                                src={companyLogo}
                                alt={company}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                                {company[0]}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-xs text-[var(--muted)] truncate font-medium">{company}</p>
                            {isVerified && <VerifiedBadge />}
                        </div>
                        <h3 className="font-bold text-base leading-snug text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant={accentColor}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Bottom: salary + location + details */}
                <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="min-w-0">
                        {salary && <p className="text-sm font-bold text-gray-900 truncate">{salary}</p>}
                        {location && <p className="text-[11px] text-[var(--muted)] truncate">{location}</p>}
                    </div>
                    <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-transform active:scale-95 shadow-sm">
                        Откликнуться
                    </button>
                </div>
            </div>
        </Link>
    );
}
