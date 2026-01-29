import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("query") || "";
        const tagsOnly = url.searchParams.get("tagsOnly") === "true";
        const tag = url.searchParams.get("tag");
        const folder = url.searchParams.get("folder");
        const editorType = url.searchParams.get("editorType");
        const isFavorite = url.searchParams.get("isFavorite") === "true" ? true : undefined;
        const isPinned = url.searchParams.get("isPinned") === "true" ? true : undefined;
        const isPublic = url.searchParams.get("isPublic") === "true" ? true : undefined;
        const hasShares = url.searchParams.get("hasShares") === "true";
        const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 20;
        const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0;
        const sort = url.searchParams.get("sort") || "-updatedAt"; // Default sort by updatedAt desc

        await connectToDatabase();

        // If we only need to return tags, get distinct tags for the user
        if (tagsOnly) {
            const tags = await Note.distinct("tags", { 
                userId: session.user.id,
                tags: { $exists: true, $ne: [] }
            });
            
            return NextResponse.json({ tags });
        }

        // Build the search query
        const searchQuery: any = { userId: session.user.id };

        // Add filter conditions based on parameters
        if (query) {
            searchQuery.$or = [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { tags: { $regex: query, $options: 'i' } }
            ];
        }

        if (tag) {
            searchQuery.tags = tag;
        }

        if (folder) {
            searchQuery.folder = folder;
        }

        if (editorType) {
            searchQuery.editorType = editorType;
        }

        if (isFavorite !== undefined) {
            searchQuery.isFavorite = isFavorite;
        }

        if (isPinned !== undefined) {
            searchQuery.isPinned = isPinned;
        }

        if (isPublic !== undefined) {
            searchQuery.isPublic = isPublic;
        }

        if (hasShares) {
            searchQuery.sharedWith = { $exists: true, $ne: [] };
        }

        // Execute the search
        const notes = await Note.find(searchQuery)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Note.countDocuments(searchQuery);

        return NextResponse.json({
            notes,
            pagination: {
                total,
                limit,
                skip
            }
        });
    } catch (error: any) {
        console.error("Error searching notes:", error);
        return NextResponse.json(
            { error: error.message || "Failed to search notes" },
            { status: 500 }
        );
    }
}