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
        const vacancy = await prisma.vacancy.findUnique({
            where: { id },
            include: {
                company: true,
                category: true,
                _count: { select: { applications: true } },
            },
        });

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
        if (!user || user.role !== "EMPLOYER") {
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

        if (vacancy.company.userId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.vacancy.update({
            where: { id },
            data: body,
        });

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
        if (!user || user.role !== "EMPLOYER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check ownership
        const vacancy = await prisma.vacancy.findUnique({
            where: { id },
            include: { company: true }
        });

        if (!vacancy) {
            return NextResponse.json({ error: "Не найдено" }, { status: 404 });
        }

        if (vacancy.company.userId !== user.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.vacancy.delete({ where: { id } });
        return NextResponse.json({ message: "Вакансия удалена" });
    } catch (error) {
        console.error("Vacancy DELETE error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
