"use client";

import dynamic from "next/dynamic";
import { FrontendNote } from "@/app/notes/[id]/page";

// Dynamic import with ssr: false (allowed in client components)
const NotesEditor = dynamic(() => import("@/components/NotesEditor"), { ssr: false });

interface ClientNotesEditorProps {
  note?: any;
  isNew?: boolean;
  readOnly?: boolean;
}

export default function ClientNotesEditor({ note, isNew = false, readOnly = false }: ClientNotesEditorProps) {
  return <NotesEditor note={note} isNew={isNew} readOnly={readOnly} />;
}
