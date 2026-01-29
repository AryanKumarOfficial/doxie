import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Note from "@/models/Note";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import ClientNotesEditor from "@/components/ClientNotesEditor";
import type { Metadata, ResolvingMetadata } from 'next';

// Define a frontend-friendly note type without Mongoose methods
export type FrontendNote = {
    id: string;
    _id: string;
    title: string;
    content: string;
    tags: string[];
    folder: string;
    color: string;
    isPinned: boolean;
    isFavorite: boolean;
    editorType: 'rich' | 'markdown' | 'simple';
    userId: string;
    isPublic: boolean;
    sharedWith: string[];
    lastAccessed: Date;
    updatedAt: Date;
    createdAt: Date;
};

// Dynamic metadata generation based on the note data
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await params to match Next.js 15 requirements
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // Get session
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      title: "Note Not Available",
      description: "You need to log in to view this note",
      robots: { index: false }
    };
  }
  
  try {
    await connectToDatabase();
    const note = await Note.findOne({ 
      _id: id,
      $or: [
        { userId: session.user.id },
        { isPublic: true },
        { sharedWith: session.user.email }
      ] 
    });
    
    if (!note) {
      return {
        title: "Note Not Found",
        description: "The requested note could not be found",
        robots: { index: false }
      };
    }
    
    // Generate a clean description from the note content
    let description = note.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .slice(0, 155); // Limit to 155 chars
    
    if (description.length === 155) {
      description += '...';
    }
    
    return {
      title: note.title || "Untitled Note",
      description: description || "No content",
      robots: { 
        index: note.isPublic, // Only index public notes
        follow: true 
      },
      openGraph: note.isPublic ? {
        title: note.title || "Untitled Note",
        description: description,
        type: 'article',
        publishedTime: note.createdAt.toISOString(),
        modifiedTime: note.updatedAt.toISOString(),
        authors: ['Doxie User'],
        tags: note.tags,
      } : undefined,
    };
  } catch (error) {
    console.error("Error fetching note for metadata:", error);
    return {
      title: "Error Loading Note",
      description: "There was a problem loading this note",
      robots: { index: false }
    };
  }
}

interface NotePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function NotePage({ params }: NotePageProps) {
    // Await params to fix the "params should be awaited" error
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    await connectToDatabase();

    // Check if the user has access to this note
    const noteDoc = await Note.findOne({
        _id: id,
        $or: [
            { userId: session.user.id },
            { isPublic: true },
            { sharedWith: session.user.email } // Use email for sharedWith
        ]
    }).lean();

    if (!noteDoc) {
        notFound();
    }

    // Convert to frontend-safe note object
    const note: FrontendNote = {
        _id: noteDoc._id.toString(),
        id: noteDoc._id.toString(),
        title: noteDoc.title || '',
        content: noteDoc.content || '',
        tags: Array.isArray(noteDoc.tags) ? noteDoc.tags : [],
        folder: noteDoc.folder || 'Default',
        color: noteDoc.color || '#ffffff',
        isPinned: Boolean(noteDoc.isPinned),
        isFavorite: Boolean(noteDoc.isFavorite),
        editorType: noteDoc.editorType || 'rich',
        userId: noteDoc.userId.toString(),
        isPublic: Boolean(noteDoc.isPublic),
        sharedWith: Array.isArray(noteDoc.sharedWith) ? noteDoc.sharedWith : [],
        lastAccessed: noteDoc.lastAccessed || new Date(),
        updatedAt: noteDoc.updatedAt || new Date(),
        createdAt: noteDoc.createdAt || new Date()
    };

    // Update last accessed time
    await Note.findByIdAndUpdate(id, { lastAccessed: new Date() });

    const isOwner = note.userId === session.user.id;

    return (
        <Container className="py-6">
            <div className="mb-4">
                <Link href="/notes">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <FiArrowLeft /> Back to Notes
                    </Button>
                </Link>
            </div>            <div className="h-[calc(100vh-180px)] rounded-lg shadow-sm border bg-white">
                {note && <ClientNotesEditor note={note} isNew={false} readOnly={!isOwner} />}

                {!isOwner && (
                    <div
                        className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="mr-2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        This note was shared with you by another user. You cannot edit it.
                    </div>
                )}
            </div>
        </Container>
    );
}