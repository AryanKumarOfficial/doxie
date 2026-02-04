import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";

// Get count of notes in each folder
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Aggregate to count notes per folder
        const folderCounts = await prisma.note.groupBy({
            by: ['folder'],
            _count: {
                _all: true
            },
            where: {
                userId: session.user.id
            }
        });

        // Convert to a more usable format
        const counts: Record<string, number> = {};

        folderCounts.forEach((item) => {
            if (item.folder) {
                counts[item.folder] = item._count._all;
            }
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
