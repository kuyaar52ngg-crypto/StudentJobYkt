import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
    } catch (error: any) {
        console.error("Vacancies GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера", message: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "EMPLOYER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = user.userId;

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
            categoryId,
        } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Заголовок и описание обязательны" },
                { status: 400 }
            );
        }

        const company = await prisma.company.findUnique({ where: { userId } });
        if (!company) {
            return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
        }

        const salaryMinInt = salaryMin ? parseInt(String(salaryMin)) : null;
        const salaryMaxInt = salaryMax ? parseInt(String(salaryMax)) : null;

        const vacancy = await prisma.vacancy.create({
            data: {
                title,
                description,
                salary: salary || null,
                salaryMin: (salaryMinInt !== null && !isNaN(salaryMinInt)) ? salaryMinInt : null,
                salaryMax: (salaryMaxInt !== null && !isNaN(salaryMaxInt)) ? salaryMaxInt : null,
                schedule,
                employmentType,
                location: location || "Якутск",
                requirements: requirements || null,
                companyId: company.id,
                categoryId: categoryId || null,
                status: "PENDING", // Wait for moderator approval
            },
        });

        return NextResponse.json(vacancy, { status: 201 });
    } catch (error: any) {
        console.error("Vacancy POST error details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        return NextResponse.json({ 
            error: "Ошибка сервера", 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
