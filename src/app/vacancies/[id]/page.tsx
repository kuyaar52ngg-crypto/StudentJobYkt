"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface VacancyDetail {
    id: string;
    title: string;
    description: string;
    salary?: string | null;
    schedule?: string | null;
    employmentType?: string | null;
    location?: string | null;
    requirements?: string | null;
    createdAt: string;
    company: { name: string; logo?: string | null; industry?: string | null; contactInfo?: string | null };
}

export default function VacancyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: session } = useSession();
    const user = session?.user as { id?: string; role?: string } | undefined;

    const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/vacancies/${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (data && !data.error) setVacancy(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    // Check if already applied
    useEffect(() => {
        if (!user?.id || !id) return;
        fetch(`/api/applications?userId=${user.id}&vacancyId=${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setApplied(true);
            })
            .catch(console.error);
    }, [user?.id, id]);

    const handleApply = async () => {
        if (!user?.id) {
            setError("Войдите в аккаунт, чтобы откликнуться");
            return;
        }
        setApplying(true);
        setError("");
        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, vacancyId: id }),
            });
            if (res.ok) {
                setApplied(true);
            } else {
                const data = await res.json();
                setError(data.error || "Ошибка");
            }
        } catch {
            setError("Ошибка сети");
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-8 bg-gray-200 rounded w-2/3" />
                    <div className="h-64 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    if (!vacancy) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-2">Вакансия не найдена</h1>
                <Link href="/vacancies" className="text-[var(--primary)] hover:underline">
                    ← Все вакансии
                </Link>
            </div>
        );
    }

    const tags = vacancy.requirements?.split(",").map((t) => t.trim()).filter(Boolean) || [];

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
                <Link href="/" className="hover:text-[var(--primary)]">Главная</Link>
                <span>/</span>
                <Link href="/vacancies" className="hover:text-[var(--primary)]">Вакансии</Link>
                <span>/</span>
                <span className="text-foreground">{vacancy.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main content */}
                <div className="flex-1">
                    <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6 sm:p-8">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-sm text-[var(--muted)] mb-1">{vacancy.company.name}</p>
                                <h1 className="text-2xl font-bold">{vacancy.title}</h1>
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="blue">{tag}</Badge>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="prose prose-sm max-w-none">
                            <h3 className="font-semibold text-base mb-3">Описание</h3>
                            <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                                {vacancy.description}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:w-72 shrink-0">
                    <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6 space-y-4 sticky top-20">
                        {/* Salary */}
                        {vacancy.salary && (
                            <div>
                                <p className="text-xs text-[var(--muted)] mb-1">Зарплата</p>
                                <p className="text-lg font-bold text-[var(--primary)]">{vacancy.salary}</p>
                            </div>
                        )}

                        {/* Details */}
                        <div className="space-y-3 text-sm">
                            {vacancy.location && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{vacancy.location}</span>
                                </div>
                            )}
                            {vacancy.schedule && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{vacancy.schedule}</span>
                                </div>
                            )}
                            {vacancy.employmentType && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{vacancy.employmentType}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Опубликовано: {new Date(vacancy.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
                            </div>
                        </div>

                        {/* Apply button */}
                        {applied ? (
                            <div className="w-full text-center bg-green-100 text-green-800 font-medium py-3 rounded-xl text-sm">
                                ✓ Вы уже откликнулись
                            </div>
                        ) : (
                            <button
                                id="vacancy-apply"
                                onClick={handleApply}
                                disabled={applying}
                                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {applying ? "Отправка..." : "Откликнуться"}
                            </button>
                        )}
                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        {/* Company info */}
                        <div className="border-t border-[var(--border)] pt-4">
                            <p className="text-xs text-[var(--muted)] mb-1">Компания</p>
                            <p className="font-semibold text-sm">{vacancy.company.name}</p>
                            {vacancy.company.industry && (
                                <p className="text-xs text-[var(--muted)]">{vacancy.company.industry}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
