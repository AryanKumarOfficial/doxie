import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@doxie/db";
import { authOptions } from "@/lib/auth";

// Share a note with other users
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { noteId, emails, isPublic } = await req.json();

        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        // Check if the note exists and belongs to the current user
        const note = await prisma.note.findUnique({
            where: { id: noteId }
        });

        if (!note || note.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to share it" },
                { status: 404 }
            );
        }

        const data: any = {};

        // Handle public sharing
        if (isPublic !== undefined) {
            data.isPublic = isPublic;
        }

        // Handle sharing with specific users
        if (emails && Array.isArray(emails)) {
            if (emails.length > 0) {
                // Find users by email
                const users = await prisma.user.findMany({
                    where: { email: { in: emails } }
                });

                if (users.length === 0) {
                    return NextResponse.json(
                        { error: "No valid users found with the provided emails" },
                        { status: 400 }
                    );
                }

                const userIds = users.map(user => user.id);
                data.sharedWith = userIds;
            } else {
                // Empty array clears sharing
                data.sharedWith = [];
            }
        }

        // Update the note
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data
        });

        return NextResponse.json({
            success: true,
            note: updatedNote
        });

    } catch (error: any) {
        console.error("Error sharing note:", error);
        return NextResponse.json(
            { error: error.message || "Failed to share note" },
            { status: 500 }
        );
    }
}
