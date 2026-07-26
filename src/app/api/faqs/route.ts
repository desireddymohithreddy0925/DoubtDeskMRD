import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { classroomFaqsTable, classroomsTable } from "@/configs/schema";
import { eq, and, desc } from "drizzle-orm";
import { buildErrorResponse } from "@/lib/errors/error-handler";

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const email = user.primaryEmailAddress.emailAddress;

        const faqs = await db
            .select({
                id: classroomFaqsTable.id,
                classroomId: classroomFaqsTable.classroomId,
                classroomName: classroomsTable.name,
                topic: classroomFaqsTable.topic,
                question: classroomFaqsTable.question,
                answer: classroomFaqsTable.answer,
                isPublished: classroomFaqsTable.isPublished,
                createdAt: classroomFaqsTable.createdAt,
            })
            .from(classroomFaqsTable)
            .innerJoin(classroomsTable, eq(classroomFaqsTable.classroomId, classroomsTable.id))
            .where(eq(classroomsTable.teacherEmail, email))
            .orderBy(desc(classroomFaqsTable.createdAt));

        return NextResponse.json({ success: true, data: faqs });
    } catch (error) {
        const { status, body } = buildErrorResponse(error);
        return NextResponse.json(body, { status });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const user = await currentUser();
        if (!user?.primaryEmailAddress?.emailAddress) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const email = user.primaryEmailAddress.emailAddress;

        const body = await req.json();
        const { id, isPublished } = body as { id: number; isPublished: boolean };

        if (!id || typeof isPublished !== "boolean") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Verify ownership
        const [faq] = await db
            .select({ id: classroomFaqsTable.id })
            .from(classroomFaqsTable)
            .innerJoin(classroomsTable, eq(classroomFaqsTable.classroomId, classroomsTable.id))
            .where(and(eq(classroomFaqsTable.id, id), eq(classroomsTable.teacherEmail, email)));

        if (!faq) {
            return NextResponse.json({ error: "FAQ not found or unauthorized" }, { status: 404 });
        }

        await db
            .update(classroomFaqsTable)
            .set({ isPublished })
            .where(eq(classroomFaqsTable.id, id));

        return NextResponse.json({ success: true, isPublished });
    } catch (error) {
        const { status, body } = buildErrorResponse(error);
        return NextResponse.json(body, { status });
    }
}
