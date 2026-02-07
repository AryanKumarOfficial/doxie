import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw { status: 401, message: "Not authenticated" };
  }
  return session.user.id as string;
}

/* ---------------- GET FOLDERS ---------------- */
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const folders = await prisma.note.findMany({
      where: { userId },
      distinct: ["folder"],
      select: { folder: true },
    });

    // Map to string array and filter nulls
    const folderNames = folders
      .map((f) => f.folder)
      .filter((f): f is string => f !== null);

    return NextResponse.json({ folders: folderNames });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch folders" },
      { status: err.status || 500 }
    );
  }
}

/* ---------------- CREATE FOLDER ---------------- */
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Check if folder already exists
    const exists = await prisma.note.findFirst({
      where: { folder: name, userId },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: `Folder "${name}" already exists` },
        { status: 409 }
      );
    }

    // Create starter note so folder exists
    await prisma.note.create({
      data: {
        title: `${name} - Getting Started`,
        content: `Welcome to "${name}". This is your first note in this folder.`,
        folder: name,
        userId,
        editorType: "rich",
      },
    });

    return NextResponse.json(
      {
        success: true,
        folderName: name,
        message: "Folder created successfully",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create folder" },
      { status: err.status || 500 }
    );
  }
}

/* ---------------- RENAME FOLDER ---------------- */
export async function PUT(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const { oldName, newName } = await req.json();

    if (![oldName, newName].every((n) => n && typeof n === "string")) {
      return NextResponse.json(
        { error: "Both old and new folder names are required" },
        { status: 400 }
      );
    }

    if (oldName === newName) {
      return NextResponse.json(
        { success: false, message: "Old and new folder names are the same" },
        { status: 400 }
      );
    }

    // Conflict check
    const conflict = await prisma.note.findFirst({
      where: { folder: newName, userId },
    });

    if (conflict) {
      return NextResponse.json(
        { success: false, message: `Folder "${newName}" already exists` },
        { status: 409 }
      );
    }

    const result = await prisma.note.updateMany({
      where: { folder: oldName, userId },
      data: { folder: newName },
    });

    return NextResponse.json({
      success: true,
      message: `Folder renamed from "${oldName}" to "${newName}"`,
      modifiedCount: result.count,
      deletedCount: 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to rename folder" },
      { status: err.status || 500 }
    );
  }
}

/* ---------------- DELETE FOLDER ---------------- */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const url = new URL(req.url);
    const name = url.searchParams.get("name");
    const deleteNotes = url.searchParams.get("deleteNotes") === "true";

    if (!name) {
      return NextResponse.json(
        { error: "Folder name is required" },
        { status: 400 }
      );
    }

    let modifiedCount = 0;
    let deletedCount = 0;

    if (deleteNotes) {
      const res = await prisma.note.deleteMany({
        where: { folder: name, userId },
      });
      deletedCount = res.count;
    } else {
      const res = await prisma.note.updateMany({
        where: { folder: name, userId },
        data: { folder: "Default" },
      });
      modifiedCount = res.count;
    }

    return NextResponse.json({
      success: true,
      message: deleteNotes
        ? `Folder "${name}" and all its notes deleted`
        : `Folder "${name}" deleted; notes moved to Default`,
      modifiedCount,
      deletedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete folder" },
      { status: err.status || 500 }
    );
  }
}
