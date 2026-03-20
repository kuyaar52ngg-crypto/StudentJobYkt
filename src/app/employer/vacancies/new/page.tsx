"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function NewVacancyPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        description: "",
        salary: "",
        salaryMin: "",
        salaryMax: "",
        currency: "RUB",
        schedule: "Полная занятость",
        employmentType: "Вакансия",
        location: "Якутск",
        requirements: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

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

        setLoading(true);
        setError("");

        try {
            // In a real app we'd fetch the company ID from the user info.
            // For now, let's assume our POST endpoint accepts userId and will resolve companyId.
            // Let's modify the body to send userId so backend can infer company.
            const res = await fetch("/api/vacancies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, userId: user.id }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/employer"), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Ошибка создания вакансии");
            }
        } catch {
            setError("Ошибка сети");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                </div>
                <h1 className="text-2xl font-bold mb-2">Вакансия создана!</h1>
                <p className="text-[var(--muted)] text-sm mb-6">
                    Ваша вакансия отправлена на модерацию. Вы будете перенаправлены в кабинет.
                </p>
                <Link
                    href="/employer"
                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors"
                >
                    Вернуться в кабинет
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Новая вакансия</h1>
                <Link href="/employer" className="text-sm text-[var(--primary)] hover:underline">
                    ← Назад
                </Link>
            </div>

            <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-6 sm:p-8">
                {error && <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-xl">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="vacancy-title" className="block text-sm font-medium mb-1.5">
                            Название вакансии *
                        </label>
                        <input
                            id="vacancy-title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Junior Frontend Разработчик"
                        />
                    </div>

                    <div>
                        <label htmlFor="vacancy-description" className="block text-sm font-medium mb-1.5">
                            Описание *
                        </label>
                        <textarea
                            id="vacancy-description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={6}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                            placeholder="Опишите обязанности, условия работы и требования..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="vacancy-salary-min" className="block text-sm font-medium mb-1.5">
                                    Зарплата от
                                </label>
                                <input
                                    id="vacancy-salary-min"
                                    name="salaryMin"
                                    type="number"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="25000"
                                />
                            </div>
                            <div>
                                <label htmlFor="vacancy-salary-max" className="block text-sm font-medium mb-1.5">
                                    Зарплата до
                                </label>
                                <input
                                    id="vacancy-salary-max"
                                    name="salaryMax"
                                    type="number"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label htmlFor="vacancy-currency" className="block text-sm font-medium mb-1.5">
                                    Валюта
                                </label>
                                <select
                                    id="vacancy-currency"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                                >
                                    <option value="RUB">RUB (₽)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="vacancy-location" className="block text-sm font-medium mb-1.5">
                                Город
                            </label>
                            <input
                                id="vacancy-location"
                                name="location"
                                type="text"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="vacancy-schedule" className="block text-sm font-medium mb-1.5">
                                График
                            </label>
                            <select
                                id="vacancy-schedule"
                                name="schedule"
                                value={form.schedule}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                            >
                                <option value="Полная занятость">Полная занятость</option>
                                <option value="Частичная занятость">Частичная занятость</option>
                                <option value="Стажировка">Стажировка</option>
                                <option value="Проектная работа">Проектная работа</option>
                                <option value="Удалённая работа">Удалённая работа</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vacancy-type" className="block text-sm font-medium mb-1.5">
                                Тип
                            </label>
                            <select
                                id="vacancy-type"
                                name="employmentType"
                                value={form.employmentType}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
                            >
                                <option value="Вакансия">Вакансия</option>
                                <option value="Стажировка">Стажировка</option>
                                <option value="Практика">Практика</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="vacancy-requirements" className="block text-sm font-medium mb-1.5">
                            Требования (навыки, через запятую)
                        </label>
                        <input
                            id="vacancy-requirements"
                            name="requirements"
                            type="text"
                            value={form.requirements}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="React, TypeScript, Git"
                        />
                    </div>

                    <button
                        id="vacancy-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? "Создание..." : "Опубликовать вакансию"}
                    </button>
                </form>
            </div>
        </div>
    );
}
