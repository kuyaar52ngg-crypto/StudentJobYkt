"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Application {
    id: string;
    status: string;
    createdAt: string;
    vacancy: {
        title: string;
        company: { name: string };
    };
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    INVITED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
    PENDING: "На рассмотрении",
    INVITED: "Приглашён",
    REJECTED: "Отказ",
};

export default function ApplicationsPage() {
    const { data: session } = useSession();
    const user = session?.user as { id?: string } | undefined;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        fetch(`/api/applications?userId=${user.id}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setApplications(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user?.id]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Мои отклики</h1>
                <Link href="/dashboard" className="text-sm text-[var(--primary)] hover:underline">
                    ← Назад
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 h-20 animate-pulse" />
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-12 text-[var(--muted)]">
                    <p>Вы пока не откликнулись ни на одну вакансию</p>
                    <Link href="/vacancies" className="text-[var(--primary)] hover:underline mt-2 inline-block">Искать вакансии</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div>
                                <h3 className="font-semibold text-sm">{app.vacancy.title}</h3>
                                <p className="text-xs text-[var(--muted)]">
                                    {app.vacancy.company.name} · {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                                </p>
                            </div>
                            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${statusColors[app.status] || "bg-gray-100"}`}>
                                {statusLabels[app.status] || app.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
