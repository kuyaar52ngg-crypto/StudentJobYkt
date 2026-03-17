"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

interface Stats {
    users: number;
    vacancies: number;
    applications: number;
    conversionRate: number;
}

interface PendingVacancy {
    id: string;
    title: string;
    createdAt: string;
    company: { name: string };
}

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const status = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";

    const [stats, setStats] = useState<Stats>({ users: 0, vacancies: 0, applications: 0, conversionRate: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const [pending, setPending] = useState<PendingVacancy[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stats").then(r => r.json()).then(setStats).finally(() => setStatsLoading(false));
        fetch("/api/admin/vacancies").then(r => r.json()).then(data => {
            if (Array.isArray(data)) setPending(data);
        }).finally(() => setPendingLoading(false));
    }, []);

    if (status === "loading") return <div className="p-8">Загрузка...</div>;
    
    if (status === "unauthenticated" || !user) {
        return <div className="p-8 text-red-500">Пожалуйста, авторизуйтесь как администратор</div>;
    }

    if (user.role !== "ADMIN") return <div className="p-8 text-red-500">Доступ запрещен. Ваша роль: {user.role}</div>;

    const handleAction = async (id: string, actionStatus: "APPROVED" | "REJECTED") => {
        try {
            const res = await fetch(`/api/vacancies/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: actionStatus }),
            });
            if (res.ok) {
                setPending(prev => prev.filter(v => v.id !== id));
            } else {
                const data = await res.json();
                alert(`Ошибка: ${data.error || res.statusText}`);
            }
        } catch (err: any) {
            alert(`Ошибка сети: ${err.message}`);
        }
    };

    const statCards = [
        { label: "Пользователей", value: stats.users, icon: "👥", color: "bg-[var(--accent-blue)]" },
        { label: "Вакансий", value: stats.vacancies, icon: "💼", color: "bg-[var(--accent-green)]" },
        { label: "Откликов", value: stats.applications, icon: "📋", color: "bg-[var(--accent-pink)]" },
        { label: "Конверсия", value: `${stats.conversionRate}%`, icon: "📊", color: "bg-[var(--accent-orange)]" },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5">
                        <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-lg mb-3`}>
                            {s.icon}
                        </div>
                        <p className="text-2xl font-bold">{statsLoading ? "..." : s.value}</p>
                        <p className="text-xs text-[var(--muted)]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Moderation queue */}
            <h2 className="font-semibold text-lg mb-4">Очередь модерации</h2>
            {pendingLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded animate-pulse" />)}
                </div>
            ) : pending.length === 0 ? (
                <div className="text-[var(--muted)]">Нет вакансий на модерацию</div>
            ) : (
                <div className="space-y-4">
                    {pending.map((v) => (
                        <div
                            key={v.id}
                            className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div>
                                <h3 className="font-semibold text-sm">{v.title}</h3>
                                <p className="text-xs text-[var(--muted)]">{v.company.name} · {new Date(v.createdAt).toLocaleDateString("ru-RU")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAction(v.id, "APPROVED")}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                                >
                                    Одобрить
                                </button>
                                <button
                                    onClick={() => handleAction(v.id, "REJECTED")}
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                                >
                                    Отклонить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
