import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const favorites = await prisma.favorite.findMany({
            where: { userId: user.userId },
            include: {
                vacancy: {
                    include: {
                        company: { select: { id: true, name: true, logo: true, isVerified: true } },
                        category: { select: { id: true, name: true } },
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(favorites.map((f: any) => f.vacancy));
    } catch (error: any) {
        console.error("Favorites GET error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { vacancyId } = await req.json();
        if (!vacancyId) {
            return NextResponse.json({ error: "vacancyId is required" }, { status: 400 });
        }

        // Check if already exists
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_vacancyId: {
                    userId: user.userId,
                    vacancyId
                }
            }
        });

        if (existing) {
            // Remove
            await prisma.favorite.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ message: "Удалено из избранного", active: false });
        } else {
            // Add
            await prisma.favorite.create({
                data: {
                    userId: user.userId,
                    vacancyId
                }
            });
            return NextResponse.json({ message: "Добавлено в избранное", active: true });
        }
    } catch (error: any) {
        console.error("Favorites POST error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
