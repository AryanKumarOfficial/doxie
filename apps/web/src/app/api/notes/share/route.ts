import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@doxie/db";
import { authOptions } from "@/lib/auth";

// Share a note with other users
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { noteId, emails, isPublic } = await req.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Ensure note exists and belongs to current user
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found or you don't have permission to share it" },
        { status: 404 }
      );
    }

    const data: any = {};

    /* ---------- PUBLIC SHARING ---------- */
    if (isPublic !== undefined) {
      data.isPublic = isPublic;
    }

    /* ---------- SHARE WITH USERS ---------- */
    if (emails !== undefined) {
      if (!Array.isArray(emails)) {
        return NextResponse.json(
          { error: "Emails must be an array" },
          { status: 400 }
        );
      }

      if (emails.length === 0) {
        // Clear sharing
        data.sharedWith = [];
      } else {
        // Find existing users by email
        const users = await prisma.user.findMany({
          where: { email: { in: emails } },
          select: { id: true },
        });

        if (users.length === 0) {
          return NextResponse.json(
            { error: "No valid users found with the provided emails" },
            { status: 400 }
          );
        }

        // Store USER IDs, not emails
        data.sharedWith = users.map((u) => u.id);
      }
    }

    /* ---------- UPDATE NOTE ---------- */
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data,
    });

    return NextResponse.json({
      success: true,
      note: updatedNote,
    });
  } catch (error: any) {
    console.error("Error sharing note:", error);
    return NextResponse.json(
      { error: error.message || "Failed to share note" },
      { status: 500 }
    );
  }
}
