import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, Prisma } from "@doxie/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
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
        // const hasShares = url.searchParams.get("hasShares") === "true";
        const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 20;
        const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0;
        const sortParam = url.searchParams.get("sort") || "-updatedAt";

        let sortField = sortParam.startsWith("-")
            ? sortParam.substring(1)
            : sortParam;
        const sortOrder = sortParam.startsWith("-") ? 'desc' : 'asc';
        if (sortField === 'lastAccessed') sortField = 'updatedAt';

        // If we only need to return tags, get distinct tags for the user
        if (tagsOnly) {
            // Prisma doesn't support distinct on scalar lists directly like MongoDB
            // We fetch all tags and deduplicate in memory
            const notes = await prisma.note.findMany({
                where: { userId: session.user.id },
                select: { tags: true }
            });
            
            const allTags = notes.flatMap(n => n.tags);
            const distinctTags = Array.from(new Set(allTags));

            return NextResponse.json({ tags: distinctTags });
        }

        // Build the search query
        const where: Prisma.NoteWhereInput = { userId: session.user.id };

        // Add filter conditions based on parameters
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
                // { tags: { has: query } } // Exact match on element, not regex partial
            ];
        }

        if (tag) {
            where.tags = { has: tag };
        }

        if (folder) {
            where.folder = folder;
        }

        if (editorType) {
            where.editorType = editorType;
        }

        if (isFavorite !== undefined) {
            where.isFavorite = isFavorite;
        }

        if (isPinned !== undefined) {
            where.isPinned = isPinned;
        }

        if (isPublic !== undefined) {
            where.isPublic = isPublic;
        }

        // Execute the search
        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                take: limit,
                skip: skip,
                orderBy: { [sortField]: sortOrder }
            }),
            prisma.note.count({ where })
        ]);

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
