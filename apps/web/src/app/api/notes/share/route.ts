import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";

// Share a note with other users
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { noteId, emails, isPublic } = await req.json();

        if (!noteId) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
        }

        // Check if the note exists and belongs to the current user
        const note = await prisma.note.findFirst({
            where: {
                id: noteId,
                userId: session.user.id
            }
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to share it" },
                { status: 404 }
            );
        }

        const updateData: any = {};

        // Handle public sharing
        if (isPublic !== undefined) {
            updateData.isPublic = isPublic;
        }

        // Handle sharing with specific users
        if (emails) {
             // Validate emails are emails? Mongoose did it.
             // We can do it here if we want, or rely on frontend.
             if (!Array.isArray(emails)) {
                 return NextResponse.json({ error: "Emails must be an array" }, { status: 400 });
             }

             // In legacy code, it fetched users to get IDs.
             // We decided to store emails in sharedWith (String[]) based on Schema and GET route.

             // Optional: Check if users exist in our DB?
             // Mongoose code: const users = await User.find({ email: { $in: emails } });
             // If we strictly want to share only with existing users, we should check.
             // But for invites, we might want to allow sharing with non-existing users.
             // The legacy code errored if users were not found. I will replicate that behavior for safety.

             if (emails.length > 0) {
                 const users = await prisma.user.findMany({
                     where: { email: { in: emails } },
                     select: { email: true }
                 });

                 // If the requirement is strict "Must be existing users":
                 if (users.length === 0) {
                     return NextResponse.json(
                         { error: "No valid users found with the provided emails" },
                         { status: 400 }
                     );
                 }

                 // We store emails.
                 updateData.sharedWith = users.map(u => u.email);
             } else {
                 updateData.sharedWith = []; // Clear shares
             }
        }

        // Update the note with sharing information
        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: updateData
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
