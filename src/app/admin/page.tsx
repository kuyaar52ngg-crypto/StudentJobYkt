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
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;
    location?: string | null;
    requirements?: string | null;
    status: string;
    createdAt: string;
    company: CompanyInfo;
}

interface Company {
    id: string;
    name: string;
    logo?: string | null;
    isVerified: boolean;
    description?: string | null;
    industry?: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string; isBlocked: boolean };
    _count: { vacancies: number };
}

export default function AdminDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const status = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";

    const [activeTab, setActiveTab] = useState<"moderation" | "vacancies" | "companies">("moderation");
    const [stats, setStats] = useState<Stats>({ users: 0, vacancies: 0, applications: 0, conversionRate: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const [pending, setPending] = useState<Vacancy[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);

    const [allVacancies, setAllVacancies] = useState<Vacancy[]>([]);
    const [allLoading, setAllLoading] = useState(false);

    const [companies, setCompanies] = useState<Company[]>([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);

    // Editing State
    const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
    const [editForm, setEditForm] = useState({ 
        title: "", 
        description: "", 
        salary: "", 
        location: "", 
        requirements: "",
        salaryMin: "" as string | number,
        salaryMax: "" as string | number,
        currency: "RUB"
    });
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
        } else if (activeTab === "vacancies") {
            setAllLoading(true);
            fetch("/api/admin/vacancies?all=true")
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setAllVacancies(data); })
                .finally(() => setAllLoading(false));
        } else if (activeTab === "companies") {
            setCompaniesLoading(true);
            fetch("/api/admin/companies")
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setCompanies(data); })
                .finally(() => setCompaniesLoading(false));
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
            salaryMin: v.salaryMin ?? "",
            salaryMax: v.salaryMax ?? "",
            currency: v.currency || "RUB",
        });
    };

    const handleSaveEdit = async () => {
        if (!editingVacancy) return;
        setSaving(true);
        try {
            const payload = {
                ...editForm,
                salaryMin: editForm.salaryMin === "" ? null : Number(editForm.salaryMin),
                salaryMax: editForm.salaryMax === "" ? null : Number(editForm.salaryMax),
            };
            const res = await fetch(`/api/vacancies/${editingVacancy.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setAllVacancies(prev => prev.map(v => 
                    v.id === editingVacancy.id ? { ...v, ...payload } : v
                ));
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
            } else {
                alert("Ошибка при удалении");
            }
        } catch {
            alert("Ошибка сети");
        }
    };

    const handleVerifyCompany = async (companyId: string, isVerified: boolean) => {
        const res = await fetch(`/api/admin/companies/${companyId}/verify`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isVerified }),
        });
        if (res.ok) {
            setCompanies(prev => prev.map(c =>
                c.id === companyId ? { ...c, isVerified } : c
            ));
        }
    };

    const handleBanCompany = async (companyId: string, isBlocked: boolean) => {
        const res = await fetch(`/api/admin/companies/${companyId}/ban`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isBlocked }),
        });
        if (res.ok) {
            setCompanies(prev => prev.map(c =>
                c.id === companyId ? { ...c, user: { ...c.user, isBlocked } } : c
            ));
        }
    };

    const statCards = [
        { label: "Пользователей", value: stats.users, icon: "👥", color: "bg-[var(--accent-blue)]" },
        { label: "Вакансий", value: stats.vacancies, icon: "💼", color: "bg-[var(--accent-green)]" },
        { label: "Откликов", value: stats.applications, icon: "📋", color: "bg-[var(--accent-pink)]" },
        { label: "Конверсия", value: `${stats.conversionRate}%`, icon: "📊", color: "bg-[var(--accent-orange)]" },
    ];

    const tabItems = [
        { key: "moderation" as const, label: "Модерация", icon: "🛡️" },
        { key: "vacancies" as const, label: "Вакансии", icon: "📝" },
        { key: "companies" as const, label: "Компании", icon: "🏢" },
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
                {tabItems.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                            activeTab === tab.key ? "bg-white shadow-sm text-[var(--primary)]" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
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
                                            </div>
                                            <p className="text-xs text-[var(--muted)]">{v.company.name} · {new Date(v.createdAt).toLocaleDateString("ru-RU")}</p>
                                            {v.salary && <p className="text-xs font-medium mt-1">{v.salary}</p>}
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Vacancies Tab — Card Layout */}
            {activeTab === "vacancies" && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Все вакансии</h2>
                        <span className="text-xs text-[var(--muted)]">Всего: {allVacancies.length}</span>
                    </div>
                    
                    {allLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : allVacancies.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)] bg-gray-50 rounded-2xl">Нет вакансий</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allVacancies.map((v) => (
                                <div key={v.id} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col gap-3 border border-[var(--border)]">
                                    {/* Status badge */}
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            v.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            v.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                        }`}>
                                            {v.status === "APPROVED" ? "Активна" : v.status === "PENDING" ? "На модерации" : "Отклонена"}
                                        </span>
                                        <span className="text-[10px] text-[var(--muted)]">
                                            {new Date(v.createdAt).toLocaleDateString("ru-RU")}
                                        </span>
                                    </div>

                                    {/* Title + Company */}
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
                                        <p className="text-xs text-[var(--muted)]">{v.company.name}</p>
                                    </div>

                                    {/* Salary + Location */}
                                    {(v.salary || v.location) && (
                                        <div className="text-xs text-[var(--muted)]">
                                            {v.salary && <span className="font-medium text-[var(--foreground)]">{v.salary}</span>}
                                            {v.salary && v.location && " · "}
                                            {v.location && <span>{v.location}</span>}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(v)}
                                            className="text-xs text-[var(--primary)] hover:underline font-medium"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            onClick={() => handleDelete(v.id)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Companies Tab */}
            {activeTab === "companies" && (
                <div className="animate-fade-in">
                    <h2 className="font-semibold text-lg mb-4">Управление компаниями</h2>
                    {companiesLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)] bg-gray-50 rounded-2xl">Нет зарегистрированных компаний</div>
                    ) : (
                        <div className="space-y-4">
                            {companies.map(c => (
                                <div key={c.id} className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 border border-[var(--border)]">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        {/* Logo + Info */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold overflow-hidden border border-[var(--border)] shrink-0">
                                                {c.logo ? (
                                                    <img src={c.logo} alt={c.name} className="w-full h-full object-cover" />
                                                ) : "🏢"}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-sm">{c.name}</h3>
                                                    {c.isVerified && (
                                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">✓</span>
                                                    )}
                                                    {c.user.isBlocked && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Заблокирован</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[var(--muted)]">{c.user.email}</p>
                                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                                    {c.industry && `${c.industry} · `}
                                                    {c._count.vacancies} вакансий
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                                            <button
                                                onClick={() => handleVerifyCompany(c.id, !c.isVerified)}
                                                className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-bold ${
                                                    c.isVerified
                                                    ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                                                    : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                                                }`}
                                            >
                                                {c.isVerified ? "✓ Верифицирована" : "+ Верифицировать"}
                                            </button>
                                            <button
                                                onClick={() => handleBanCompany(c.id, !c.user.isBlocked)}
                                                className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-bold ${
                                                    c.user.isBlocked
                                                    ? "bg-red-500 text-white shadow-md shadow-red-200"
                                                    : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                                                }`}
                                            >
                                                {c.user.isBlocked ? "Разблокировать" : "Заблокировать"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">От</label>
                                    <input
                                        type="number"
                                        value={editForm.salaryMin}
                                        onChange={(e) => setEditForm({...editForm, salaryMin: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">До</label>
                                    <input
                                        type="number"
                                        value={editForm.salaryMax}
                                        onChange={(e) => setEditForm({...editForm, salaryMax: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Валюта</label>
                                    <select
                                        value={editForm.currency}
                                        onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none bg-white"
                                    >
                                        <option value="RUB">RUB (₽)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Город</label>
                                <input
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                />
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
