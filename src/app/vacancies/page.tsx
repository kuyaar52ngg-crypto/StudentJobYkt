"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/ui/FilterSidebar";
import VacancyCard from "@/components/ui/VacancyCard";
import SearchBar from "@/components/ui/SearchBar";

interface Vacancy {
    id: string;
    title: string;
    salary?: string | null;
    location?: string | null;
    requirements?: string | null;
    createdAt: string;
    company: { name: string; logo?: string | null; isVerified?: boolean };
}

const accentColors: Array<"blue" | "pink" | "orange" | "green" | "purple"> = [
    "blue", "pink", "orange", "green", "purple",
];

function VacanciesContent() {
    const searchParams = useSearchParams();
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const params = new URLSearchParams();
        const q = searchParams.get("q");
        if (q) params.set("q", q);
        
        if (filters.schedule && filters.schedule.length > 0) {
            params.set("schedule", filters.schedule.join(","));
        }
        if (filters.employmentType && filters.employmentType.length > 0) {
            params.set("employmentType", filters.employmentType.join(","));
        }

        setLoading(true);
        fetch(`/api/vacancies?${params.toString()}`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setVacancies(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchParams, filters]);

    return (
        <>
            {/* Search header */}
            <section className="bg-[var(--header-dark)] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-white text-2xl font-bold mb-4 text-center">Все вакансии</h1>
                    <SearchBar />
                </div>
            </section>

            {/* Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar onFilterChange={setFilters} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-[var(--muted)]">
                                {loading ? "Загрузка..." : <>Найдено <span className="font-semibold text-foreground">{vacancies.length}</span> вакансий</>}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                <span>Сортировка:</span>
                                <button className="font-semibold text-foreground">По дате</button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 h-48 animate-pulse" />
                                ))}
                            </div>
                        ) : vacancies.length === 0 ? (
                            <div className="text-center py-16 text-[var(--muted)]">
                                <p className="text-lg">Вакансий не найдено</p>
                                <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {vacancies.map((v, i) => (
                                    <div key={v.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                                        <VacancyCard
                                            id={v.id}
                                            title={v.title}
                                            company={v.company.name}
                                            companyLogo={v.company.logo}
                                            isVerified={v.company.isVerified}
                                            salary={v.salary || undefined}
                                            location={v.location || undefined}
                                            date={new Date(v.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                                            tags={v.requirements?.split(",").map((t) => t.trim()).filter(Boolean) || []}
                                            accentColor={accentColors[i % accentColors.length]}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

export default function VacanciesPage() {
    return (
        <Suspense fallback={<div className="p-16 text-center text-[var(--muted)]">Загрузка секции вакансий...</div>}>
            <VacanciesContent />
        </Suspense>
    );
}
