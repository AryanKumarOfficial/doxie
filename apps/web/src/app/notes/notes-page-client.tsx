"use client";

import {Suspense, useCallback, useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import NotesList from "@/components/NotesList";
import {Button} from "@/components/ui/button";
import {FiFileText, FiFilter, FiPlus} from "react-icons/fi";
import {Container} from "@/components/ui/container";
import {motion} from "framer-motion";
import {useNotesStore} from "@/store/notesStore";

// Simplified type for frontend use (without Mongoose methods)
type NoteData = {
    id: string;
    _id: string; // Mongoose ID
    title: string;
    content: string;
    tags: string[];
    folder: string;
    isFavorite: boolean;
    isPinned: boolean;
    updatedAt: string;
    lastAccessed: string;
    editorType: string;
    color?: string;
    isPublic?: boolean;
    sharedWith?: string[];
};

export default function NotesPageClient() {
    const {data: session} = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get the current folder filter
    const folderParam = searchParams.get('folder');
    const folder = folderParam || "all";
    
    // Retrieve notes using Zustand store
    const {notes, loading, fetchNotes, error} = useNotesStore();
    
    // Filters and sorting state
    const [sortBy, setSortBy] = useState<string>("updatedAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filterByTag, setFilterByTag] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Available tags from notes
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    
    // Filter and sort notes
    const filteredNotes = useCallback(() => {
        if (!notes) return [];
        
        let filtered = [...notes];
        
        // Filter by folder if not "all"
        if (folder !== "all") {
            filtered = filtered.filter(note => note.folder === folder);
        }
        
        // Filter by tag if selected
        if (filterByTag) {
            filtered = filtered.filter(note => note.tags.includes(filterByTag));
        }
        
        // Sort notes
        filtered.sort((a, b) => {
            if (sortBy === "title") {
                return sortOrder === "asc" 
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
            } else if (sortBy === "updatedAt") {
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            } else {
                return 0;
            }
        });
        
        return filtered;
    }, [notes, folder, filterByTag, sortBy, sortOrder]);
    
    // Extract all available tags from notes
    useEffect(() => {
        if (notes) {
            const allTags = notes.flatMap(note => note.tags);
            const uniqueTags = [...new Set(allTags)].filter(tag => tag); // Remove empty tags
            setAvailableTags(uniqueTags);
        }
    }, [notes]);
      // Fetch notes on initial load
    useEffect(() => {
        if (session?.user?.id) {
            fetchNotes(session.user.id);
        }
    }, [session, fetchNotes]);
    
    // Handle filter toggle
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };
    
    // Handle sort change
    const handleSortChange = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc"); // Default to descending when changing fields
        }
    };
    
    // Handle tag selection
    const handleTagSelect = (tag: string | null) => {
        setFilterByTag(tag);
    };
    
    // Generate button style based on active state
    const getButtonStyle = (isActive: boolean) => {
        return isActive 
            ? "bg-indigo-100 text-indigo-700" 
            : "bg-white hover:bg-gray-100";
    };
    
    if (!session) {
        return (
            <Container>
                <div className="text-center py-10">
                    <h1 className="text-2xl font-bold mb-4">Please log in to view your notes</h1>
                    <Link href="/login">
                        <Button>Log In</Button>
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {folder === "all" ? "All Notes" : 
                         folder === "favorites" ? "Favorite Notes" : 
                         folder === "recent" ? "Recent Notes" : 
                         `Folder: ${folder}`}
                    </h1>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFilters}
                            className="flex items-center gap-1"
                        >
                            <FiFilter className="h-4 w-4" />
                            Filters
                        </Button>
                        <Link href="/notes/new">
                            <Button size="sm" className="flex items-center gap-1">
                                <FiPlus className="h-4 w-4" />
                                New Note
                            </Button>
                        </Link>
                    </div>
                </div>
                
                {/* Filters Panel - Animated */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 p-4 rounded-lg mb-6"
                    >
                        <div className="mb-4">
                            <h3 className="font-medium mb-2">Sort by</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleSortChange("title")}
                                    className={`px-3 py-1 text-sm rounded-md transition ${getButtonStyle(sortBy === "title")}`}
                                >
                                    Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                                </button>
                                <button
                                    onClick={() => handleSortChange("updatedAt")}
                                    className={`px-3 py-1 text-sm rounded-md transition ${getButtonStyle(sortBy === "updatedAt")}`}
                                >
                                    Updated {sortBy === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
                                </button>
                            </div>
                        </div>
                        
                        {availableTags.length > 0 && (
                            <div>
                                <h3 className="font-medium mb-2">Filter by tag</h3>
                                <div className="flex flex-wrap gap-2">
                                    {filterByTag && (
                                        <button
                                            onClick={() => handleTagSelect(null)}
                                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                        >
                                            Clear
                                        </button>
                                    )}
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleTagSelect(tag)}
                                            className={`px-3 py-1 text-sm rounded-md transition ${
                                                filterByTag === tag 
                                                    ? "bg-indigo-100 text-indigo-700" 
                                                    : "bg-white hover:bg-gray-100"
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        <p>Error loading notes: {error}</p>                        <button 
                            onClick={() => session?.user?.id && fetchNotes(session.user.id)}
                            className="mt-2 text-sm underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredNotes().length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h2 className="mt-4 text-lg font-medium text-gray-900">No notes found</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            {folder !== "all" 
                                ? `You don't have any notes in this folder${filterByTag ? ' with the selected tag' : ''}.` 
                                : filterByTag 
                                    ? `You don't have any notes with the tag "${filterByTag}".`
                                    : "Get started by creating your first note."}
                        </p>
                        <div className="mt-6">
                            <Link href="/notes/new">
                                <Button>
                                    <FiPlus className="mr-2 h-4 w-4" />
                                    Create a new note
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Suspense fallback={<div>Loading notes...</div>}>
                        <NotesList notes={filteredNotes()} />
                    </Suspense>
                )}
            </div>
        </Container>
    );
}
