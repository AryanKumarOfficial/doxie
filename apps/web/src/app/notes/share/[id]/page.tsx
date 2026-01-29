"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FiLink, FiMail, FiGlobe, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${(await params).id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch note");
        }

        const noteData = await response.json();
        setNote(noteData);
        setIsPublic(noteData.isPublic || false);

        if (noteData.sharedWith && noteData.sharedWith.length > 0) {
          // Here we would ideally fetch the emails of users based on their IDs
          // For simplicity, we'll just display the IDs for now
          setEmails(noteData.sharedWith.join(", "));
        }
      } catch (error) {
        toast.error("Could not load note details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [React.use(params).id, router, session]);

  const handleShare = async () => {
    if (!note) return;

    setIsSubmitting(true);

    try {
      const emailList = emails
        .split(",")
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const response = await fetch("/api/notes/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId: note.id || note._id,
          emails: emailList,
          isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share note");
      }

      toast.success("Note sharing settings updated!");
      router.push(`/notes/${note.id || note._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to share note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center">Loading note details...</div>
      </Container>
    );
  }

  if (!note) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Note not found</h1>
          <Button onClick={() => router.push("/notes")}>Back to Notes</Button>
        </div>
      </Container>
    );
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/notes/${note.id || note._id}`
    : "";

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-bold mb-6">Share "{note.title}"</h1>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Public Access</h2>
        <div className="flex gap-4 items-center mb-4">
          <button
            className={`flex items-center gap-2 p-3 rounded-md border ${isPublic ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onClick={() => setIsPublic(true)}
          >
            <FiGlobe className={isPublic ? "text-blue-500" : "text-gray-500"} />
            <div className="text-left">
              <div className="font-medium">Public</div>
              <div className="text-sm text-gray-500">Anyone with the link can view</div>
            </div>
          </button>

          <button
            className={`flex items-center gap-2 p-3 rounded-md border ${!isPublic ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onClick={() => setIsPublic(false)}
          >
            <FiLock className={!isPublic ? "text-blue-500" : "text-gray-500"} />
            <div className="text-left">
              <div className="font-medium">Private</div>
              <div className="text-sm text-gray-500">Only you and people you invite</div>
            </div>
          </button>
        </div>

        {isPublic && shareUrl && (
          <div className="mt-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share link
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-grow border rounded-l-md p-2 bg-gray-50"
              />
              <Button
                className="rounded-l-none"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Link copied to clipboard");
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Share with specific people</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email addresses
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses, separated by commas"
            className="w-full p-2 border rounded-md min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter email addresses separated by commas. Users must have an account on this platform.
          </p>
        </div>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => router.push(`/notes/${note.id || note._id}`)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleShare}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save sharing settings"}
        </Button>
      </div>
    </Container>
  );
}