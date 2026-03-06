"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
    { href: "/", label: "Поиск работы" },
    { href: "/vacancies", label: "Вакансии" },
    { href: "/about", label: "О нас" },
    { href: "/faq", label: "FAQ" },
];

const roleLinks: Record<string, { href: string; label: string }> = {
    STUDENT: { href: "/dashboard", label: "Кабинет" },
    EMPLOYER: { href: "/employer", label: "Кабинет" },
    ADMIN: { href: "/admin", label: "Админ-панель" },
};

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { data: session, status } = useSession();
    const user = session?.user as { name?: string; role?: string } | undefined;

    return (
        <header className="bg-[var(--header-dark)] text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top bar */}
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                            SJ
                        </div>
                        <span className="text-lg font-bold tracking-tight hidden sm:inline">
                            StudentJobYkt
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm transition-colors hover:text-white ${pathname === link.href
                                    ? "text-white font-semibold"
                                    : "text-gray-400"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Location */}
                        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Якутск</span>
                        </div>

                        {/* Auth area */}
                        {status === "loading" ? (
                            <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
                        ) : session && user ? (
                            <div className="flex items-center gap-3">
                                {/* Role-based cabinet link */}
                                {user.role && roleLinks[user.role] && (
                                    <Link
                                        href={roleLinks[user.role].href}
                                        className="text-xs text-gray-300 hover:text-white transition-colors hidden sm:inline"
                                    >
                                        {roleLinks[user.role].label}
                                    </Link>
                                )}
                                {/* User name */}
                                <span className="text-xs text-gray-300 hidden sm:inline">
                                    {user.name}
                                </span>
                                {/* Sign out */}
                                <button
                                    id="header-signout"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-xs text-gray-300 hover:text-white transition-colors hidden sm:inline"
                                >
                                    Войти
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                                >
                                    Регистрация
                                </Link>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            id="mobile-menu-toggle"
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <nav className="md:hidden pb-4 border-t border-white/10 pt-3 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`text-sm px-2 py-1.5 rounded-lg transition-colors ${pathname === link.href
                                    ? "text-white bg-white/10"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session && user?.role && roleLinks[user.role] && (
                            <Link
                                href={roleLinks[user.role].href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                            >
                                {roleLinks[user.role].label}
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
