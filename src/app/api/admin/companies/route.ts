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

        const companies = await prisma.company.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isBlocked: true,
                    },
                },
                _count: {
                    select: { vacancies: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(companies);
    } catch (error: unknown) {
        console.error("Admin companies GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
