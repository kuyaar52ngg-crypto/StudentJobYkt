"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface EditVacancyPageProps {
    params: Promise<{ id: string }>;
}

export default function EditVacancyPage({ params }: EditVacancyPageProps) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        description: "",
        salary: "",
        salaryMin: "" as string | number,
        salaryMax: "" as string | number,
        currency: "RUB",
        schedule: "",
        employmentType: "",
        location: "",
        requirements: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch(`/api/vacancies/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setForm({
                        title: data.title || "",
                        description: data.description || "",
                        salary: data.salary || "",
                        salaryMin: data.salaryMin ?? "",
                        salaryMax: data.salaryMax ?? "",
                        currency: data.currency || "RUB",
                        schedule: data.schedule || "",
                        employmentType: data.employmentType || "",
                        location: data.location || "",
                        requirements: data.requirements || "",
                    });
                }
            })
            .catch(() => setError("Ошибка загрузки"))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            setError("Пожалуйста, авторизуйтесь");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/vacancies/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/employer"), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Ошибка сохранения");
            }
        } catch {
            setError("Ошибка сети");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                <h1 className="text-2xl font-bold mb-2">Вакансия обновлена!</h1>
                <p className="text-[var(--muted)] text-sm mb-6">Изменения сохранены. Вы будете перенаправлены в кабинет.</p>
                <Link href="/employer" className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                    Вернуться в кабинет
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Редактировать вакансию</h1>
                <Link href="/employer" className="text-sm text-[var(--primary)] hover:underline">← Назад</Link>
            </div>

            <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6 sm:p-8">
                {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="edit-title" className="block text-sm font-medium mb-1.5">Название вакансии *</label>
                        <input
                            id="edit-title" name="title" type="text" value={form.title} onChange={handleChange} required
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-1.5">Описание *</label>
                        <textarea
                            id="edit-description" name="description" value={form.description} onChange={handleChange} required rows={6}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="edit-salary-min" className="block text-sm font-medium mb-1.5">Зарплата от</label>
                                <input
                                    id="edit-salary-min" name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-salary-max" className="block text-sm font-medium mb-1.5">Зарплата до</label>
                                <input
                                    id="edit-salary-max" name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-currency" className="block text-sm font-medium mb-1.5">Валюта</label>
                                <select
                                    id="edit-currency" name="currency" value={form.currency} onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                                >
                                    <option value="RUB">RUB (₽)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="edit-location" className="block text-sm font-medium mb-1.5">Город</label>
                            <input
                                id="edit-location" name="location" type="text" value={form.location} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-schedule" className="block text-sm font-medium mb-1.5">График</label>
                            <select
                                id="edit-schedule" name="schedule" value={form.schedule} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                            >
                                <option value="">Не указан</option>
                                <option value="Полная занятость">Полная занятость</option>
                                <option value="Частичная занятость">Частичная занятость</option>
                                <option value="Стажировка">Стажировка</option>
                                <option value="Проектная работа">Проектная работа</option>
                                <option value="Удалённая работа">Удалённая работа</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-type" className="block text-sm font-medium mb-1.5">Тип</label>
                            <select
                                id="edit-type" name="employmentType" value={form.employmentType} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                            >
                                <option value="">Не указан</option>
                                <option value="Вакансия">Вакансия</option>
                                <option value="Стажировка">Стажировка</option>
                                <option value="Практика">Практика</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="edit-requirements" className="block text-sm font-medium mb-1.5">Требования</label>
                        <input
                            id="edit-requirements" name="requirements" type="text" value={form.requirements} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="React, TypeScript, Git"
                        />
                    </div>

                    <button
                        id="vacancy-save" type="submit" disabled={saving}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {saving ? "Сохранение..." : "Сохранить изменения"}
                    </button>
                </form>
            </div>
        </div>
    );
}
