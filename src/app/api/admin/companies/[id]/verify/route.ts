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

        const { isVerified } = await req.json();

        const company = await prisma.company.update({
            where: { id: companyId },
            data: { isVerified }
        });

        return NextResponse.json(company);
    } catch (error: unknown) {
        console.error("Company verification update error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
