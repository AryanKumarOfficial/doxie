import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";

// Get count of notes in each folder
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Aggregate to count notes per folder
        const folderCounts = await Note.aggregate([
            { $match: { userId: session.user.id } },
            { $group: { _id: "$folder", count: { $sum: 1 } } }
        ]);

        // Convert to a more usable format
        const counts: Record<string, number> = {};
        folderCounts.forEach((item: { _id: string; count: number }) => {
            counts[item._id] = item.count;
        });

        return NextResponse.json({ counts });
    } catch (error: any) {
        console.error("Error fetching folder counts:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch folder counts" },
            { status: 500 }
        );
    }
}