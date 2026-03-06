import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 });
        }

        const company = await prisma.company.findUnique({ where: { userId } });

        if (!company) {
            return NextResponse.json([]); // No company = no vacancies
        }

        const vacancies = await prisma.vacancy.findMany({
            where: { companyId: company.id },
            include: {
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(vacancies);
    } catch (error) {
        console.error("Employer vacancies GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
