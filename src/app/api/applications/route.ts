import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { userId, vacancyId } = await req.json();

        if (!userId || !vacancyId) {
            return NextResponse.json(
                { error: "userId and vacancyId are required" },
                { status: 400 }
            );
        }

        // Check if already applied
        const existing = await prisma.application.findUnique({
            where: { userId_vacancyId: { userId, vacancyId } },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Вы уже откликнулись на эту вакансию" },
                { status: 409 }
            );
        }

        const application = await prisma.application.create({
            data: { userId, vacancyId },
        });

        return NextResponse.json(application, { status: 201 });
    } catch (error) {
        console.error("Application POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const vacancyId = searchParams.get("vacancyId");

        const where: Record<string, string> = {};
        if (userId) where.userId = userId;
        if (vacancyId) where.vacancyId = vacancyId;

        const applications = await prisma.application.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, university: true, resumeUrl: true } },
                vacancy: {
                    include: {
                        company: { select: { id: true, name: true, logo: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(applications);
    } catch (error) {
        console.error("Applications GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
