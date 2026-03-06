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

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: {
                        company: { select: { id: true, name: true, logo: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error("Favorites GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId, vacancyId } = await req.json();

        if (!userId || !vacancyId) {
            return NextResponse.json(
                { error: "userId and vacancyId are required" },
                { status: 400 }
            );
        }

        const existing = await prisma.favorite.findUnique({
            where: { userId_vacancyId: { userId, vacancyId } },
        });

        if (existing) {
            return NextResponse.json(
                { error: "Уже в избранном" },
                { status: 409 }
            );
        }

        const favorite = await prisma.favorite.create({
            data: { userId, vacancyId },
        });

        return NextResponse.json(favorite, { status: 201 });
    } catch (error) {
        console.error("Favorites POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const vacancyId = searchParams.get("vacancyId");

        if (!userId || !vacancyId) {
            return NextResponse.json(
                { error: "userId and vacancyId are required" },
                { status: 400 }
            );
        }

        await prisma.favorite.delete({
            where: { userId_vacancyId: { userId, vacancyId } },
        });

        return NextResponse.json({ message: "Удалено из избранного" });
    } catch (error) {
        console.error("Favorites DELETE error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
