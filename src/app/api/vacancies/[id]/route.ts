import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
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
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const vacancy = await prisma.vacancy.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(vacancy);
    } catch (error) {
        console.error("Vacancy PUT error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.vacancy.delete({ where: { id } });
        return NextResponse.json({ message: "Вакансия удалена" });
    } catch (error) {
        console.error("Vacancy DELETE error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
