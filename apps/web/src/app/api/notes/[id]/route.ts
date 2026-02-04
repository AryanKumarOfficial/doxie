import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";

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
                    { sharedWith: { has: session.user.email } } // Assuming sharedWith contains emails
                ]
            }
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to view it" },
                { status: 404 }
            );
        }

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
        const existingNote = await prisma.note.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (!existingNote) {
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
        const updateData: any = {
            ...body
        };

        // Prevent changing userId - security measure
        delete updateData.userId;
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const updatedNote = await prisma.note.update({
            where: { id },
            data: updateData
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
        const note = await prisma.note.findFirst({
            where: {
                id: id,
                userId: session.user.id
            }
        });

        if (!note) {
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
