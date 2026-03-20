"use client";

import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Tab = "profile" | "favorites" | "applications";

interface Favorite {
    id: string;
    vacancyId: string;
    vacancy: {
        id: string;
        title: string;
        salary?: string;
        location?: string;
        schedule?: string;
        company: { id: string; name: string; logo?: string };
    };
}

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

const months = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function DashboardPage() {
    const { user, loading: authLoading, refresh } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Profile state
    const [profile, setProfile] = useState({
        name: "", phone: "", gender: "", university: "", major: "", skills: "",
        birthdayDay: "", birthdayMonth: "", birthdayYear: "", avatarUrl: "",
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState("");

    // Favorites state
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [favsLoading, setFavsLoading] = useState(true);

    // Applications state
    const [applications, setApplications] = useState<Application[]>([]);
    const [appsLoading, setAppsLoading] = useState(true);

    // Load profile
    useEffect(() => {
        if (!user?.id) return;
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(data => {
                const bd = data.birthday ? new Date(data.birthday) : null;
                setProfile({
                    name: data.name || "",
                    phone: data.phone || "",
                    gender: data.gender || "",
                    university: data.university || "",
                    major: data.major || "",
                    skills: data.skills || "",
                    birthdayDay: bd ? String(bd.getDate()) : "",
                    birthdayMonth: bd ? String(bd.getMonth()) : "",
                    birthdayYear: bd ? String(bd.getFullYear()) : "",
                    avatarUrl: data.avatarUrl || "",
                });
            })
            .catch(console.error)
            .finally(() => setProfileLoading(false));
    }, [user?.id]);

    // Load favorites when tab selected
    const loadFavorites = useCallback(() => {
        if (!user?.id) return;
        setFavsLoading(true);
        fetch("/api/favorites")
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setFavorites(data); })
            .catch(console.error)
            .finally(() => setFavsLoading(false));
    }, [user?.id]);

    // Load applications when tab selected
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
        if (activeTab === "favorites") loadFavorites();
        if (activeTab === "applications") loadApplications();
    }, [activeTab, loadFavorites, loadApplications]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveMsg("");
        try {
            let birthday: string | null = null;
            if (profile.birthdayDay && profile.birthdayMonth !== "" && profile.birthdayYear) {
                birthday = new Date(
                    parseInt(profile.birthdayYear),
                    parseInt(profile.birthdayMonth),
                    parseInt(profile.birthdayDay)
                ).toISOString();
            }
            const res = await fetch("/api/auth/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    gender: profile.gender,
                    university: profile.university,
                    major: profile.major,
                    skills: profile.skills,
                    avatarUrl: profile.avatarUrl,
                    birthday,
                }),
            });
            if (res.ok) {
                setSaveMsg("Данные сохранены!");
                setIsEditing(false);
                refresh();
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

    const removeFavorite = async (vacancyId: string) => {
        try {
            await fetch(`/api/favorites?vacancyId=${vacancyId}`, { method: "DELETE" });
            setFavorites(prev => prev.filter(f => f.vacancyId !== vacancyId));
        } catch (e) { console.error(e); }
    };

    if (authLoading) {
        return <div className="max-w-3xl mx-auto p-8"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6"></div></div>;
    }
    if (!user) {
        return <div className="max-w-3xl mx-auto p-8 text-center text-red-500">Пожалуйста, войдите в систему</div>;
    }

    const initials = (user.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: "profile", label: "Мои данные", icon: "👤" },
        { key: "favorites", label: "Избранные вакансии", icon: "⭐" },
        { key: "applications", label: "Мои отклики", icon: "📋" },
    ];

    // Format birthday for view mode
    const getBirthdayString = () => {
        if (!profile.birthdayDay || profile.birthdayMonth === "" || !profile.birthdayYear) return "";
        const monthIdx = parseInt(profile.birthdayMonth);
        return `${profile.birthdayDay} ${months[monthIdx] || ""} ${profile.birthdayYear}`;
    };

    const genderLabel = profile.gender === "male" ? "Мужской" : profile.gender === "female" ? "Женский" : "";

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-6">Личный кабинет</h1>

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
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Личная информация</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-sm text-[var(--primary)] hover:underline font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Редактировать
                            </button>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-amber-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-2 border-white shadow-lg transition-transform group-hover:scale-[1.02]">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : initials}
                                </div>
                                {isEditing && (
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
                                                        setProfile({ ...profile, avatarUrl: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            {isEditing && (
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[var(--foreground)]">Выберите фото</p>
                                    <p className="text-[11px] text-[var(--muted)] mt-1 max-w-[200px]">Нажмите на квадрат, чтобы загрузить изображение с вашего устройства</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {profileLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : isEditing ? (
                        /* Edit mode */
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Ваше имя</label>
                                <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="Иванов Иван" />
                            </div>

                            {/* Birthday */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5">День рождения</label>
                                <div className="flex gap-2 flex-wrap">
                                    <select value={profile.birthdayDay} onChange={e => setProfile({...profile, birthdayDay: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white">
                                        <option value="">День</option>
                                        {Array.from({length: 31}, (_, i) => (<option key={i+1} value={String(i+1)}>{i+1}</option>))}
                                    </select>
                                    <select value={profile.birthdayMonth} onChange={e => setProfile({...profile, birthdayMonth: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white">
                                        <option value="">Месяц</option>
                                        {months.map((m, i) => (<option key={i} value={String(i)}>{m}</option>))}
                                    </select>
                                    <select value={profile.birthdayYear} onChange={e => setProfile({...profile, birthdayYear: e.target.value})}
                                        className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white">
                                        <option value="">Год</option>
                                        {Array.from({length: 30}, (_, i) => { const y = 2010 - i; return <option key={y} value={String(y)}>{y}</option>; })}
                                    </select>
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Пол</label>
                                <div className="space-y-2">
                                    {[{v: "male", l: "Мужской"}, {v: "female", l: "Женский"}, {v: "", l: "Не выбрано"}].map(g => (
                                        <label key={g.v} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="gender" checked={profile.gender === g.v}
                                                onChange={() => setProfile({...profile, gender: g.v})} className="w-4 h-4 accent-[var(--primary)]" />
                                            <span className="text-sm">{g.l}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Телефон</label>
                                <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="+7 (999) 123-45-67" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Университет</label>
                                <input type="text" value={profile.university} onChange={e => setProfile({...profile, university: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="СВФУ, ЯГУ и т.д." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Специальность</label>
                                <input type="text" value={profile.major} onChange={e => setProfile({...profile, major: e.target.value})}
                                    className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="Программная инженерия" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Навыки</label>
                                <input type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" placeholder="React, TypeScript, Python..." />
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={handleSaveProfile} disabled={saving}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                                    {saving ? "Сохранение..." : "Сохранить"}
                                </button>
                                <button onClick={() => setIsEditing(false)}
                                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-gray-50 transition-colors">
                                    Отмена
                                </button>
                                {saveMsg && (
                                    <span className={`text-sm ${saveMsg.includes("Ошибка") ? "text-red-500" : "text-green-600"}`}>
                                        {saveMsg}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* View mode */
                        <div className="space-y-5">
                            <InfoRow label="Имя" value={profile.name} />
                            <InfoRow label="День рождения" value={getBirthdayString()} />
                            <InfoRow label="Пол" value={genderLabel} />
                            <InfoRow label="Телефон" value={profile.phone} />
                            <InfoRow label="Университет" value={profile.university} />
                            <InfoRow label="Специальность" value={profile.major} />
                            <InfoRow label="Навыки" value={profile.skills} />
                        </div>
                    )}
                </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-bold mb-4">Избранные вакансии</h2>
                    {favsLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded-[var(--radius-card)] animate-pulse" />)}
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)]">
                            <p className="text-4xl mb-3">⭐</p>
                            <p>У вас пока нет избранных вакансий</p>
                            <Link href="/vacancies" className="text-[var(--primary)] hover:underline mt-2 inline-block text-sm">
                                Искать вакансии →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {favorites.filter(f => f.vacancy).map(fav => (
                                <div
                                    key={fav.id}
                                    className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div>
                                        <Link href={`/vacancies/${fav.vacancy.id}`} className="font-semibold text-sm hover:text-[var(--primary)] transition-colors">
                                            {fav.vacancy.title}
                                        </Link>
                                        <p className="text-xs text-[var(--muted)]">
                                            {fav.vacancy.company.name}
                                            {fav.vacancy.salary && ` · ${fav.vacancy.salary}`}
                                            {fav.vacancy.location && ` · ${fav.vacancy.location}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFavorite(fav.vacancyId)}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors self-start sm:self-center"
                                    >
                                        Удалить ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Applications Tab */}
            {activeTab === "applications" && (
                <div className="animate-fade-in-up">
                    <h2 className="text-xl font-bold mb-4">Мои отклики</h2>
                    {appsLoading ? (
                        <div className="space-y-4">
                            {[1,2,3].map(i => <div key={i} className="h-20 bg-[var(--card-bg)] rounded-[var(--radius-card)] animate-pulse" />)}
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-[var(--muted)]">
                            <p className="text-4xl mb-3">📋</p>
                            <p>Вы пока не откликнулись ни на одну вакансию</p>
                            <Link href="/vacancies" className="text-[var(--primary)] hover:underline mt-2 inline-block text-sm">
                                Искать вакансии →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map(app => (
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
            )}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-[11px] text-[var(--muted)] uppercase tracking-wider font-bold mb-0.5">{label}</p>
            <p className="text-sm text-[var(--foreground)]">{value || "—"}</p>
        </div>
    );
}
