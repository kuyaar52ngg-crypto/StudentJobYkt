"use client";

import Link from "next/link";
import Badge from "./Badge";

interface VacancyCardProps {
    id: string;
    title: string;
    company: string;
    companyLogo?: string;
    salary?: string;
    location?: string;
    date: string;
    tags?: string[];
    accentColor?: "blue" | "pink" | "orange" | "green" | "purple";
}

export default function VacancyCard({
    id,
    title,
    company,
    salary,
    location,
    date,
    tags = [],
    accentColor = "blue",
}: VacancyCardProps) {
    const borderColorMap: Record<string, string> = {
        blue: "border-t-blue-300",
        pink: "border-t-pink-300",
        orange: "border-t-orange-300",
        green: "border-t-emerald-300",
        purple: "border-t-violet-300",
    };

    return (
        <Link href={`/vacancies/${id}`} id={`vacancy-card-${id}`}>
            <div
                className={`card-hover bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 border border-[var(--border)] border-t-4 ${borderColorMap[accentColor]} flex flex-col gap-3 h-full cursor-pointer`}
            >
                {/* Top row: date + bookmark */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">{date}</span>
                    <button
                        className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: toggle favorite
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                            />
                        </svg>
                    </button>
                </div>

                {/* Company + title */}
                <div>
                    <p className="text-xs text-[var(--muted)] mb-1">{company}</p>
                    <h3 className="font-semibold text-sm leading-tight">{title}</h3>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant={accentColor}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Bottom: salary + location + details */}
                <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                        {salary && <p className="text-sm font-bold">{salary}</p>}
                        {location && <p className="text-xs text-[var(--muted)]">{location}</p>}
                    </div>
                    <span className="text-xs font-medium text-[var(--primary)] hover:underline">
                        Подробнее
                    </span>
                </div>
            </div>
        </Link>
    );
}
