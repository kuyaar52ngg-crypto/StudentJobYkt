"use client";

import { useState } from "react";

import SalarySlider from "./SalarySlider";

interface FilterSidebarProps {
    onFilterChange?: (filters: Record<string, any>) => void;
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
    const [salaryRange, setSalaryRange] = useState<[number, number]>([0, 300000]);

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
        const nextObj = {
            schedule: key === "schedule" ? next : selectedSchedule,
            employmentType: key === "employmentType" ? next : selectedEmployment,
            salaryMin: salaryRange[0] > 0 ? salaryRange[0] : undefined,
            salaryMax: salaryRange[1] < 300000 ? salaryRange[1] : undefined,
        };
        onFilterChange?.(nextObj);
    };

    const handleSalaryChange = (newRange: [number, number]) => {
        setSalaryRange(newRange);
        // Do not call onFilterChange immediately on every pixel move to avoid lag,
        // Wait, since we don't have a debounce right now, let's just update. 
        // We'll update state, but maybe send to parent only on mouseup if it was a heavy operation, 
        // but here it's fine. Next.js fetch is in useEffect. We'll rely on React state batching.
    };

    const applySalaryFilter = () => {
        onFilterChange?.({
            schedule: selectedSchedule,
            employmentType: selectedEmployment,
            salaryMin: salaryRange[0] > 0 ? salaryRange[0] : undefined,
            salaryMax: salaryRange[1] < 300000 ? salaryRange[1] : undefined,
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
                                setSalaryRange([0, 300000]);
                                onFilterChange?.({ schedule: [], employmentType: [] });
                                onReset?.();
                            }}
                        >
                            Сбросить
                        </button>
                    </h3>
                </div>

                {/* Salary Filter */}
                <div className="mb-6">
                    <h4 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                        Зарплата (₽)
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="От"
                                value={salaryRange[0] || ""}
                                onChange={(e) => {
                                    const val = Math.min(Number(e.target.value), salaryRange[1]);
                                    setSalaryRange([val, salaryRange[1]]);
                                    applySalaryFilter();
                                }}
                                onBlur={applySalaryFilter}
                                className="w-1/2 rounded-[var(--radius-button)] border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                            />
                            <span className="text-[var(--muted)]">-</span>
                            <input
                                type="number"
                                placeholder="До"
                                value={salaryRange[1] || ""}
                                onChange={(e) => {
                                    const val = Math.max(Number(e.target.value), salaryRange[0]);
                                    setSalaryRange([salaryRange[0], val]);
                                    applySalaryFilter();
                                }}
                                onBlur={applySalaryFilter}
                                className="w-1/2 rounded-[var(--radius-button)] border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                            />
                        </div>
                        <div className="px-2" onMouseUp={applySalaryFilter} onTouchEnd={applySalaryFilter}>
                            <SalarySlider
                                min={0}
                                max={300000}
                                step={5000}
                                value={salaryRange}
                                onChange={handleSalaryChange}
                            />
                        </div>
                    </div>
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
