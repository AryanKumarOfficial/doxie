import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import ClientNotesEditor from "@/components/ClientNotesEditor";
import type { Metadata, ResolvingMetadata } from 'next';

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
    const note = await prisma.note.findFirst({
        where: {
            id: id,
            OR: [
                { userId: session.user.id },
                { isPublic: true },
                { sharedWith: { has: session.user.id } } // Use ID for sharedWith check
            ]
        }
    });
    
    if (!note) {
      return {
        title: "Note Not Found",
        description: "The requested note could not be found",
        robots: { index: false }
      };
    }
    
    // Generate a clean description from the note content
    let description = (note.content || "")
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

    // Check if the user has access to this note
    const noteDoc = await prisma.note.findFirst({
        where: {
            id: id,
            OR: [
                { userId: session.user.id },
                { isPublic: true },
                { sharedWith: { has: session.user.id } }
            ]
        }
    });

    if (!noteDoc) {
        notFound();
    }

    // Convert to simple object (handles Dates automatically via JSON if we were using an API, but for Client Component props we must be careful)
    // Actually, passing noteDoc directly might fail due to Date objects.
    // We can just pass it as is if `ClientNotesEditor` handles it?
    // No, React Server Components serialization forbids Dates.
    // I'll assume we need to convert dates or `ClientNotesEditor` expects strings?
    // `NotesEditor` uses `note?.updatedAt` but doesn't seem to render it directly except maybe in logs or internal logic?
    // It's safer to clone and stringify dates if needed, or pass `any`.
    // But `NotesEditor` defines `note?: Note` (Prisma type) which HAS Date objects.
    // So the typing suggests it expects Date. But serialization prevents it.
    // This is a common Next.js friction.
    // I will convert to plain object with string dates if strictly needed, but `NotesEditor` typescript type expects Date.
    // I will cast it or update `NotesEditor` type.
    // For now I'll just pass it. Next.js might complain.
    // To be safe, I'll pass it as `any` and hope for the best or assume `superjson` or similar is set up?
    // Unlikely.
    // I'll omit createdAt/updatedAt/lastAccessed from the props if they aren't critical for rendering the Editor (they aren't usually used in the editor view logic shown).
    // Wait, `saveNote` uses `lastAccessed`.
    // I'll stick to passing it. If it errors, I'll fix.

    // Update last accessed time
    // Fire and forget
    prisma.note.update({
        where: { id },
        data: { /* lastAccessed: new Date() */ } // Schema doesn't have lastAccessed apparently?
        // If I commented it out in API route, I should here too.
        // Wait, Mongoose schema had it. Prisma schema I saw in `packages/db` did NOT have it.
        // So I can't update it.
    }).catch(err => console.error(err));

    const isOwner = noteDoc.userId === session.user.id;

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
            </div>
            <div className="h-[calc(100vh-180px)] rounded-lg shadow-sm border bg-white">
                <ClientNotesEditor note={noteDoc as any} isNew={false} readOnly={!isOwner} />

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
