"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        if (form.password.length < 6) {
            setError("Пароль должен содержать минимум 6 символов");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: form.role,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Ошибка регистрации");
                setLoading(false);
                return;
            }

            router.push("/auth/login?registered=true");
        } catch {
            setError("Ошибка сервера");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-8">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                            SJ
                        </div>
                        <h1 className="text-2xl font-bold">Регистрация</h1>
                        <p className="text-sm text-[var(--muted)] mt-2">
                            Создайте аккаунт для начала поиска работы
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Role selector */}
                        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, role: "STUDENT" })}
                                className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${form.role === "STUDENT"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-[var(--muted)] hover:text-foreground"
                                    }`}
                            >
                                👨‍🎓 Студент
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, role: "EMPLOYER" })}
                                className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${form.role === "EMPLOYER"
                                        ? "bg-white text-foreground shadow-sm"
                                        : "text-[var(--muted)] hover:text-foreground"
                                    }`}
                            >
                                🏢 Работодатель
                            </button>
                        </div>

                        <div>
                            <label htmlFor="register-name" className="block text-sm font-medium mb-1.5">
                                {form.role === "STUDENT" ? "ФИО" : "Название компании"}
                            </label>
                            <input
                                id="register-name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                placeholder={form.role === "STUDENT" ? "Иванов Иван Иванович" : "ООО «Компания»"}
                            />
                        </div>

                        <div>
                            <label htmlFor="register-email" className="block text-sm font-medium mb-1.5">
                                Email
                            </label>
                            <input
                                id="register-email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                placeholder="student@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="register-password" className="block text-sm font-medium mb-1.5">
                                Пароль
                            </label>
                            <input
                                id="register-password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                placeholder="Минимум 6 символов"
                            />
                        </div>

                        <div>
                            <label htmlFor="register-confirm" className="block text-sm font-medium mb-1.5">
                                Подтвердите пароль
                            </label>
                            <input
                                id="register-confirm"
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            id="register-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? "Регистрация..." : "Зарегистрироваться"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--muted)] mt-6">
                        Уже есть аккаунт?{" "}
                        <Link href="/auth/login" className="text-[var(--primary)] hover:underline font-medium">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
