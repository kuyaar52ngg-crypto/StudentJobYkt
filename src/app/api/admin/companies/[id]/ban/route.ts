import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: companyId } = await params;
        const user = getUserFromRequest(req);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isBlocked } = await req.json();

        // Find the company to get its userId
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { userId: true },
        });

        if (!company) {
            return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
        }

        // Update the user's isBlocked status
        const updatedUser = await prisma.user.update({
            where: { id: company.userId },
            data: { isBlocked },
            select: { id: true, isBlocked: true },
        });

        return NextResponse.json(updatedUser);
    } catch (error: unknown) {
        console.error("Company ban/unban error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
