"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const user = session?.user as { id?: string; name?: string; email?: string } | undefined;

    const [counts, setCounts] = useState({ applications: 0, favorites: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        Promise.all([
            fetch(`/api/applications?userId=${user.id}`).then(r => r.json()),
            fetch(`/api/favorites?userId=${user.id}`).then(r => r.json()),
        ]).then(([appsData, favsData]) => {
            setCounts({
                applications: Array.isArray(appsData) ? appsData.length : 0,
                favorites: Array.isArray(favsData) ? favsData.length : 0,
            });
        }).catch(console.error).finally(() => setLoading(false));
    }, [user?.id]);

    if (status === "loading") {
        return <div className="max-w-5xl mx-auto p-8"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6"></div></div>;
    }

    if (!session) {
        return <div className="max-w-5xl mx-auto p-8 text-center text-red-500">Пожалуйста, войдите в систему</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Добро пожаловать, {user?.name || "Студент"}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-blue)] flex items-center justify-center text-2xl">
                            👨‍🎓
                        </div>
                        <div>
                            <h2 className="font-semibold">Мой профиль</h2>
                            <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Заполните профиль, чтобы работодатели могли найти вас.
                    </p>
                    <Link
                        href="/dashboard/profile"
                        className="text-sm text-[var(--primary)] hover:underline font-medium"
                    >
                        Редактировать →
                    </Link>
                </div>

                {/* Applications card */}
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-green)] flex items-center justify-center text-2xl relative">
                            📋
                            {!loading && counts.applications > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                    {counts.applications}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold">Мои отклики</h2>
                            <p className="text-xs text-[var(--muted)]">Отслеживание статусов</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Просматривайте статусы ваших откликов на вакансии.
                    </p>
                    <Link
                        href="/dashboard/applications"
                        className="text-sm text-[var(--primary)] hover:underline font-medium"
                    >
                        Посмотреть →
                    </Link>
                </div>

                {/* Favorites card */}
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-pink)] flex items-center justify-center text-2xl relative">
                            ⭐
                            {!loading && counts.favorites > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                                    {counts.favorites}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="font-semibold">Избранное</h2>
                            <p className="text-xs text-[var(--muted)]">Сохранённые вакансии</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Вакансии, которые вы сохранили для рассмотрения.
                    </p>
                    <Link
                        href="/vacancies"
                        className="text-sm text-[var(--primary)] hover:underline font-medium"
                    >
                        Смотреть →
                    </Link>
                </div>
            </div>
        </div>
    );
}
