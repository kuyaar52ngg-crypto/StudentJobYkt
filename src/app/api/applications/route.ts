import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "STUDENT") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { vacancyId } = await req.json();
        const userId = user.userId;

        if (!vacancyId) {
            return NextResponse.json({ error: "vacancyId required" }, { status: 400 });
        }

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

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (user.role === "STUDENT") {
            const applications = await prisma.application.findMany({
                where: { userId: user.userId },
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
        } else if (user.role === "EMPLOYER" || user.role === "ADMIN") {
            const { searchParams } = new URL(req.url);
            const vacancyId = searchParams.get("vacancyId");
            
            const where: Record<string, unknown> = {};
            if (vacancyId) {
                where.vacancyId = vacancyId;
            } else if (user.role === "EMPLOYER") {
                const company = await prisma.company.findUnique({ where: { userId: user.userId } });
                if (company) {
                    const companyVacancies = await prisma.vacancy.findMany({ where: { companyId: company.id }, select: { id: true } });
                    where.vacancyId = { in: companyVacancies.map((v: { id: string }) => v.id) };
                }
            }

            const applications = await prisma.application.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, university: true, resumeUrl: true, phone: true, skills: true, major: true, gender: true } },
                    vacancy: {
                        include: {
                            company: { select: { id: true, name: true, logo: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(applications);
        }

        return NextResponse.json([]);
    } catch (error) {
        console.error("Applications GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
