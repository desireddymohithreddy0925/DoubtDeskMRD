import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { classroomFaqsTable } from "@/configs/schema";
import { eq, and, desc } from "drizzle-orm";
import { buildErrorResponse } from "@/lib/errors/error-handler";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const classroomId = parseInt(params.id, 10);
        if (isNaN(classroomId)) {
            return NextResponse.json({ error: "Invalid classroom ID" }, { status: 400 });
        }

        const faqs = await db
            .select({
                id: classroomFaqsTable.id,
                topic: classroomFaqsTable.topic,
                question: classroomFaqsTable.question,
                answer: classroomFaqsTable.answer,
            })
            .from(classroomFaqsTable)
            .where(
                and(
                    eq(classroomFaqsTable.classroomId, classroomId),
                    eq(classroomFaqsTable.isPublished, true)
                )
            )
            .orderBy(desc(classroomFaqsTable.createdAt));

        return NextResponse.json({ success: true, data: faqs });
    } catch (error) {
        const { status, body } = buildErrorResponse(error);
        return NextResponse.json(body, { status });
    }
}
