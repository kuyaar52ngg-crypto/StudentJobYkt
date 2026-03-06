import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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
        console.error("Application PATCH error:", error);
        return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
    }
}
