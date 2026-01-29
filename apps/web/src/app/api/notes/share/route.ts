import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";
import User from "@/models/User";

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

        await connectToDatabase();

        // Check if the note exists and belongs to the current user
        const note = await Note.findOne({
            _id: noteId,
            userId: session.user.id
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
        if (emails && emails.length > 0) {
            // Find users by email
            const users = await User.find({ email: { $in: emails } });

            if (users.length === 0) {
                return NextResponse.json(
                    { error: "No valid users found with the provided emails" },
                    { status: 400 }
                );
            }

            const userIds = users.map(user => user._id);
            updateData.sharedWith = userIds;
        }

        // Update the note with sharing information
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            updateData,
            { new: true }
        );

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