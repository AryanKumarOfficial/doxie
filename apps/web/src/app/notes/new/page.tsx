import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { FiArrowLeft } from "react-icons/fi";
import ClientNotesEditor from "@/components/ClientNotesEditor";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Create New Note",
  description: "Create a new rich text or markdown note with Doxie's intuitive editor",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NewNotePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }  
  return (
    <Container className="py-6">
      <div className="mb-6">
        <Breadcrumbs className="mb-4" />
        <div className="flex items-center justify-between">
          <Link href="/notes">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft /> Back to Notes
            </Button>
          </Link>
        </div>
      </div>
      <div className="h-[calc(100vh-180px)] rounded-lg shadow-sm border bg-white">
        <ClientNotesEditor isNew={true} />
      </div>
    </Container>
  );
}