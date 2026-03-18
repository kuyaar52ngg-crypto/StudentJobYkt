"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

type Tab = "profile" | "vacancies" | "applications";

interface Vacancy {
    id: string;
    title: string;
    status: string;
    salary?: string;
    location?: string;
    createdAt: string;
    _count: { applications: number };
}

interface Application {
    id: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string; university?: string; resumeUrl?: string };
    vacancy: { title: string; company: { name: string } };
}

const appStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    INVITED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
};
const appStatusLabels: Record<string, string> = {
    PENDING: "На рассмотрении",
    INVITED: "Приглашён",
    REJECTED: "Отказ",
};

export default function EmployerDashboardPage() {
    const { user, loading: authLoading, refresh } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Company profile
    const [companyProfile, setCompanyProfile] = useState({
        name: "", description: "", industry: "", contactInfo: "", phone: "", logo: "", isVerified: false,
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Vacancies
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [vacsLoading, setVacsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Applications
    const [applications, setApplications] = useState<Application[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);

    // Load profile
    useEffect(() => {
        if (!user?.id) return;
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(data => {
                setCompanyProfile({
                    name: data.company?.name || data.name || "",
                    description: data.company?.description || "",
                    industry: data.company?.industry || "",
                    contactInfo: data.company?.contactInfo || "",
                    phone: data.phone || "",
                    logo: data.company?.logo || "",
                    isVerified: data.company?.isVerified || false,
                });
            })
            .catch(console.error)
            .finally(() => setProfileLoading(false));
    }, [user?.id]);

    // Load vacancies
    const loadVacancies = useCallback(() => {
        if (!user?.id) return;
        setVacsLoading(true);
        fetch(`/api/employer/vacancies?userId=${user.id}`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setVacancies(data); })
            .catch(console.error)
            .finally(() => setVacsLoading(false));
    }, [user?.id]);

    // Load applications
    const loadApplications = useCallback(() => {
        if (!user?.id) return;
        setAppsLoading(true);
        fetch("/api/applications")
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setApplications(data); })
            .catch(console.error)
            .finally(() => setAppsLoading(false));
    }, [user?.id]);

    useEffect(() => {
        if (activeTab === "vacancies") loadVacancies();
        if (activeTab === "applications") loadApplications();
    }, [activeTab, loadVacancies, loadApplications]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveMsg("");
        try {
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: companyProfile.name,
                    phone: companyProfile.phone,
                    company: {
                        name: companyProfile.name,
                        description: companyProfile.description,
                        industry: companyProfile.industry,
                        contactInfo: companyProfile.contactInfo,
                        logo: companyProfile.logo,
                    },
                }),
            });
            if (res.ok) {
                setSaveMsg("Данные сохранены!");
                await refresh();
            } else {
                setSaveMsg("Ошибка сохранения");
            }
        } catch {
            setSaveMsg("Ошибка сети");
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(""), 3000);
        }
    };

    const handleDeleteVacancy = async (id: string) => {
        try {
            const res = await fetch(`/api/vacancies/${id}`, { method: "DELETE" });
            if (res.ok) {
                setVacancies(prev => prev.filter(v => v.id !== id));
            }
        } catch (e) { console.error(e); }
        setDeleteConfirm(null);
    };

    const handleApplicationStatus = async (appId: string, status: string) => {
        try {
            const res = await fetch(`/api/applications/${appId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
            }
        } catch (e) { console.error(e); }
    };

    if (authLoading) {
        return <div className="max-w-3xl mx-auto p-8"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6"></div></div>;
    }
    if (!user) {
        return <div className="max-w-3xl mx-auto p-8 text-center text-red-500">Пожалуйста, войдите в систему</div>;
    }

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "profile", label: "Мои данные", icon: "🏢" },
        { key: "vacancies", label: "Мои вакансии", icon: "📝" },
        { key: "applications", label: "Мои отклики", icon: "📋" },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Кабинет работодателя</h1>

            {/* Tab buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === t.key
                                ? "bg-[var(--primary)] text-white shadow-md"
                                : "bg-[var(--card-bg)] text-[var(--foreground)] shadow-[var(--card-shadow)] hover:shadow-md"
                        }`}
                    >
                        <span>{t.icon}</span>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6 sm:p-8 animate-fade-in-up">
                    <h2 className="text-xl font-bold mb-6">Данные компании</h2>

                    {/* Logo */}
                    <div className="flex flex-col gap-4 mb-8">
                        <label className="block text-sm font-medium">Логотип компании</label>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 text-3xl font-bold overflow-hidden border-2 border-[var(--border)] shadow-lg transition-transform group-hover:scale-[1.02]">
                                    {companyProfile.logo ? (
                                        <img src={companyProfile.logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : "🏢"}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                                    Изменить
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChangeCapture={(e) => {
                                            const file = (e.currentTarget as HTMLInputElement).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setCompanyProfile({ ...companyProfile, logo: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-medium text-[var(--foreground)]">Загрузите логотип</p>
                                    {companyProfile.isVerified && (
                                        <div className="group relative">
                                            <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                Официальный аккаунт
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-[var(--muted)] max-w-[200px]">Нажмите на квадрат, чтобы загрузить логотип вашей компании с устройства</p>
                            </div>
                        </div>
                    </div>

                    {profileLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Название компании</label>
                                <input
                                    type="text"
                                    value={companyProfile.name}
                                    onChange={e => setCompanyProfile({...companyProfile, name: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder='ООО «Компания»'
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Описание</label>
                                <textarea
                                    value={companyProfile.description}
                                    onChange={e => setCompanyProfile({...companyProfile, description: e.target.value})}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                                    placeholder="Расскажите о вашей компании..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Отрасль</label>
                                <input
                                    type="text"
                                    value={companyProfile.industry}
                                    onChange={e => setCompanyProfile({...companyProfile, industry: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="IT, Торговля, Образование..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Контактная информация</label>
                                <input
                                    type="text"
                                    value={companyProfile.contactInfo}
                                    onChange={e => setCompanyProfile({...companyProfile, contactInfo: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Email, телефон, адрес..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Телефон</label>
                                <input
                                    type="tel"
                                    value={companyProfile.phone}
                                    onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="+7 (999) 123-45-67"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {saving ? "Сохранение..." : "Сохранить"}
                                </button>
                                {saveMsg && (
                                    <span className={`text-sm ${saveMsg.includes("Ошибка") ? "text-red-500" : "text-green-600"}`}>
                                        {saveMsg}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vacancies Tab */}
            {activeTab === "vacancies" && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Мои вакансии</h2>
                        <Link
                            href="/employer/vacancies/new"
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                        >
                            + Добавить вакансию
                        </Link>
                    </div>

                    {vacsLoading ? (
                        <div className="space-y-4">
                            {[1,2].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded-[var(--radius-card)] animate-pulse" />)}
                        </div>
                    ) : vacancies.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)]">
                            <p className="text-4xl mb-3">📝</p>
                            <p>У вас пока нет вакансий</p>
                            <Link href="/employer/vacancies/new" className="text-[var(--primary)] hover:underline mt-2 inline-block text-sm">
                                Создать первую вакансию →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {vacancies.map(v => (
                                <div
                                    key={v.id}
                                    className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-sm">{v.title}</h3>
                                            <p className="text-xs text-[var(--muted)]">
                                                {new Date(v.createdAt).toLocaleDateString("ru-RU")} · {v._count?.applications || 0} откликов
                                                {v.salary && ` · ${v.salary}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                                v.status === "APPROVED" ? "bg-green-100 text-green-800"
                                                : v.status === "REJECTED" ? "bg-red-100 text-red-800"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                                {v.status === "APPROVED" ? "Активна" : v.status === "REJECTED" ? "Отклонена" : "На модерации"}
                                            </span>
                                            <Link
                                                href={`/employer/vacancies/${v.id}/edit`}
                                                className="text-xs text-[var(--primary)] hover:underline font-medium"
                                            >
                                                Редактировать
                                            </Link>
                                            {deleteConfirm === v.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleDeleteVacancy(v.id)}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Да, удалить
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] font-medium"
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(v.id)}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    Удалить
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-bold mb-4">Отклики на вакансии</h2>
                    {appsLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-24 bg-[var(--card-bg)] rounded-[var(--radius-card)] animate-pulse" />)}
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)]">
                            <p className="text-4xl mb-3">📋</p>
                            <p>Пока нет откликов на ваши вакансии</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.filter(a => a.vacancy).map(app => (
                                <div
                                    key={app.id}
                                    className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-sm">{app.user.name}</h3>
                                            <p className="text-xs text-[var(--muted)]">
                                                {app.user.email}
                                                {app.user.university && ` · ${app.user.university}`}
                                            </p>
                                            <p className="text-xs text-[var(--muted)] mt-1">
                                                Вакансия: <span className="font-medium text-[var(--foreground)]">{app.vacancy.title}</span>
                                                {" · "}{new Date(app.createdAt).toLocaleDateString("ru-RU")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${appStatusColors[app.status] || "bg-gray-100"}`}>
                                                {appStatusLabels[app.status] || app.status}
                                            </span>
                                            {app.status === "PENDING" && (
                                                <>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, "INVITED")}
                                                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
                                                    >
                                                        Пригласить
                                                    </button>
                                                    <button
                                                        onClick={() => handleApplicationStatus(app.id, "REJECTED")}
                                                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-medium transition-colors"
                                                    >
                                                        Отказать
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Delete confirmation overlay */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-2">Удалить вакансию?</h3>
                        <p className="text-sm text-[var(--muted)] mb-4">Это действие нельзя отменить. Все отклики на эту вакансию также будут удалены.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirm(null)} className="text-sm px-4 py-2 rounded-xl border border-[var(--border)] hover:bg-gray-50 transition-colors">
                                Отмена
                            </button>
                            <button onClick={() => handleDeleteVacancy(deleteConfirm)} className="text-sm px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
