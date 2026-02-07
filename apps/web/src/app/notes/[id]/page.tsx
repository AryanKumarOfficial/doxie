import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@doxie/db";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import ClientNotesEditor from "@/components/ClientNotesEditor";
import type { Metadata, ResolvingMetadata } from "next";

/* ---------------- METADATA ---------------- */

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      title: "Note Not Available",
      description: "You need to log in to view this note",
      robots: { index: false },
    };
  }

  try {
    const note = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { isPublic: true },
          { sharedWith: { has: session.user.id } },
        ],
      },
    });

    if (!note) {
      return {
        title: "Note Not Found",
        description: "The requested note could not be found",
        robots: { index: false },
      };
    }

    const description =
      (note.content || "").replace(/<[^>]*>/g, "").slice(0, 155) || "No content";

    return {
      title: note.title || "Untitled Note",
      description,
      robots: {
        index: note.isPublic,
        follow: true,
      },
      openGraph: note.isPublic
        ? {
            title: note.title || "Untitled Note",
            description,
            type: "article",
            publishedTime: note.createdAt.toISOString(),
            modifiedTime: note.updatedAt.toISOString(),
            authors: ["Doxie User"],
            tags: note.tags,
          }
        : undefined,
    };
  } catch (error) {
    console.error("Metadata error:", error);
    return {
      title: "Error Loading Note",
      description: "There was a problem loading this note",
      robots: { index: false },
    };
  }
}

/* ---------------- PAGE ---------------- */

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");

  const noteDoc = await prisma.note.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { isPublic: true },
        { sharedWith: { has: session.user.id } },
      ],
    },
  });

  if (!noteDoc) notFound();

  const isOwner = noteDoc.userId === session.user.id;

  return (
    <Container className="py-6">
      <div className="mb-4">
        <Link href="/notes">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <FiArrowLeft /> Back to Notes
          </Button>
        </Link>
      </div>

      <div className="h-[calc(100vh-180px)] rounded-lg shadow-sm border bg-white">
        <ClientNotesEditor
          note={noteDoc as any}
          isNew={false}
          readOnly={!isOwner}
        />

        {!isOwner && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-200">
            This note was shared with you. You cannot edit it.
          </div>
        )}
      </div>
    </Container>
  );
}
