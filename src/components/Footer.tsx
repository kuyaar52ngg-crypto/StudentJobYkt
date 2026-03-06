import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[var(--header-dark)] text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                                SJ
                            </div>
                            <span className="text-white text-lg font-bold">StudentJobYkt</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Платформа для поиска первой работы, стажировок и практик для студентов Якутска.
                        </p>
                    </div>

                    {/* Students */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Студентам</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/vacancies" className="hover:text-white transition-colors">Вакансии</Link></li>
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Регистрация</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Employers */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Работодателям</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Разместить вакансию</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">О платформе</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Контакты</h4>
                        <ul className="space-y-2 text-sm">
                            <li>г. Якутск, Республика Саха</li>
                            <li>info@studentjobykt.ru</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-6 text-xs text-center">
                    © {new Date().getFullYear()} StudentJobYkt. Все права защищены.
                </div>
            </div>
        </footer>
    );
}
