"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import FilterSidebar from "@/components/ui/FilterSidebar";
import VacancyCard from "@/components/ui/VacancyCard";

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

export default function HomePage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchVacancies = async () => {
      const params = new URLSearchParams();
      if (filters.schedule && filters.schedule.length > 0) {
        params.set("schedule", filters.schedule.join(","));
      }
      if (filters.employmentType && filters.employmentType.length > 0) {
        params.set("employmentType", filters.employmentType.join(","));
      }

      setLoading(true);
      try {
        const r = await fetch(`/api/vacancies?${params.toString()}`);
        const data = await r.json();
        if (Array.isArray(data)) setVacancies(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, [filters]);

  return (
    <>
      {/* Hero section — dark background */}
      <section className="bg-[var(--header-dark)] pb-12 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Promo banner */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl p-8 flex-1 max-w-md">
              <h1 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-3">
                Найди свою первую работу в Якутске
              </h1>
              <p className="text-gray-400 text-sm mb-5">
                Вакансии, стажировки и практики для студентов без опыта
              </p>
              <Link
                href="/vacancies"
                className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Смотреть вакансии
              </Link>
            </div>
            <div className="flex-1 w-full max-w-xl">
              <SearchBar />
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">IT &amp; Программирование</span>
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Маркетинг</span>
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Дизайн</span>
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Финансы</span>
                <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">Образование</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar onFilterChange={setFilters} />

          {/* Vacancies */}
          <div className="flex-1 min-w-0">
            {/* Title + sort */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Популярные вакансии</h2>
              <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <span>Сортировка:</span>
                <button className="font-semibold text-foreground hover:text-[var(--primary)] transition-colors">
                  По дате
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 h-48 animate-pulse" />
                ))}
              </div>
            ) : vacancies.length === 0 ? (
              <div className="text-center py-16 text-[var(--muted)]">
                <p className="text-lg mb-2">Пока нет вакансий</p>
                <p className="text-sm">Зарегистрируйтесь как работодатель и создайте первую вакансию!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {vacancies.map((v, i) => (
                  <div
                    key={v.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
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

            {/* View more */}
            <div className="text-center mt-8">
              <Link
                href="/vacancies"
                className="inline-block border border-[var(--border)] text-sm font-medium px-8 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Показать все вакансии
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
