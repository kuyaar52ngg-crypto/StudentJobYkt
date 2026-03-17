"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

interface Stats {
    users: number;
    vacancies: number;
    applications: number;
    conversionRate: number;
}

interface CompanyInfo {
    id: string;
    name: string;
    logo?: string | null;
    isVerified: boolean;
}

interface Vacancy {
    id: string;
    title: string;
    description: string;
    salary?: string | null;
    location?: string | null;
    requirements?: string | null;
    status: string;
    createdAt: string;
    company: CompanyInfo;
}

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const status = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";

    const [activeTab, setActiveTab] = useState<"moderation" | "vacancies">("moderation");
    const [stats, setStats] = useState<Stats>({ users: 0, vacancies: 0, applications: 0, conversionRate: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const [pending, setPending] = useState<Vacancy[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);

    const [allVacancies, setAllVacancies] = useState<Vacancy[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    // Editing State
    const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", salary: "", location: "", requirements: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/stats").then(r => r.json()).then(setStats).finally(() => setStatsLoading(false));
    }, []);

    useEffect(() => {
        if (activeTab === "moderation") {
            setPendingLoading(true);
            fetch("/api/admin/vacancies")
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setPending(data); })
                .finally(() => setPendingLoading(false));
        } else {
            setAllLoading(true);
            fetch("/api/admin/vacancies?all=true")
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setAllVacancies(data); })
                .finally(() => setAllLoading(false));
        }
    }, [activeTab]);

    if (status === "loading") return <div className="p-8">Загрузка...</div>;
    
    if (status === "unauthenticated" || !user) {
        return <div className="p-8 text-red-500">Пожалуйста, авторизуйтесь как администратор</div>;
    }

    if (user.role !== "ADMIN") return <div className="p-8 text-red-500">Доступ запрещен. Ваша роль: {user.role}</div>;

    const handleModeration = async (id: string, actionStatus: "APPROVED" | "REJECTED") => {
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
        } catch (err: unknown) {
            alert(`Ошибка сети: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleEditClick = (v: Vacancy) => {
        setEditingVacancy(v);
        setEditForm({
            title: v.title,
            description: v.description,
            salary: v.salary || "",
            location: v.location || "",
            requirements: v.requirements || "",
        });
    };

    const handleSaveEdit = async () => {
        if (!editingVacancy) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/vacancies/${editingVacancy.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                const updated = await res.json();
                setAllVacancies(prev => prev.map(v => v.id === updated.id ? { ...v, ...editForm } : v));
                setEditingVacancy(null);
                alert("Изменения сохранены!");
            } else {
                alert("Ошибка при сохранении");
            }
        } catch {
            alert("Ошибка сети");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту вакансию? Это действие необратимо.")) return;
        try {
            const res = await fetch(`/api/vacancies/${id}`, { method: "DELETE" });
            if (res.ok) {
                setAllVacancies(prev => prev.filter(v => v.id !== id));
                alert("Вакансия удалена");
            } else {
                alert("Ошибка при удалении");
            }
        } catch {
            alert("Ошибка сети");
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("moderation")}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "moderation" ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Модерация
                </button>
                <button
                    onClick={() => setActiveTab("vacancies")}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "vacancies" ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Редактирование
                </button>
            </div>

            {/* Moderation Tab */}
            {activeTab === "moderation" && (
                <div className="animate-fade-in">
                    <h2 className="font-semibold text-lg mb-4">Очередь модерации</h2>
                    {pendingLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded animate-pulse" />)}
                        </div>
                    ) : pending.length === 0 ? (
                        <div className="text-[var(--muted)] text-center py-10 bg-gray-50 rounded-2xl">Все вакансии проверены</div>
                    ) : (
                        <div className="space-y-4">
                            {pending.map((v) => (
                                <div
                                    key={v.id}
                                    className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col gap-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm">{v.title}</h3>
                                                {v.company.isVerified && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[var(--muted)]">{v.company.name} · {new Date(v.createdAt).toLocaleDateString("ru-RU")}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleModeration(v.id, "APPROVED")}
                                                className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                                            >
                                                Одобрить
                                            </button>
                                            <button
                                                onClick={() => handleModeration(v.id, "REJECTED")}
                                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                                            >
                                                Отклонить
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Статус компании</span>
                                        <button
                                            onClick={async () => {
                                                const newStatus = !v.company.isVerified;
                                                const res = await fetch(`/api/admin/companies/${v.company.id}/verify`, {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ isVerified: newStatus }),
                                                });
                                                if (res.ok) {
                                                    setPending(prev => prev.map(item => 
                                                        item.company.id === v.company.id 
                                                        ? { ...item, company: { ...item.company, isVerified: newStatus } }
                                                        : item
                                                    ));
                                                }
                                            }}
                                            className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-bold ${
                                                v.company.isVerified 
                                                ? "bg-blue-500 text-white shadow-md shadow-blue-200" 
                                                : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                                            }`}
                                        >
                                            {v.company.isVerified ? "✓ Верифицирована" : "+ Верифицировать компанию"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Vacancies List Tab */}
            {activeTab === "vacancies" && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Все вакансии</h2>
                        <span className="text-xs text-[var(--muted)]">Всего: {allVacancies.length}</span>
                    </div>
                    
                    {allLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-[var(--muted)] font-medium text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Вакансия</th>
                                        <th className="px-6 py-4">Компания</th>
                                        <th className="px-6 py-4">Статус</th>
                                        <th className="px-6 py-4 text-right">Действие</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allVacancies.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{v.title}</td>
                                            <td className="px-6 py-4 text-[var(--muted)]">{v.company.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                                    v.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                    v.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(v)}
                                                        className="text-[var(--primary)] hover:underline font-medium"
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                        title="Удалить вакансию"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal / Overlay */}
            {editingVacancy && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Редактирование вакансии</h3>
                            <button onClick={() => setEditingVacancy(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Заголовок</label>
                                <input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Описание</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    rows={6}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Зарплата</label>
                                    <input
                                        value={editForm.salary}
                                        onChange={(e) => setEditForm({...editForm, salary: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Город</label>
                                    <input
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Требования (через запятую)</label>
                                <input
                                    value={editForm.requirements}
                                    onChange={(e) => setEditForm({...editForm, requirements: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setEditingVacancy(null)}
                                className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                            >
                                {saving ? "Сохранение..." : "Сохранить изменения"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
