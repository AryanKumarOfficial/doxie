import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, Prisma } from "@doxie/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
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
    const isFavorite =
      url.searchParams.get("isFavorite") === "true" ? true : undefined;
    const isPinned =
      url.searchParams.get("isPinned") === "true" ? true : undefined;
    const isPublic =
      url.searchParams.get("isPublic") === "true" ? true : undefined;

    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : 20;
    const skip = url.searchParams.get("skip")
      ? parseInt(url.searchParams.get("skip")!)
      : 0;

    /* ---------------- SORT PARSING ---------------- */

    const sortParam = url.searchParams.get("sort") || "-updatedAt";

    let sortField = sortParam.startsWith("-")
      ? sortParam.substring(1)
      : sortParam;

    const validSortFields = ["updatedAt", "createdAt", "title"];

    if (sortField === "lastAccessed" || !validSortFields.includes(sortField)) {
      sortField = "updatedAt";
    }

    const sortOrder: Prisma.SortOrder = sortParam.startsWith("-")
      ? "desc"
      : "asc";

    const orderBy: Prisma.NoteOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    /* ---------------- TAGS ONLY MODE ---------------- */

    if (tagsOnly) {
      const notes = await prisma.note.findMany({
        where: { userId: session.user.id },
        select: { tags: true },
      });

      const allTags = notes.flatMap((n) => n.tags);
      const distinctTags = Array.from(new Set(allTags));

      return NextResponse.json({ tags: distinctTags });
    }

    /* ---------------- WHERE CLAUSE ---------------- */

    const where: Prisma.NoteWhereInput = { userId: session.user.id };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { tags: { has: query } },
      ];
    }

    if (tag) where.tags = { has: tag };
    if (folder) where.folder = folder;
    if (editorType) where.editorType = editorType;
    if (isFavorite !== undefined) where.isFavorite = isFavorite;
    if (isPinned !== undefined) where.isPinned = isPinned;
    if (isPublic !== undefined) where.isPublic = isPublic;

    /* ---------------- EXECUTION ---------------- */

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        take: limit,
        skip,
      }),
      prisma.note.count({ where }),
    ]);

    return NextResponse.json({
      notes,
      pagination: {
        total,
        limit,
        skip,
      },
    });
  } catch (error: any) {
    console.error("Error searching notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search notes" },
      { status: 500 }
    );
  }
}
