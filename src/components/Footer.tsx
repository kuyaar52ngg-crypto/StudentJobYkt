import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[var(--header-dark)] text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-xl shadow-lg border border-white/5 object-contain" quality={95} />
                            <span className="text-white text-sm font-bold">StudentJobYkt</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                            Платформа для поиска первой работы, стажировок и практик для студентов Якутска.
                        </p>
                    </div>

                    {/* Students */}
                    <div>
                        <h4 className="text-white font-semibold text-xs mb-2">Студентам</h4>
                        <ul className="space-y-1 text-xs">
                            <li><Link href="/vacancies" className="hover:text-white transition-colors">Вакансии</Link></li>
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Регистрация</Link></li>
                        </ul>
                    </div>

                    {/* Employers */}
                    <div>
                        <h4 className="text-white font-semibold text-xs mb-2">Работодателям</h4>
                        <ul className="space-y-1 text-xs">
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Разместить вакансию</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-xs mb-2">Контакты</h4>
                        <ul className="space-y-1 text-xs">
                            <li>г. Якутск, Республика Саха</li>
                            <li>info@studentjobykt.ru</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-4 pt-3 text-xs text-center">
                    © {new Date().getFullYear()} StudentJobYkt. Все права защищены.
                </div>
            </div>
        </footer>
    );
}
