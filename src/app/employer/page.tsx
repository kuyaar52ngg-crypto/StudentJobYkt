"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Vacancy {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    _count: { applications: number };
}

export default function EmployerDashboardPage() {
    const { data: session, status } = useSession();
    // Assuming we have companyId in session for employers, or we fetch it based on user id
    const user = session?.user as { id?: string } | undefined;

    // Quick mock for company ID fetching, in a real app this would come from session or a separate API call matching userId to companyId.
    // For now we'll fetch vacancies by trying to get the company ID
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        // Actually, we need an endpoint to get the employer's company. We will map via user.id -> company directly in a real API.
        // For demonstration, let's assume we have an endpoint or we hardcode fetching based on user context.
        // I'll add a fetch to a mock or we pass companyId. Let's assume the user has a company.
        // We will do a generic fetch using user.id and let the backend resolve the company.
        // But our `employer/vacancies` route expects companyId. I will change it to work with user ID, or we fetch company first.
        // Let's modify the route or just pass a mock company ID if none exists for demo purposes.
        fetch(`/api/employer/vacancies?userId=${user.id}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setVacancies(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

    }, [user?.id]);

    const totalApplicants = vacancies.reduce((sum, v) => sum + (v._count?.applications || 0), 0);
    const pendingVacanciesCount = vacancies.filter(v => v.status === "PENDING").length;

    if (status === "loading") return <div className="p-8"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded" /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Кабинет работодателя</h1>
                <Link
                    href="/employer/vacancies/new"
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                    + Новая вакансия
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 text-center">
                    <p className="text-3xl font-bold text-[var(--primary)]">{vacancies.length}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Всего создано вакансий</p>
                </div>
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 text-center">
                    <p className="text-3xl font-bold text-green-600">{totalApplicants}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Всего откликов</p>
                </div>
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 text-center">
                    <p className="text-3xl font-bold text-orange-600">{pendingVacanciesCount}</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Вакансий на модерации</p>
                </div>
            </div>

            {/* Vacancies list */}
            <h2 className="font-semibold text-lg mb-4">Мои вакансии</h2>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded-[var(--radius-card)] animate-pulse" />)}
                </div>
            ) : vacancies.length === 0 ? (
                <div className="text-[var(--muted)] text-center py-8">У вас пока нет вакансий</div>
            ) : (
                <div className="space-y-4">
                    {vacancies.map((v) => (
                        <div
                            key={v.id}
                            className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div>
                                <h3 className="font-semibold text-sm">{v.title}</h3>
                                <p className="text-xs text-[var(--muted)]">
                                    {new Date(v.createdAt).toLocaleDateString("ru-RU")} · {v._count?.applications || 0} откликов
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs font-medium px-3 py-1 rounded-full ${v.status === "APPROVED"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {v.status === "APPROVED" ? "Активна" : "На модерации"}
                                </span>
                                <Link
                                    href={`/vacancies/${v.id}`}
                                    className="text-xs text-[var(--primary)] hover:underline"
                                >
                                    Подробнее
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
