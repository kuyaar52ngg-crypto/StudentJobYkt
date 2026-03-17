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
        const vacancies = await prisma.vacancy.findMany({
            where: { status: "PENDING" },
            include: {
                company: { select: { id: true, name: true, isVerified: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(vacancies);
    } catch (error) {
        console.error("Admin vacancies GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
