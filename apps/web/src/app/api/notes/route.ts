import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Note from "@/models/Note";

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
        const validSortFields = ["updatedAt", "createdAt", "title", "lastAccessed"];
        const sortField = sortParam.startsWith("-") 
            ? sortParam.substring(1) 
            : sortParam;
            
        const sort = validSortFields.includes(sortField) 
            ? sortParam 
            : "-updatedAt";

        await connectToDatabase();

        // Build query object
        const query: any = { userId: session.user.id };

        // Filter by folder if provided
        if (folder) {
            query.folder = folder;
        }

        // Filter by tag if provided
        if (tag) {
            query.tags = tag;
        }
        
        // Filter by editor type if provided
        if (editorType) {
            query.editorType = editorType;
        }
        
        // Filter by favorite status if provided
        if (isFavorite === 'true') {
            query.isFavorite = true;
        }
        
        // Filter by pinned status if provided
        if (isPinned === 'true') {
            query.isPinned = true;
        }
        
        // Filter by public status if provided
        if (isPublic === 'true') {
            query.isPublic = true;
        }
        
        // Filter for shared notes if requested
        if (hasShares === 'true') {
            query.sharedWith = { $exists: true, $ne: [] };
        }

        // Search by title or content
        if (searchQuery) {
            query.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { content: { $regex: searchQuery, $options: 'i' } },
                { tags: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Execute query with timeout protection
        const queryPromise = Note.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        // Set a timeout for the query
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Database query timeout'));
            }, 10000); // 10 second timeout
        });

        // Race the query against the timeout
        const notes = await Promise.race([
            queryPromise,
            timeoutPromise
        ]) as any[];

        const total = await Note.countDocuments(query);

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
        
        // Provide appropriate error responses based on error type
        if (error.name === 'CastError' || error.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Invalid request parameters" },
                { status: 400 }
            );
        }
        
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
        
        // Set default values for missing fields
        const noteData = {
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
            createdAt: new Date(),
            updatedAt: new Date(),
            lastAccessed: new Date()
        };

        await connectToDatabase();

        const note = new Note(noteData);
        await note.save();

        return NextResponse.json(
            { 
                message: "Note created successfully",
                data: note.toObject()
            }, 
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating note:", error);
        
        // Provide appropriate error responses based on error type
        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { error: "Invalid note data: " + error.message },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { error: "Failed to create note" },
            { status: 500 }
        );
    }
}