import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
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
