"use client";

import { useState, useEffect, Suspense, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NotesList from "@/components/NotesList";
import { FiFilter, FiSearch, FiFolder, FiTag, FiChevronDown, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { SidebarToggleContext } from "@/context/SidebarToggleContext";

function AllNotes() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const { toggleSidebar } = useContext(SidebarToggleContext);

  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("-updatedAt");
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch notes with filters
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        // Build query parameters
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("query", searchQuery);
        }

        if (selectedFolder) {
          params.append("folder", selectedFolder);
        }

        if (selectedTag) {
          params.append("tag", selectedTag);
        }

        params.append("sort", sortOrder);
        params.append("limit", "100");

        const response = await fetch(`/api/notes?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data.notes);

        // Extract unique folders and tags
        if (!selectedFolder && !selectedTag) {
          const uniqueFolders = Array.from(new Set(data.notes.map((note: any) => note.folder)));
          const uniqueTags = Array.from(
            new Set(data.notes.flatMap((note: any) => note.tags || []))
          );
          setFolders(uniqueFolders as string[]);
          setTags(uniqueTags as string[]);
        }

      } catch (error: any) {
        toast.error(error.message || "Error fetching notes");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [status, searchQuery, selectedFolder, selectedTag, sortOrder]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFolder(null);
    setSelectedTag(null);
    setSortOrder("-updatedAt");
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your notes...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <PageHeader title="All Notes" toggleSidebar={toggleSidebar}>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <FiFilter className={isFiltersOpen ? "text-blue-600" : ""} /> Filters
            <FiChevronDown
              className={`transition-transform duration-300 ${isFiltersOpen ? "rotate-180 text-blue-600" : ""}`}
            />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/notes/new">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200">
              <FiPlus /> New Note
            </Button>
          </Link>
        </motion.div>
      </PageHeader>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-4 border shadow-md bg-white">
              <div className="flex flex-wrap gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FiFolder className="text-blue-500" /> Filter by Folder
                  </h3>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {folders.map((folder, index) => (
                      <motion.button
                        key={folder}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${selectedFolder === folder
                          ? "bg-blue-100 text-blue-700 border border-blue-300 shadow"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {folder}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <FiTag className="text-blue-500" /> Filter by Tag
                  </h3>
                  <div className="flex flex-wrap gap-2 max-w-md">
                    {tags.map((tag, index) => (
                      <motion.button
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${selectedTag === tag
                          ? "bg-blue-100 text-blue-700 border border-blue-300 shadow"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <polyline points="17 16 12 21 7 16"></polyline>
                    </svg> Sort by
                  </h3>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
                  >
                    <option value="-updatedAt">Recently Updated</option>
                    <option value="-createdAt">Recently Created</option>
                    <option value="-lastAccessed">Recently Accessed</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="-title">Title (Z-A)</option>
                  </select>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {(selectedFolder || selectedTag || searchQuery) && (
                      <span>
                        Applied filters: {" "}
                        {selectedFolder && (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Folder: {selectedFolder}</span>
                        )}{" "}
                        {selectedTag && (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">Tag: {selectedTag}</span>
                        )}{" "}
                        {searchQuery && (
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md ml-1">Search: "{searchQuery}"</span>
                        )}
                      </span>
                    )}
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiX className="mr-1" /> Clear filters
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoadingNotes ? (
        <motion.div
          className="flex justify-center items-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute top-0 right-0 bottom-0 left-0 animate-ping rounded-full bg-blue-400 opacity-20"></div>
              <div className="absolute top-2 right-2 bottom-2 left-2 animate-ping rounded-full bg-blue-500 opacity-40 delay-100"></div>
              <div className="absolute top-4 right-4 bottom-4 left-4 animate-ping rounded-full bg-blue-600 opacity-60 delay-200"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiSearch size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-gray-500">Loading your notes...</p>
          </div>
        </motion.div>
      ) : notes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-12 text-center border-dashed border-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-gray-100 p-4 rounded-full">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FiSearch size={32} className="text-gray-400" />
                </motion.div>
              </div>
              <h2 className="text-xl font-semibold">No notes found</h2>
              <p className="text-gray-500 mb-4 max-w-md">
                {searchQuery || selectedFolder || selectedTag
                  ? "Try changing your search criteria or removing filters."
                  : "Start creating notes to see them here."}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/notes/new">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <FiPlus /> Create a New Note
                  </Button>
                </Link>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <NotesList notes={notes} showViewToggle={true} />
      )}
    </Container>
  );
}

function LoadingSkeleton() {
  return (
    <Container className="py-8">
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your notes...</p>
        </div>
      </div>
    </Container>
  );
}

export default function AllNotesPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AllNotes />
    </Suspense>
  )
}