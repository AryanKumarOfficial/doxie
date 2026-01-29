import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NotesPageClient from "./notes-page-client";

export const metadata: Metadata = {
  title: "Your Notes",
  description: "Access, manage, and organize all your notes in one place",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NotesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }
  
  return <NotesPageClient />;
}