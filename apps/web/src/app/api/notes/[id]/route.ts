import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";

// Helper to validate MongoDB ID
function isValidMongoId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}

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

        // Validate ID format
        if (!isValidMongoId(id)) {
            return NextResponse.json(
                { error: "Invalid note ID format" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const note = await Note.findOne({
            _id: id,
            $or: [
                { userId: session.user.id },
                { isPublic: true },
                { sharedWith: { $elemMatch: { $eq: session.user.email } } }
            ]
        }).lean();

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to view it" },
                { status: 404 }
            );
        }

        // Update lastAccessed timestamp without waiting for completion
        Note.findByIdAndUpdate(id, { lastAccessed: new Date() }).catch(err => {
            console.error("Error updating lastAccessed timestamp:", err);
        });

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

        // Validate ID format
        if (!isValidMongoId(id)) {
            return NextResponse.json(
                { error: "Invalid note ID format" },
                { status: 400 }
            );
        }

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

        await connectToDatabase();

        // Only allow updating own notes
        const note = await Note.findOne({
            _id: id,
            userId: session.user.id
        });

        if (!note) {
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
        const updateData = {
            ...body,
            lastAccessed: new Date(),
            updatedAt: new Date()
        };

        // Prevent changing userId - security measure
        delete updateData.userId;

        const updatedNote = await Note.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).lean();

        return NextResponse.json({
            data: updatedNote,
            message: "Note updated successfully"
        });
    } catch (error: any) {
        console.error("Error updating note:", error);

        // Different responses based on error type
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Invalid note data: " + error.message },
                { status: 400 }
            );
        }

        if (error.name === 'CastError') {
            return NextResponse.json(
                { error: "Invalid data format" },
                { status: 400 }
            );
        }

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

        const { id } =await params;

        // Validate ID format
        if (!isValidMongoId(id)) {
            return NextResponse.json(
                { error: "Invalid note ID format" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Only allow deleting own notes
        const note = await Note.findOne({
            _id: id,
            userId: session.user.id
        });

        if (!note) {
            return NextResponse.json(
                { error: "Note not found or you don't have permission to delete it" },
                { status: 404 }
            );
        }

        await Note.findByIdAndDelete(id);

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