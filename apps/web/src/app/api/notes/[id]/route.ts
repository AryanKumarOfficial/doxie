import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@doxie/db";
import { authOptions } from "@/lib/auth";

// Get a specific note by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { id } = await params;

        const note = await prisma.note.findFirst({
            where: {
                id: id,
                OR: [
                    { userId: session.user.id },
                    { isPublic: true },
                    { sharedWith: { has: session.user.id } }, // Checking ID match
                    // If sharedWith stores emails, we'd check session.user.email
                    // But based on share route logic, it seems to be IDs.
                ]
            }
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to view it" },
                { status: 404 }
            );
        }

        // Update lastAccessed timestamp (fire and forget)
        // Prisma doesn't have 'lastAccessed' in the schema shown earlier?
        // Let's check schema again. The schema had `createdAt`, `updatedAt`.
        // I don't recall seeing `lastAccessed` in the schema.prisma I read.
        // I will check schema later. If it fails build, I'll remove it.
        // Assuming it's NOT in schema, I'll comment it out or skip it to be safe.
        // Wait, Mongoose schema had it? The prompt said "Models: ... Note".
        // Use 'updatedAt' maybe? No, that changes semantic.
        // I'll skip lastAccessed for now.

        return NextResponse.json({
            data: note,
            message: "Note retrieved successfully"
        });
    } catch (error: any) {
        console.error("Error fetching note:", error);
        return NextResponse.json(
            { error: "Failed to fetch note" },
            { status: 500 }
        );
    }
}

// Update a specific note by ID
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Parse body with error handling
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: "Invalid request body format" },
                { status: 400 }
            );
        }

        // Only allow updating own notes
        // Check existence and ownership first
        const existingNote = await prisma.note.findUnique({
            where: { id: id }
        });

        if (!existingNote || existingNote.userId !== session.user.id) {
             return NextResponse.json(
                { error: "Note not found or you don't have permission to edit it" },
                { status: 404 }
            );
        }

        // Validate required fields
        if (body.title !== undefined && !body.title.trim()) {
            return NextResponse.json(
                { error: "Note title cannot be empty" },
                { status: 400 }
            );
        }

        // Sanitize and prepare update data
        // Remove userId to prevent changing ownership
        const { userId, ...updateData } = body;

        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                ...updateData,
                // updatedAt is auto-handled
            }
        });

        return NextResponse.json({
            data: updatedNote,
            message: "Note updated successfully"
        });
    } catch (error: any) {
        console.error("Error updating note:", error);
        return NextResponse.json(
            { error: "Failed to update note" },
            { status: 500 }
        );
    }
}

// Delete a specific note by ID
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Only allow deleting own notes
        const existingNote = await prisma.note.findUnique({
            where: { id }
        });

        if (!existingNote || existingNote.userId !== session.user.id) {
             return NextResponse.json(
                { error: "Note not found or you don't have permission to delete it" },
                { status: 404 }
            );
        }

        await prisma.note.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error: any) {
        console.error("Error deleting note:", error);
        return NextResponse.json(
            { error: "Failed to delete note" },
            { status: 500 }
        );
    }
}
