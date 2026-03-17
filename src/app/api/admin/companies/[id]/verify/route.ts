import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getUserFromRequest(req);
        if (!user || user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { isVerified } = await req.json();
        const companyId = params.id;

        const company = await prisma.company.update({
            where: { id: companyId },
            data: { isVerified }
        });

        return NextResponse.json(company);
    } catch (error: any) {
        console.error("Company verification update error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
