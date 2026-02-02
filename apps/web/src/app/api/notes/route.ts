import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma, Prisma } from "@doxie/db";
import { authOptions } from "@/lib/auth";

// Get all notes for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        
        // Extract and validate query parameters
        const folder = url.searchParams.get("folder");
        const tag = url.searchParams.get("tag");
        const searchQuery = url.searchParams.get("query");
        const editorType = url.searchParams.get("editorType");
        const isFavorite = url.searchParams.get("isFavorite");
        const isPinned = url.searchParams.get("isPinned");
        const isPublic = url.searchParams.get("isPublic");
        const hasShares = url.searchParams.get("hasShares");
        
        // Parse pagination parameters with defaults and validation
        const limit = Math.min(
            url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 50,
            100 // Maximum allowed limit
        );
        const skip = Math.max(
            url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0,
            0 // Minimum allowed skip
        );
        
        // Parse sort parameter with validation
        const sortParam = url.searchParams.get("sort") || "-updatedAt";
        const validSortFields = ["updatedAt", "createdAt", "title"];
        const sortField = sortParam.startsWith("-") 
            ? sortParam.substring(1) 
            : sortParam;

        const sortOrder: Prisma.SortOrder = sortParam.startsWith("-") ? "desc" : "asc";
            
        const orderBy: Prisma.NoteOrderByWithRelationInput = validSortFields.includes(sortField)
            ? { [sortField]: sortOrder }
            : { updatedAt: "desc" };

        // Build where clause
        const where: Prisma.NoteWhereInput = { userId: session.user.id };

        if (folder) {
            where.folder = folder;
        }

        if (tag) {
            where.tags = { has: tag };
        }
        
        if (editorType) {
            where.editorType = editorType;
        }
        
        if (isFavorite === 'true') {
            where.isFavorite = true;
        }
        
        if (isPinned === 'true') {
            where.isPinned = true;
        }
        
        if (isPublic === 'true') {
            where.isPublic = true;
        }
        
        if (searchQuery) {
            where.OR = [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { content: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                orderBy,
                take: limit,
                skip: skip,
            }),
            prisma.note.count({ where })
        ]);

        return NextResponse.json({
            notes,
            pagination: {
                total,
                limit,
                skip,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { error: "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

// Create a new note
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Parse and validate request body
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }
        
        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }
        
        const note = await prisma.note.create({
            data: {
                title: body.title,
                content: body.content || "",
                tags: body.tags || [],
                folder: body.folder || "Default",
                editorType: body.editorType || "rich",
                isFavorite: body.isFavorite || false,
                isPinned: body.isPinned || false,
                isPublic: body.isPublic || false,
                color: body.color || "#ffffff",
                userId: session.user.id,
            }
        });

        return NextResponse.json(
            { 
                message: "Note created successfully",
                data: note
            }, 
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { error: "Failed to create note" },
            { status: 500 }
        );
    }
}
