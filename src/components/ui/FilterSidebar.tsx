"use client";

import { useState } from "react";

interface FilterSidebarProps {
    onFilterChange?: (filters: Record<string, string[]>) => void;
    onReset?: () => void;
}

const scheduleOptions = [
    { value: "Полная занятость", label: "Полная занятость" },
    { value: "Частичная занятость", label: "Частичная занятость" },
    { value: "Стажировка", label: "Стажировка" },
    { value: "Проектная работа", label: "Проектная работа" },
    { value: "Удалённая работа", label: "Удалённая работа" },
];

const employmentOptions = [
    { value: "Вакансия", label: "Вакансия" },
    { value: "Стажировка", label: "Стажировка" },
    { value: "Практика", label: "Практика" },
];

export default function FilterSidebar({ onFilterChange, onReset }: FilterSidebarProps) {
    const [selectedSchedule, setSelectedSchedule] = useState<string[]>([]);
    const [selectedEmployment, setSelectedEmployment] = useState<string[]>([]);

    const toggleFilter = (
        value: string,
        current: string[],
        setter: (v: string[]) => void,
        key: string
    ) => {
        const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        setter(next);
        onFilterChange?.({
            schedule: key === "schedule" ? next : selectedSchedule,
            employmentType: key === "employmentType" ? next : selectedEmployment,
        });
    };

    return (
        <aside className="w-full lg:w-60 shrink-0">
            <div className="sticky top-20">
                <div className="mb-6">
                    <h3 className="font-semibold text-sm mb-3 flex items-center justify-between">
                        Фильтры
                        <button
                            className="text-xs text-[var(--primary)] hover:underline font-normal"
                            onClick={() => {
                                setSelectedSchedule([]);
                                setSelectedEmployment([]);
                                onFilterChange?.({ schedule: [], employmentType: [] });
                                onReset?.();
                            }}
                        >
                            Сбросить
                        </button>
                    </h3>
                </div>

                {/* Schedule */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                        График работы
                    </h4>
                    <div className="space-y-2">
                        {scheduleOptions.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedSchedule.includes(opt.value)}
                                    onChange={() =>
                                        toggleFilter(opt.value, selectedSchedule, setSelectedSchedule, "schedule")
                                    }
                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Employment type */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                        Тип занятости
                    </h4>
                    <div className="space-y-2">
                        {employmentOptions.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedEmployment.includes(opt.value)}
                                    onChange={() =>
                                        toggleFilter(
                                            opt.value,
                                            selectedEmployment,
                                            setSelectedEmployment,
                                            "employmentType"
                                        )
                                    }
                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] accent-[var(--primary)]"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
