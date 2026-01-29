import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";

async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw { status: 401, message: "Not authenticated" };
    }
    return session.user.id as string;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await requireAuth();
        await connectToDatabase();
        const folders = await Note.distinct<string>("folder", { userId });
        return NextResponse.json({ folders });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to fetch folders" },
            { status: err.status || 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await requireAuth();
        const { name } = await req.json();
        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
        }

        await connectToDatabase();
        const exists = await Note.exists({ folder: name, userId });
        if (exists) {
            return NextResponse.json(
                { success: false, message: `Folder "${name}" already exists` },
                { status: 409 }
            );
        }

        const note = new Note({
            title: `${name} - Getting Started`,
            content: `Welcome to "${name}". This is your first note in this folder.`,
            folder: name,
            userId,
            editorType: "rich",
        });
        await note.save();

        return NextResponse.json(
            { success: true, folderName: name, message: "Folder created successfully" },
            { status: 201 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to create folder" },
            { status: err.status || 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await requireAuth();
        const { oldName, newName } = await req.json();
        if (![oldName, newName].every(n => n && typeof n === "string")) {
            return NextResponse.json(
                { error: "Both old and new folder names are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        if (oldName === newName) {
            return NextResponse.json(
                { success: false, message: "Old and new folder names are the same" },
                { status: 400 }
            );
        }

        // Check if the target newName already exists
        const conflict = await Note.exists({ folder: newName, userId });
        if (conflict) {
            return NextResponse.json(
                { success: false, message: `Folder "${newName}" already exists` },
                { status: 409 }
            );
        }

        const result = await Note.updateMany(
            { folder: oldName, userId },
            { $set: { folder: newName } }
        );

        return NextResponse.json({
            success: true,
            message: `Folder renamed from "${oldName}" to "${newName}"`,
            modifiedCount: result.modifiedCount,
            deletedCount: 0,
        });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to rename folder" },
            { status: err.status || 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = await requireAuth();
        const url = new URL(req.url);
        const name = url.searchParams.get("name");
        const deleteNotes = url.searchParams.get("deleteNotes") === "true";

        if (!name) {
            return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
        }

        await connectToDatabase();

        let modifiedCount = 0;
        let deletedCount = 0;

        if (deleteNotes) {
            const res = await Note.deleteMany({ folder: name, userId });
            deletedCount = res.deletedCount ?? 0;
        } else {
            const res = await Note.updateMany(
                { folder: name, userId },
                { $set: { folder: "Default" } }
            );
            modifiedCount = res.modifiedCount;
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
