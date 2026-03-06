import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";
        const schedule = searchParams.get("schedule") || "";
        const employmentType = searchParams.get("employmentType") || "";
        const categoryId = searchParams.get("categoryId") || "";

        const where: Record<string, unknown> = {
            status: "APPROVED",
        };

        if (q) {
            where.OR = [
                { title: { contains: q } },
                { description: { contains: q } },
            ];
        }

        if (schedule) {
            where.schedule = { in: schedule.split(",") };
        }

        if (employmentType) {
            where.employmentType = { in: employmentType.split(",") };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const vacancies = await prisma.vacancy.findMany({
            where,
            include: {
                company: { select: { id: true, name: true, logo: true } },
                category: { select: { id: true, name: true } },
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(vacancies);
    } catch (error) {
        console.error("Vacancies GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            title,
            description,
            salary,
            salaryMin,
            salaryMax,
            schedule,
            employmentType,
            location,
            requirements,
            userId,
            categoryId,
        } = body;

        if (!title || !description || !userId) {
            return NextResponse.json(
                { error: "Заголовок, описание и автор обязательны" },
                { status: 400 }
            );
        }

        const company = await prisma.company.findUnique({ where: { userId } });
        if (!company) {
            return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
        }

        const vacancy = await prisma.vacancy.create({
            data: {
                title,
                description,
                salary,
                salaryMin: salaryMin ? parseInt(salaryMin) : null,
                salaryMax: salaryMax ? parseInt(salaryMax) : null,
                schedule,
                employmentType,
                location: location || "Якутск",
                requirements,
                companyId: company.id,
                categoryId: categoryId || null,
                status: "PENDING", // Wait for moderator approval
            },
        });

        return NextResponse.json(vacancy, { status: 201 });
    } catch (error) {
        console.error("Vacancy POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
