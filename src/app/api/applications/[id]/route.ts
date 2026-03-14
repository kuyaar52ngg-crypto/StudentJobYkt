import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

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
        const { status } = await req.json();

        if (!["PENDING", "INVITED", "REJECTED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        const application = await prisma.application.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(application);
    } catch (error) {
        console.error("Application PUT error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
