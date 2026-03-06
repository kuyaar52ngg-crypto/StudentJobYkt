import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const [usersCount, vacanciesCount, applicationsCount] = await Promise.all([
            prisma.user.count(),
            prisma.vacancy.count(),
            prisma.application.count(),
        ]);

        const conversionRate = vacanciesCount > 0
            ? Math.round((applicationsCount / vacanciesCount) * 100)
            : 0;

        return NextResponse.json({
            users: usersCount,
            vacancies: vacanciesCount,
            applications: applicationsCount,
            conversionRate,
        });
    } catch (error) {
        console.error("Admin stats GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
