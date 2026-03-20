"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
    const { login } = useAuth();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

            // Auto-login after registration
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: form.email, password: form.password }),
            });

            if (loginRes.ok) {
                const user = await loginRes.json();
                await login(user);
            } else {
                // Fallback: redirect to home
                window.location.href = "/";
            }
        } catch {
            setError("Ошибка сервера");
            setLoading(false);
        }
    };

    const EyeIcon = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
        >
            {show ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            )}
        </button>
    );

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] shadow-[var(--card-shadow)] p-8">
                    <div className="text-center mb-8">
                        <Image
                            src="/logo.png"
                            alt="SJ Logo"
                            width={48}
                            height={48}
                            className="rounded-xl object-contain mx-auto"
                            quality={95}
                        />
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
                            <div className="relative">
                                <input
                                    id="register-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                    placeholder="Минимум 6 символов"
                                />
                                <EyeIcon show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="register-confirm" className="block text-sm font-medium mb-1.5">
                                Подтвердите пароль
                            </label>
                            <div className="relative">
                                <input
                                    id="register-confirm"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <EyeIcon show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                            </div>
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
