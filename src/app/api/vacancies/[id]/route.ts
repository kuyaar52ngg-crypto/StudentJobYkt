import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        let vacancy;
        try {
            vacancy = await prisma.vacancy.findUnique({
                where: { id },
                include: {
                    company: true,
                    category: true,
                    _count: { select: { applications: true } },
                },
            });
        } catch (error) {
            console.error("Single vacancy GET safe fallback:", error);
            vacancy = await prisma.vacancy.findUnique({
                where: { id },
                select: {
                    id: true, title: true, description: true, salary: true,
                    schedule: true, employmentType: true, location: true,
                    requirements: true, companyId: true, categoryId: true,
                    status: true, createdAt: true, updatedAt: true,
                    company: true,
                    category: true,
                    _count: { select: { applications: true } },
                },
            });
        }

        if (!vacancy) {
            return NextResponse.json({ error: "Вакансия не найдена" }, { status: 404 });
        }

        return NextResponse.json(vacancy);
    } catch (error) {
        console.error("Vacancy GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Check ownership
        const vacancy = await prisma.vacancy.findUnique({
            where: { id },
            include: { company: true }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Не найдено" }, { status: 404 });
        }

        if (user.role !== "ADMIN" && vacancy.company.userId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let updated;
        try {
            updated = await prisma.vacancy.update({
                where: { id },
                data: body,
            });
        } catch (error) {
            console.error("Vacancy PUT safe fallback:", error);
            const { salaryMin, salaryMax, currency, ...safeData } = body;
            updated = await prisma.vacancy.update({
                where: { id },
                data: safeData,
            });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Vacancy PUT error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = getUserFromRequest(req);
        if (!user || (user.role !== "EMPLOYER" && user.role !== "ADMIN")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check ownership/role
        const vacancy = await prisma.vacancy.findUnique({
            where: { id },
            include: { company: true }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Не найдено" }, { status: 404 });
        }

        if (user.role !== "ADMIN" && vacancy.company.userId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete related records first to avoid FK constraint errors
        await prisma.application.deleteMany({ where: { vacancyId: id } });
        await prisma.favorite.deleteMany({ where: { vacancyId: id } });
        await prisma.vacancy.delete({ where: { id } });
        return NextResponse.json({ message: "Вакансия удалена" });
    } catch (error) {
        console.error("Vacancy DELETE error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
