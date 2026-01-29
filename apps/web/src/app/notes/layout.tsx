"use client";

import { useEffect, useRef } from "react";
import { getSession, useSession } from "next-auth/react";
import AuthProvider from "@/components/AuthProvider";
import { Container } from "@/components/ui/container";
import NotesSidebar from "@/components/NotesSidebar";
import FolderSidebar from "@/components/FolderSidebar";
import Navbar from "@/components/Navbar";
import { SidebarToggleContext } from "@/context/SidebarToggleContext";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  
  // Client-side auth check
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        window.location.href = "/login";
      }
    };
    
    checkSession();
  }, []);
  
  // Create a reference to hold the toggle sidebar function
  const toggleSidebarRef = useRef<(() => void) | null>(null);
  
  // The function that will be provided through context to child components
  const toggleSidebar = () => {
    if (toggleSidebarRef.current) {
      toggleSidebarRef.current();
    }
  };
  
  return (
    <SidebarToggleContext.Provider value={{ toggleSidebar }}>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-grow w-full">
          {/* Left sidebar - FolderSidebar - Only render if we have a user session */}
          {session?.user?.id && (
            <div className="hidden md:block md:w-64 flex-shrink-0">
              <FolderSidebar userId={session.user.id} />
            </div>
          )}
          
          {/* Right sidebar - NotesSidebar */}
          <div className="hidden md:block w-64 flex-shrink-0 border-r">
            <NotesSidebar toggleSidebarRef={toggleSidebarRef} />
          </div>
          
          {/* Mobile sidebar toggle - Only visible on smaller screens */}
          <div className="md:hidden">
            <button 
              onClick={toggleSidebar}
              className="fixed top-4 right-4 z-30 p-2 bg-white rounded-md shadow-md border border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-grow p-4 overflow-auto">
            {children}
          </div>        </div>
      </div>
    </SidebarToggleContext.Provider>
  );
}